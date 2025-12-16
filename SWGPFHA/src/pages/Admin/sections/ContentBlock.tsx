// src/components/ContentBlock.tsx
import { useEffect, useState } from "react";
import RichViewer from "@/components/RichViewer";
const API = (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";
const api = (path: string) => `${API}${path}`;

type BlockRow = {
  id: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  content: string;
  lastUpdated?: string;
  publishedAt?: string;
  createdAt?: string;
};

export default function ContentBlock({ slug, className }: { slug: string; className?: string }) {
  const [data, setData] = useState<BlockRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const url = api(`/api/content/${slug}?t=${Date.now()}`);

    console.debug(`[ContentBlock] fetch ->`, url);

    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        const txt = await r.clone().text();
        console.debug(`[ContentBlock] status=${r.status} body=`, txt.slice(0, 200));
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return JSON.parse(txt) as BlockRow;
      })
      .then((json) => {
        if (!alive) return;
        const hash = btoa(json.content).slice(0, 16);
        console.debug(
          `[ContentBlock] setData slug="${slug}" id=${json.id} status=${json.status} lastUpdated=${json.lastUpdated} hash=${hash}`
        );
        setData(json);
      })
      .catch((e) => {
        console.error(`[ContentBlock] error slug="${slug}"`, e);
        setError(String(e));
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  if (error) return <div className={className}>Failed to load: {error}</div>;
  if (!data) return <div className={className}>Loading…</div>;

  return <RichViewer value={data.content} className={className} />;
}
