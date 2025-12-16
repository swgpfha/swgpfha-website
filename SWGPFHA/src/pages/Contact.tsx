import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock, User, Send } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:5050";

const Contact = () => {
  const contactInfo = [
    {
      icon: <User className="h-6 w-6" />,
      title: "CEO & Founder",
      primary: "Henry Kwame Gyebi",
      secondary: "Executive Leadership",
      description: "Direct contact with foundation leadership"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Address",
      primary: "swgpfha@gmail.com",
      secondary: "General Inquiries",
      description: "Send us your questions and we'll respond promptly"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Location",
      primary: "Accra, Ghana",
      secondary: "West Africa",
      description: "Serving communities across Africa"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Response Time",
      primary: "24-48 Hours",
      secondary: "Business Days",
      description: "We aim to respond to all inquiries quickly"
    }
  ];

  const inquiryTypes = [
    "General Information",
    "Program Participation",
    "Volunteer Opportunities",
    "Partnership Inquiries",
    "Donation Questions",
    "Media & Press",
    "Technical Support",
    "Other"
  ];

  const officeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 5:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 2:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];

  // ── New: controlled form state ────────────────────────────────
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inquiryType: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setField = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Valid email is required.";
    if (!form.inquiryType.trim()) return "Please select an inquiry type.";
    if (!form.subject.trim()) return "Subject is required.";
    if (form.message.trim().length < 5) return "Message must be at least 5 characters.";
    return null;
  };

  const onSubmit = useCallback(async () => {
    setErrorMsg(null);
    setSuccessRef(null);
    const v = validate();
    if (v) {
      setErrorMsg(v);
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch(`${API}/api/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        throw new Error(
          data?.error
            ? typeof data.error === "string"
              ? data.error
              : "Validation failed"
            : "Failed to send message"
        );
      }
      setSuccessRef(data.id);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        inquiryType: "",
        subject: "",
        message: "",
      });
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Communication Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-foundation-blue via-foundation-green to-foundation-yellow"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>

        {/* Contact Icons */}
        <div className="absolute inset-0">
          <Mail className="absolute top-24 left-[15%] h-8 w-8 text-foundation-yellow/50 animate-float" />
          <Phone className="absolute top-40 right-[20%] h-9 w-9 text-foundation-green/60 animate-float" style={{ animationDelay: '0.8s' }} />
          <MapPin className="absolute bottom-36 left-[18%] h-10 w-10 text-foundation-blue/50 animate-float" style={{ animationDelay: '1.6s' }} />
          <Send className="absolute bottom-28 right-[25%] h-7 w-7 text-foundation-purple/60 animate-float" style={{ animationDelay: '2.4s' }} />
          <User className="absolute top-1/2 right-[10%] h-6 w-6 text-foundation-yellow/40 animate-float" style={{ animationDelay: '3.2s' }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-foundation-yellow rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-foundation-yellow rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-foundation-green rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <p className="text-foundation-yellow font-semibold uppercase tracking-wide text-sm ml-2">
                      Get in Touch
                    </p>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Contact
                  <br />
                  <span className="bg-gradient-to-r from-foundation-yellow to-foundation-green bg-clip-text text-transparent">
                    Our Team
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                  We're here to answer your questions and help you get involved in our mission.
                  Reach out today and let's create change together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="bg-muted section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center space-x-2">
                    <Send className="h-6 w-6 text-primary" />
                    <span>Send us a Message</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        required
                        value={form.firstName}
                        onChange={(e) => setField("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        required
                        value={form.lastName}
                        onChange={(e) => setField("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      required
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">Type of Inquiry *</Label>
                    <Select
                      value={form.inquiryType}
                      onValueChange={(v) => setField("inquiryType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type, index) => {
                          const value = type.toLowerCase().replace(/\s+/g, "-");
                          return (
                            <SelectItem key={index} value={value}>
                              {type}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief subject of your message"
                      required
                      value={form.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      required
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                    />
                  </div>

                  {/* Feedback banners */}
                  {errorMsg && (
                    <div className="text-sm text-red-600 border border-red-500/30 bg-red-500/5 rounded-md p-2">
                      {errorMsg}
                    </div>
                  )}
                  {successRef && (
                    <div className="text-sm text-green-700 border border-green-600/30 bg-green-600/5 rounded-md p-2">
                      Message sent successfully. Ref: <span className="font-mono">{successRef}</span>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                    onClick={onSubmit}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    * Required fields. We'll respond within 24-48 hours during business days.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              {/* Office Hours */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Office Hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {officeHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                      <span className="text-sm font-medium text-foreground">{schedule.day}</span>
                      <span className="text-sm text-muted-foreground">{schedule.hours}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2">
                    GMT+0 (Ghana Standard Time)
                  </p>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">swgpfha@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">CEO</p>
                        <p className="text-sm text-muted-foreground">Henry Kwame Gyebi</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">Accra, Ghana</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Direct Email
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Schedule a Call
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="card-shadow border-l-4 border-l-accent">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Emergency Contact</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    For urgent matters related to our programs or beneficiaries, please contact us immediately.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Emergency Contact
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Location</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Based in Accra, Ghana, serving communities across Africa
            </p>
          </div>
          <Card className="card-shadow">
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="h-16 w-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold text-foreground">Accra, Ghana</h3>
                  <p className="text-muted-foreground max-w-md">
                    Our foundation is headquartered in Accra, from where we coordinate programs
                    and initiatives across West Africa and beyond.
                  </p>
                  <Button variant="outline">
                    View Directions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="hero-gradient text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">We're Here to Help</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Whether you have questions about our programs, want to get involved, or need support,
            our team is ready to assist you. Don't hesitate to reach out.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg italic mb-2">
              "Every question matters, every conversation counts, and every connection
              brings us closer to our mission."
            </p>
            <p className="text-sm opacity-75">— SWGPFHA Team</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
