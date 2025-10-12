import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  team: [
    { name: "About Us", href: "#about" },
    { name: "Our Mission", href: "#mission" },
    { name: "Achievements", href: "#mission" },
  ],
  resources: [
    { name: "How to Join", href: "/join" },
    { name: "Events", href: "#events" },
  ],
  connect: [
    { name: "Contact", href: "/contact" },
    { name: "Instagram", href: "https://www.instagram.com/stpsolarcar/?hl=en", external: true },
  ],
};

export function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (e: any, href: string) => {
    // In-page section links
    if (href.startsWith("#")) {
      e.preventDefault();
      const goAndScroll = () => {
        const element = document.getElementById(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      };

      if (window.location.pathname !== "/") {
        navigate("/");
        setTimeout(goAndScroll, 100);
      } else {
        goAndScroll();
      }
      return;
    }

    // Route links: ensure top of page after navigation
    if (href.startsWith("/")) {
      e.preventDefault();
      if (window.location.pathname !== href) {
        navigate(href);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src="/tiger-logo.png"
                alt="Solar Car Team Logo"
                className="h-10 w-10"
              />
              <span className="text-xl font-bold">Stony Point Solar Car</span>
            </Link>
            <p className="text-background/80 mb-6 leading-relaxed">
              Innovating sustainable transportation through student-driven solar vehicle development and competitive
              racing.
            </p>
            <div className="space-y-2 text-sm text-background/70">
              <a
                href="mailto:christy_williams@roundrockisd.org"
                className="flex items-center gap-2 hover:text-background transition-smooth"
              >
                <Mail className="h-4 w-4" />
                <span>vp-communications@stonypointsolarcar.org</span>
              </a>
            </div>
          </div>

          {/* Team Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Team</h3>
            <ul className="space-y-2">
              {footerLinks.team.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={(e) => handleNavigation(e, link.href)}
                    className="text-background/80 hover:text-background transition-smooth text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={(e) => handleNavigation(e, link.href)}
                    className="text-background/80 hover:text-background transition-smooth text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavigation(e, link.href)}
                    className="text-background/80 hover:text-background transition-smooth text-sm flex items-center gap-1"
                    {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {link.name}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © 2024 Stony Point Solar Car Team. Racing towards a sustainable future.
            </p>
            <div className="flex items-center gap-6 text-sm text-background/60">
              <a href="#privacy" className="hover:text-background transition-smooth">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-background transition-smooth">
                Terms of Use
              </a>
              <a href="#accessibility" className="hover:text-background transition-smooth">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
