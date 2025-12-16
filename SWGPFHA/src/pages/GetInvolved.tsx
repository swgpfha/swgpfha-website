import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Users, Handshake, DollarSign, Calendar, GraduationCap, Mail, Phone } from 'lucide-react';

type Opportunity = {
  id: string;
  title: 'string' | any;
  timeType: 'Full-Time' | 'Part-Time' | 'Flexible' | 'Remote';
  location?: string;
  description: string;
  skills: string[];
  status: 'Active' | 'Closed';
  createdAt: string; // ISO
};

/** API helpers (same approach as Admin.tsx) */
const API = (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined)?.replace(/\/$/, '') ?? '';
const apiUrl = (path: string) => `${API}${path}`;
const ensureJson = async <T,>(res: Response): Promise<T> => {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`Expected JSON but got ${ct || 'unknown'} — ${text.slice(0, 120)}…`);
  }
  return res.json() as Promise<T>;
};

const GetInvolved = () => {
  const [amountChoice, setAmountChoice] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const finalAmount = amountChoice === "custom" ? Number(customAmount || 0) : Number(amountChoice || 0);

  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const donorName =
    [form.firstName, form.lastName].filter(Boolean).join(" ").trim() || undefined;

  const donationOptions = [
    { amount: "GHC25", impact: "Provides educational materials for 5 children" },
    { amount: "GHC50", impact: "Supports a family's monthly nutrition program" },
    { amount: "GHC100", impact: "Funds health insurance for one family" },
    { amount: "GHC250", impact: "Sponsors vocational training for one person" },
    { amount: "GHC500", impact: "Supports a community health fair" },
    { amount: "Custom", impact: "Choose your own impact amount" }
  ];

  // ------- Live Opportunities (replaces dummy data) -------
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [oppsError, setOppsError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingOpps(true);
      setOppsError(null);
      try {
        // Public endpoint returns only Active by default
        const res = await fetch(apiUrl('/api/opportunities'));
        if (!res.ok) throw new Error(`Failed to load opportunities (${res.status})`);
        const data = await ensureJson<Opportunity[]>(res);
        setOpps(data);
      } catch (e: any) {
        setOppsError(e?.message ?? 'Failed to load opportunities');
      } finally {
        setLoadingOpps(false);
      }
    };
    load();
  }, []);
  // --------------------------------------------------------

  const partnershipTypes = [
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Corporate Partnership",
      description: "Partner with us through financial support, employee volunteer programs, or in-kind donations",
      benefits: ["Tax benefits", "Corporate social responsibility", "Employee engagement", "Brand visibility"]
    },
    {
      icon: <Handshake className="h-8 w-8" />,
      title: "Strategic Alliance",
      description: "Collaborate on programs and initiatives that align with our mission and your organization's goals",
      benefits: ["Shared expertise", "Expanded reach", "Joint impact", "Resource sharing"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Partnership",
      description: "Work with local communities and organizations to implement and sustain our programs",
      benefits: ["Local knowledge", "Community trust", "Sustainable impact", "Grassroots support"]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foundation-green via-foundation-yellow to-foundation-purple"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        <div className="absolute inset-0">
          <Heart className="absolute top-20 left-[12%] h-10 w-10 text-foundation-yellow/50 animate-float" />
          <Users className="absolute top-36 right-[18%] h-12 w-12 text-foundation-green/60 animate-float" style={{ animationDelay: '0.6s' }} />
          <Handshake className="absolute bottom-32 left-[20%] h-11 w-11 text-foundation-blue/50 animate-float" style={{ animationDelay: '1.2s' }} />
          <DollarSign className="absolute bottom-24 right-[22%] h-9 w-9 text-foundation-purple/60 animate-float" style={{ animationDelay: '1.8s' }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-foundation-yellow rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-foundation-yellow via-foundation-green to-foundation-blue"></div>
                  <p className="text-foundation-yellow font-semibold uppercase tracking-wide text-sm">
                    Make an Impact
                  </p>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Get
                  <br />
                  <span className="bg-gradient-to-r from-foundation-yellow to-foundation-green bg-clip-text text-transparent">
                    Involved
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                  Join our mission to transform communities across Africa. There are many ways
                  to make a difference and create lasting impact.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foundation-yellow">3</div>
                    <div className="text-sm text-white/80">Ways to Help</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foundation-green">GHC25+</div>
                    <div className="text-sm text-white/80">Min Donation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foundation-blue">24/7</div>
                    <div className="text-sm text-white/80">Support</div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Gateway Into Reading English Program Section */}
      <section className="bg-foundation-blue/10 py-16 border-t-4 border-foundation-blue">
        <div className="max-w-6xl mx-auto container-padding text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foundation-blue">
            GATEWAY INTO READING ENGLISH PROGRAM
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            SWGPFHA’s Educational Foundation Program is designed to build early childhood literacy and language skills across Ghana and Africa.
            Schools can enroll for <span className="font-semibold text-foundation-blue">$481.93</span> and benefit from certified facilitators, teacher training, and participant certificates.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <Card className="border-l-4 border-foundation-blue shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-4 text-left">
                <h3 className="text-xl font-semibold text-foundation-blue">
                  Program Highlights
                </h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Package: GATEWAY INTO READING ENGLISH & MOTHER LANGUAGE</li>
                  <li>• Cost: $481.93 per participating school</li>
                  <li>• Facilitated by SWGPFHA Local & Foreign Program Instructors</li>
                  <li>• Teacher training and capacity-building sessions</li>
                  <li>• Certificates of participation for all attendees</li>
                  <li>• Focus: Laying a solid literacy foundation for young generations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-foundation-yellow shadow-md hover:shadow-lg transition-all duration-300 text-center flex flex-col justify-center">
              <CardContent className="p-8 space-y-6">
                <GraduationCap className="h-12 w-12 text-foundation-yellow mx-auto" />
                <h3 className="text-2xl font-bold text-foundation-yellow">
                  Enroll Your School
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Partner with SWGPFHA to empower teachers and students with foundational literacy tools for a brighter future.
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-foundation-yellow text-foundation-yellow hover:bg-foundation-yellow hover:text-white"
                >
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ways to Help */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ways to Make a Difference</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose how you'd like to contribute to our mission of empowering families and strengthening communities
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-shadow hover:shadow-lg transition-all duration-300 text-center animate-fade-in">
              <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Donate</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Make a financial contribution to support our programs and reach more families in need
                </p>
              </CardContent>
            </Card>
            <Card className="card-shadow hover:shadow-lg transition-all duration-300 text-center animate-fade-in">
              <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Volunteer</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Contribute your time and skills to help implement our programs and support communities
                </p>
              </CardContent>
            </Card>
            <Card className="card-shadow hover:shadow-lg transition-all duration-300 text-center animate-fade-in">
              <CardContent className="p-8 space-y-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Handshake className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Partner</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Collaborate with us as an organization to amplify our impact and reach
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="bg-muted section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Make a Donation</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your donation directly supports our programs and helps us reach more families across Africa.
                Every contribution, no matter the size, makes a real difference.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {donationOptions.map((option, index) => (
                  <Card key={index} className="card-shadow hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-4 text-center space-y-2">
                      <h3 className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                        {option.amount}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-tight">{option.impact}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Donation Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Donation Amount</Label>

                  <Select value={amountChoice} onValueChange={setAmountChoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-foreground shadow-lg rounded-md">
                      <SelectItem value="25">GHC25</SelectItem>
                      <SelectItem value="50">GHC50</SelectItem>
                      <SelectItem value="100">GHC100</SelectItem>
                      <SelectItem value="250">GHC250</SelectItem>
                      <SelectItem value="500">GHC500</SelectItem>
                      <SelectItem value="custom">Custom Amount</SelectItem>
                    </SelectContent>
                  </Select>

                  {amountChoice === "custom" && (
                    <div className="relative mt-2">
                      <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground select-none">
                        GHC
                      </span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        placeholder="0"
                        className="pl-14"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value.replace(/[^\d]/g, ""))}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    rows={3}
                    placeholder="Leave a message..."
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (!finalAmount || finalAmount < 1) return;
                    navigate("/payment", {
                      state: {
                        amount: finalAmount,
                        donor: donorName,
                        email: form.email || undefined,
                        message: form.message || undefined,
                        currency: "GHC",
                        amountChoice,
                      },
                    });
                  }}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Donate Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Volunteer Opportunities (from API) */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Volunteer Opportunities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Use your skills and passion to help us create positive change in communities
            </p>
          </div>

          {loadingOpps && (
            <div className="text-sm text-muted-foreground text-center">Loading opportunities…</div>
          )}
          {oppsError && (
            <div className="text-sm text-destructive text-center">{oppsError}</div>
          )}
          {!loadingOpps && !oppsError && (
            <div className="grid gap-6">
              {opps.map((o) => (
                <Card key={o.id} className="card-shadow hover:shadow-lg transition-all duration-300 animate-slide-in-right">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-xl font-semibold text-foreground">{o.title}</h3>
                          <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                            {o.timeType}
                          </span>
                          {o.location && (
                            <span className="bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full">
                              {o.location}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{o.description}</p>
                        {!!o.skills?.length && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Required Skills: </span>
                            {o.skills.join(', ')}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="ml-6">
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {opps.length === 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  No opportunities available at the moment. Please check back soon.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Partnership Opportunities */}
      <section className="bg-muted section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Partnership Opportunities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join forces with us to amplify our impact and create sustainable change
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {partnershipTypes.map((partnership, index) => (
              <Card key={index} className="card-shadow hover:shadow-lg transition-all duration-300 animate-scale-in">
                <CardContent className="p-8 space-y-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="text-primary">
                      {partnership.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{partnership.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{partnership.description}</p>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Benefits:</h4>
                    <ul className="space-y-1">
                      {partnership.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact for Involvement */}
      <section className="hero-gradient text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Have questions about how to get involved? We're here to help you find the perfect way
            to contribute to our mission.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center space-y-4">
                <Mail className="h-8 w-8 mx-auto" />
                <h3 className="text-lg font-semibold">Email Us</h3>
                <p className="text-sm opacity-90">swgpfha@gmail.com</p>
                <Button variant="secondary" size="sm">
                  Send Email
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center space-y-4">
                <Phone className="h-8 w-8 mx-auto" />
                <h3 className="text-lg font-semibold">Call Us</h3>
                <p className="text-sm opacity-90">Henry Kwame Gyebi, CEO</p>
                <Button variant="secondary" size="sm">
                  Schedule Call
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetInvolved;
