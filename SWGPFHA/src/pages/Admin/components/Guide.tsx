import * as React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpenCheck, Search, Filter, Copy, Check, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------- Types --------------------------------- */
export type SlugType = "text" | "rich" | "json";
export type Cheat = {
    slug: string;
    section: string;
    type: SlugType;
    usedIn: string;
    tip?: string;
    example?: string;
};

/* ---------------------- Handy examples / fallbacks ------------------------ */
const HERO_LEAD_FALLBACK = JSON.stringify(
    {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text:
                            "Empowering families and transforming communities through education, health, and comprehensive social programs that create lasting positive change.",
                    },
                ],
            },
        ],
    },
    null,
    2
);

const ABOUT_RICH_FALLBACK = JSON.stringify(
    {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text:
                            "Founded in 2020 and legally established in 2025, the SouthWest Good Parenting Foundation Home Africa (SWGPFHA) is dedicated to creating lasting positive change in communities across Africa.",
                    },
                ],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text:
                            "Our comprehensive approach addresses critical needs in parenting support, education, healthcare, nutrition, and vocational training, ensuring that every child and family has the opportunity to thrive.",
                    },
                ],
            },
        ],
    },
    null,
    2
);

const FEATURES_EXAMPLE = JSON.stringify(
    [
        { icon: "heart", title: "Parenting Support", description: "Empowering families with guidance and resources for effective parenting", color: "text-foundation-purple" },
        { icon: "book", title: "Education", description: "Transforming lives through quality education and learning opportunities", color: "text-foundation-blue" },
        { icon: "shield", title: "Health Insurance", description: "Providing accessible healthcare and insurance initiatives", color: "text-foundation-green" },
        { icon: "droplets", title: "Food & Water", description: "Ensuring basic needs through nutrition and clean water programs", color: "text-foundation-yellow" },
    ],
    null,
    2
);

const STATS_EXAMPLE = JSON.stringify(
    [
        { number: "2020", label: "Founded" },
        { number: "2025", label: "Legally Established" },
        { number: "1000+", label: "Lives Impacted" },
        { number: "5+", label: "Active Programs" },
    ],
    null,
    2
);

/* ----------------------------- Cheatsheet data ---------------------------- */
export const CHEATSHEET: Cheat[] = [
    { slug: "home.kicker", section: "Home • Kicker (small text above title)", type: "text", usedIn: "Home hero (left)", tip: "Short, ALL CAPS friendly eg. Established 2020 • Legally Recognized 2025" },
    { slug: "home.subtitle", section: "Home • Subtitle (small line)", type: "text", usedIn: "Home hero (left)" },
    { slug: "home.title.line1", section: "Home • Title (Line 1)", type: "text", usedIn: "Home hero (left)" },
    { slug: "home.title.line2", section: "Home • Title (Line 2 gradient)", type: "text", usedIn: "Home hero (left)" },
    { slug: "home.quote", section: "Home • Quote (yellow box)", type: "text", usedIn: "Home hero (left)", tip: "Keep it short, inspirational." },
    { slug: "home.hero.lead", section: "Home • Lead paragraph (rich)", type: "rich", usedIn: "Home hero (left), under quote", example: HERO_LEAD_FALLBACK, tip: "Use headings, bold, links and lists if needed." },

    { slug: "home.about.rich", section: "Home • About (rich block)", type: "rich", usedIn: "Home About section (left)", example: ABOUT_RICH_FALLBACK },

    { slug: "home.features", section: "Home • Impact Areas (cards)", type: "json", usedIn: "Programs/Impact grid", example: FEATURES_EXAMPLE, tip: "JSON array: {icon, title, description, color}. Icons: heart|book|shield|droplets|users" },
    { slug: "home.stats", section: "Home • Stats row", type: "json", usedIn: "Stats band", example: STATS_EXAMPLE, tip: "JSON array: {number, label}." },

    { slug: "about.header", section: "About • Header", type: "text", usedIn: "About hero" },
    { slug: "about.body", section: "About • Body (rich)", type: "rich", usedIn: "About content", example: JSON.stringify({ type: "doc", content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Who We Are" }] }, { type: "paragraph", content: [{ type: "text", text: "Write about the foundation…" }] }] }, null, 2) },

    { slug: "mission.header", section: "Mission • Header", type: "text", usedIn: "Mission hero" },
    { slug: "mission.body", section: "Mission • Body (rich)", type: "rich", usedIn: "Mission content", example: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Our mission is to…" }] }] }, null, 2) },

    { slug: "cta.join.title", section: "CTA • Join Title", type: "text", usedIn: "CTA section" },
    { slug: "cta.join.body", section: "CTA • Join Body (rich)", type: "rich", usedIn: "CTA section", example: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Together, we can…" }] }] }, null, 2) },
    // --- About page slugs ---
    { slug: "about.hero.kicker", type: "text", section: "About • Hero kicker", usedIn: "About hero (small text)" },
    { slug: "about.hero.title.line1", type: "text", section: "About • Hero title (line 1)", usedIn: "About hero" },
    { slug: "about.hero.title.line2", type: "text", section: "About • Hero title (line 2)", usedIn: "About hero" },
    { slug: "about.hero.subtitle", type: "text", section: "About • Hero subtitle", usedIn: "About hero" },
    { slug: "about.hero.stats", type: "json", section: "About • Hero stats", usedIn: "About hero", tip: "Array of {number,label,color?}" },

    { slug: "about.hero.card.title", type: "text", section: "About • Hero card", usedIn: "Mission card" },
    { slug: "about.hero.card.kicker", type: "text", section: "About • Hero card", usedIn: "Mission card" },
    { slug: "about.hero.card.body", type: "text", section: "About • Hero card", usedIn: "Mission card" },

    { slug: "about.story.header", type: "text", section: "About • Story header", usedIn: "Story section" },
    { slug: "about.body", type: "rich", section: "About • Body (rich)", usedIn: "Story section" },

    { slug: "about.purpose.title", type: "text", section: "About • Purpose", usedIn: "Right column" },
    { slug: "about.purpose.body", type: "text", section: "About • Purpose", usedIn: "Right column" },
    { slug: "about.values.title", type: "text", section: "About • Values", usedIn: "Right column" },
    { slug: "about.values.body", type: "text", section: "About • Values", usedIn: "Right column" },

    { slug: "about.timeline.header", type: "text", section: "About • Timeline header", usedIn: "Timeline" },
    { slug: "about.timeline.sub", type: "text", section: "About • Timeline sub", usedIn: "Timeline" },
    { slug: "about.timeline.items", type: "json", section: "About • Timeline items", usedIn: "Timeline", tip: "Array of {year,event,description}" },

    { slug: "about.leaders.header", type: "text", section: "About • Leaders header", usedIn: "Leadership" },
    { slug: "about.leaders.sub", type: "text", section: "About • Leaders sub", usedIn: "Leadership" },
    { slug: "about.leaders.items", type: "json", section: "About • Leaders list", usedIn: "Leadership", tip: "Array of {name,title,description,photoUrl?}" },

    { slug: "about.collab.header", type: "text", section: "About • Collaborations header", usedIn: "Collaborations" },
    { slug: "about.collab.sub", type: "text", section: "About • Collaborations sub", usedIn: "Collaborations" },
    { slug: "about.collab.items", type: "json", section: "About • Collaborations list", usedIn: "Collaborations", tip: "Array of {name,location?,logoUrl?}" },

    { slug: "about.impact.header", type: "text", section: "About • Impact header", usedIn: "Impact statement" },
    { slug: "about.impact.quote", type: "text", section: "About • Impact quote", usedIn: "Impact statement" },
    { slug: "about.impact.byline", type: "text", section: "About • Impact byline", usedIn: "Impact statement" },

];

export const getCheat = (slug: string | null | undefined) => CHEATSHEET.find((c) => c.slug === (slug ?? "").trim());

/* --------------------------------- UI ------------------------------------- */
type GuideProps = {
    onUseCheat?: (c: Cheat) => void;
    buttonClassName?: string;
    size?: "sm" | "default" | "lg";
};

export default function Guide({ onUseCheat, buttonClassName, size = "default" }: GuideProps) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const [typeFilter, setTypeFilter] = useState<SlugType | "all">("all");
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        return CHEATSHEET.filter((c) => {
            const matchesQ =
                !t ||
                c.slug.toLowerCase().includes(t) ||
                c.section.toLowerCase().includes(t) ||
                c.usedIn.toLowerCase().includes(t);
            const matchesType = typeFilter === "all" || c.type === typeFilter;
            return matchesQ && matchesType;
        });
    }, [q, typeFilter]);

    // Group by page (left side of the "•" in section, or prefix of slug)
    const grouped = useMemo(() => {
        const groups: Record<string, Cheat[]> = {};
        filtered.forEach((c) => {
            const kFromSection = c.section?.split("•")?.[0]?.trim();
            const kFromSlug = c.slug.split(".")[0];
            const key = kFromSection || kFromSlug || "Other";
            if (!groups[key]) groups[key] = [];
            groups[key].push(c);
        });
        return groups;
    }, [filtered]);

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedSlug(text);
            setTimeout(() => setCopiedSlug(null), 1100);
        } catch { }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={cn(buttonClassName)} size={size} variant="outline">
                    <BookOpenCheck className="w-4 h-4 mr-2" />
                    Guide
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpenCheck className="w-5 h-5" />
                        Content Guide
                    </DialogTitle>
                </DialogHeader>

                {/* Sticky controls */}
                <div className="px-4 pb-3 border-b sticky top-0 bg-background z-10">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1 flex items-center gap-2">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder='Find "hero", "stats", "mission"...'
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <div className="flex gap-1">
                                {(["all", "text", "rich", "json"] as const).map((t) => (
                                    <Button
                                        key={t}
                                        size="sm"
                                        variant={typeFilter === t ? "default" : "outline"}
                                        onClick={() => setTypeFilter(t)}
                                    >
                                        {t.toString().toUpperCase()}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Tip: Click <span className="font-medium">Use</span> to fill the editor with the slug (and example if available).
                    </p>
                </div>

                {/* Body */}
                <div className="px-4 py-4">
                    <Tabs defaultValue="quick" className="w-full">
                        <TabsList className="grid grid-cols-3 w-full">
                            <TabsTrigger value="quick">Quick</TabsTrigger>
                            <TabsTrigger value="grouped">By Page</TabsTrigger>
                            <TabsTrigger value="help">Help</TabsTrigger>
                        </TabsList>

                        {/* QUICK: flat, compact cards */}
                        <TabsContent value="quick" className="mt-3">
                            <div className="max-h-[55vh] overflow-y-auto space-y-2">
                                {filtered.map((c) => (
                                    <Card key={c.slug} className="border bg-background">
                                        <CardContent className="py-3 px-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs truncate">{c.slug}</span>
                                                        {c.type === "rich" ? (
                                                            <Badge>Rich</Badge>
                                                        ) : c.type === "json" ? (
                                                            <Badge variant="outline">JSON</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Text</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm mt-1">{c.section}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{c.usedIn}</p>

                                                    {c.tip && (
                                                        <details className="mt-1">
                                                            <summary className="text-xs text-muted-foreground cursor-pointer">Show tip</summary>
                                                            <p className="text-xs mt-1">{c.tip}</p>
                                                        </details>
                                                    )}
                                                    {c.example && (
                                                        <details className="mt-1">
                                                            <summary className="text-xs text-muted-foreground cursor-pointer">Show example</summary>
                                                            <pre className="text-[11px] p-2 mt-1 rounded border bg-muted/30 overflow-auto max-h-40">
                                                                {c.example}
                                                            </pre>
                                                        </details>
                                                    )}
                                                </div>
                                                <div className="shrink-0 flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            onUseCheat?.(c);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        Use
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => copy(c.slug)} title="Copy slug">
                                                        {copiedSlug === c.slug ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {filtered.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No matches. Try a different search or filter.</p>
                                )}
                            </div>
                        </TabsContent>

                        {/* GROUPED: accordion by page */}
                        <TabsContent value="grouped" className="mt-3">
                            <div className="max-h-[55vh] overflow-y-auto">
                                <Accordion type="multiple" defaultValue={Object.keys(grouped)}>
                                    {Object.entries(grouped).map(([group, rows]) => (
                                        <AccordionItem key={group} value={group} className="border rounded-md mb-2">
                                            <AccordionTrigger className="px-3 py-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <ChevronDown className="w-4 h-4" />
                                                    <span className="font-medium">{group}</span>
                                                    <span className="text-xs text-muted-foreground">({rows.length})</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-3 pb-3">
                                                <div className="space-y-2">
                                                    {rows.map((c) => (
                                                        <div key={c.slug} className="flex items-start justify-between gap-3 border rounded-md p-2">
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono text-xs truncate">{c.slug}</span>
                                                                    {c.type === "rich" ? (
                                                                        <Badge>Rich</Badge>
                                                                    ) : c.type === "json" ? (
                                                                        <Badge variant="outline">JSON</Badge>
                                                                    ) : (
                                                                        <Badge variant="secondary">Text</Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1 truncate">{c.usedIn}</p>
                                                            </div>
                                                            <div className="shrink-0 flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        onUseCheat?.(c);
                                                                        setOpen(false);
                                                                    }}
                                                                >
                                                                    Use
                                                                </Button>
                                                                <Button size="icon" variant="ghost" onClick={() => copy(c.slug)} title="Copy slug">
                                                                    {copiedSlug === c.slug ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                                {Object.keys(grouped).length === 0 && (
                                    <p className="text-sm text-muted-foreground">No matches.</p>
                                )}
                            </div>
                        </TabsContent>

                        {/* HELP: minimal steps + legend */}
                        <TabsContent value="help" className="mt-3">
                            <div className="grid gap-3">
                                <Card>
                                    <CardContent className="pt-4 text-sm">
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Use the search to find a slug or sentence.</li>
                                            <li>Click <span className="font-medium">Use</span> to fill the editor (example included if available).</li>
                                            <li>Edit → Save (draft) → Preview → Publish.</li>
                                        </ol>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4 text-sm">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-muted-foreground">Types:</span>
                                            <Badge variant="secondary">Text</Badge>
                                            <span className="text-muted-foreground text-xs">plain</span>
                                            <Badge>Rich</Badge>
                                            <span className="text-muted-foreground text-xs">formatted</span>
                                            <Badge variant="outline">JSON</Badge>
                                            <span className="text-muted-foreground text-xs">structured</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Only <strong>PUBLISHED</strong> content appears on the live site.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
