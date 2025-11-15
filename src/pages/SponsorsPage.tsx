import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { GOOGLE_SCRIPT_URL } from "@/config/googleScript";
import { useQuery } from "@tanstack/react-query";

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  thumbnailLink?: string;
}

interface SponsorTier {
  tier: string;
  tierColor: string;
  sponsors: Sponsor[];
}

export default function SponsorsPage() {
  // Fetch sponsors using the same pattern as GallerySection
  const { data: sponsorsData, isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=sponsors`);
      if (!response.ok) {
        throw new Error('Failed to fetch sponsors');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const sponsorTiers: SponsorTier[] = sponsorsData?.success && sponsorsData?.sponsors ? [
    { tier: "Diamond Sponsors", tierColor: "text-cyan-400", sponsors: sponsorsData.sponsors.diamond || [] },
    { tier: "Platinum Sponsors", tierColor: "text-slate-400", sponsors: sponsorsData.sponsors.platinum || [] },
    { tier: "Gold Sponsors", tierColor: "text-yellow-500", sponsors: sponsorsData.sponsors.gold || [] },
    { tier: "Silver Sponsors", tierColor: "text-slate-300", sponsors: sponsorsData.sponsors.silver || [] },
    { tier: "Bronze Sponsors", tierColor: "text-amber-600", sponsors: sponsorsData.sponsors.bronze || [] },
  ] : [];

  // Helpers for reliable Google Drive image URLs
  const extractDriveId = (url: string) => {
    try {
      const u = new URL(url);
      const id = u.searchParams.get('id');
      if (id) return id; // keep as-is (some IDs may end with '-')
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      return match?.[1] ?? '';
    } catch {
      return '';
    }
  };
  const buildViewUrl = (id: string) => `https://drive.google.com/uc?export=view&id=${id}`;
  const buildThumbUrl = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w600`;
  const getPrimarySrc = (s: Sponsor) => s.logo; // trust backend first

  // Get tier-based card and logo sizing
  const getTierSizing = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond sponsors':
        return { cardWidth: 'max-w-[480px]', logoHeight: 'max-h-32', minHeight: 'min-h-[200px]' };
      case 'platinum sponsors':
        return { cardWidth: 'max-w-[420px]', logoHeight: 'max-h-28', minHeight: 'min-h-[180px]' };
      case 'gold sponsors':
        return { cardWidth: 'max-w-[360px]', logoHeight: 'max-h-24', minHeight: 'min-h-[160px]' };
      case 'silver sponsors':
        return { cardWidth: 'max-w-[320px]', logoHeight: 'max-h-20', minHeight: 'min-h-[140px]' };
      case 'bronze sponsors':
        return { cardWidth: 'max-w-[280px]', logoHeight: 'max-h-16', minHeight: 'min-h-[120px]' };
      default:
        return { cardWidth: 'max-w-[360px]', logoHeight: 'max-h-24', minHeight: 'min-h-[150px]' };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-muted">
        <div className="container mx-auto px-6 text-center">
          <Award className="h-16 w-16 mx-auto mb-6 text-black dark:text-white" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Sponsors</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We are grateful for the generous support of our sponsors who make our solar car project possible.
          </p>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-16">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading sponsors...</p>
              </div>
            ) : (
              sponsorTiers.map((tier, index) => {
                const sizing = getTierSizing(tier.tier);
                return (
              <div key={index}>
                <h2 className={`text-3xl font-bold text-center mb-12 ${tier.tierColor}`}>
                  {tier.tier}
                </h2>
                
                {tier.sponsors.length === 0 ? (
                  <Card className="bg-muted/50">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">
                        Sponsor spots available. Contact us to become a {tier.tier.toLowerCase()} sponsor!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-wrap justify-center items-stretch gap-8">
                    {tier.sponsors.map((sponsor: Sponsor, sponsorIndex: number) => (
                      <Card key={sponsorIndex} className={`hover:shadow-solar transition-smooth w-full ${sizing.cardWidth} mx-auto`}>
                        <CardContent className={`p-8 flex items-center justify-center ${sizing.minHeight} text-center`}>
                          <img
                            src={getPrimarySrc(sponsor)}
                            alt={`${sponsor.name} logo`}
                            className={`w-auto object-contain mx-auto ${sizing.logoHeight}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              const tried = Number(img.dataset.errIx || '0');
                              const id = extractDriveId(sponsor.logo);
                              const tid = extractDriveId((sponsor as any).thumbnailLink || '');
                              const candidates = [
                                sponsor.logo,
                                (sponsor as any).thumbnailLink || '',
                                id ? buildViewUrl(id) : '',
                                id ? `https://drive.google.com/uc?id=${id}` : '',
                                tid ? buildThumbUrl(tid) : '',
                                sponsor.logo.replace('export=view','export=download'),
                              ].filter(Boolean) as string[];
                              if (tried < candidates.length - 1) {
                                img.dataset.errIx = String(tried + 1);
                                img.src = candidates[tried + 1];
                                return;
                              }
                              img.style.display = 'none';
                              const label = document.createElement('div');
                              label.className = 'text-muted-foreground text-sm';
                              label.textContent = sponsor.name;
                              img.parentElement?.appendChild(label);
                            }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
                );
              })
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-20 text-center">
            <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
              <CardContent className="p-12">
                <h3 className="text-2xl font-bold mb-4">Become a Sponsor</h3>
                <p className="mb-6 text-muted-foreground">
                  Support the future of sustainable transportation and inspire the next generation of engineers.
                </p>
                <a
                  href="/sponsor"
                  className="inline-flex items-center justify-center rounded-md bg-black text-white px-8 py-3 text-sm font-medium shadow transition-smooth hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  Learn More About Sponsorship
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
