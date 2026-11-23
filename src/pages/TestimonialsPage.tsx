import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, PenLine, Quote, Send, Users } from "lucide-react";
import { GOOGLE_SCRIPT_URL } from "@/config/googleScript";

interface Alum {
  name: string;
  startYear: number;
  endYear: number | "present"; // "present" = current member, still on the team
  college: string;
  major: string;
  message: string;
}

// Sample rows for previewing the layout locally: open /testimonials?demo in `npm run dev`.
// Never included in production builds.
const DEMO_ALUMNI: Alum[] = [
  {
    name: "Jordan Lee",
    startYear: 2021,
    endYear: 2024,
    college: "Rensselaer Polytechnic Institute",
    major: "Mechanical Engineering",
    message: "Building the car taught me more about engineering than any class. I still use what I learned wiring the battery pack.",
  },
  { name: "Sam Patel", startYear: 2022, endYear: 2024, college: "SUNY Binghamton", major: "Electrical Engineering", message: "" },
  {
    name: "Alex Rivera",
    startYear: 2020,
    endYear: 2023,
    college: "Rochester Institute of Technology",
    major: "Industrial Design",
    message: "The team gave me the confidence to lead a group and present to sponsors.",
  },
  { name: "Morgan Chen", startYear: 2024, endYear: "present", college: "Stony Point High School", major: "Undecided", message: "" },
  { name: "Casey Morgan", startYear: 2023, endYear: 2023, college: "Cornell University", major: "Computer Science", message: "" },
];

// Earliest year offered in the form's dropdowns. Change this to the year the team started.
const FIRST_TEAM_YEAR = 2005;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - FIRST_TEAM_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);

// "2021–2024", or just "2023" for a single year.
const formatYears = (a: Alum) => {
  if (!a.startYear) return "";
  if (a.endYear === "present") return `${a.startYear}–Current member`;
  return a.startYear === a.endYear ? `${a.startYear}` : `${a.startYear}–${a.endYear}`;
};

// Current members sort above every finished year.
const endValue = (a: Alum) => (a.endYear === "present" ? Infinity : a.endYear);

// Chronological, most recent first: by last year on the team, then by first
// year (later start = more recent), then alphabetical.
const sortAlumni = (list: Alum[]) =>
  [...list].sort(
    (a, b) =>
      (endValue(a) === endValue(b) ? 0 : endValue(b) > endValue(a) ? 1 : -1) ||
      b.startYear - a.startYear ||
      a.name.localeCompare(b.name),
  );

// Year dropdown that always opens downward and never runs under the fixed header:
// clicking it first centres the field on screen so there's room below, and the
// list shrinks to the space available (scrolling inside) instead of flipping up.
function YearSelect({
  id,
  value,
  onChange,
  years,
  includePresent = false,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  years: number[];
  includePresent?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        onPointerDown={(e) => e.currentTarget.scrollIntoView({ block: "center" })}
        onKeyDown={(e) => e.currentTarget.scrollIntoView({ block: "center" })}
      >
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent
        side="bottom"
        avoidCollisions={false}
        collisionPadding={16}
        className="max-h-[min(15rem,var(--radix-select-content-available-height))]"
      >
        {includePresent && <SelectItem value="present">Current member</SelectItem>}
        {years.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const emptyForm = {
  name: "",
  startYear: "",
  endYear: "",
  college: "",
  major: "",
  message: "",
  website: "", // honeypot: hidden from people, filled in by spam bots
};

export default function TestimonialsPage() {
  const [alumni, setAlumni] = useState<Alum[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  // The open tab lives in the URL (?tab=alumni) so it can be linked to directly.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "alumni" ? "alumni" : "testimonials";
  const changeTab = (tab: string) => {
    const next = new URLSearchParams(searchParams);
    if (tab === "alumni") next.set("tab", "alumni");
    else next.delete("tab");
    setSearchParams(next, { replace: true });
  };
  const { toast } = useToast();

  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("demo")) {
      setAlumni(sortAlumni(DEMO_ALUMNI));
      setLoading(false);
      return;
    }

    const fetchAlumni = async () => {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=testimonials`);
        const data = await response.json();
        if (data.success && Array.isArray(data.testimonials)) {
          setAlumni(sortAlumni(data.testimonials));
        }
      } catch (error) {
        console.error("Error fetching alumni:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  const testimonials = alumni.filter((a) => a.message);

  const openForm = () => {
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const closeForm = () => {
    setShowForm(false);
    setSubmitted(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setStartYear = (value: string) => {
    // Keep the range valid: an end year before the new start year is cleared.
    const endYear =
      formData.endYear && formData.endYear !== "present" && Number(formData.endYear) < Number(value)
        ? ""
        : formData.endYear;
    setFormData({ ...formData, startYear: value, endYear });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startYear || !formData.endYear) {
      toast({
        title: "Missing years",
        description: "Please choose your first and last year on the team.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      // text/plain keeps this a "simple" request, so the browser skips the CORS
      // preflight that Google Apps Script can't answer.
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "submitTestimonial",
          ...formData,
          startYear: Number(formData.startYear),
          endYear: formData.endYear === "present" ? "present" : Number(formData.endYear),
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Submission failed");

      setSubmitted(true);
      setFormData(emptyForm);
    } catch (error) {
      console.error("Error submitting alumni entry:", error);
      toast({
        title: "Error",
        description: "We couldn't submit your entry. Please try again.",
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Alumni Testimonials</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Where our solar car alumni went after Stony Point, and what the team meant to them.
          </p>
        </div>
      </section>

      {/* Tabs: pick between testimonials and the alumni list */}
      <section className="pt-10 sm:pt-12 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={changeTab}>
            <div className="flex justify-center">
              <TabsList className="h-12 w-full max-w-md">
                <TabsTrigger value="testimonials" className="flex-1 h-10 text-base gap-2">
                  <Quote className="h-4 w-4" />
                  Testimonials
                </TabsTrigger>
                <TabsTrigger value="alumni" className="flex-1 h-10 text-base gap-2">
                  <Users className="h-4 w-4" />
                  Alumni
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Quotes from alumni who wrote a message */}
            <TabsContent value="testimonials" className="mt-10">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading testimonials...</p>
              ) : testimonials.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No testimonials yet. Were you on the team? Be the first to share your story!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((t, index) => (
                    <Card key={index} className="flex flex-col hover:shadow-solar transition-smooth">
                      <CardContent className="p-6 flex flex-col gap-4 flex-1">
                        <div className="flex gap-3">
                          <Quote className="h-5 w-5 text-primary shrink-0" />
                          <p className="italic text-foreground whitespace-pre-line">{t.message}</p>
                        </div>
                        <div className="mt-auto">
                          <p className="font-semibold">{t.name}</p>
                          <p className="text-sm text-muted-foreground">Solar Car Team · {formatYears(t)}</p>
                          <p className="text-sm text-primary flex items-center gap-1.5 mt-1">
                            <GraduationCap className="h-4 w-4 shrink-0" />
                            {t.college}
                            {t.major && ` · ${t.major}`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Full alumni list */}
            <TabsContent value="alumni" className="mt-10">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading alumni...</p>
              ) : alumni.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No alumni listed yet. Were you on the team? Be the first to add yourself!
                </p>
              ) : (
                <>
                  {/* Phones: stacked list, so no column gets cut off */}
                  <Card className="sm:hidden divide-y divide-border">
                    {alumni.map((a, index) => (
                      <div key={index} className="p-4">
                        <p className="font-semibold">{a.name}</p>
                        <p className="text-sm text-muted-foreground">Solar Car Team · {formatYears(a)}</p>
                        <p className="text-sm mt-1">{a.college}</p>
                        {a.major && <p className="text-sm text-primary">{a.major}</p>}
                      </div>
                    ))}
                  </Card>

                  {/* Tablets and up: table */}
                  <Card className="hidden sm:block max-w-5xl mx-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Year(s) on Team</TableHead>
                          <TableHead>College</TableHead>
                          <TableHead>Major</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alumni.map((a, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium whitespace-nowrap">{a.name}</TableCell>
                            <TableCell className="whitespace-nowrap">{formatYears(a)}</TableCell>
                            <TableCell className="min-w-[10rem]">{a.college}</TableCell>
                            <TableCell className="min-w-[10rem]">{a.major}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Submission form: hidden until the visitor asks for it */}
      <section className="pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {!showForm ? (
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">Were you on the Stony Point Solar Car Team?</p>
              <Button variant="hero" size="lg" onClick={openForm}>
                <PenLine className="h-4 w-4 mr-2" />
                Share Your Story
              </Button>
            </div>
          ) : (
            <Card ref={formRef} className="max-w-2xl mx-auto scroll-mt-28">
              <CardHeader>
                <CardTitle>Share Your Story</CardTitle>
                <p className="text-muted-foreground">
                  Were you on the Stony Point Solar Car Team? Add yourself to our alumni list. Submissions are reviewed
                  before they appear on this page.
                </p>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-lg font-semibold">Thank you for sharing!</p>
                    <p className="text-muted-foreground">
                      Your entry has been received and will appear here once it's approved.
                    </p>
                    <Button variant="outline" onClick={closeForm}>
                      Close
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="startYear">First year on the team *</Label>
                        <YearSelect id="startYear" value={formData.startYear} onChange={setStartYear} years={YEAR_OPTIONS} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endYear">Last year on the team *</Label>
                        <YearSelect
                          id="endYear"
                          value={formData.endYear}
                          onChange={(value) => setFormData({ ...formData, endYear: value })}
                          years={YEAR_OPTIONS.filter((year) => !formData.startYear || year >= Number(formData.startYear))}
                          includePresent
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="college">College attended *</Label>
                      <Input
                        id="college"
                        name="college"
                        value={formData.college}
                        onChange={handleInputChange}
                        maxLength={150}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major *</Label>
                      <Input
                        id="major"
                        name="major"
                        placeholder="e.g. Mechanical Engineering, or Undecided"
                        value={formData.major}
                        onChange={handleInputChange}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">What did the solar car team mean to you? (optional)</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        maxLength={1000}
                      />
                    </div>
                    {/* Honeypot field: visually hidden, skipped by keyboard and screen readers */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="website">Website</label>
                      <input
                        id="website"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                      <Button type="button" variant="outline" className="sm:flex-1" onClick={closeForm}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="hero" className="sm:flex-1" disabled={isSubmitting}>
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
