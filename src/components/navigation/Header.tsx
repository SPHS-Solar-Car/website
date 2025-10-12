import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Events", href: "/#events" },
  { name: "Points", href: "/points" },
  { name: "How to Join", href: "/join" },
  { name: "Donate", href: "/sponsor" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="flex items-center justify-between p-4 sm:p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link 
            to="/" 
            className="-m-1.5 p-1.5 flex items-center gap-2"
            onClick={() => setTimeout(() => window.scrollTo(0, 0), 0)}
          >
            <img 
              src="/tiger-logo.png" 
              alt="Solar Car Team Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <span className="text-base sm:text-xl font-bold truncate max-w-[160px] sm:max-w-none">
              Stony Point Solar Car
            </span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-smooth"
              onClick={() => {
                if (item.href === '/' || item.href === '/join' || item.href === '/contact' || item.href === '/points' || item.href === '/sponsor') {
                  setTimeout(() => window.scrollTo(0, 0), 0);
                } else if (item.href === '/#about') {
                  setTimeout(() => {
                    const aboutSection = document.getElementById('about');
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                } else if (item.href === '/#events') {
                  setTimeout(() => {
                    const eventsSection = document.getElementById('events');
                    if (eventsSection) {
                      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Button variant="hero" size="sm" asChild>
            <a href="https://forms.gle/G8wVBNhgG7We9xN19" target="_blank" rel="noopener noreferrer">
              Join Our Team
            </a>
          </Button>
        </div>
      </nav>
      
      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-50 lg:hidden bg-background border-b border-border shadow-lg animate-slide-in-top">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-4 py-3 text-base font-semibold rounded-lg text-foreground hover:bg-muted transition-smooth"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (item.href === '/' || item.href === '/join' || item.href === '/contact' || item.href === '/points' || item.href === '/sponsor') {
                        setTimeout(() => window.scrollTo(0, 0), 0);
                      } else if (item.href === '/#about') {
                        setTimeout(() => {
                          const aboutSection = document.getElementById('about');
                          if (aboutSection) {
                            aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      } else if (item.href === '/#events') {
                        setTimeout(() => {
                          const eventsSection = document.getElementById('events');
                          if (eventsSection) {
                            eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-2 border-t border-border">
                  <Button variant="hero" className="w-full" asChild>
                    <a href="https://forms.gle/G8wVBNhgG7We9xN19" target="_blank" rel="noopener noreferrer">
                      Join Our Team
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}