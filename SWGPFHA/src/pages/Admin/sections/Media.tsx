import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload, Eye, Trash2, FileText, Image as ImageIcon, X,
  Instagram, Facebook, Twitter, Youtube, Video, RefreshCw, Save, Undo2
} from "lucide-react";
import { ADMIN_KEY, listMedia, deleteMediaItem, apiUrl, safeErr } from "../_api";
import type { MediaItem } from "../_types";

const PAGE_SIZE = 12;

/* ----------------------------- Social Types -------------------------------- */
type Platform = "tiktok" | "instagram" | "facebook" | "twitter" | "youtube";
type SocialRow = {
  id?: string;
  platform: Platform;
  handle?: string;
  url?: string;
  followers: number;
  lastUpdated?: string; // ISO
};

const PLATFORM_META: Record<Platform, { label: string; Icon: any; placeholder: string }> = {
  tiktok:    { label: "TikTok",    Icon: Video,    placeholder: "@foundation.tiktok" },
  instagram: { label: "Instagram", Icon: Instagram, placeholder: "@foundation" },
  facebook:  { label: "Facebook",  Icon: Facebook,  placeholder: "facebook.com/yourpage" },
  twitter:   { label: "X (Twitter)", Icon: Twitter, placeholder: "@foundation" },
  youtube:   { label: "YouTube",   Icon: Youtube,   placeholder: "youtube.com/@foundation" },
};

/* ----------------------------- Helpers ------------------------------------- */
function abbreviate(n: number) {
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000)         return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
function parseIntSafe(v: string) {
  const cleaned = v.replace(/[,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}
function prettySize(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/* ----------------------------- API (social) --------------------------------
   If you already have endpoints, keep these paths.
   - GET  /api/admin/social-stats
   - POST /api/admin/social-stats   (body: { rows: SocialRow[] })
-----------------------------------------------------------------------------*/
async function listSocialStats(): Promise<SocialRow[]> {
  const res = await fetch(apiUrl("/api/admin/social-stats"), {
    headers: { "x-admin-key": ADMIN_KEY || "" },
  });
  if (!res.ok) throw new Error(await safeErr(res));
  const data = await res.json();
  return data?.rows || [];
}

async function saveSocialStats(rows: SocialRow[]) {
  const res = await fetch(apiUrl("/api/admin/social-stats"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": ADMIN_KEY || "",
    },
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) throw new Error(await safeErr(res));
  return res.json();
}

export default function MediaSection() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<"ALL" | "photo" | "video" | "document">("ALL");
  const [rows, setRows] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Upload form fields
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [usage, setUsage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [mediaType, setMediaType] = useState<"photo" | "video" | "document">("photo");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  // NEW: hold selected files until user clicks Upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // NEW: Social state
  const [social, setSocial] = useState<SocialRow[]>([]);
  const [socialPristine, setSocialPristine] = useState<SocialRow[] | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialErr, setSocialErr] = useState<string | null>(null);

  const ACCEPT = useMemo(
    () =>
      [
        "image/*",
        "video/*",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ].join(","),
    []
  );

  /* ----------------------------- Loaders ----------------------------------- */
  async function loadMedia() {
    try {
      setLoading(true);
      setErr(null);
      const data = await listMedia(page, PAGE_SIZE, type);
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setErr(e?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  async function loadSocial() {
    try {
      setSocialLoading(true);
      setSocialErr(null);
      const existing = await listSocialStats();
      // ensure all known platforms are present (creates defaults for missing)
      const map = new Map<Platform, SocialRow>();
      for (const r of existing) map.set(r.platform, r);
      (["tiktok","instagram","facebook","twitter","youtube"] as Platform[]).forEach((p) => {
        if (!map.has(p)) map.set(p, { platform: p, followers: 0 });
      });
      const next = Array.from(map.values()).sort(
        (a, b) => ["tiktok","instagram","facebook","twitter","youtube"].indexOf(a.platform)
               - ["tiktok","instagram","facebook","twitter","youtube"].indexOf(b.platform)
      );
      setSocial(next);
      setSocialPristine(JSON.parse(JSON.stringify(next)));
    } catch (e: any) {
      setSocialErr(e?.message || "Failed to load social stats");
    } finally {
      setSocialLoading(false);
    }
  }

  useEffect(() => { loadMedia(); /* eslint-disable-next-line */ }, [page, type]);
  useEffect(() => { loadSocial(); }, []);

  /* ----------------------------- File choose ------------------------------- */
  function openPicker() { fileRef.current?.click(); }
  function onChoose(filesList: FileList | null) {
    if (!filesList || filesList.length === 0) return;
    const next = [...selectedFiles, ...Array.from(filesList)];
    setSelectedFiles(next);
  }
  function removeChosen(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }
  function clearChosen() {
    setSelectedFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  const canUpload =
    !!ADMIN_KEY &&
    !uploading &&
    title.trim().length > 0 &&
    eventDate.trim().length > 0 &&
    selectedFiles.length > 0;

  async function uploadNow() {
    if (!canUpload) return;
    setUploading(true);
    setUploadErr(null);
    try {
      const fd = new FormData();
      selectedFiles.forEach((f) => fd.append("files", f));
      const eventIso = eventDate ? new Date(`${eventDate}T00:00:00.000Z`).toISOString() : undefined;
      fd.append(
        "data",
        JSON.stringify({
          title: title || (selectedFiles.length === 1 ? selectedFiles[0].name : "New Upload"),
          description: desc || undefined,
          location: location || undefined,
          eventDate: eventIso,
          type: mediaType,
          usage: usage || undefined,
        })
      );

      const res = await fetch(apiUrl("/api/admin/media"), {
        method: "POST",
        headers: { "x-admin-key": ADMIN_KEY! },
        body: fd,
      });
      if (!res.ok) throw new Error(await safeErr(res));

      // reset form
      setTitle("");
      setDesc("");
      setLocation("");
      setUsage("");
      setEventDate("");
      setMediaType("photo");
      clearChosen();

      await loadMedia();
    } catch (e: any) {
      setUploadErr(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    await deleteMediaItem(id);
    setRows((prev) => prev.filter((x) => x.id !== id));
  }

  /* ----------------------------- Social handlers --------------------------- */
  function updateSocialField(idx: number, key: keyof SocialRow, value: string) {
    setSocial((prev) => {
      const next = [...prev];
      if (key === "followers") {
        next[idx].followers = parseIntSafe(value);
      } else {
        (next[idx] as any)[key] = value;
      }
      return next;
    });
  }

  function hasSocialChanges() {
    return JSON.stringify(social) !== JSON.stringify(socialPristine);
  }

  async function saveSocial() {
    if (!ADMIN_KEY) return;
    setSocialSaving(true);
    setSocialErr(null);
    try {
      const payload = social.map((r) => ({
        ...r,
        followers: Number.isFinite(r.followers) ? r.followers : 0,
      }));
      await saveSocialStats(payload);
      await loadSocial(); // refresh + reset pristine
    } catch (e: any) {
      setSocialErr(e?.message || "Failed to save social stats");
    } finally {
      setSocialSaving(false);
    }
  }

  function revertSocial() {
    if (socialPristine) setSocial(JSON.parse(JSON.stringify(socialPristine)));
  }

  /* -------------------------------- Render -------------------------------- */
  return (
    <div className="space-y-6">
      {/* ------------------- Upload ------------------- */}
      <Card className="border-muted/60">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload New Media
          </CardTitle>
        </CardHeader>

        <div className="px-4">
          <Toolbar
            left={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Input
                  placeholder="Title (required)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Select value={mediaType} onValueChange={(v) => setMediaType(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
                <Input placeholder="Usage (optional)" value={usage} onChange={(e) => setUsage(e.target.value)} />
              </div>
            }
            right={
              <>
                <Input
                  placeholder="Event date (required)"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-[170px]"
                  required
                />
                <Button variant="outline" onClick={openPicker} disabled={!ADMIN_KEY || uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT}
                  multiple
                  className="hidden"
                  onChange={(e) => onChoose(e.target.files)}
                />
                <Button onClick={uploadNow} disabled={!canUpload}>
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </>
            }
          />
        </div>

        <CardContent className="pt-4 space-y-3">
          <Textarea
            rows={3}
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          {/* Selected files preview list */}
          {selectedFiles.length > 0 && (
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  Selected files: {selectedFiles.length}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={clearChosen}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedFiles.map((f, idx) => {
                  const isImg = f.type.startsWith("image/");
                  return (
                    <div key={idx} className="flex items-center gap-2 border rounded-md p-2">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {isImg ? (
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            className="w-full h-full object-cover"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{f.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {f.type || "unknown"} • {prettySize(f.size)}
                        </p>
                      </div>
                      <Button variant="outline" size="icon" onClick={() => removeChosen(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tip: You can change Title/Type/Date before clicking Upload. Title and Date are required.
              </p>
            </div>
          )}

          {uploadErr && <p className="mt-2 text-sm text-destructive">{uploadErr}</p>}
          {!ADMIN_KEY && (
            <p className="text-sm text-destructive">
              Set <code>VITE_ADMIN_API_KEY</code> to manage media.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ------------------- Social Media & Followers ------------------- */}
      <Card className="border-muted/60">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Social Media & Followers
          </CardTitle>
        </CardHeader>

        <Toolbar
          left={
            <p className="text-sm text-muted-foreground px-4">
              Manually track follower counts for your official handles. These values power public stats on the site.
            </p>
          }
          right={
            <div className="pr-4 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadSocial} disabled={socialLoading}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={revertSocial} disabled={!hasSocialChanges()}>
                <Undo2 className="w-4 h-4 mr-1" />
                Revert
              </Button>
              <Button size="sm" onClick={saveSocial} disabled={!ADMIN_KEY || !hasSocialChanges() || socialSaving}>
                {socialSaving ? "Saving…" : "Save All"}
              </Button>
            </div>
          }
        />

        <CardContent className="pt-4">
          {socialErr && <div className="mb-3 text-sm text-destructive">{socialErr}</div>}
          {socialLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {!socialLoading && social.length === 0 && <EmptyState>No social platforms configured.</EmptyState>}

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {social.map((row, idx) => {
              const meta = PLATFORM_META[row.platform];
              const Icon = meta.Icon;
              const last = row.lastUpdated ? new Date(row.lastUpdated).toLocaleString() : null;
              return (
                <div key={row.platform} className="p-4 border rounded-xl bg-background">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center ring-1 ring-border">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium leading-none">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {last ? `Last updated: ${last}` : "Not updated yet"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder={meta.placeholder}
                      value={row.handle || ""}
                      onChange={(e) => updateSocialField(idx, "handle", e.target.value)}
                    />
                    <Input
                      placeholder="Profile URL (optional)"
                      value={row.url || ""}
                      onChange={(e) => updateSocialField(idx, "url", e.target.value)}
                    />
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Followers"
                        value={String(row.followers || "")}
                        onChange={(e) => updateSocialField(idx, "followers", e.target.value)}
                      />
                      <div className="px-3 py-2 text-sm rounded-md border bg-muted flex items-center">
                        {abbreviate(row.followers || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!ADMIN_KEY && (
            <p className="mt-3 text-sm text-destructive">
              Set <code>VITE_ADMIN_API_KEY</code> to save changes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ------------------- Library / List ------------------- */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Media File Management</CardTitle>
        </CardHeader>
        <Toolbar
          right={
            <>
              <Select
                value={type}
                onValueChange={(v) => {
                  setPage(1);
                  setType(v as any);
                }}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="photo">Photos</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadMedia}>
                Refresh
              </Button>
            </>
          }
        />
        <CardContent className="space-y-4 pt-4">
          {err && <div className="text-sm text-destructive">{err}</div>}
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {!loading && rows.length === 0 && <EmptyState>No media found.</EmptyState>}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.map((item) => {
              const first = item.assets?.[0];
              const thumb = item.thumbUrl || first?.thumbUrl || first?.url;
              const when = new Date(item.createdAt).toLocaleString();
              const typeBadge = item.type === "photo" ? "Photo" : item.type === "video" ? "Video" : "Document";
              return (
                <div key={item.id} className="p-4 border rounded-xl bg-background flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                      {thumb ? (
                        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {typeBadge} • {when}
                      </p>
                      {!!item.location && (
                        <p className="text-xs text-muted-foreground truncate">Location: {item.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {first?.url && (
                      <Button variant="outline" size="sm" onClick={() => window.open(first.url, "_blank")}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => remove(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            className="pt-2"
          />
        </CardContent>
      </Card>
    </div>
  );
}
