import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listPayments, getPayStats, verifyPayment, refundPayment } from "../_api"; // ⬅️ add these two in _api if not present
import type { Payment, PayStats } from "../_types";
import { ADMIN_KEY } from "../_api";
import { Receipt, CreditCard, Smartphone, RefreshCw } from "lucide-react";

const PAGE_SIZE = 20;

const fmtMoney = (amt: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 2 }).format(amt ?? 0);

const statusStyles: Record<
    Payment["status"],
    { variant: "default" | "secondary" | "destructive" | "outline"; tone: string }
> = {
    SUCCESS: { variant: "default", tone: "bg-emerald-500/10 text-emerald-600 border-emerald-600/20" },
    PENDING: { variant: "secondary", tone: "bg-amber-500/10 text-amber-600 border-amber-600/20" },
    FAILED: { variant: "destructive", tone: "bg-red-500/10 text-red-600 border-red-600/20" },
    ABANDONED: { variant: "outline", tone: "bg-slate-500/10 text-slate-600 border-slate-600/20" },
    REFUNDED: { variant: "outline", tone: "bg-blue-500/10 text-blue-600 border-blue-600/20" },
};

function ChannelPill({ channel }: { channel?: string | null }) {
    const ch = (channel || "").toLowerCase();
    const Icon = ch.includes("momo") || ch.includes("mobile") ? Smartphone : CreditCard;
    return (
        <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border bg-muted/40 text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            {channel || "—"}
        </span>
    );
}

export default function DonationsSection() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<Payment["status"] | "ALL">("ALL");
    const [rows, setRows] = useState<Payment[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [stats, setStats] = useState<PayStats | null>(null);
    const [statsErr, setStatsErr] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [working, setWorking] = useState<string | null>(null); // payment id currently being acted on

    async function load() {
        try {
            setLoading(true);
            setErr(null);
            const data = await listPayments(page, PAGE_SIZE, status);
            setRows(data.items || []);
            setTotal(data.total || 0);
        } catch (e: any) {
            setErr(e?.message || "Failed to load payments");
        } finally {
            setLoading(false);
        }
    }

    async function loadStats() {
        try {
            setStatsErr(null);
            const s = await getPayStats();
            setStats(s);
        } catch (e: any) {
            setStatsErr(e?.message || "Failed to load payment stats");
        }
    }

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, status]);
    useEffect(() => {
        loadStats();
        const t = setInterval(loadStats, 15000);
        return () => clearInterval(t);
    }, []);

    const filtered = useMemo(() => {
        if (!q.trim()) return rows;
        const needle = q.toLowerCase();
        return rows.filter((p) => {
            const who = (p.donorName || [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email || "Anonymous").toLowerCase();
            const ref = (p.reference || "").toLowerCase();
            const ch = (p.channel || p.method || "").toLowerCase();
            return [who, ref, ch].some((v) => v.includes(needle));
        });
    }, [rows, q]);

    async function doVerify(p: Payment) {
        try {
            setWorking(p.id);
            await verifyPayment(p.id);   // ⬅️ calls backend to hit Paystack verify
            await load();
            await loadStats();
        } catch (e) {
            console.error(e);
            // optionally toast here
        } finally {
            setWorking(null);
        }
    }

    async function doRefund(p: Payment) {
        if (!window.confirm(`Refund ${fmtMoney(p.amount)} for ${p.reference}?`)) return;
        try {
            setWorking(p.id);
            await refundPayment(p.id);   // ⬅️ calls backend to refund
            await load();
            await loadStats();
        } catch (e) {
            console.error(e);
        } finally {
            setWorking(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* Overview / Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Total Received</div>
                    <div className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-500">
                        {fmtMoney(stats?.totalAmount ?? 0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{statsErr ? statsErr : `${stats?.totalCount ?? 0} payments`}</div>
                </CardContent></Card>

                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">This Month</div>
                    <div className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-500">
                        {fmtMoney(stats?.monthAmount ?? 0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{`${stats?.monthCount ?? 0} payments`}</div>
                </CardContent></Card>

                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                    <div className="mt-1 text-2xl font-semibold">
                        {typeof stats?.successRate === "number" ? `${(stats!.successRate * 100).toFixed(0)}%` : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">of all attempts</div>
                </CardContent></Card>

                <Card><CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Avg. Donation</div>
                    <div className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-500">
                        {fmtMoney(stats?.avgAmount ?? 0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">per successful payment</div>
                </CardContent></Card>
            </div>


            {/* List & Filters */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Donations (Payments)
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search donor, reference, channel…" className="w-[260px]" />
                            <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v as any); }}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="SUCCESS">Success</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="ABANDONED">Abandoned</SelectItem>
                                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={load} disabled={loading || !ADMIN_KEY}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                    {!ADMIN_KEY && <div className="text-xs text-destructive mt-2">Set <code>VITE_ADMIN_API_KEY</code> to manage payments.</div>}
                    {err && <div className="text-xs text-destructive mt-2">{err}</div>}
                </CardHeader>

                <CardContent className="pt-0">
                    {loading && <div className="text-sm text-muted-foreground p-4">Loading…</div>}
                    {!loading && filtered.length === 0 && <EmptyState>No payments found.</EmptyState>}

                    {/* Header row */}
                    {filtered.length > 0 && (
                        <div className="mt-2 hidden md:grid grid-cols-[minmax(180px,1.4fr)_120px_110px_140px_160px_160px_220px] gap-3 px-3 py-2 text-xs text-muted-foreground">
                            <span>Donor</span>
                            <span className="text-right">Amount</span>
                            <span>Status</span>
                            <span>Channel</span>
                            <span>Reference</span>
                            <span>Date</span>
                            <span className="text-right">Actions</span>
                        </div>
                    )}

                    {/* Rows */}
                    <ul className="divide-y rounded-xl border">
                        {filtered.map((p) => {
                            const who = p.donorName || [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email || "Anonymous";
                            const when = p.paidAt || p.createdAt ? new Date(p.paidAt || p.createdAt).toLocaleString() : "—";
                            const style = statusStyles[p.status];
                            const canVerify = ["PENDING", "FAILED", "ABANDONED"].includes(p.status);
                            const canRefund = p.status === "SUCCESS";

                            return (
                                <li key={p.id} className="px-3 py-3">
                                    {/* Desktop grid */}
                                    <div className="hidden md:grid grid-cols-[minmax(180px,1.4fr)_120px_110px_140px_160px_160px_220px] gap-3 items-center">
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{who}</div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {p.email || "—"}{p.phone ? ` • ${p.phone}` : ""}
                                            </div>
                                        </div>

                                        <div className="text-right font-semibold text-emerald-600 dark:text-emerald-500">
                                            {fmtMoney(p.amount)}
                                        </div>

                                        <div>
                                            <span className={`inline-flex items-center px-2 py-1 text-[11px] rounded-full border ${style.tone}`}>
                                                {p.status}
                                            </span>
                                        </div>

                                        <div><ChannelPill channel={p.channel || p.method} /></div>

                                        <div className="font-mono text-xs truncate">{p.reference}</div>

                                        <div className="text-sm text-muted-foreground">{when}</div>

                                        <div className="flex items-center justify-end gap-2">
                                            
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                disabled={!canVerify || working === p.id}
                                                onClick={() => doVerify(p)}
                                                title="Verify with Paystack"
                                            >
                                                {working === p.id ? "Verifying…" : "Verify"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-rose-600 hover:bg-zinc-800 text-white"
                                                disabled={!canRefund || working === p.id}
                                                onClick={() => doRefund(p)}
                                                title="Refund"
                                            >
                                                {working === p.id ? "Processing…" : "Refund"}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Mobile stacked */}
                                    <div className="md:hidden space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{who}</div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {p.email || "—"}{p.phone ? ` • ${p.phone}` : ""}
                                                </div>
                                            </div>
                                            <div className="text-right font-semibold text-emerald-600 dark:text-emerald-500">
                                                {fmtMoney(p.amount)}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`inline-flex items-center px-2 py-1 text-[11px] rounded-full border ${style.tone}`}>
                                                {p.status}
                                            </span>
                                            <ChannelPill channel={p.channel || p.method} />
                                            <span className="font-mono text-[11px] truncate">{p.reference}</span>
                                            <span className="text-xs text-muted-foreground ml-auto">{when}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="flex-1"
                                                disabled={!canVerify || working === p.id}
                                                onClick={() => doVerify(p)}
                                                title="Verify with Paystack"
                                            >
                                                {working === p.id ? "Verifying…" : "Verify"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-black hover:bg-zinc-800 text-white"
                                                disabled={!canRefund || working === p.id}
                                                onClick={() => doRefund(p)}
                                                title="Refund"
                                            >
                                                {working === p.id ? "Processing…" : "Refund"}
                                            </Button>

                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <Pagination
                        page={page}
                        pageSize={PAGE_SIZE}
                        total={total}
                        onPrev={() => setPage((p) => Math.max(1, p - 1))}
                        onNext={() => setPage((p) => p + 1)}
                        className="pt-3"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
