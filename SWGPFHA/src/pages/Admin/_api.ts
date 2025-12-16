import { type Payment, type Message, type Opportunity, type MediaItem, type PayStats } from "./_types";

export const API = (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";
export const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY as string | undefined;

export const apiUrl = (path: string) => `${API}${path}`;

export const ensureJson = async <T,>(res: Response): Promise<T> => {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Expected JSON but got ${ct || "unknown"}${text ? ` — ${text.slice(0, 120)}…` : ""}`);
  }
  return res.json() as Promise<T>;
};

export const safeErr = async (res: Response) => {
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      return j?.error || res.statusText;
    }
    const t = await res.text();
    return t || res.statusText;
  } catch {
    return res.statusText;
  }
};

export async function listPayments(page: number, pageSize: number, status: Payment["status"] | "ALL") {
  if (!ADMIN_KEY) throw new Error("Missing VITE_ADMIN_API_KEY");
  const url = new URL(apiUrl("/api/admin/payments"));
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  if (status !== "ALL") url.searchParams.set("status", status);
  const res = await fetch(url.toString(), { headers: { "x-admin-key": ADMIN_KEY! } });
  if (!res.ok) throw new Error(await safeErr(res));
  return ensureJson<{ items: Payment[]; total: number }>(res);
}

export async function getPayStats() {
  if (!ADMIN_KEY) throw new Error("Missing VITE_ADMIN_API_KEY");
  const res = await fetch(apiUrl("/api/admin/payments/stats"), { headers: { "x-admin-key": ADMIN_KEY! }, cache: "no-store" });
  if (!res.ok) throw new Error(await safeErr(res));
  return ensureJson<PayStats>(res);
}

export async function listMessages(page: number, pageSize: number, status: Message["status"] | "ALL") {
  if (!ADMIN_KEY) throw new Error("Missing VITE_ADMIN_API_KEY");
  const url = new URL(apiUrl("/api/contact-messages"));
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  if (status !== "ALL") url.searchParams.set("status", status);
  const res = await fetch(url.toString(), { headers: { "x-admin-key": ADMIN_KEY! } });
  if (!res.ok) throw new Error(await safeErr(res));
  return ensureJson<{ items: Message[]; total: number }>(res);
}

export async function updateMessageStatus(id: string, status: Message["status"]) {
  if (!ADMIN_KEY) throw new Error("Missing VITE_ADMIN_API_KEY");
  const res = await fetch(apiUrl(`/api/contact-messages/${id}/status`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await safeErr(res));
  return { ok: true };
}

export async function listOpps() {
  const res = await fetch(apiUrl("/api/opportunities"));
  if (!res.ok) throw new Error(await safeErr(res));
  return ensureJson<Opportunity[]>(res);
}

export async function createOpp(payload: Omit<Opportunity, "id" | "createdAt">) {
  if (!ADMIN_KEY) throw new Error("Missing VITE_ADMIN_API_KEY");
  const res = await fetch(apiUrl("/api/admin/opportunities"), {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await safeErr(res));
  return ensureJson<Opportunity>(res);
}

export async function updateOpp(id: string, payload: Partial<Opportunity>) {
  if (!ADMIN_KEY) throw new Error("Missing VITE_ADMIN_API_KEY");
  const res = await fetch(apiUrl(`/api/admin/opportunities/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await safeErr(res));
  return ensureJson<Opportunity>(res);
}

export async function deleteOpp(id: string) {
  if (!ADMIN_KEY) throw new Error("Missing VITE_ADMIN_API_KEY");
  const res = await fetch(apiUrl(`/api/admin/opportunities/${id}`), {
    method: "DELETE",
    headers: { "x-admin-key": ADMIN_KEY },
  });
  if (!res.ok) throw new Error(await safeErr(res));
  return ensureJson<{ ok: true }>(res);
}

export async function listMedia(page: number, pageSize: number, type: "ALL" | "photo" | "video" | "document") {
  if (!ADMIN_KEY) throw new Error("Missing VITE_ADMIN_API_KEY");
  const url = new URL(apiUrl("/api/admin/media"));
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  if (type !== "ALL") url.searchParams.set("type", type);
  const res = await fetch(url.toString(), { headers: { "x-admin-key": ADMIN_KEY! } });
  if (!res.ok) throw new Error(await safeErr(res));
  return ensureJson<{ items: MediaItem[]; total: number }>(res);
}

export async function deleteMediaItem(id: string) {
  if (!ADMIN_KEY) throw new Error("Missing VITE_ADMIN_API_KEY");
  const res = await fetch(apiUrl(`/api/admin/media/${id}`), { method: "DELETE", headers: { "x-admin-key": ADMIN_KEY! } });
  if (!res.ok) throw new Error(await safeErr(res));
  return { ok: true };
}

export async function verifyPayment(id: string) {
  const r = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN || ""}/api/admin/payments/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_API_KEY! },
  });
  if (!r.ok) throw new Error(`Verify failed: ${r.status}`);
  return r.json();
}

export async function refundPayment(id: string) {
  const r = await fetch(`${import.meta.env.VITE_BACKEND_ORIGIN || ""}/api/admin/payments/${id}/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": import.meta.env.VITE_ADMIN_API_KEY! },
  });
  if (!r.ok) throw new Error(`Refund failed: ${r.status}`);
  return r.json();
}
