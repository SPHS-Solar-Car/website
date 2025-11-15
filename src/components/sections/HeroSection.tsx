import { Button } from "@/components/ui/button";
import { ChevronRight, Zap, Trophy } from "lucide-react";
import heroImage from "@/assets/hero-team-photo.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Cropped from top */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Stony Point Solar Car Team at Texas Motor Speedway with solar vehicle"
          className="w-full h-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-black/50 to-secondary/30" />
      </div>

      {/* Content - Positioned to show car and people */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto pt-20 sm:pt-24 text-left sm:text-center animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-4 sm:mb-6">
            Racing Towards a<span className="block text-white">Sustainable Future</span>
          </h1>

          <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            We design, build, and race solar-powered vehicles while learning cutting-edge engineering skills and
            promoting renewable energy innovation.
          </p>

          <div className="flex justify-center items-center mb-12 sm:mb-16 mt-4 sm:mt-6">
            <Button
              variant="hero"
              size="lg"
              className="group w-full sm:w-auto text-lg sm:text-xl px-8 py-6 sm:px-10 sm:py-7"
              asChild
            >
              <a href="/sponsor">
                Support Us!
                <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>

        {/* Stats moved to bottom to show more of the image */}
        <div className="max-w-4xl mx-auto mt-24 sm:mt-40 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-white">
            <div className="flex flex-col items-center">
              <div className="bg-white/10 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 backdrop-blur-sm">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Innovation</h3>
              <p className="text-white/80 text-xs sm:text-sm">Cutting-edge solar technology</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white/10 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 backdrop-blur-sm">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Competition</h3>
              <p className="text-white/80 text-xs sm:text-sm">National racing championships</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white/10 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 backdrop-blur-sm">
                <svg className="h-6 w-6 sm:h-8 sm:w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L19 7.27L14.18 12.73L20.5 14.36L13.5 17.5L15.27 22L12 19.09L8.73 22L10.5 17.5L3.5 14.36L9.82 12.73L5 7.27L10.91 8.26L12 2Z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Learning</h3>
              <p className="text-white/80 text-xs sm:text-sm">Real-world engineering experience</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
