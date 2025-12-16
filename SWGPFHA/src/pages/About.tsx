import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Target, Award, Heart, Handshake, User2 } from "lucide-react";
import RichViewer from "@/components/RichViewer";

/* ----------------------- tiny content fetch helpers ----------------------- */
const API = (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";
const api = (p: string) => `${API}${p}`;

function useString(slug: string, fallback = "") {
  const [val, setVal] = useState(fallback);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(api(`/api/content/${slug}?t=${Date.now()}`), { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (alive && typeof d?.content === "string") setVal(d.content);
      } catch { }
    })();
    return () => { alive = false; };
  }, [slug]);
  return val;
}
function useJSON<T>(slug: string, fallback: T): T {
  const [val, setVal] = useState<T>(fallback);
  const raw = useString(slug, JSON.stringify(fallback));
  useEffect(() => {
    try {
      const parsed = JSON.parse(raw);
      setVal(parsed as T);
    } catch {
      setVal(fallback);
    }
  }, [raw]); // eslint-disable-line
  return val;
}

/* ------------------------------ fallbacks -------------------------------- */
const FB = {
  hero: {
    kicker: "EST. 2020 • LEGALLY RECOGNIZED 2025",
    title1: "About Our",
    title2: "Foundation",
    subtitle:
      "Building stronger communities through comprehensive support, education, and empowerment since 2020",
    stats: [
      { number: "2020", label: "Founded", color: "text-foundation-yellow" },
      { number: "2025", label: "Legal Status", color: "text-foundation-green" },
      { number: "1000+", label: "Lives Touched", color: "text-foundation-blue" },
    ],
    cardTitle: "Our Mission",
    cardKicker: "Transforming Communities",
    cardBody:
      "Creating sustainable pathways for family empowerment and community development across Africa through comprehensive support systems.",
  },
  storyHeader: "Our Foundation’s Journey",
  storyBody: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "The SouthWest Good Parenting Foundation Home Africa (SWGPFHA) was born from a deep commitment to addressing family support, education, and social development." },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "In 2025, we achieved legal establishment, enabling us to expand our reach and formalize our commitment to sustainable community development." },
        ],
      },
    ],
  },
  purposeTitle: "Our Purpose",
  purposeBody:
    "To create sustainable pathways for family empowerment and community development across Africa.",
  valuesTitle: "Our Values",
  valuesBody:
    "Compassion, integrity, a community-centered approach, and sustainable development guide all our initiatives.",
  timelineHeader: "Our Journey",
  timelineSub:
    "Key milestones in our foundation's growth and impact",
  timelineItems: [
    { year: "2020", event: "Foundation Established", description: "SWGPFHA was founded with a vision to transform communities across Africa" },
    { year: "2024", event: "First Director's Vision", description: "Leadership vision expanded to include comprehensive social programs" },
    { year: "2025", event: "Legal Establishment", description: "Officially registered as a legal entity, expanding our reach and impact" },
  ],
  leaderHeader: "Foundation Leadership",
  leaderSub: "Dedicated leaders committed to creating positive change",
  leaders: [
    {
      name: "Apostle Dr Henry Kwame Gyebi",
      title: "CEO & First Director",
      description:
        "Visionary leader dedicated to empowering African communities through sustainable development programs.",
      photoUrl: "/dir.jpg",
    },
    {
      name: "Madam Esther Ashon",
      title: "Head of Human Relations & Second Director",
      description:
        "Committed to fostering strong relationships and ensuring the foundation’s human development initiatives thrive.",
      photoUrl: "/director_2.jpg",
    },
    {
      name: "Madam Fafali Dziedzoave Esi",
      title: "Foundation Secretary",
      description:
        "Dedicated to ensuring transparency, structure, and effective communication within the foundation.",
      photoUrl: "/secretary.jpg",
    },
  ],

  collabHeader: "Collaborating Organizations",
  collabSub:
    "We’re honored to collaborate with faith-based and community organizations across Africa.",
  collaborators: [
    { name: "NEEMA FOUNDATION SOUTH AFRICA", location: "South Africa", logoUrl: null },
    { name: "PEACE TERBENACLE MINISTRY", location: "Durban, Marrian Hills, South Africa", logoUrl: null },
    { name: "BLESSED GENERATION MINISTRY INT.", location: "Rukungiri, Uganda", logoUrl: "blessedgen-logo.jpg" },
    { name: "JESURUN TEACHING PRAYER MINISTRY INT.", location: "Ghana, West Africa", logoUrl: null },
    { name: "CHRIST NARROW GATE CHAPEL", location: "Kojokrom, Takoradi, Ghana, West Africa", logoUrl: null },
  ],
  impactHeader: "Our Commitment",
  impactQuote:
    "We believe that every child deserves a nurturing environment, every family deserves support, and every community deserves the opportunity to thrive.",
  impactByline: "— SWGPFHA Leadership Team",
};

/* -------------------------------- component -------------------------------- */
const About = () => {
  /* --------------------------- CMS-controlled strings --------------------------- */
  const heroKicker = useString("about.hero.kicker", FB.hero.kicker);
  const heroTitle1 = useString("about.hero.title.line1", FB.hero.title1);
  const heroTitle2 = useString("about.hero.title.line2", FB.hero.title2);
  const heroSubtitle = useString("about.hero.subtitle", FB.hero.subtitle);
  const heroStats = useJSON<Array<{ number: string; label: string; color?: string }>>(
    "about.hero.stats",
    FB.hero.stats
  );
  const heroCardTitle = useString("about.hero.card.title", FB.hero.cardTitle);
  const heroCardKicker = useString("about.hero.card.kicker", FB.hero.cardKicker);
  const heroCardBody = useString("about.hero.card.body", FB.hero.cardBody);

  const storyHeader = useString("about.story.header", FB.storyHeader);
  const storyRich = useString("about.body", JSON.stringify(FB.storyBody));

  const purposeTitle = useString("about.purpose.title", FB.purposeTitle);
  const purposeBody = useString("about.purpose.body", FB.purposeBody);
  const valuesTitle = useString("about.values.title", FB.valuesTitle);
  const valuesBody = useString("about.values.body", FB.valuesBody);

  const tlHeader = useString("about.timeline.header", FB.timelineHeader);
  const tlSub = useString("about.timeline.sub", FB.timelineSub);
  const tlItems = useJSON<Array<{ year: string; event: string; description: string }>>(
    "about.timeline.items",
    FB.timelineItems
  );

  const leaderHeader = useString("about.leaders.header", FB.leaderHeader);
  const leaderSub = useString("about.leaders.sub", FB.leaderSub);
  const leaders = useJSON<Array<{ name: string; title: string; description: string; photoUrl?: string | null }>>(
    "about.leaders.items",
    FB.leaders
  );

  const collabHeader = useString("about.collab.header", FB.collabHeader);
  const collabSub = useString("about.collab.sub", FB.collabSub);
  const collaborators = useJSON<Array<{ name: string; location?: string; logoUrl?: string | null }>>(
    "about.collab.items",
    FB.collaborators
  );

  const impactHeader = useString("about.impact.header", FB.impactHeader);
  const impactQuote = useString("about.impact.quote", FB.impactQuote);
  const impactByline = useString("about.impact.byline", FB.impactByline);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foundation-purple via-primary to-foundation-green" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-20 right-20 w-40 h-40 bg-foundation-yellow/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-foundation-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative w-full max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-foundation-yellow rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-foundation-yellow to-transparent" />
                </div>

                {/* kicker (small) */}
                <p className="uppercase tracking-wider text-white/70 text-xs">{heroKicker}</p>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {heroTitle1}
                  <br />
                  <span className="bg-gradient-to-r from-foundation-yellow to-foundation-green bg-clip-text text-transparent">
                    {heroTitle2}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                  {heroSubtitle}
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {heroStats.map((s, i) => (
                    <div className="text-center" key={`${s.label}-${i}`}>
                      <div className={`text-2xl md:text-3xl font-bold ${s.color ?? (i === 0 ? "text-foundation-yellow" : i === 1 ? "text-foundation-green" : "text-foundation-blue")}`}>
                        {s.number}
                      </div>
                      <div className="text-sm text-white/80">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right card */}
            <div className="relative animate-fade-in">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-foundation-green rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{heroCardTitle}</h3>
                      <p className="text-foundation-yellow">{heroCardKicker}</p>
                    </div>
                  </div>
                  <p className="text-white/90 leading-relaxed">{heroCardBody}</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-foundation-purple/80 rounded-full flex items-center justify-center animate-float">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-foundation-yellow/80 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story (rich) */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {storyHeader.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-primary">{storyHeader.split(" ").slice(-1)}</span>
              </h2>
              <RichViewer className="text-lg text-muted-foreground leading-relaxed" value={storyRich || "{}"} />
            </div>

            <div className="lg:pl-8">
              <div className="grid gap-6">
                <Card className="card-shadow border-l-4 border-l-foundation-green bg-foundation-green/5">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Target className="h-8 w-8 text-foundation-green mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{purposeTitle}</h3>
                        <p className="text-muted-foreground">{purposeBody}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-shadow border-l-4 border-l-foundation-yellow bg-foundation-yellow/5">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Award className="h-8 w-8 text-foundation-yellow mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{valuesTitle}</h3>
                        <p className="text-muted-foreground">{valuesBody}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-foundation-green/10 section-padding border-t-4 border-foundation-green">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{tlHeader}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{tlSub}</p>
          </div>
          <div className="space-y-8">
            {tlItems.map((m, i) => (
              <div key={`${m.year}-${i}`} className="relative animate-slide-in-right">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg foundation-shadow ${i % 3 === 0 ? "bg-foundation-green" : i % 3 === 1 ? "bg-foundation-yellow" : "bg-primary"
                        }`}
                    >
                      {m.year}
                    </div>
                  </div>
                  <Card className="flex-1 card-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Calendar className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">{m.event}</h3>
                          <p className="text-muted-foreground leading-relaxed">{m.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {i < tlItems.length - 1 && <div className="absolute left-8 top-16 w-0.5 h-8 bg-primary/30" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{leaderHeader}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{leaderSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leaders.map((f, i) => (
              <Card
                key={`${f.name}-${i}`}
                className="group overflow-hidden card-shadow border border-border/40 bg-background hover:shadow-lg transition-all duration-300"
              >
                {/* Hero-style image header with overlay text */}
                <div className="relative w-full h-56 md:h-64 overflow-hidden">
                  {f.photoUrl ? (
                    <img
                      src={f.photoUrl}
                      alt={f.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ objectPosition: "50% 25%" }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-foundation-yellow/30 to-foundation-green/30 flex items-center justify-center">
                      <Users className="h-14 w-14 text-foundation-yellow" />
                    </div>
                  )}

                  {/* Overlay gradient and text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5">
                    <h3 className="text-lg md:text-xl font-bold text-white">{f.name}</h3>
                    <p className="text-sm text-foundation-yellow font-medium">{f.title}</p>
                  </div>
                </div>

                {/* Description below the image */}
                <CardContent className="p-5">
                  <p className="text-muted-foreground text-sm leading-relaxed text-center">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborations */}
      <section className="section-padding bg-foundation-purple/5 border-t border-border/50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-3 mb-10">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Handshake className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{collabHeader}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{collabSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {collaborators.map((c, i) => (
              <Card key={`${c.name}-${i}`} className="card-shadow hover:shadow-lg transition-shadow bg-background border">
                <CardContent className="p-5">
                  <div className="h-20 w-full flex items-center justify-center mb-4">
                    {c.logoUrl ? (
                      <img src={c.logoUrl} alt={`${c.name} logo`} className="h-12 max-w-[90%] object-contain" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center ring-1 ring-border">
                        <User2 className="h-7 w-7 text-muted-foreground/70" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="font-semibold leading-snug">{c.name}</h3>
                    {c.location && <p className="text-sm text-muted-foreground">{c.location}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="hero-gradient text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">{impactHeader}</h2>
          <blockquote className="text-xl md:text-2xl italic leading-relaxed opacity-95">“{impactQuote}”</blockquote>
          <div className="text-lg opacity-90">
            <p className="font-medium">{impactByline}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
