import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Eye, CheckCircle2, Globe2, Undo2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import RichEditor from "@/components/RichEditor";
import RichViewer from "@/components/RichViewer";

import Guide, { getCheat, type Cheat } from "../components/Guide";

const API = (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";
const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY ?? "";
const api = (path: string) => `${API}${path}`;

type Block = {
  id: string;
  slug: string;
  section: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
  lastUpdated: string;
  publishedAt?: string | null;
};

function validateJson(text: string): string | null {
  try {
    JSON.parse(text);
    return null;
  } catch (e: any) {
    return e?.message || "Invalid JSON.";
  }
}

export default function ContentSection() {
  const [items, setItems] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Search state
  const [mode, setMode] = useState<"ALL" | "SEARCH">("ALL");
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<(Block & { snippet?: string })[]>([]);

  // Editor fields
  const selected = useMemo(() => items.find((i) => i.id === selectedId) || null, [items, selectedId]);
  const [slug, setSlug] = useState("");
  const [section, setSection] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [previewOpen, setPreviewOpen] = useState(false);

  const cheat = getCheat(slug);
  const isRich = cheat?.type === "rich";
  const isJson = cheat?.type === "json";
  const jsonError = isJson ? validateJson(content) : null;

  const resetForm = (b?: Block) => {
    setSlug(b?.slug || "");
    setSection(b?.section || "");
    setContent(b?.content || "");
    setStatus(((b?.status as any) || "DRAFT") as any);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(api("/api/content/admin/list"), { headers: { "x-admin-key": ADMIN_KEY } });
      if (!res.ok) throw new Error(`Load failed: ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);
      if (data.items?.length && !selectedId) {
        setSelectedId(data.items[0].id);
        resetForm(data.items[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) resetForm(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const runSearch = async (term: string) => {
    const t = term.trim();
    if (!t) {
      setResults([]);
      setMode("ALL");
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(api(`/api/content/admin/search?q=${encodeURIComponent(t)}`), {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();

      // Normalize shapes:
      // - Some backends return { items: [{ block: {...}, snippet: "..." }]}
      // - Others return { items: [{ id, slug, section, content, ... }]}
      const normalized = (data.items || []).map((row: any, i: number) => {
        const base = row?.block ?? row ?? {};
        return {
          id: base.id ?? row.id ?? base.slug ?? `search-${i}`,
          slug: base.slug ?? "",
          section: base.section ?? "",
          content: base.content ?? "",
          status: base.status ?? "DRAFT",
          lastUpdated: base.lastUpdated ?? new Date().toISOString(),
          publishedAt: base.publishedAt ?? null,
          snippet: row.snippet ?? base.snippet,
        } as Block & { snippet?: string };
      });

      setResults(normalized);
      setMode("SEARCH");
    } catch (e) {
      console.error(e);
      setResults([]);
      setMode("SEARCH");
    } finally {
      setSearching(false);
    }
  };

  const onSave = async (opts?: { publishNow?: boolean }) => {
    if (isJson && jsonError) {
      alert(`Fix JSON before saving:\n${jsonError}`);
      return;
    }
    const body = { id: selected?.id, slug, section, content, status, publishNow: !!opts?.publishNow };
    const res = await fetch(api("/api/content/admin/content"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      alert("Save failed");
      return;
    }
    await load();
  };

  const onPublish = async () => {
    if (!selected?.id) return;
    const res = await fetch(api(`/api/content/admin/content/${selected.id}/publish`), {
      method: "PATCH",
      headers: { "x-admin-key": ADMIN_KEY },
    });
    if (!res.ok) {
      alert("Publish failed");
      return;
    }
    await load();
  };

  const onUnpublish = async () => {
    if (!selected?.id) return;
    const res = await fetch(api(`/api/content/admin/content/${selected.id}/unpublish`), {
      method: "PATCH",
      headers: { "x-admin-key": ADMIN_KEY },
    });
    if (!res.ok) {
      alert("Unpublish failed");
      return;
    }
    await load();
  };

  const onCreateNew = () => {
    setSelectedId(null);
    resetForm();
  };

  const pick = (b: Block) => {
    setSelectedId(b.id);
    resetForm(b);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStatusBadge = (s: string) => (
    <Badge variant={s === "PUBLISHED" ? "default" : s === "ARCHIVED" ? "destructive" : "secondary"}>{s}</Badge>
  );

  const insertExample = () => {
    if (!cheat?.example) return;
    setContent(cheat.example);
  };

  /* --------------------- NEW: Use from Guide loads real content --------------------- */
  const useCheatHandler = async (c: Cheat) => {
    // 1) Try to find in current list
    let found = items.find((i) => i.slug === c.slug) || null;

    // 2) If not found, refresh list once and try again
    if (!found) {
      try {
        const res = await fetch(api("/api/content/admin/list"), { headers: { "x-admin-key": ADMIN_KEY } });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
          found = (data.items || []).find((i: any) => i.slug === c.slug) || null;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (found) {
      // Load existing admin block
      setSelectedId(found.id);
      resetForm(found);
    } else {
      // 3) Prefill from live content if exists
      let liveContent = "";
      try {
        const r = await fetch(api(`/api/content/${encodeURIComponent(c.slug)}`), { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          if (typeof d?.content === "string") liveContent = d.content;
        }
      } catch (e) {
        console.error(e);
      }

      // 4) Prepare new draft with best available content
      setSelectedId(null);
      setSlug(c.slug);
      setSection(c.section);
      setContent(liveContent || c.example || "");
      setStatus("DRAFT");
    }

    // 5) Focus editor
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="grid gap-6">
      {/* ======= Top bar: Search ======= */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Card className="w-full md:w-auto grow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="w-4 h-4" />
              Find content by sentence / line
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(q); }}
                placeholder='Paste text, e.g. "Empowering families and transforming communities"'
              />
              <Button onClick={() => runSearch(q)} disabled={!q.trim()}>
                {searching ? "Searching..." : "Search"}
              </Button>
              {mode === "SEARCH" && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setQ("");
                    setMode("ALL");
                    setResults([]);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
            {mode === "SEARCH" && (
              <div className="text-xs text-muted-foreground mt-2">
                {searching ? "Searching…" : `Found ${results.length} result(s). Click a block to edit.`}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ======= Content List / Results ======= */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Website Content Management
          </CardTitle>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Block
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading &&
            (mode === "SEARCH" ? results : items).map((b: any) => (
              <div
                key={b.id}
                className={cn(
                  "p-4 border rounded-xl bg-background cursor-pointer transition",
                  selectedId === b.id ? "ring-2 ring-primary" : "hover:bg-muted/40"
                )}
                onClick={() => pick(b)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{b.section}</p>
                      {renderStatusBadge(b.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Slug: {b.slug}</p>
                    {mode === "SEARCH" && b.snippet ? (
                      <p className="text-sm text-muted-foreground">{b.snippet}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground line-clamp-2">{b.content}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Last updated: {new Date(b.lastUpdated).toLocaleString()}
                      {b.publishedAt ? ` · Published: ${new Date(b.publishedAt).toLocaleString()}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(b.id);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          {!loading && (mode === "SEARCH" ? results : items).length === 0 && (
            <p className="text-sm text-muted-foreground">No matching blocks.</p>
          )}
        </CardContent>
      </Card>

      {/* ======= Quick Editor ======= */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Content Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Section Label</label>
              <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. Home Hero" />
            </div>
            <div>
              <label className="text-sm font-medium">Slug (unique)</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. home.hero.lead" />
            </div>
          </div>

          {/* Context helper */}
          <div className="rounded-md border p-3 bg-muted/40 text-xs flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">
                {cheat ? (
                  <>
                    This slug expects:{" "}
                    {cheat.type === "rich" ? (
                      <Badge>Rich</Badge>
                    ) : cheat.type === "json" ? (
                      <Badge variant="outline">JSON</Badge>
                    ) : (
                      <Badge variant="secondary">Text</Badge>
                    )}
                  </>
                ) : (
                  "Unknown slug: choose a slug from the Guide or create a new one."
                )}
              </div>

              {cheat?.tip && <p className="text-muted-foreground mt-1">{cheat.tip}</p>}
              {isJson && jsonError && <p className="text-destructive mt-1">JSON error: {jsonError}</p>}
            </div>

            <div className="shrink-0 flex gap-2">
              {cheat?.example && (
                <Button size="sm" variant="outline" onClick={insertExample}>
                  Insert Example
                </Button>
              )}
              <Guide size="sm" onUseCheat={useCheatHandler} />
            </div>
          </div>

          {/* Editor */}
          <label className="text-sm font-medium">Content</label>
          {isJson ? (
            <textarea
              className="w-full min-h-[220px] p-4 rounded-md bg-background border font-mono text-xs"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste valid JSON here…"
            />
          ) : (
            <RichEditor value={content} onChange={setContent} placeholder="Start writing…" />
          )}

          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={status === "PUBLISHED" ? "default" : status === "ARCHIVED" ? "destructive" : "secondary"}>
              {status}
            </Badge>
            <div className="ml-auto flex gap-2">
              <Button onClick={() => onSave()} title="Save as Draft">
                <Edit className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline" onClick={onUnpublish}>
                <Undo2 className="w-4 h-4 mr-1" />
                Unpublish
              </Button>
              <Button onClick={() => onSave({ publishNow: true })}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Save & Publish
              </Button>
              <Button variant="outline" onClick={onPublish}>
                <Globe2 className="w-4 h-4 mr-1" />
                Publish
              </Button>
            </div>
          </div>

          {/* Preview */}
          {previewOpen && (
            <div className="mt-4 rounded-xl border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  Preview: {section || "(Untitled block)"} <span className="text-muted-foreground">({slug || "no slug"})</span>
                </p>
                <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="prose prose-sm max-w-none">
                {isRich ? (
                  <RichViewer value={content || "{}"} />
                ) : isJson ? (
                  <pre className="text-xs overflow-auto p-3 rounded-md bg-background border">
                    {content || "// JSON will render on the site using the page component that reads this slug."}
                  </pre>
                ) : (
                  <p>{content || "Nothing to preview yet…"}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
