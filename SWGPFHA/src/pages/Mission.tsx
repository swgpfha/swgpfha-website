import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Heart, BookOpen, Shield, Droplets, Home, Lightbulb, Users } from 'lucide-react';
import classroomImage from '@/assets/classroom_students.jpg';

const Mission = () => {
  const missionStatements = [
    {
      id: 1,
      icon: <Heart className="h-8 w-8" />,
      title: "Family Empowerment",
      statement: "To strengthen family units through comprehensive parenting support, guidance, and resources that promote healthy child development and family cohesion.",
      color: "text-foundation-purple"
    },
    {
      id: 2,
      icon: <BookOpen className="h-8 w-8" />,
      title: "Educational Excellence",
      statement: "To provide quality educational opportunities and learning resources that transform lives and create pathways to sustainable prosperity.",
      color: "text-foundation-blue"
    },
    {
      id: 3,
      icon: <Shield className="h-8 w-8" />,
      title: "Healthcare Access",
      statement: "To ensure accessible healthcare services and health insurance initiatives that protect and preserve the wellbeing of our communities.",
      color: "text-foundation-green"
    },
    {
      id: 4,
      icon: <Droplets className="h-8 w-8" />,
      title: "Basic Needs Security",
      statement: "To address fundamental needs through food security, clean water access, and nutrition programs that sustain healthy communities.",
      color: "text-foundation-yellow"
    },
    {
      id: 5,
      icon: <Home className="h-8 w-8" />,
      title: "Shelter & Safety",
      statement: "To provide safe housing solutions and create secure environments where families can thrive and children can grow safely.",
      color: "text-foundation-blue"
    }
  ];

  const visionStatements = [
    {
      id: 1,
      icon: <Target className="h-8 w-8" />,
      title: "Community Transformation",
      statement: "To create thriving, self-sustaining communities across Africa where every family has access to opportunities for growth and prosperity.",
      color: "text-foundation-purple"
    },
    {
      id: 2,
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Innovation in Development",
      statement: "To pioneer innovative approaches in community development that address root causes and create lasting, positive change.",
      color: "text-foundation-green"
    },
    {
      id: 3,
      icon: <Users className="h-8 w-8" />,
      title: "Generational Impact",
      statement: "To build sustainable programs that benefit current generations while creating foundations for future generations to succeed.",
      color: "text-foundation-yellow"
    },
    {
      id: 4,
      icon: <Shield className="h-8 w-8" />,
      title: "Comprehensive Support",
      statement: "To establish comprehensive support systems that address health, education, economic empowerment, and social development.",
      color: "text-foundation-blue"
    },
    {
      id: 5,
      icon: <Heart className="h-8 w-8" />,
      title: "African Renaissance",
      statement: "To contribute to an African renaissance where communities are empowered, families are strong, and children have unlimited potential.",
      color: "text-foundation-purple"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={classroomImage} 
            alt="Students in Classroom" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 left-10 w-32 h-32 border-4 border-foundation-yellow/30 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-16 w-24 h-24 border-4 border-foundation-green/30 rotate-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-foundation-yellow/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative w-full max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-10 animate-fade-in">
            {/* Header */}
            <div className="space-y-6">
              <div className="flex justify-center items-center space-x-6 mb-8">
                <div className="flex items-center space-x-4">
                  <Target className="h-12 w-12 text-foundation-yellow" />
                  <div className="w-24 h-px bg-gradient-to-r from-foundation-yellow to-foundation-green"></div>
                  <Eye className="h-12 w-12 text-foundation-green" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Mission
                <span className="text-foundation-yellow"> & </span>
                <span className="bg-gradient-to-r from-foundation-green to-foundation-blue bg-clip-text text-transparent">Vision</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                Our guiding principles and aspirations that drive every initiative and program we undertake
              </p>
            </div>
            
            {/* Motto Showcase */}
            <div className="relative max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 foundation-shadow">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-3 h-3 bg-foundation-yellow rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-foundation-green rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                  <div className="w-3 h-3 bg-foundation-blue rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                </div>
                <p className="text-2xl md:text-3xl font-bold italic text-foundation-yellow text-center mb-3">
                  "Children are Gift & God's Heritage"
                </p>
                <p className="text-white/70 text-center">— Foundation Motto</p>
              </div>
              
              {/* Supporting Elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-foundation-purple/60 rounded-full flex items-center justify-center animate-float">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-foundation-green/60 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                <BookOpen className="h-7 w-7 text-white" />
              </div>
            </div>
            
            {/* Vision & Mission Preview Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-8">
              <div className="bg-foundation-purple/20 backdrop-blur-sm rounded-xl p-6 border border-foundation-purple/30">
                <Target className="h-10 w-10 text-foundation-yellow mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
                <p className="text-white/80 text-sm">Comprehensive support for family empowerment</p>
              </div>
              <div className="bg-foundation-green/20 backdrop-blur-sm rounded-xl p-6 border border-foundation-green/30">
                <Eye className="h-10 w-10 text-foundation-yellow mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
                <p className="text-white/80 text-sm">Thriving communities across Africa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statements */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Target className="h-10 w-10 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our mission statements define our commitment to addressing critical needs and creating 
              sustainable positive change in African communities
            </p>
          </div>
          <div className="grid gap-6">
            {missionStatements.map((mission, index) => (
              <Card key={mission.id} className="card-shadow hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className={mission.color}>
                          {mission.icon}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl font-bold text-primary">{mission.id}.</span>
                        <h3 className="text-xl font-semibold text-foreground">{mission.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-lg">{mission.statement}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Statements */}
      <section className="bg-muted section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Eye className="h-10 w-10 text-secondary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Vision</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our vision statements outline our aspirations for the future and the lasting impact 
              we aim to create across African communities
            </p>
          </div>
          <div className="grid gap-6">
            {visionStatements.map((vision, index) => (
              <Card key={vision.id} className="card-shadow hover:shadow-lg transition-all duration-300 animate-slide-in-right">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                        <div className={vision.color}>
                          {vision.icon}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl font-bold text-secondary">{vision.id}.</span>
                        <h3 className="text-xl font-semibold text-foreground">{vision.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-lg">{vision.statement}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The fundamental principles that guide our work and define our approach
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Compassion", description: "Leading with empathy and understanding" },
              { title: "Integrity", description: "Maintaining transparency and honesty" },
              { title: "Community-Centered", description: "Putting communities at the heart of our work" },
              { title: "Sustainability", description: "Creating lasting, long-term solutions" }
            ].map((value, index) => (
              <Card key={index} className="text-center card-shadow hover:shadow-lg transition-all duration-300 animate-scale-in">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="hero-gradient text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Join Our Mission</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Help us turn our mission and vision into reality. Together, we can create the change 
            our communities need and deserve.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-lg italic mb-2">
              "Every child deserves a loving family, every family deserves support, 
              and every community deserves the opportunity to thrive."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Mission;