import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mail, Phone, MoreHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { listMessages, updateMessageStatus } from "../_api";
import type { Message } from "../_types";
import MessageDetailDialog from "../components/MessageDetailDialog";
import { ADMIN_KEY } from "../_api";

const PAGE_SIZE = 20;

type Status = Message["status"];
const statusStyles: Record<Status, { badge: "default" | "secondary" | "destructive" | "outline"; border: string }> = {
    NEW: { badge: "destructive", border: "border-l-4 border-l-destructive" },
    READ: { badge: "secondary", border: "border-l-4 border-l-secondary" },
    REPLIED: { badge: "default", border: "border-l-4 border-l-primary" },
    ARCHIVED: { badge: "outline", border: "border-l-4 border-l-muted" },
};

function formatWhen(d: string | number | Date) {
    const dt = new Date(d);
    const now = new Date();
    const diff = (now.getTime() - dt.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    // show date if older than 7 days
    if (diff > 86400 * 7) return dt.toLocaleDateString();
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function MessagesSection() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<Message["status"] | "ALL">("ALL");
    const [rows, setRows] = useState<Message[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [detail, setDetail] = useState<Message | null>(null);
    const [q, setQ] = useState("");

    async function load() {
        try {
            setLoading(true);
            setErr(null);
            const data = await listMessages(page, PAGE_SIZE, status);
            setRows(data.items || []);
            setTotal(data.total || 0);
        } catch (e: any) {
            setErr(e?.message || "Failed to load messages");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, status]);

    async function quick(next: Status, id: string) {
        await updateMessageStatus(id, next);
        setRows((prev) => prev.map((m) => (m.id === id ? { ...m, status: next } : m)));
    }

    const filtered = useMemo(() => {
        if (!q.trim()) return rows;
        const needle = q.toLowerCase();
        return rows.filter((m) => {
            const subject = (m.subject || "").toLowerCase();
            const message = (m.message || "").toLowerCase();
            const email = (m.email || "").toLowerCase();
            const phone = (m.phone || "").toLowerCase();
            const name = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
            const type = (m.inquiryType || "").toLowerCase();
            return [subject, message, email, phone, name, type].some((v) => v.includes(needle));
        });
    }, [rows, q]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Contact Messages
                            </CardTitle>
                            <Badge variant="secondary" className="ml-1">{total} total</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search name, subject, email…"
                                className="w-[260px]"
                            />
                            <Select
                                value={status}
                                onValueChange={(v) => {
                                    setPage(1);
                                    setStatus(v as any);
                                }}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="NEW">New</SelectItem>
                                    <SelectItem value="READ">Read</SelectItem>
                                    <SelectItem value="REPLIED">Replied</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={load} disabled={loading || !ADMIN_KEY}>
                                Refresh
                            </Button>
                        </div>
                    </div>
                    {!ADMIN_KEY && (
                        <div className="text-xs text-destructive mt-2">
                            Set <code>VITE_ADMIN_API_KEY</code> to manage messages.
                        </div>
                    )}
                    {err && <div className="text-xs text-destructive mt-2">{err}</div>}
                </CardHeader>

                <CardContent className="pt-0">
                    {loading && <div className="text-sm text-muted-foreground p-4">Loading…</div>}
                    {!loading && filtered.length === 0 && <EmptyState>No messages found.</EmptyState>}

                    <ul className="divide-y">
                        {filtered.map((m) => {
                            const fullName = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
                            const label = statusStyles[m.status];
                            return (
                                <li
                                    key={m.id}
                                    className={`group relative bg-background hover:bg-muted/40 transition-colors`}
                                >
                                    <button
                                        className={`w-full text-left p-4 pr-16 border ${label.border} rounded-xl my-2 focus:outline-none focus:ring-2 focus:ring-primary/40`}
                                        onClick={() => setDetail(m)}
                                    >
                                        {/* SUBJECT — primary, prominent */}
                                        <div className="text-base md:text-[15px] font-semibold leading-tight truncate text-foreground">
                                            {m.subject || "(no subject)"}
                                        </div>

                                        {/* BYLINE — sender + chips + time (muted, clearly secondary) */}
                                        <div className="mt-1 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">
                                                    {fullName || m.email || "Unknown sender"}
                                                </span>
                                                <span className="text-muted-foreground/40">•</span>
                                                <Badge variant={label.badge as any} className="px-1.5 py-0.5 text-[10px]">
                                                    {m.status}
                                                </Badge>
                                                {m.inquiryType && (
                                                    <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] uppercase">
                                                        {m.inquiryType.replace(/-/g, " ")}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                {formatWhen(m.createdAt)}
                                            </span>
                                        </div>

                                        {/* META — keeps your email/phone, lighter and spaced down */}
                                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                            {m.email && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {m.email}
                                                </span>
                                            )}
                                            {m.phone && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {m.phone}
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Actions (hover / focus) */}
                                    <div
                                        className="absolute top-3 right-3"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                {m.status !== "READ" && (
                                                    <DropdownMenuItem onClick={() => quick("READ", m.id)}>
                                                        Mark as Read
                                                    </DropdownMenuItem>
                                                )}
                                                {m.status !== "REPLIED" && (
                                                    <DropdownMenuItem onClick={() => quick("REPLIED", m.id)}>
                                                        Mark as Replied
                                                    </DropdownMenuItem>
                                                )}
                                                {m.status !== "ARCHIVED" && (
                                                    <DropdownMenuItem onClick={() => quick("ARCHIVED", m.id)}>
                                                        Archive
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-4">
                        <Pagination
                            page={page}
                            pageSize={PAGE_SIZE}
                            total={total}
                            onPrev={() => setPage((p) => Math.max(1, p - 1))}
                            onNext={() => setPage((p) => p + 1)}
                        />
                    </div>
                </CardContent>
            </Card>

            <MessageDetailDialog
                open={!!detail}
                message={detail}
                onClose={() => setDetail(null)}
                onReplied={async (id) => {
                    await updateMessageStatus(id, "REPLIED");
                    setRows((prev) => prev.map((m) => (m.id === id ? { ...m, status: "REPLIED" } : m)));
                }}
            />
        </div>
    );
}
