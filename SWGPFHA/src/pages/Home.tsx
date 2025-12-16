import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Heart, Users, BookOpen, Droplets, Shield, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import teamImage from "@/assets/team.jpg";
import RichViewer from "@/components/RichViewer";

// ---------- Tiny helpers to consume your content API ----------

const API = (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";
const api = (p: string) => `${API}${p}`;

/** Simple text (or raw string) content block fetcher with fallback */
function useContent(slug: string, fallback = "") {
  const [value, setValue] = useState<string>(fallback);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/content/${slug}?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (alive && typeof data?.content === "string") setValue(data.content);
      } catch {}
    })();
    return () => { alive = false; };
  }, [slug]);
  return value;
}

/** JSON content block fetcher with typed fallback + optional validator */
function useJsonBlock<T>(slug: string, fallback: T, validate?: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(api(`/api/content/${slug}?t=${Date.now()}`), { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const raw = data?.content;
        if (typeof raw !== "string") return;
        const parsed = JSON.parse(raw);
        if (validate ? validate(parsed) : true) {
          if (alive) setValue(parsed as T);
        }
      } catch {
        /* keep previous */
      }
    })();
    return () => { alive = false; };
  }, [slug]);
  return value;
}

// Map icon names (stored in JSON) to Lucide components
const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  book: BookOpen,
  shield: Shield,
  droplets: Droplets,
  users: Users,
};

// ---------- Fallback content (used until blocks are created/published) ----------

const FALLBACK_FEATURES = [
  { icon: "heart",    title: "Parenting Support", description: "Empowering families with guidance and resources for effective parenting", color: "text-foundation-purple" },
  { icon: "book",     title: "Education",         description: "Transforming lives through quality education and learning opportunities", color: "text-foundation-blue" },
  { icon: "shield",   title: "Health Insurance",  description: "Providing accessible healthcare and insurance initiatives",             color: "text-foundation-green" },
  { icon: "droplets", title: "Food & Water",      description: "Ensuring basic needs through nutrition and clean water programs",      color: "text-foundation-yellow" },
];

const FALLBACK_STATS = [
  { number: "2020",  label: "Founded" },
  { number: "2025",  label: "Legally Established" },
  { number: "1000+", label: "Lives Impacted" },
  { number: "5+",    label: "Active Programs" },
];

// TipTap JSON fallbacks (rich)
const FALLBACK_HERO_LEAD_JSON = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Empowering families and transforming communities through education, health, and comprehensive social programs that create lasting positive change." }] }],
});

const FALLBACK_ABOUT_RICH_JSON = JSON.stringify({
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Founded in 2020 and legally established in 2025, the SouthWest Good Parenting Foundation Home Africa (SWGPFHA) is dedicated to creating lasting positive change in communities across Africa." }] },
    { type: "paragraph", content: [{ type: "text", text: "Our comprehensive approach addresses critical needs in parenting support, education, healthcare, nutrition, and vocational training, ensuring that every child and family has the opportunity to thrive." }] },
  ],
});

// ---------- Validators to protect against bad JSON being published ----------
const isFeatures = (v: unknown): v is Array<{ icon: string; title: string; description: string; color?: string }> =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      x &&
      typeof x === "object" &&
      typeof (x as any).icon === "string" &&
      typeof (x as any).title === "string" &&
      typeof (x as any).description === "string"
  );

const isStats = (v: unknown): v is Array<{ number: string; label: string }> =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      x &&
      typeof x === "object" &&
      typeof (x as any).number === "string" &&
      typeof (x as any).label === "string"
  );

const Home = () => {
  // Pull text blocks (plain) from CMS
  const kicker    = useContent("home.kicker", "Established 2020 • Legally Recognized 2025");
  const subtitle  = useContent("home.subtitle", "Serving Communities Across Africa");
  const title1    = useContent("home.title.line1", "SouthWest Good");
  const title2    = useContent("home.title.line2", "Parenting Foundation");
  const quote     = useContent("home.quote", `"Children are Gift & God's Heritage"`);

  // Pull rich blocks (TipTap JSON as string)
  const heroLeadRich = useContent("home.hero.lead", FALLBACK_HERO_LEAD_JSON);
  const aboutRich    = useContent("home.about.rich", FALLBACK_ABOUT_RICH_JSON);

  // Pull JSON blocks for features & stats (with validators)
  const features = useJsonBlock("home.features", FALLBACK_FEATURES, isFeatures);
  const stats    = useJsonBlock("home.stats",    FALLBACK_STATS,    isStats);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={teamImage} alt="SWGPFHA Team" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-foundation-yellow/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-foundation-green/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-foundation-purple/20 rounded-full blur-xl animate-pulse"></div>

        <div className="relative w-full max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            {/* Content Side */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-1 h-16 bg-gradient-to-b from-foundation-yellow to-foundation-green"></div>
                  <div>
                    <p className="text-foundation-yellow font-semibold tracking-wide uppercase text-sm">{kicker}</p>
                    <p className="text-white/80 text-sm">{subtitle}</p>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {title1}
                  <br />
                  <span className="bg-gradient-to-r from-foundation-yellow via-foundation-green to-foundation-blue bg-clip-text text-transparent">
                    {title2}
                  </span>
                  <br />
                  <span className="text-3xl md:text-4xl lg:text-5xl text-white/90">Home Africa</span>
                </h1>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <p className="text-xl md:text-2xl font-medium text-foundation-yellow italic text-center">{quote}</p>
                </div>

                {/* Rich hero lead */}
                <div className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl prose-invert prose prose-lg">
                  <RichViewer value={heroLeadRich} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="text-lg px-8 py-4 bg-foundation-green hover:bg-foundation-green/90 border-0 foundation-shadow animate-scale-in">
                  <Link to="/get-involved" className="flex items-center space-x-2">
                    <Heart size={20} />
                    <span>Join Our Mission</span>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-white/10 border-2 border-foundation-yellow text-foundation-yellow hover:bg-foundation-yellow hover:text-white animate-scale-in">
                  <Link to="/about" className="flex items-center space-x-2">
                    <span>Discover Our Story</span>
                    <ArrowRight size={20} />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Visual Side */}
            <div className="relative lg:pl-8 animate-fade-in">
              <div className="relative">
                {/* Central Logo */}
                <div className="relative z-10 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-foundation-yellow via-foundation-green to-foundation-blue rounded-full p-1 animate-pulse">
                      <div className="bg-white rounded-full p-4">
                        <img src="/assets/swgpfha-logo.jpg" alt="SWGPFHA Logo" className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-8 -left-8 z-0">
                  <div className="bg-foundation-purple/90 backdrop-blur-sm text-white p-4 rounded-lg foundation-shadow animate-float">
                    <Heart className="h-6 w-6 mb-2" />
                    <p className="text-sm font-medium">Family Support</p>
                  </div>
                </div>

                <div className="absolute -top-4 -right-8 z-0">
                  <div className="bg-foundation-blue/90 backdrop-blur-sm text-white p-4 rounded-lg foundation-shadow animate-float" style={{ animationDelay: "0.5s" }}>
                    <BookOpen className="h-6 w-6 mb-2" />
                    <p className="text-sm font-medium">Education</p>
                  </div>
                </div>

                <div className="absolute -bottom-8 -left-4 z-0">
                  <div className="bg-foundation-green/90 backdrop-blur-sm text-white p-4 rounded-lg foundation-shadow animate-float" style={{ animationDelay: "1s" }}>
                    <Shield className="h-6 w-6 mb-2" />
                    <p className="text-sm font-medium">Healthcare</p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-12 z-0">
                  <div className="bg-foundation-yellow/90 backdrop-blur-sm text-white p-4 rounded-lg foundation-shadow animate-float" style={{ animationDelay: "1.5s" }}>
                    <Droplets className="h-6 w-6 mb-2" />
                    <p className="text-sm font-medium">Nutrition</p>
                  </div>
                </div>

                {/* Impact Numbers */}
                <div className="absolute top-1/2 left-full ml-8 transform -translate-y-1/2 hidden xl:block">
                  <div className="space-y-4">
                    {stats.slice(2, 4).map((s, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
                        <p className={`text-2xl font-bold ${i === 0 ? "text-foundation-green" : "text-foundation-yellow"}`}>{s.number}</p>
                        <p className="text-xs">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-foundation-yellow/10 py-16 border-t-4 border-foundation-yellow">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2 animate-slide-in-right">
                <h3 className="text-3xl md:text-4xl font-bold text-foundation-green">{stat.number}</h3>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Transforming Lives Through
                <span className="text-primary"> Purpose & Compassion</span>
              </h2>

              {/* Rich About content */}
              <RichViewer value={aboutRich} className="text-lg leading-relaxed" />

              <div className="pt-4">
                <Button variant="default" size="lg">
                  <Link to="/about" className="flex items-center space-x-2">
                    <span>Our Story</span>
                    <ArrowRight size={20} />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:pl-8">
              <Card className="card-shadow border-l-4 border-l-foundation-green bg-foundation-green/5">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-foundation-green" />
                    <h3 className="text-xl font-semibold">Our Mission</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To provide comprehensive support systems that empower families, strengthen communities, and
                    create sustainable pathways to prosperity throughout Africa.
                  </p>
                  <Button variant="outline" size="sm" className="border-foundation-green text-foundation-green hover:bg-foundation-green hover:text-white">
                    <Link to="/mission">View Full Mission & Vision</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="bg-muted section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Impact Areas</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive programs designed to address critical needs and create lasting change
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = iconMap[feature.icon] ?? Heart;
              return (
                <Card key={index} className="card-shadow hover:shadow-lg transition-all duration-300 group cursor-pointer animate-scale-in">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`${feature.color ?? "text-primary"} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center pt-8">
            <Button variant="default" size="lg">
              <Link to="/programs" className="flex items-center space-x-2">
                <span>Explore All Programs</span>
                <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Join Our Mission</h2>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed">
            Together, we can create lasting change and empower communities across Africa. Your support helps us reach
            more families and transform more lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/get-involved" className="flex items-center space-x-2">
                <span>Get Involved</span>
                <Heart size={20} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white hover:bg-white hover:text-primary">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
