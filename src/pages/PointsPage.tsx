import { useState } from "react";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GOOGLE_SCRIPT_URL } from "@/config/googleScript";
import { Loader2, Award, Calendar, Users, Lightbulb } from "lucide-react";
import { toast } from "sonner";
interface StudentLookupData {
  name: string;
  studentId: string;
  totalPoints: number;
  rank: number;
  categories: {
    saturday: {
      points: number;
      activities: string[];
    };
    logistics: {
      points: number;
      activities: string[];
    };
    community: {
      points: number;
      activities: string[];
    };
    referrals: {
      points: number;
      activities: string[];
    };
  };
}
const PointsPage = () => {
  const [studentId, setStudentId] = useState("");
  const [lookupData, setLookupData] = useState<StudentLookupData | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const handleLookupStudent = async () => {
    if (!studentId.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setLookupLoading(true);
    try {
      const params = new URLSearchParams({
        student_name: studentId.trim()
      });
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: 'GET'
      });
      const result = await response.json();
      if (result.success && result.student) {
        setLookupData(result.student);
        toast.success("Student found!");
      } else {
        toast.error(result.message || "Student not found");
        setLookupData(null);
      }
    } catch (error) {
      console.error("Error looking up student:", error);
      toast.error("Failed to lookup student");
      setLookupData(null);
    } finally {
      setLookupLoading(false);
    }
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Student Points Tracker</h1>
            <p className="text-lg text-muted-foreground">
              Look up your points and see your detailed breakdown
            </p>
          </div>

          {/* Student Lookup Section */}
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle>Look Up Your Points</CardTitle>
                  <CardDescription>Enter your full name to see your detailed points breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input placeholder="Enter your full name" value={studentId} onChange={e => setStudentId(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleLookupStudent()} className="flex-1" />
                    <Button onClick={handleLookupStudent} disabled={lookupLoading} className="text-slate-50 bg-gray-950 hover:bg-gray-800">
                      {lookupLoading ? <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Looking up...
                        </> : "Look Up"}
                    </Button>
                  </div>

                  {lookupData && <div className="mt-6 space-y-4">
                      {/* Student Header */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground bg-slate-950">
                              {lookupData.rank}
                            </div>
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold">{lookupData.name}</h2>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 mt-6">
                            <div className="text-center">
                              <div className="text-4xl font-bold">{lookupData.totalPoints}</div>
                              <div className="text-muted-foreground mt-1">Total Points</div>
                            </div>
                            <div className="text-center">
                              <div className="text-4xl font-bold text-foreground">#{lookupData.rank}</div>
                              <div className="text-muted-foreground mt-1">Chapter Rank</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Category Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gray-950">
                                <Calendar className="h-6 w-6 text-primary-foreground bg-gray-950" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Saturday Points</h3>
                                <p className="text-2xl font-bold">{lookupData.categories.saturday.points}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                                <Award className="h-6 w-6 text-secondary-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Logistics Points</h3>
                                <p className="text-2xl font-bold">{lookupData.categories.logistics.points}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                                <Users className="h-6 w-6 text-accent-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Community Points</h3>
                                <p className="text-2xl font-bold">{lookupData.categories.community.points}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                <Lightbulb className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Referrals</h3>
                                <p className="text-2xl font-bold">{lookupData.categories.referrals.points}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>}
                </CardContent>
              </Card>
        </div>
      </main>

      <Footer />
    </div>;
};
export default PointsPage;