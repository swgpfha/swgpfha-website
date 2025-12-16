import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Menu, X } from "lucide-react";
import logoUrl from "@/assets/swgpfha-logo.jpg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/mission", label: "Mission & Vision" },
    { href: "/programs", label: "Programs" },
    { href: "/media", label: "Publications & Media" },
    { href: "/get-involved", label: "Get Involved" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border foundation-shadow
                    bg-background/70 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      {/* full width, just horizontal padding */}
      <div className="w-full container-padding">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={logoUrl}
              alt="SWGPFHA Logo"
              className="h-12 w-12 rounded-full foundation-shadow"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foundation-green">SWGPFHA</h1>
              <p className="text-xs text-muted-foreground">
                Good Parenting Foundation
              </p>
            </div>
          </Link>

          {/* Center: main nav (no Contact) */}
          <div className="hidden lg:flex flex-1 justify-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-muted ${isActive(item.href)
                    ? "text-foundation-green bg-muted"
                    : "text-foreground hover:text-primary"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: Contact + Donate */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link
              to="/contact"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-muted ${isActive("/contact")
                  ? "text-primary bg-muted"
                  : "text-foreground hover:text-primary"
                }`}
            >
              Contact Us
            </Link>
            <Link to="/get-involved">
              <Button variant="default" size="sm" className="bg-green-500">
                Donate
              </Button>
            </Link>

          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-border bg-background/80 backdrop-blur-lg">
            <div className="py-4 space-y-2">
              {[...navItems, { href: "/contact", label: "Contact Us" }].map(
                (item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${isActive(item.href)
                        ? "text-primary bg-muted"
                        : "text-foreground hover:text-primary hover:bg-muted"
                      }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <div className="pt-2">
                <Button variant="default" size="sm" className="w-full">
                  Donate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
