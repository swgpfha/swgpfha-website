import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone, MapPin } from 'lucide-react';
import logoUrl from "@/assets/swgpfha-logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto container-padding section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Foundation Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={logoUrl
                }
                alt="SWGPFHA Logo"
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h3 className="font-bold text-lg">SWGPFHA</h3>
                <p className="text-sm opacity-90">Since 2020</p>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              Supporting children, families, and communities across Africa through
              education, health, and social programs.
            </p>
            <div className="text-sm opacity-90">
              <p className="font-medium">Motto:</p>
              <p className="italic">"Children are Gift & God's Heritage"</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:opacity-75 transition-opacity">About Us</Link></li>
              <li><Link to="/mission" className="hover:opacity-75 transition-opacity">Mission & Vision</Link></li>
              <li><Link to="/programs" className="hover:opacity-75 transition-opacity">Programs</Link></li>
              <li><Link to="/get-involved" className="hover:opacity-75 transition-opacity">Get Involved</Link></li>
            </ul>
          </div>

          {/* Programs */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Our Programs</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>Parenting & Social Media Outreach</li>
              <li>Educational Transformation</li>
              <li>Health Insurance Initiatives</li>
              <li>Food & Nutrition Programs</li>
              <li>Vocational Training</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Mail size={16} className="mt-0.5 opacity-75" />
                <div>
                  <p>SWGPFHA@gmail.co.uk</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Phone size={16} className="mt-0.5 opacity-75" />
                <div>
                  <p className="font-medium">Henry Kwame Gyebi</p>
                  <p className="opacity-90">CEO & Founder</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="mt-0.5 opacity-75" />
                <p>Accra, Ghana</p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <a href="#" className="hover:opacity-75 transition-opacity">
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-75">
          <p>&copy; 2025 SouthWest Good Parenting Foundation Home Africa. All rights reserved.</p>
          <p className="mt-1">Founded 2020 • Legally Established 2025</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;