// src/routes/payments.ts
import { Router, Request, Response, NextFunction } from "express";
import { fetch } from "undici";
import { prisma } from "../prisma.js";
import { env } from "../env.js";

// put near the top of src/routes/payments.ts
type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status?: string; // "success" | "failed" | "abandoned" | ...
    amount?: number; // in kobo/pesewas
    currency?: string; // "GHS"
    channel?: string; // "mobile_money" | "card" | ...
    gateway_response?: string;
    paid_at?: string | null;
    metadata?: {
      custom_fields?: Array<{
        display_name?: string;
        variable_name?: string;
        value?: any;
      }>;
      [k: string]: any;
    };
    customer?: { email?: string };
  };
};

const router = Router();

/** Simple admin guard (matches your other routes) */
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-admin-key");
  if (!env.ADMIN_API_KEY || key !== env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * Maps Paystack's status strings to our enum
 */
function mapStatus(s?: string) {
  const x = String(s || "").toLowerCase();
  if (x === "success") return "SUCCESS";
  if (x === "failed") return "FAILED";
  if (x === "abandoned") return "ABANDONED";
  return "PENDING";
}

/**
 * GET /api/payments/verify-payment?reference=xxxx
 * - Calls Paystack verify endpoint
 * - Upserts a Payment row for the reference
 * - Returns the raw Paystack data for your existing frontend logic
 */
router.get("/verify-payment", async (req, res) => {
  try {
    const ref = String(req.query.reference || "").trim();
    if (!ref) return res.status(400).json({ error: "Missing reference" });
    if (!env.PAYSTACK_SECRET_KEY) {
      return res
        .status(500)
        .json({ error: "PAYSTACK_SECRET_KEY not configured" });
    }

    const psRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
      {
        headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
      }
    );

    // Paystack always returns JSON for verify
    // Paystack always returns JSON for verify
    const payload = (await psRes
      .json()
      .catch(() => null)) as PaystackVerifyResponse | null;

    if (!psRes.ok || !payload) {
      return res
        .status(502)
        .json({ error: "Paystack verify failed", data: payload });
    }

    // Typical shape: { status: true, message: "...", data: {...} }
    const tx = (payload && "data" in payload ? payload.data : undefined) ?? {};

    const status = mapStatus(tx?.status);
    const amountMinor = Number(tx?.amount ?? 0); // in pesewas
    const amount = amountMinor / 100; // GHS
    const currency = String(tx?.currency ?? "GHS");
    const channel = String(tx?.channel ?? "");
    const gatewayResponse = String(tx?.gateway_response ?? "");
    const paidAt = tx?.paid_at ? new Date(tx.paid_at) : null;

    // Extract metadata we sent from the frontend (names, donor, method, phone)
    const md = tx?.metadata || {};
    const customFields = Array.isArray(md?.custom_fields)
      ? md.custom_fields
      : [];
    const getField = (name: string) =>
      customFields.find(
        (f: any) =>
          String(f?.variable_name).toLowerCase() === name.toLowerCase()
      )?.value;

    const method = getField("method") || undefined;
    const donorName =
      (getField("donor") as string) ||
      [getField("first_name"), getField("last_name")]
        .filter(Boolean)
        .join(" ") ||
      undefined;
    const firstName = (getField("first_name") as string) || undefined;
    const lastName = (getField("last_name") as string) || undefined;
    const phone = (getField("msisdn") as string) || undefined;

    // Email also comes from tx.customer.email (more reliable)
    const email =
      String(tx?.customer?.email || "") || String(getField("email") || "");

    // Upsert by reference (idempotent if frontend re-verifies/polls)
    const saved = await prisma.payment.upsert({
      where: { reference: ref },
      create: {
        reference: ref,
        status, // <- plain string: "SUCCESS" | "PENDING" | ...
        amountMinor,
        amount,
        currency,
        channel,
        method,
        donorName,
        firstName,
        lastName,
        email,
        phone,
        gatewayResponse,
        metadataJson: JSON.stringify(md), // <- store as string
        paidAt: paidAt || undefined,
      },
      update: {
        status,
        amountMinor,
        amount,
        currency,
        channel,
        method,
        donorName,
        firstName,
        lastName,
        email,
        phone,
        gatewayResponse,
        metadataJson: JSON.stringify(md),
        paidAt: paidAt || undefined,
      },
    });

    return res.json({
      ok: true,
      saved: { id: saved.id, reference: saved.reference, status: saved.status },
      data: payload, // keep your original debug / UI behavior
    });
  } catch (err: any) {
    console.error("verify-payment error:", err);
    return res
      .status(500)
      .json({ error: "Internal error", detail: err?.message });
  }
});

/**
 * Admin list payments
 * GET /api/admin/payments?page=1&pageSize=20&status=SUCCESS|PENDING|...
 */
router.get("/admin/payments", requireAdmin, async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));
  const status = String(req.query.status || "").toUpperCase();
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
  ]);

  res.json({ items, total, page, pageSize });
});

export default router;

// GET /api/admin/payments/stats
router.get("/admin/payments/stats", requireAdmin, async (req, res) => {
  // Total SUCCESS donations (amount is in GHS already)
  const [succAgg, counts] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }).catch(() => [] as Array<{ status: string; _count: { _all: number } }>),
  ]);

  const byStatus: Record<string, number> = {};
  for (const c of counts) byStatus[c.status] = c._count._all;

  res.json({
    currency: "GHS",
    totalAmount: Number(succAgg._sum.amount ?? 0),
    totalCount: Number(succAgg._count._all ?? 0),
    byStatus, // e.g. { SUCCESS: 12, PENDING: 3, FAILED: 1, ... }
  });
});
