import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import presidentPhoto from "@/assets/board/president.jpg";
import seniorVicePresidentPhoto from "@/assets/board/senior-vice-president.jpg";
import vpFundraisingPhoto from "@/assets/board/vp-fundraising.jpg";
import vpCommunicationsPhoto from "@/assets/board/vp-communications.jpg";
import treasurerPhoto from "@/assets/board/treasurer.jpg";
import secretaryPhoto from "@/assets/board/secretary.jpg";

type BoardMember = {
  name: string;
  title: string;
  email?: string;
  // Imported image from src/assets/board/. Initials are shown until a photo is added.
  photo?: string;
};

// To change the board: edit this list. Order here is the order shown on the page.
const boardMembers: BoardMember[] = [
  { name: "Randall Eiland", title: "President", email: "president@stonypointsolarcar.org", photo: presidentPhoto },
  {
    name: "Deepa Krishnan",
    title: "Senior Vice President",
    email: "svp@stonypointsolarcar.org",
    photo: seniorVicePresidentPhoto,
  },
  {
    name: "Adam Brown",
    title: "VP Fundraising",
    email: "vp-fundraising@stonypointsolarcar.org",
    photo: vpFundraisingPhoto,
  },
  {
    name: "Anjali Kashyap",
    title: "VP Communications",
    email: "vp-communications@stonypointsolarcar.org",
    photo: vpCommunicationsPhoto,
  },
  { name: "Angela Okah", title: "Treasurer", email: "treasurer@stonypointsolarcar.org", photo: treasurerPhoto },
  { name: "Cleeta Fernandes", title: "Secretary", email: "secretary@stonypointsolarcar.org", photo: secretaryPhoto },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

export function BoardSection() {
  return (
    <section className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Our Board</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Reach out to the board member who can best help with your question.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {boardMembers.map((member) => (
            <Card key={member.name} className="text-center hover:shadow-solar transition-smooth">
              <CardContent className="p-6">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    loading="lazy"
                    className="w-40 h-40 mx-auto mb-4 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-40 h-40 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                    {initials(member.name)}
                  </div>
                )}
                <h3 className="text-lg font-semibold text-primary">{member.name}</h3>
                {member.email ? (
                  <a
                    href={`mailto:${member.email}`}
                    title={`Email ${member.name}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary hover:underline transition-smooth"
                  >
                    {member.title}
                    <Mail className="h-4 w-4 shrink-0" />
                  </a>
                ) : (
                  <p className="text-muted-foreground">{member.title}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
