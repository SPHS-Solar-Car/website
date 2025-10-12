import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">About Our Team</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            We're a passionate group of students dedicated to advancing solar vehicle technology 
            while gaining hands-on engineering experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">What We Do</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
              Our Solar Car Team combines engineering excellence with environmental consciousness. 
              We design and build high-performance solar vehicles that compete in national competitions 
              while advancing sustainable transportation technology.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              From aerodynamic design to solar panel optimization, our students work on every aspect 
              of vehicle development, gaining invaluable experience in mechanical engineering, 
              electrical systems, project management, and teamwork.
            </p>
          </div>
          
          <div id="mission" className="bg-muted rounded-lg p-6 sm:p-8">
            <h4 className="text-lg sm:text-xl font-semibold mb-4">Team Stats</h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Active Members</span>
                <span className="font-bold">15+</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Years Active</span>
                <span className="font-bold">18+</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Competitions Won</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Miles Driven</span>
                <span className="font-bold">1,000+</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="text-center p-4 sm:p-6 hover:shadow-solar transition-smooth">
            <CardContent className="pt-4 sm:pt-6">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-semibold mb-2">Collaborative Team</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Students from all engineering disciplines working together on complex projects.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-4 sm:p-6 hover:shadow-solar transition-smooth">
            <CardContent className="pt-4 sm:pt-6">
              <Target className="h-10 w-10 sm:h-12 sm:w-12 text-secondary mx-auto mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-semibold mb-2">Innovation Focus</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Pushing the boundaries of solar technology and sustainable transportation.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-4 sm:p-6 hover:shadow-solar transition-smooth">
            <CardContent className="pt-4 sm:pt-6">
              <Award className="h-10 w-10 sm:h-12 sm:w-12 text-accent mx-auto mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-semibold mb-2">Proven Results</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Multiple competition wins and recognition for engineering excellence.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}