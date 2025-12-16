// src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import crypto from "crypto";
import { env } from "./env.js";

import mediaPublic from "./routes/media.public.js";
import mediaAdmin from "./routes/media.admin.js";
import opportunitiesAdminRouter from "./routes/opportunities.admin.js";
import opportunitiesRouter from "./routes/opportunities.js";
import contactMessagesRouter from "./routes/contactMessages.js";
import paymentsRouter from "./routes/payments.js";
import contentRouter from "./routes/content.js";
const app = express();
app.set("trust proxy", true);

// CORS: allow localhost; in prod restrict to your domain(s)
app.use(cors({ origin: true, credentials: true }));
app.use(morgan(env.isDev ? "dev" : "combined"));

// JSON parser (DO NOT apply to the Paystack webhook; it needs raw)
app.use(express.json());

// Serve local uploads (dev; or prod if you intend to keep local storage)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routers
app.use("/api/media", mediaPublic);
app.use("/api/admin/media", mediaAdmin);
app.use("/api/admin/opportunities", opportunitiesAdminRouter);
app.use("/api/opportunities", opportunitiesRouter);
app.use("/api/contact-messages", contactMessagesRouter);
app.use("/api/payments", paymentsRouter); // verify endpoints etc.
app.use("/api", paymentsRouter);  // <- was redundant/buggy
app.use("/api/content", contentRouter);

/* -------------------------------
   Types for Paystack payloads
-------------------------------- */
type PaystackTxStatus = "abandoned" | "failed" | "reversed" | "success" | string;

interface PaystackVerifyData {
  status?: PaystackTxStatus;
  gateway_response?: string;
  reference?: string;
  amount?: number; // minor units
  currency?: string;
  [k: string]: unknown;
}
interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: PaystackVerifyData;
}
interface PaystackWebhookEvent {
  event?: string;
  data?: PaystackVerifyData;
  [k: string]: unknown;
}

/* -------------------------------
   PAYSTACK: verify + webhook
-------------------------------- */
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API = "https://api.paystack.co";

if (!PAYSTACK_SECRET) {
  console.warn("[payments] PAYSTACK_SECRET_KEY is not set — payments will fail.");
}

// Verify by reference
app.get("/api/payments/verify-payment", async (req: Request, res: Response) => {
  try {
    const reference = String(req.query.reference || "");
    if (!reference) return res.status(400).json({ error: "reference required" });
    if (!PAYSTACK_SECRET) return res.status(500).json({ error: "Missing PAYSTACK_SECRET_KEY" });

    const r = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    const data = (await r.json()) as PaystackVerifyResponse;
    if (!r.ok) return res.status(400).json(data);

    const status = data?.data?.status;
    const gateway = String(data?.data?.gateway_response ?? "").toLowerCase();
    const ok = status === "success" || gateway === "approved";

    return res.json({ ok, data: data.data });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Webhook (use RAW body to verify signature)
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  (req: Request, res: Response) => {
    try {
      if (!PAYSTACK_SECRET) return res.sendStatus(500);

      const signature = req.headers["x-paystack-signature"] as string | undefined;
      // HMAC over the raw body buffer
      const computed = crypto
        .createHmac("sha512", PAYSTACK_SECRET)
        .update(req.body) // Buffer
        .digest("hex");

      if (!signature || signature !== computed) return res.sendStatus(401);

      // Parse manually since we used raw()
      const event = JSON.parse((req.body as Buffer).toString("utf8")) as PaystackWebhookEvent;

      // TODO: upsert donation status using event.data?.reference / event.data?.status
      console.log("[paystack:hook]", event.event, event.data?.reference, event.data?.status);

      res.sendStatus(200);
    } catch (err) {
      console.error("[paystack:hook] error", err);
      res.sendStatus(500);
    }
  }
);

// Health
app.get("/healthz", (_: Request, res: Response) => {
  res.json({ ok: true, env: env.NODE_ENV });
});

app.listen(env.PORT, () => {
  console.log(`[${env.NODE_ENV}] media api listening on :${env.PORT}`);
});

export default app;
