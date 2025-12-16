import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Shield, Droplets, Briefcase, Users, Smartphone, GraduationCap } from 'lucide-react';
import boreholeImage from '@/assets/projects_borehole.jpg';

const Programs = () => {
  const programs = [
    {
      icon: <Heart className="h-10 w-10" />,
      title: "Parenting & Social Media Outreach",
      description: "Comprehensive parenting support through digital platforms including TikTok and Facebook, providing accessible guidance and resources for modern families.",
      features: [
        "TikTok educational content",
        "Facebook community groups",
        "Parenting workshops",
        "Digital resource sharing"
      ],
      color: "text-foundation-purple",
      bgColor: "bg-foundation-purple/10"
    },
    {
      icon: <BookOpen className="h-10 w-10" />,
      title: "Educational Transformation Programs",
      description: "Innovative educational initiatives designed to transform learning experiences and create sustainable pathways to academic and professional success.",
      features: [
        "Curriculum development",
        "Teacher training programs",
        "Student scholarships",
        "Digital learning platforms"
      ],
      color: "text-foundation-blue",
      bgColor: "bg-foundation-blue/10"
    },
    // ────────────────────────────────────────────────
    // NEW PROGRAM ADDED BELOW
    // ────────────────────────────────────────────────
    {
      icon: <GraduationCap className="h-10 w-10" />,
      title: "Gateway Into Reading Program",
      description:
        "A flagship literacy initiative empowering early learners in Ghana and across Africa through English and local language reading education.",
      features: [
        "Dual-language learning packages",
        "Teacher training workshops",
        "Facilitated by certified instructors",
        "Participation certificates for schools"
      ],
      color: "text-foundation-blue",
      bgColor: "bg-foundation-blue/10"
    },
    // ────────────────────────────────────────────────
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Health Insurance Initiatives",
      description: "Accessible healthcare programs and insurance schemes that ensure communities have the medical support they need for healthy living.",
      features: [
        "Community health insurance",
        "Medical screening programs",
        "Health education workshops",
        "Emergency medical assistance"
      ],
      color: "text-foundation-green",
      bgColor: "bg-foundation-green/10"
    },
    {
      icon: <Droplets className="h-10 w-10" />,
      title: "Food, Water & Nutrition Programs",
      description: "Essential programs addressing food security, clean water access, and nutrition education to ensure healthy communities.",
      features: [
        "Clean water projects",
        "Nutrition education",
        "Food distribution programs",
        "Community gardens"
      ],
      color: "text-foundation-yellow",
      bgColor: "bg-foundation-yellow/10"
    },
    {
      icon: <Briefcase className="h-10 w-10" />,
      title: "Agro-Food Processing & Farming",
      description: "Agricultural development programs that promote sustainable farming practices and food processing techniques for economic empowerment.",
      features: [
        "Modern farming techniques",
        "Food processing training",
        "Agricultural equipment support",
        "Market linkage programs"
      ],
      color: "text-foundation-green",
      bgColor: "bg-foundation-green/10"
    },
    {
      icon: <GraduationCap className="h-10 w-10" />,
      title: "Vocational Training Programs",
      description: "Skills development and vocational training initiatives that equip individuals with practical skills for sustainable livelihoods.",
      features: [
        "Technical skills training",
        "Business development support",
        "Apprenticeship programs",
        "Job placement assistance"
      ],
      color: "text-foundation-blue",
      bgColor: "bg-foundation-blue/10"
    }
  ];

  const impactStats = [
    { number: "1000+", label: "Families Supported" },
    { number: "500+", label: "Children Educated" },
    { number: "200+", label: "Health Beneficiaries" },
    { number: "50+", label: "Vocational Graduates" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={boreholeImage}
            alt="Water Borehole Project"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>

        {/* Program Icons Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <Heart className="absolute top-20 left-[10%] h-8 w-8 text-foundation-yellow/30 animate-float" />
          <BookOpen className="absolute top-40 right-[15%] h-10 w-10 text-foundation-green/40 animate-float" style={{ animationDelay: '0.5s' }} />
          <Shield className="absolute bottom-32 left-[20%] h-12 w-12 text-foundation-blue/30 animate-float" style={{ animationDelay: '1s' }} />
          <Droplets className="absolute bottom-20 right-[25%] h-9 w-9 text-foundation-purple/40 animate-float" style={{ animationDelay: '1.5s' }} />
          <Briefcase className="absolute top-1/2 left-[5%] h-7 w-7 text-foundation-yellow/35 animate-float" style={{ animationDelay: '2s' }} />
          <GraduationCap className="absolute top-1/3 right-[8%] h-11 w-11 text-foundation-green/35 animate-float" style={{ animationDelay: '2.5s' }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content Side */}
            <div className="text-white space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-foundation-yellow rounded-full"></div>
                    <div className="w-3 h-3 bg-foundation-green rounded-full"></div>
                    <div className="w-3 h-3 bg-foundation-blue rounded-full"></div>
                    <div className="w-3 h-3 bg-foundation-purple rounded-full"></div>
                  </div>
                  <p className="text-foundation-yellow font-semibold uppercase tracking-wide text-sm">
                    Comprehensive Impact Programs
                  </p>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Our Programs
                  <br />
                  <span className="text-foundation-yellow">&</span>
                  <br />
                  <span className="bg-gradient-to-r from-foundation-green to-foundation-blue bg-clip-text text-transparent">
                    Initiatives
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl">
                  Comprehensive programs designed to address critical needs and create
                  lasting positive change in communities across Africa
                </p>
              </div>
            </div>

            {/* Visual Side */}
            <div className="relative animate-fade-in">
              <div className="relative">
                {/* Central Hub */}
                <div className="bg-white/15 backdrop-blur-lg rounded-3xl p-8 border border-white/20 foundation-shadow">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-foundation-yellow via-foundation-green to-foundation-blue rounded-full mx-auto flex items-center justify-center">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-foundation-yellow via-foundation-green to-foundation-blue rounded-full animate-pulse opacity-30"></div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">7 Core Programs</h3>
                      <p className="text-foundation-yellow">Integrated Impact</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-2xl font-bold text-foundation-green">1000+</p>
                        <p className="text-xs text-white/80">Beneficiaries</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foundation-yellow">50+</p>
                        <p className="text-xs text-white/80">Graduates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-foundation-green/10 py-16 border-t-4 border-foundation-green">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center space-y-2 animate-slide-in-right">
                <h3
                  className={`text-3xl md:text-4xl font-bold ${index % 2 === 0 ? 'text-foundation-yellow' : 'text-foundation-green'
                    }`}
                >
                  {stat.number}
                </h3>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Impact Areas</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each program is designed to address specific community needs while contributing to overall development
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="card-shadow hover:shadow-lg transition-all duration-300 group animate-fade-in">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className={`${program.bgColor} p-4 rounded-full group-hover:scale-110 transition-transform duration-300`}>
                        <div className={program.color}>{program.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-3">{program.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{program.description}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Program Features:</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {program.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Programs;
