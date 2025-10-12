import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { CheckCircle, Users, Calendar, MessageSquare, UserPlus, ArrowRight, Lightbulb, Cog, PenTool } from "lucide-react";
const steps = [{
  step: 1,
  title: "Attend an Info Session",
  description: "Join us for a weekly info session to learn about our team, current projects, and what we're looking for in new members.",
  details: "Every Thursday at 6:00 PM in Student Union Room 150",
  icon: MessageSquare
}, {
  step: 2,
  title: "Fill Out Application",
  description: "Complete our online application form with your background, interests, and why you want to join the solar car team.",
  details: "Takes about 10-15 minutes to complete",
  icon: PenTool
}, {
  step: 3,
  title: "Interview Process",
  description: "Have a casual conversation with team leads about your skills, goals, and how you can contribute to our mission.",
  details: "30-minute informal interview",
  icon: Users
}, {
  step: 4,
  title: "Welcome to the Team!",
  description: "Once accepted, you'll be paired with a mentor and integrated into one of our specialized sub-teams.",
  details: "Orientation and team assignment",
  icon: UserPlus
}];
const requirements = ["Currently enrolled student at our high school", "Strong interest in engineering, technology, or renewable energy", "Willingness to commit 4-6 hours per week to team activities", "Collaborative mindset and enthusiasm for learning", "No prior experience required - we'll teach you!"];
const subteams = [{
  name: "Mechanical Design",
  description: "Work on chassis design, aerodynamics, and structural components",
  icon: Cog,
  skills: ["CAD Design", "Manufacturing", "Materials Science"]
}, {
  name: "Electrical Systems",
  description: "Design and implement electrical systems, solar panels, and motor controls",
  icon: Lightbulb,
  skills: ["Circuit Design", "Solar Technology", "Motor Control"]
}, {
  name: "Strategy & Operations",
  description: "Handle project management, sponsorships, and race strategy",
  icon: Users,
  skills: ["Project Management", "Communication", "Data Analysis"]
}];
export default function JoinPage() {
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-muted">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be part of an innovative team that's racing towards a sustainable future. 
            No experience necessary - just passion and dedication!
          </p>
          <Button variant="default" size="lg" className="bg-foreground text-background hover:bg-foreground/90" asChild>
            <a href="https://forms.gle/G8wVBNhgG7We9xN19" target="_blank" rel="noopener noreferrer">Join Us</a>
          </Button>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-6">What We're Looking For</h2>
              <div className="space-y-4">
                {requirements.map((req, index) => <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{req}</span>
                  </div>)}
              </div>
            </div>
            
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-2xl">Sub-Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6">
                  Choose the area that interests you most - or explore multiple teams!
                </p>
                <div className="space-y-6">
                  {subteams.map((team, index) => <div key={index} className="border-b border-border pb-4 last:border-b-0">
                      <div className="flex items-center gap-3 mb-2">
                        <team.icon className="h-5 w-5" />
                        <h4 className="font-semibold">{team.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{team.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {team.skills.map((skill, skillIndex) => <span key={skillIndex} className="text-xs bg-accent px-2 py-1 rounded">
                            {skill}
                          </span>)}
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join us in building the future of transportation. Application deadline is rolling - 
            we accept new members throughout the school year!
          </p>
          <div className="flex justify-center">
            <Button variant="hero" size="lg" className="group">
              Join us
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
}