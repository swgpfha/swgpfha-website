import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, Camera, Video, FileText, Calendar, ExternalLink, Play, MapPin } from 'lucide-react';

/** Same hybrid API setup as Admin */
const API = (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined)?.replace(/\/$/, '') ?? '';
const apiUrl = (path: string) => `${API}${path}`;

// Ensure a Response is JSON before parsing
const ensureJson = async <T,>(res: Response): Promise<T> => {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`Expected JSON but got ${ct || 'unknown'}${text ? ` — ${text.slice(0, 120)}…` : ''}`);
  }
  return res.json() as Promise<T>;
};

// Safe error extractor
const safeErr = async (res: Response) => {
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const j = await res.json();
      return j?.error || res.statusText;
    }
    const t = await res.text();
    return t || res.statusText;
  } catch {
    return res.statusText;
  }
};

// 🔧 make a URL absolute against the API origin when it starts with '/'
const toAbs = (u?: string | null) => (u ? (u.startsWith('/') ? `${API}${u}` : u) : '');

// Types
type PublicMediaAsset = {
  id: string;
  url: string;
  thumbUrl?: string | null;
};

type PublicMediaItem = {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'document';
  createdAt: string;
  coverUrl?: string | null;
  thumbUrl?: string | null;

  // Extra metadata we want to show if available
  description?: string | null;
  location?: string | null;
  eventDate?: string | null;

  // Some backends include assets on list; if not present this stays undefined.
  assets?: PublicMediaAsset[];
};

const Media = () => {
  // ----- static content you already had -----
  const publications = [
    {
      title: 'Annual Impact Report 2024',
      type: 'Report',
      date: 'December 2024',
      description:
        'Comprehensive overview of our programs, achievements, and community impact throughout 2024.',
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: 'Parenting in the Digital Age',
      type: 'Guide',
      date: 'November 2024',
      description:
        'Essential guide for modern parents navigating technology and social media with their children.',
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: 'Community Health Guidelines',
      type: 'Manual',
      date: 'October 2024',
      description:
        'Practical health and wellness guidelines for community health workers and families.',
      icon: <FileText className="h-6 w-6" />,
    },
  ];

  const TikTokIcon = () => (
    // public/tiktok.webp  ->  served at /tiktok.webp
    <img
      src="/tiktok.webp"
      alt="TikTok"
      className="h-8 w-8 object-contain"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );

  const socialMediaHighlights = [
    {
      platform: 'Facebook',
      followers: '5,000+',
      engagement: 'High',
      content: 'Community updates, educational content, and program highlights',
      icon: <Facebook className="h-8 w-8" />,
      url: undefined,
    },
    {
      platform: 'TikTok',
      followers: '2,500+',
      engagement: 'Growing',
      content: 'Parenting tips, educational videos, and community stories',
      icon: <TikTokIcon />,
      url: 'https://www.tiktok.com/@swgpfha?is_from_webapp=1&sender_device=pc',
      buttonStyle: 'tiktok',
    },
  ];

  // ----- Pull uploaded photos & videos -----
  const [media, setMedia] = useState<PublicMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function fetchMedia() {
    setLoading(true);
    setErr(null);
    try {
      const [photosRes, videosRes] = await Promise.all([
        fetch(apiUrl('/api/media?type=photo')),
        fetch(apiUrl('/api/media?type=video')),
      ]);

      if (!photosRes.ok) throw new Error(await safeErr(photosRes));
      if (!videosRes.ok) throw new Error(await safeErr(videosRes));

      const photosJson = await ensureJson<any>(photosRes);
      const videosJson = await ensureJson<any>(videosRes);

      // Handle either shape: Array or { items: [...] }
      const toArr = (x: any) =>
        Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : [];

      const photos: PublicMediaItem[] = toArr(photosJson);
      const videos: PublicMediaItem[] = toArr(videosJson);

      // Normalize URLs to absolute right away (cover/thumb/assets)
      const normalize = (items: PublicMediaItem[]) =>
        items.map((it) => ({
          ...it,
          coverUrl: toAbs(it.coverUrl),
          thumbUrl: toAbs(it.thumbUrl),
          assets: (it.assets || []).map((a) => ({
            ...a,
            url: toAbs(a.url),
            thumbUrl: toAbs(a.thumbUrl ?? undefined),
          })),
        }));

      const combined = [...normalize(photos), ...normalize(videos)].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setMedia(combined);

      // Hydrate extra metadata (description, location, eventDate) from detail endpoint if missing
      const needs = combined.filter(
        (i) => i.description == null && i.location == null && i.eventDate == null
      );
      if (needs.length) {
        const results = await Promise.allSettled(
          needs.map(async (i) => {
            const r = await fetch(apiUrl(`/api/media/${i.id}`));
            if (!r.ok) throw new Error(await safeErr(r));
            const j = await ensureJson<any>(r);
            const hydrated: PublicMediaItem = {
              ...i,
              description: j?.description ?? null,
              location: j?.location ?? null,
              eventDate: j?.eventDate ?? null,
              coverUrl: toAbs(j?.coverUrl ?? i.coverUrl),
              thumbUrl: toAbs(j?.thumbUrl ?? i.thumbUrl),
              assets: (j?.assets || i.assets || []).map((a: any) => ({
                id: a.id,
                url: toAbs(a.url),
                thumbUrl: toAbs(a.thumbUrl ?? undefined),
              })),
            };
            return hydrated;
          })
        );

        const byId = new Map<string, PublicMediaItem>();
        results.forEach((res) => {
          if (res.status === 'fulfilled') byId.set(res.value.id, res.value);
        });
        if (byId.size) {
          setMedia((prev) => prev.map((it) => byId.get(it.id) ?? it));
        }
      }
    } catch (e: any) {
      setErr(e?.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMedia();
  }, []);

  // Pickers (these now receive absolute URLs thanks to normalize/hydrate)
  const pickThumb = (item: PublicMediaItem) =>
    item.thumbUrl || item.coverUrl || item.assets?.[0]?.thumbUrl || item.assets?.[0]?.url || '';
  const pickUrl = (item: PublicMediaItem) => item.coverUrl || item.assets?.[0]?.url || '';

  return (
    <div className="min-h-screen">
      {/* Hero Section (unchanged) */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-foundation-purple via-foundation-blue to-foundation-green"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
        <div className="absolute inset-0">
          <Camera className="absolute top-24 left-[15%] h-8 w-8 text-foundation-yellow/40 animate-float" />
          <Video className="absolute top-32 right-[20%] h-10 w-10 text-foundation-green/50 animate-float" style={{ animationDelay: '0.7s' }} />
          <FileText className="absolute bottom-40 left-[25%] h-9 w-9 text-foundation-blue/40 animate-float" style={{ animationDelay: '1.4s' }} />
          <Facebook className="absolute bottom-28 right-[15%] h-7 w-7 text-foundation-purple/50 animate-float" style={{ animationDelay: '2.1s' }} />
          <Play className="absolute top-1/2 left-[8%] h-6 w-6 text-foundation-yellow/35 animate-float" style={{ animationDelay: '2.8s' }} />
        </div>
        <div className="relative w-full max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-foundation-yellow rounded-lg flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-foundation-yellow rounded-full animate-pulse"></div>
                    <p className="text-foundation-yellow font-semibold uppercase tracking-wide text-sm">
                      Digital Presence & Publications
                    </p>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Publications
                  <br />
                  <span className="text-foundation-yellow">&</span>
                  <br />
                  <span className="bg-gradient-to-r from-foundation-green to-foundation-blue bg-clip-text text-transparent">
                    Media
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                  Stay updated with our latest publications, social media content, and event highlights showcasing our
                  community impact
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Presence (unchanged) */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Digital Presence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with us on social media for daily updates, educational content, and community stories
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {socialMediaHighlights.map((platform, index) => (
              <Card
                key={index}
                className="card-shadow hover:shadow-lg transition-all duration-300 animate-fade-in"
              >
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-4 rounded-full">
                        <div className="text-primary">{platform.icon}</div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{platform.platform}</h3>
                        <p className="text-sm text-muted-foreground">Follow us for updates</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-primary">{platform.followers}</p>
                        <p className="text-sm text-muted-foreground">Followers</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-secondary">{platform.engagement}</p>
                        <p className="text-sm text-muted-foreground">Engagement</p>
                      </div>
                    </div>

                    <p className="text-muted-foreground">{platform.content}</p>

                    {platform.url ? (
                      <Button
                        variant={platform.buttonStyle === 'tiktok' ? 'default' : 'outline'}
                        className={`w-full ${platform.buttonStyle === 'tiktok'
                            ? 'bg-[#010101] hover:bg-[#ff0050] text-white border-none'
                            : ''
                          }`}
                        asChild
                      >
                        <a
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${platform.platform}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit {platform.platform}
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled title="Link coming soon">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit {platform.platform}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Publications (unchanged) */}
      <section className="bg-muted section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Latest Publications</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access our research, reports, and educational materials designed to support communities and families
            </p>
          </div>
          <div className="grid gap-6">
            {publications.map((publication, index) => (
              <Card key={index} className="card-shadow hover:shadow-lg transition-all duration-300 animate-slide-in-right">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <div className="text-primary">{publication.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-foreground">{publication.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded">{publication.type}</span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{publication.date}</span>
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{publication.description}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Event Gallery — uses real uploads; shows all available metadata */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Event Gallery</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Highlights from our recent events, workshops, and community activities
            </p>
          </div>

          {err && <p className="text-sm text-destructive text-center mb-4">{err}</p>}
          {loading && <p className="text-sm text-muted-foreground text-center mb-4">Loading…</p>}
          {!loading && !err && media.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mb-4">No media yet.</p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item) => {
              const isVideo = item.type === 'video';
              const thumb = pickThumb(item);
              const url = pickUrl(item);
              const dateText = item.eventDate
                ? new Date(item.eventDate).toLocaleDateString()
                : new Date(item.createdAt).toLocaleDateString();

              return (
                <Card key={item.id} className="card-shadow hover:shadow-lg transition-all duration-300 group animate-scale-in">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                        {/* Fallback icon layer (always present) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isVideo ? (
                            <Play className="h-12 w-12 text-white bg-primary/80 rounded-full p-3" />
                          ) : (
                            <Camera className="h-12 w-12 text-white bg-primary/80 rounded-full p-3" />
                          )}
                        </div>

                        {/* Image on top; hide it on error so fallback shows */}
                        {thumb && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={item.title}
                            className="w-full h-full object-cover relative z-10"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // hide broken image; fallback icon stays visible underneath
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>

                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 text-primary text-xs font-medium px-2 py-1 rounded">
                          {isVideo ? 'Video' : 'Photos'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{dateText}</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => url && window.open(url, '_blank', 'noopener,noreferrer')}
                        disabled={!url}
                      >
                        View {isVideo ? 'Video' : 'Gallery'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter (unchanged) */}
      <section className="hero-gradient text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Stay Connected</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Subscribe to our newsletter and follow us on social media to stay updated with our latest news, events, and impact stories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Subscribe to Newsletter
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white hover:bg-white hover:text-primary">
              Follow on Social Media
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Media;
