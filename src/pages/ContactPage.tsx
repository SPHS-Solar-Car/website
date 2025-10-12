import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Send, MessageSquare, Users, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    detail: "vp-communications@stonypointsolarcar.org",
    description: "General inquiries and information",
  },
];
const teamLeads = [
  {
    name: "Ishan Singhal",
    role: "Team Captain",
    email: "ishansinghal123@gmail.com",
    specialty: "Project Management & Strategy",
  },
  {
    name: "Jason Hanhe",
    role: "Electrical Lead",
    email: "Jason Hanhe@school.edu",
    specialty: "Electrical Systems & Solar Technology",
  },
  {
    name: "Caleb Brown",
    role: "Mechanical Lead",
    email: "Caleb.Brown@school.edu",
    specialty: "Mechanical Design & Aerodynamics",
  },
];
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-form", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-muted">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have questions about our team, want to get involved, or interested in sponsorship? We'd love to hear from
            you!
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="hover:shadow-solar transition-smooth">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 rounded-lg p-3">
                            <info.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{info.title}</h3>
                            <p className="text-primary font-medium mb-1">{info.detail}</p>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Team Leads */}
              <Card id="team-leaders" className="bg-muted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Team Leadership
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">
                    Connect directly with our team leads for specific questions or collaboration opportunities.
                  </p>
                  <div className="space-y-4">
                    {teamLeads.map((lead, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-b-0">
                        <h4 className="font-semibold">{lead.name}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{lead.role}</p>
                        <p className="text-xs text-muted-foreground mb-2">{lead.specialty}</p>
                        <a href={`mailto:${lead.email}`} className="text-sm flex items-center gap-1 hover:underline">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Follow Our Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Stay updated with our latest projects and achievements on social media.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="https://www.instagram.com/stpsolarcar/?hl=en"
                      className="flex items-center gap-3 text-primary hover:text-primary/80 transition-smooth"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Instagram @stpsolarcar
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
