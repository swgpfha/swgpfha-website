import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Plus, MapPin, Clock, Briefcase } from "lucide-react";
import { createOpp, deleteOpp, listOpps, updateOpp } from "../_api";
import type { Opportunity } from "../_types";
import { ADMIN_KEY } from "../_api";

export default function OpportunitiesSection() {
  const [rows, setRows] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (o) =>
        o.title.toLowerCase().includes(s) ||
        o.description.toLowerCase().includes(s) ||
        o.skills.join(" ").toLowerCase().includes(s) ||
        (o.location ?? "").toLowerCase().includes(s) ||
        o.timeType.toLowerCase().includes(s),
    );
  }, [rows, q]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [form, setForm] = useState<Partial<Opportunity>>({
    title: "",
    timeType: "Part-Time",
    location: "",
    description: "",
    skills: [],
    status: "Active",
  });
  const saving = false;

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const data = await listOpps();
      setRows(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", timeType: "Part-Time", location: "", description: "", skills: [], status: "Active" });
    setOpen(true);
  }
  function openEdit(o: Opportunity) {
    setEditing(o);
    setForm({ ...o });
    setOpen(true);
  }

  async function upsert() {
    const skills = (form.skills ?? []).filter(Boolean);
    if (!form.title?.trim() || !form.description?.trim()) return;
    if (editing) {
      await updateOpp(editing.id, {
        title: form.title?.trim(),
        timeType: form.timeType,
        location: form.location?.trim() || undefined,
        description: form.description?.trim(),
        skills,
        status: form.status,
      });
    } else {
      await createOpp({
        title: form.title!.trim(),
        timeType: (form.timeType ?? "Part-Time") as Opportunity["timeType"],
        location: form.location?.trim() || undefined,
        description: form.description!.trim(),
        skills,
        status: (form.status ?? "Active") as Opportunity["status"],
      });
    }
    await load();
    setOpen(false);
  }

  async function remove(id: string) {
    await deleteOpp(id);
    await load();
  }

  async function toggleStatus(o: Opportunity) {
    const next = o.status === "Active" ? "Closed" : "Active";
    await updateOpp(o.id, { status: next });
    setRows((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: next } : x)));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Volunteer Opportunities</CardTitle>
        </CardHeader>

        <Toolbar
          left={<Input placeholder="Search by title, skill, location..." value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />}
          right={
            <Button onClick={openCreate} disabled={!ADMIN_KEY}>
              <Plus className="w-4 h-4 mr-2" />
              New Opportunity
            </Button>
          }
        />

        <div className="p-4">
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {err && <div className="text-sm text-destructive">{err}</div>}
          {!loading && filtered.length === 0 && <EmptyState>No opportunities found.</EmptyState>}

          <div className="grid gap-4">
            {filtered.map((o) => (
              <div key={o.id} className="p-4 border rounded-xl bg-background">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-base truncate">{o.title}</p>
                      <Badge>{o.timeType}</Badge>
                      <Badge variant={o.status === "Active" ? "default" : "secondary"}>{o.status}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                      {o.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {o.location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Posted {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{o.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {o.skills.map((s, i) => (
                        <Badge key={i} variant="outline" className="inline-flex items-center gap-1">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(o)} disabled={!ADMIN_KEY}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(o)} disabled={!ADMIN_KEY}>
                      {o.status === "Active" ? "Close" : "Activate"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => remove(o.id)} disabled={!ADMIN_KEY}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Opportunity" : "New Opportunity"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title ?? ""} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., Program Coordinator" />
              </div>
              <div>
                <label className="text-sm font-medium">Time Type</label>
                <Select value={(form.timeType as string) ?? "Part-Time"} onValueChange={(v) => setForm((p) => ({ ...p, timeType: v as Opportunity["timeType"] }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-Time">Full-Time</SelectItem>
                    <SelectItem value="Part-Time">Part-Time</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Location (optional)</label>
                <Input value={form.location ?? ""} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g., Accra / Remote" />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={(form.status as string) ?? "Active"} onValueChange={(v) => setForm((p) => ({ ...p, status: v as Opportunity["status"] }))}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe responsibilities, impact, and expectations…" />
            </div>

            <div>
              <label className="text-sm font-medium">Required Skills (comma-separated)</label>
              <Input
                value={(form.skills ?? []).join(", ")}
                onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                placeholder="e.g., Organization, Communication, Project Management"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={upsert} disabled={!form.title?.trim() || !form.description?.trim() || !ADMIN_KEY}>
              {editing ? "Save Changes" : "Create Opportunity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
