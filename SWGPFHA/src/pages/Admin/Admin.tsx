import { useEffect, useState } from "react";
import { DollarSign, MessageSquare, BarChart3, Settings, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DonationsSection from "./sections/Donations";
import MessagesSection from "./sections/Messages";
import OpportunitiesSection from "./sections/Opportunities";
import MediaSection from "./sections/Media";
import ContentSection from "./sections/Content";
import StatCard from "./components/StatCard";
import { ADMIN_KEY, API, getPayStats } from "./_api";
import type { PayStats } from "./_types";

export default function Admin() {
  const [stats, setStats] = useState<PayStats | null>(null);
  const [statsErr, setStatsErr] = useState<string | null>(null);
  const [fixing, setFixing] = useState(false);

  async function loadStats() {
    try {
      const s = await getPayStats();
      setStats(s);
    } catch (e: any) {
      setStatsErr(e?.message || "Failed to load payment stats");
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function runFixSlugs() {
    if (!API || !ADMIN_KEY) return alert("Missing API or ADMIN_KEY envs.");
    if (!confirm("Normalize all existing content slugs in the database? This may rename duplicates.")) return;
    try {
      setFixing(true);
      const res = await fetch(`${API}/api/content/admin/fix-slugs`, {
        method: "POST",
        headers: { "x-admin-key": ADMIN_KEY },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      alert(`Done.\nNormalized groups: ${json?.normalized_groups ?? "?"}\nActions: ${json?.actions?.length ?? 0}`);
    } catch (err: any) {
      console.error(err);
      alert(`Fix failed: ${err?.message || err}`);
    } finally {
      setFixing(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage donations, messages, website, media, and opportunities</p>
              {(!API || !ADMIN_KEY) && (
                <p className="mt-2 text-sm text-destructive">
                  {!API
                    ? "API base not set. Set VITE_BACKEND_ORIGIN or configure a dev proxy for /api."
                    : !ADMIN_KEY
                    ? "Admin key missing on frontend. Set VITE_ADMIN_API_KEY to match server ADMIN_API_KEY."
                    : null}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={runFixSlugs} disabled={fixing} title="Normalize DB content slugs">
                <Wrench className="w-4 h-4 mr-2" />
                {fixing ? "Fixing…" : "Fix DB Slugs"}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Top stats */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="content">Website Content</TabsTrigger>
            <TabsTrigger value="media">Media Files</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities"><OpportunitiesSection /></TabsContent>
          <TabsContent value="donations"><DonationsSection /></TabsContent>
          <TabsContent value="messages"><MessagesSection /></TabsContent>
          <TabsContent value="content"><ContentSection /></TabsContent>
          <TabsContent value="media"><MediaSection /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/** Tiny live counter component for NEW messages, kept here for simplicity */
function LiveNewMessages() {
  const [count, setCount] = useState<number | null>(null);

  async function fetchCount() {
    try {
      const res = await fetch(
        (() => {
          const base = (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";
          const url = new URL(`${base}/api/contact-messages`);
          url.searchParams.set("page", "1");
          url.searchParams.set("pageSize", "1");
          url.searchParams.set("status", "NEW");
          return url.toString();
        })(),
        { headers: { "x-admin-key": import.meta.env.VITE_ADMIN_API_KEY! } }
      );
      const data = await res.json();
      setCount(data?.total ?? 0);
    } catch {
      setCount(null);
    }
  }

  useEffect(() => {
    fetchCount();
    const t = setInterval(fetchCount, 15000);
    return () => clearInterval(t);
  }, []);

  return <span>{count ?? "—"}</span>;
}
