import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { z } from "zod";
import crypto from "crypto";
import { env } from "../env.js";
// ✅ Only import the Prisma namespace (no model types)
import type { Prisma } from "@prisma/client";

const router = Router();

// Simple admin guard using header x-admin-key
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-admin-key");
  if (!env.ADMIN_API_KEY || key !== env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// --- Zod schemas ---
const createMessageBody = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional().or(z.literal("")),
  inquiryType: z.string().min(1, "Inquiry type is required"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(5, "Message is required"),
});

const updateStatusBody = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]),
});

// --- Public: Create message ---
router.post("/", async (req: Request, res: Response) => {
  const parsed = createMessageBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const data = parsed.data;

  const publicId = crypto.randomBytes(9).toString("base64url"); // ~12 chars

  const created = await prisma.contactMessage.create({
    data: {
      publicId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || null,
      inquiryType: data.inquiryType,
      subject: data.subject.trim(),
      message: data.message.trim(),
    },
  });

  res.status(201).json({
    ok: true,
    id: created.publicId,
    createdAt: created.createdAt,
  });
});

// --- Admin: list messages (paged) ---
// --- Admin: list messages (paged) ---
router.get("/", requireAdmin, async (req: Request, res: Response) => {
  const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? "20"), 10) || 20, 1), 100);
  const statusRaw = (req.query.status as string | undefined)?.toUpperCase();

  const normalizedStatus =
    statusRaw && ["NEW", "READ", "REPLIED", "ARCHIVED"].includes(statusRaw) ? (statusRaw as any) : undefined;

  // 🔧 Don’t try to infer from the delegate; just use a minimal shape
  type ContactMessageWhere = { status?: any };
  const where: ContactMessageWhere = normalizedStatus ? { status: normalizedStatus } : {};

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  // 🔧 Give the mapper a type so 'm' isn’t implicit any
  type ContactMessageRow = {
    publicId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    inquiryType: string;
    subject: string;
    message: string;
    status: any;       // enum in prod, string in dev
    createdAt: Date;
  };

  res.json({
    items: (items as ContactMessageRow[]).map((m: ContactMessageRow) => ({
      id: m.publicId,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      inquiryType: m.inquiryType,
      subject: m.subject,
      message: m.message,
      status: m.status,
      createdAt: m.createdAt,
    })),
    total,
    page,
    pageSize,
  });
});


// --- Admin: update status ---
router.patch("/:publicId/status", requireAdmin, async (req: Request, res: Response) => {
  const { publicId } = req.params;
  const parsed = updateStatusBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const updated = await prisma.contactMessage.update({
    where: { publicId },
    data: { status: parsed.data.status as any }, // dev: string; prod: enum
  });

  res.json({ ok: true, id: updated.publicId, status: updated.status });
});

export default router;
