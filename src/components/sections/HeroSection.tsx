import { ElectricButton } from "@/components/ui/electric-button";
import { ChevronRight, Zap, Trophy } from "lucide-react";
import heroImage from "@/assets/hero-team-photo.jpg";

const LearningIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L13.09 8.26L19 7.27L14.18 12.73L20.5 14.36L13.5 17.5L15.27 22L12 19.09L8.73 22L10.5 17.5L3.5 14.36L9.82 12.73L5 7.27L10.91 8.26L12 2Z" />
  </svg>
);

const features = [
  { icon: Zap, title: "Innovation", description: "Cutting-edge solar technology" },
  { icon: Trophy, title: "Competition", description: "National racing championships" },
  { icon: LearningIcon, title: "Learning", description: "Real-world engineering experience" },
];

export function HeroSection() {
  return (
    // Top padding matches the fixed header's height so content starts just below it
    <section className="pt-[73px] sm:pt-[89px] overflow-x-clip">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 xl:py-6 text-center animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-5xl mb-3 sm:mb-4">
          Racing Towards a<span className="block xl:inline"> Sustainable Future</span>
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We design, build, and race solar-powered vehicles while learning cutting-edge engineering skills and
          promoting renewable energy innovation.
        </p>
      </div>

      <div className="relative">
        {/* On wide screens the photo is cropped so the button and icons sit over the pavement and the bottom of the
            car, keeping every face clear. Narrower screens show the full photo with the button and icons below it. */}
        <img
          src={heroImage}
          alt="Stony Point Solar Car Team at Texas Motor Speedway with solar vehicle"
          className="w-full h-auto xl:aspect-[8/3] xl:object-cover object-[center_42%]"
        />
        <div className="hidden xl:block absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 to-transparent" />

        <div className="xl:absolute xl:inset-x-0 xl:bottom-0 px-4 sm:px-6 lg:px-8 py-8 xl:py-5">
          <div className="flex justify-center items-center">
            <ElectricButton
              href="/sponsor"
              className="group text-lg sm:text-xl px-10 py-3 sm:py-4"
            >
              Support Us!
              <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </ElectricButton>
          </div>

          <div className="max-w-4xl xl:max-w-6xl mx-auto mt-8 xl:mt-14 grid grid-cols-3 gap-2 sm:gap-6 xl:gap-16 xl:text-white">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center xl:flex-row xl:justify-center xl:text-left xl:gap-3"
              >
                <div className="bg-primary/10 text-primary xl:bg-white/15 xl:text-white xl:backdrop-blur-sm rounded-full p-2 sm:p-3 xl:p-3.5 mb-2 xl:mb-0 shrink-0">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 xl:h-8 xl:w-8" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-xl font-semibold">{title}</h3>
                  <p className="text-muted-foreground xl:text-white/90 text-xs leading-tight sm:text-base sm:leading-normal">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
