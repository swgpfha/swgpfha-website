import { Router, type RequestHandler } from "express";
import multer from "multer";
import fs from "node:fs";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { env } from "../env.js";
import path from "node:path";
import mime from "mime-types";
import { uploadToCloudinary } from "../services/cloudinary.js";

const router = Router();

/** Simple header key guard for admin routes */
const requireAdmin: RequestHandler = (req, res, next) => {
  const key = req.header("x-admin-key");
  if (!env.ADMIN_API_KEY || key !== env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

/** ensure uploads dir exists */
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/** temp disk storage (dev) */
const upload = multer({ dest: uploadsDir });

/** Zod schema for metadata payload */
const createMediaItemBody = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  location: z.string().optional(),
  eventDate: z.string().datetime().optional(), // ISO string
  type: z.enum(["photo", "video", "document"]),
});

/** classify a file's mimetype into app "type" */
function classifyType(mimeType: string): "photo" | "video" | "document" {
  if (mimeType.startsWith("image/")) return "photo";
  if (mimeType.startsWith("video/")) return "video";
  // pdf, docx, txt, etc.
  return "document";
}

/** map to cloudinary resource_type */
function toCloudinaryResourceType(mimeType: string): "image" | "video" | "raw" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw"; // documents and everything else
}

/** choose extension; prefer mimetype, fall back to original filename ext */
function pickExt(file: Express.Multer.File): string {
  const fromMime = mime.extension(file.mimetype);
  const fromName = path.extname(file.originalname).replace(".", "");
  const ext = (fromMime || fromName || "").toLowerCase();
  return ext ? `.${ext}` : ""; // may be empty
}

/** ensure the temp file has an extension and return public URL + final path */
function ensureExt(file: Express.Multer.File): { diskPath: string; publicUrl: string; ext: string } {
  const baseName = path.basename(file.path); // random name from multer
  const wantedExt = pickExt(file);
  const finalName = wantedExt && !baseName.endsWith(wantedExt) ? baseName + wantedExt : baseName;
  const finalPath = path.join(uploadsDir, finalName);

  if (finalPath !== file.path) {
    fs.renameSync(file.path, finalPath);
  }

  return {
    diskPath: finalPath,
    publicUrl: `/uploads/${finalName}`,
    ext: wantedExt.replace(".", ""),
  };
}

/**
 * POST /api/admin/media
 * multipart/form-data:
 *  - data: JSON string => { title, description?, location?, eventDate?, type }
 *  - files: File[] (images/videos/docs)
 */
router.post("/", requireAdmin, upload.array("files", 12), async (req, res) => {
  try {
    const raw = (req.body as any)?.data;
    if (!raw) return res.status(400).json({ error: "Missing data" });

    const parsed = createMediaItemBody.parse(JSON.parse(raw));

    // Create the parent item
    const item = await prisma.mediaItem.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        location: parsed.location,
        eventDate: parsed.eventDate ? new Date(parsed.eventDate) : null,
        type: parsed.type as any, // avoid enum import mismatch
      },
    });

    const files = ((req as any).files as Express.Multer.File[]) ?? [];

    for (const file of files) {
      const mimeType =
        file.mimetype || (mime.lookup(file.originalname) || "application/octet-stream").toString();
      const appType = classifyType(mimeType);
      const resourceType = toCloudinaryResourceType(mimeType);

      let assetUrl: string | null = null;
      let thumbUrl: string | null = null;
      let provider: "cloudinary" | "local" = "local";
      let width: number | null = null;
      let height: number | null = null;
      let durationSec: number | null = null;
      let format: string | null = null;

      // Try Cloudinary first (if configured)
      const uploaded = await uploadToCloudinary(file.path, resourceType);
      if (uploaded) {
        assetUrl = uploaded.url;
        thumbUrl = uploaded.thumbUrl || null;
        provider = "cloudinary";
        width = uploaded.width ?? null;
        height = uploaded.height ?? null;
        durationSec = uploaded.durationSec ?? null;
        format = uploaded.format ?? null;

        // cleanup temp file
        try { fs.unlinkSync(file.path); } catch {}
      } else {
        // Local dev storage: ensure file has an extension and keep it
        const { diskPath, publicUrl, ext } = ensureExt(file);
        assetUrl = publicUrl;
        provider = "local";
        format = ext || null;
        // (Optional) you can probe width/height/duration here if needed
      }

      const asset = await prisma.mediaAsset.create({
        data: {
          itemId: item.id,
          url: assetUrl!,
          thumbUrl,
          provider,
          width,
          height,
          durationSec,
          format,
        },
      });

      // Seed cover/thumbnail if missing
      if (!item.coverUrl) {
        await prisma.mediaItem.update({
          where: { id: item.id },
          data: { coverUrl: asset.url, thumbUrl: asset.thumbUrl ?? asset.url },
        });
      }
    }

    const itemWithAssets = await prisma.mediaItem.findUnique({
      where: { id: item.id },
      include: { assets: true },
    });

    return res.status(201).json(itemWithAssets);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

/** DELETE /api/admin/media/:id */
router.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };
  await prisma.mediaAsset.deleteMany({ where: { itemId: id } });
  await prisma.mediaItem.delete({ where: { id } });
  res.json({ ok: true });
});

/** GET /api/admin/media?page=1&pageSize=12&type=photo|video|document */
router.get("/", requireAdmin, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || "12"), 10)));
  const type = req.query.type ? String(req.query.type) : undefined;

  const where = type ? { type } : undefined;

  const [total, items] = await Promise.all([
    prisma.mediaItem.count({ where }),
    prisma.mediaItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { assets: true },
    }),
  ]);

  res.json({ items, total, page, pageSize });
});

export default router;
