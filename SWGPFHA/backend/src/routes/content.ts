// src/routes/content.ts
import { Router, Request, Response, NextFunction } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { env } from "../env.js";

const router = Router();

/* ---------------------- utils ---------------------- */

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-admin-key");
  if (!env.ADMIN_API_KEY || key !== env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function nocache(res: Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
}

function tinyHash(s: string) {
  try {
    return Buffer.from(s).toString("base64").slice(0, 16);
  } catch {
    return String(s).slice(0, 16);
  }
}

// normalize slug consistently across API
function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function last6(id: string) {
  return (id || "").slice(-6).toLowerCase();
}

/* ---------------------- validation ---------------------- */

const statusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const upsertBody = z.object({
  id: z.string().optional(), // present => update by id
  slug: z.string().min(2),
  section: z.string().min(2),
  content: z.string().default(""),
  status: z.enum(statusValues).default("DRAFT"),
  publishNow: z.boolean().optional(), // if true, force publish
});

/* ---------------------- PUBLIC ---------------------- */

/**
 * GET /api/content
 * Returns published blocks (light list) — no cache.
 */
router.get("/", async (_req, res) => {
  try {
    const items = await prisma.contentBlock.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [
        { section: "asc" },
        { publishedAt: "desc" },
        { lastUpdated: "desc" },
      ],
      select: {
        id: true,
        slug: true,
        section: true,
        content: true,
        lastUpdated: true,
        publishedAt: true,
        status: true,
      },
    });

    nocache(res);
    console.log(`[content:list] published_count=${items.length}`);
    res.json({ items });
  } catch (err) {
    console.error("[content:list] ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------- ADMIN ---------------------- */

router.get("/admin/list", requireAdmin, async (_req, res) => {
  try {
    const items = await prisma.contentBlock.findMany({
      orderBy: [{ lastUpdated: "desc" }],
    });
    console.log(`[content:admin:list] count=${items.length}`);
    res.json({ items });
  } catch (err) {
    console.error("[content:admin:list] ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/content", requireAdmin, async (req, res) => {
  const parsed = upsertBody.safeParse(req.body);
  if (!parsed.success) {
    console.warn("[content:admin:upsert] BAD_REQUEST", parsed.error.flatten());
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  let { id, slug, section, content, status, publishNow } = parsed.data;
  slug = normalizeSlug(slug); // 🔑 normalize here

  const willPublish = !!publishNow || status === "PUBLISHED";

  const data = {
    slug,
    section,
    content,
    status: (willPublish ? "PUBLISHED" : status) as (typeof statusValues)[number],
    publishedAt: willPublish ? new Date() : null,
  };

  try {
    let saved;
    if (id) {
      saved = await prisma.contentBlock.update({ where: { id }, data });
      console.log(
        `[content:admin:update] id=${id} slug="${slug}" status=${data.status} hash=${tinyHash(
          content
        )}`
      );
    } else {
      saved = await prisma.contentBlock.upsert({
        where: { slug },
        update: data,
        create: {
          slug,
          section,
          content,
          status: data.status,
          publishedAt: data.publishedAt ?? undefined,
        },
      });
      console.log(
        `[content:admin:upsert] slug="${slug}" status=${data.status} hash=${tinyHash(content)}`
      );
    }
    res.json(saved);
  } catch (err) {
    console.error("[content:admin:upsert] ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/admin/content/:id/publish", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  try {
    const saved = await prisma.contentBlock.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    console.log(`[content:admin:publish] id=${id} slug="${saved.slug}"`);
    res.json(saved);
  } catch (err) {
    console.error("[content:admin:publish] ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/admin/content/:id/unpublish", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  try {
    const saved = await prisma.contentBlock.update({
      where: { id },
      data: { status: "DRAFT", publishedAt: null },
    });
    console.log(`[content:admin:unpublish] id=${id} slug="${saved.slug}"`);
    res.json(saved);
  } catch (err) {
    console.error("[content:admin:unpublish] ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/content/admin/fix-slugs
 * Admin-only one-shot: normalize all slugs (trim+lowercase) and resolve duplicates.
 */
router.post("/admin/fix-slugs", requireAdmin, async (_req, res) => {
  try {
    const rows = await prisma.contentBlock.findMany({
      orderBy: [{ publishedAt: "desc" }, { lastUpdated: "desc" }],
    });

    type Row = (typeof rows)[number];
    const groups = new Map<string, Row[]>();

    for (const r of rows) {
      const fixed = normalizeSlug(r.slug);
      const arr = groups.get(fixed) ?? [];
      arr.push(r);
      groups.set(fixed, arr);
    }

    const actions: Array<{ action: string; id: string; from: string; to: string }> = [];

    // Use a transaction so either all fixes apply or none
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const [fixed, arr] of groups) {
        // Sort: prefer most recently published, then lastUpdated, then createdAt
        arr.sort((a, b) => {
          const aPub = a.publishedAt ? a.publishedAt.getTime() : 0;
          const bPub = b.publishedAt ? b.publishedAt.getTime() : 0;
          if (bPub !== aPub) return bPub - aPub;

          const aUpd = a.lastUpdated ? a.lastUpdated.getTime() : 0;
          const bUpd = b.lastUpdated ? b.lastUpdated.getTime() : 0;
          if (bUpd !== aUpd) return bUpd - aUpd;

          return b.createdAt.getTime() - a.createdAt.getTime();
        });

        const [winner, ...dups] = arr;

        // Ensure winner has canonical fixed slug
        if (winner.slug !== fixed) {
          await tx.contentBlock.update({
            where: { id: winner.id },
            data: { slug: fixed },
          });
          actions.push({ action: "canonicalized", id: winner.id, from: String(winner.slug), to: fixed });
          console.log(`[fix-slugs] canonicalized id=${winner.id} "${winner.slug}" -> "${fixed}"`);
        }

        // Move duplicates to unique suffixed slugs
        for (const r of dups) {
          const target = `${fixed}-${last6(r.id)}`;
          if (r.slug === target) continue;
          await tx.contentBlock.update({
            where: { id: r.id },
            data: { slug: target },
          });
          actions.push({ action: "deduped", id: r.id, from: String(r.slug), to: target });
          console.log(`[fix-slugs] deduped id=${r.id} "${r.slug}" -> "${target}"`);
        }
      }
    });

    res.json({ ok: true, normalized_groups: groups.size, actions });
  } catch (err) {
    console.error("[content:admin:fix-slugs] ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------- PUBLIC (by slug) ---------------------- */

router.get("/:slug", async (req, res) => {
  const slug = normalizeSlug(String(req.params.slug)); // 🔑 normalize here
  const t = req.query.t;

  console.log(`[content:get] slug="${slug}" t=${t ?? "-"} @ ${new Date().toISOString()}`);

  try {
    const item = await prisma.contentBlock.findFirst({
      where: { slug, status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { lastUpdated: "desc" }],
      select: {
        id: true,
        slug: true,
        section: true,
        content: true,
        status: true,
        lastUpdated: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    nocache(res);

    if (!item) {
      console.warn(`[content:get] NOT_FOUND slug="${slug}"`);
      return res.status(404).json({ error: "Not found", slug });
    }

    console.log(
      `[content:get] OK slug="${slug}" id=${item.id} status=${item.status} lastUpdated=${item.lastUpdated} hash=${tinyHash(
        item.content
      )}`
    );

    res.json(item);
  } catch (err) {
    console.error("[content:get] ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

// --- FIX: Admin search by text (remove unsupported `mode`)
router.get("/admin/search", requireAdmin, async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ items: [] });

  try {
    const items = await prisma.contentBlock.findMany({
      where: {
        OR: [
          { section: { contains: q } },  // removed `mode`
          { slug:    { contains: q } },
          { content: { contains: q } },
        ],
      },
      orderBy: [
        { publishedAt: "desc" },
        { lastUpdated: "desc" },
      ],
      select: {
        id: true,
        slug: true,
        section: true,
        content: true,
        status: true,
        lastUpdated: true,
        publishedAt: true,
      },
      take: 100,
    });

    const lcq = q.toLowerCase();
    const withSnippets = items.map((r) => {
      const text = r.content || "";
      const idx = text.toLowerCase().indexOf(lcq);
      if (idx < 0) return { ...r, snippet: text.slice(0, 160) + (text.length > 160 ? "…" : "") };
      const span = 80;
      const s = Math.max(0, idx - span);
      const e = Math.min(text.length, idx + q.length + span);
      return {
        ...r,
        snippet: (s > 0 ? "…" : "") + text.slice(s, e) + (e < text.length ? "…" : ""),
      };
    });

    res.json({ items: withSnippets });
  } catch (err) {
    console.error("[content:admin:search] ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- ADD: Public multi-slug fetch: GET /api/content/by-slugs?slugs=a,b,c
router.get("/by-slugs", async (req, res) => {
  const slugsParam = String(req.query.slugs || "").trim();
  if (!slugsParam) return res.json({ data: {} });

  const slugs = slugsParam.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!slugs.length) return res.json({ data: {} });

  try {
    const rows = await prisma.contentBlock.findMany({
      where: { slug: { in: slugs }, status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { lastUpdated: "desc" }],
      select: { slug: true, content: true, lastUpdated: true, publishedAt: true },
    });

    // keep newest per slug
    const map: Record<string, { content: string; updatedAt: string }> = {};
    for (const r of rows) {
      if (!map[r.slug]) {
        map[r.slug] = { content: r.content, updatedAt: (r.publishedAt ?? r.lastUpdated).toISOString() };
      }
    }
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: map });
  } catch (err) {
    console.error("[content:by-slugs] ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
});
