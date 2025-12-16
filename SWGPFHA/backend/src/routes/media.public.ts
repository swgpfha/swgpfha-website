import { Router, Request, Response } from "express";
import { prisma } from "../prisma.js";

const router = Router();

// ----- Types used locally (keep in sync with your Prisma model where needed) -----
type SrcAsset = {
  id: string;
  url: string;                 // from Prisma select it's string (not nullable)
  thumbUrl: string | null;
  provider?: string | null;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  format?: string | null;
  createdAt: Date;
};

type Asset = {
  id: string;
  url: string | null;          // after toAbs we allow null
  thumbUrl: string | null;
  provider?: string | null;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  format?: string | null;
  createdAt: Date;
};

type PublicListItem = {
  id: string;
  title: string;
  type: "photo" | "video" | "document";
  createdAt: Date;
  coverUrl: string | null;
  thumbUrl: string | null;
  assets: { id: string; url: string; thumbUrl: string | null }[];
};

// ---------- Helpers (proxy-aware base URL; avoids mixed-content) ----------
function getBaseFromReq(req: Request) {
  // Prefer proxy headers when present (Netlify/Vercel/Nginx)
  const xfProto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim();
  const xfHost  = (req.headers["x-forwarded-host"]  as string)?.split(",")[0]?.trim();
  const host    = xfHost || req.get("host");
  const proto   = xfProto || (req.secure ? "https" : req.protocol || "http");
  return `${proto}://${host}`;
}
const toAbsFactory = (req: Request) => {
  const base = getBaseFromReq(req);
  return (u?: string | null) => (u ? (u.startsWith("/") ? `${base}${u}` : u) : null);
};

/**
 * GET /api/media
 * Query:
 *  - page (default 1)
 *  - limit (default 12, max 60)
 *  - type = photo | video | document (optional)
 *  - search = string (optional: title/desc/location)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 12), 1), 60);

    const rawType = String(req.query.type ?? "").toLowerCase().trim();
    const type =
      rawType === "photo" || rawType === "video" || rawType === "document"
        ? (rawType as "photo" | "video" | "document")
        : undefined;

    const search = (req.query.search as string | undefined)?.trim();

    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.mediaItem.count({ where }),
      prisma.mediaItem.findMany({
        where,
        // Avoid selecting problematic DateTime fields if DB has legacy bad values.
        select: {
          id: true,
          title: true,
          type: true,
          createdAt: true,
          coverUrl: true,
          thumbUrl: true,
          assets: {
            select: { id: true, url: true, thumbUrl: true },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // 🔧 Make URLs absolute and provide robust fallbacks for cover/thumb
    const toAbs = toAbsFactory(req);

    const sanitized = (items as PublicListItem[]).map((it) => {
      // Ensure asset URLs absolute (string type for list is fine)
      const absAssets =
        (it.assets || []).map((a) => ({
          id: a.id,
          url: toAbs(a.url) ?? "", // keep string (empty if null)
          thumbUrl: toAbs(a.thumbUrl),
        })) ?? [];

      // Prefer explicit fields, then fall back to first asset
      const cover =
        toAbs(it.coverUrl) ||
        toAbs(it.thumbUrl) ||
        absAssets[0]?.url ||
        null;

      const thumb =
        toAbs(it.thumbUrl) ||
        absAssets[0]?.thumbUrl ||
        absAssets[0]?.url ||
        null;

      return {
        ...it,
        coverUrl: cover,
        thumbUrl: thumb,
        assets: absAssets,
      };
    });

    res.json({ page, limit, total, items: sanitized });
  } catch (err: any) {
    console.error("GET /api/media failed:", err);
    res.status(500).json({ error: "Failed to load media" });
  }
});

/** GET /api/media/:id */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await prisma.mediaItem.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        type: true,
        createdAt: true,
        // eventDate: true, // re-enable only after DB cleanup
        coverUrl: true,
        thumbUrl: true,
        assets: {
          select: {
            id: true,
            url: true,
            thumbUrl: true,
            provider: true,
            width: true,
            height: true,
            durationSec: true,
            format: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!item) return res.status(404).json({ error: "Not found" });

    const toAbs = toAbsFactory(req);

    const assets: Asset[] =
      ((item.assets || []) as SrcAsset[]).map((a): Asset => ({
        ...a,
        url: toAbs(a.url),
        thumbUrl: toAbs(a.thumbUrl),
      })) ?? [];

    const normalized = {
      ...item,
      coverUrl:
        toAbs(item.coverUrl) ||
        toAbs(item.thumbUrl) ||
        (assets[0]?.url ?? null),
      thumbUrl:
        toAbs(item.thumbUrl) ||
        (assets[0]?.thumbUrl ?? assets[0]?.url ?? null),
      assets,
    };

    res.json(normalized);
  } catch (err: any) {
    console.error("GET /api/media/:id failed:", err);
    res.status(500).json({ error: "Failed to load media item" });
  }
});

export default router;
