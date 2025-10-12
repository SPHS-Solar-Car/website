import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, RefreshCw } from "lucide-react";
import { CalendarEvent } from "@/lib/googleAppsScript";
import { GOOGLE_SCRIPT_URL } from "@/config/googleScript";

// Fallback events for when Google Calendar is not configured
const fallbackEvents = [
  {
    id: "1",
    title: "Solar Car Workshop",
    start: "2024-03-15T14:00:00",
    end: "2024-03-15T16:00:00",
    location: "Engineering Building, Room 201",
    description: "Hands-on workshop covering solar panel installation and efficiency optimization."
  },
  {
    id: "2",
    title: "American Solar Challenge",
    start: "2024-07-20T08:00:00",
    end: "2024-07-28T18:00:00",
    location: "Texas to Minnesota",
    description: "Annual cross-country solar car race covering over 1,500 miles."
  },
  {
    id: "3",
    title: "Weekly Team Meeting",
    start: "2024-12-12T18:00:00",
    end: "2024-12-12T20:00:00",
    location: "Student Union, Room 150",
    description: "Weekly team meetings to discuss project progress and plan upcoming activities."
  }
];

export function EventsSection() {
  const [events, setEvents] = useState<CalendarEvent[]>(fallbackEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=events`);
      const data = await response.json();
      
      if (data.success && data.events && data.events.length > 0) {
        setEvents(data.events);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (startString: string, endString: string) => {
    const start = new Date(startString);
    const end = new Date(endString);
    
    const startTime = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    
    const endTime = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    
    return `${startTime} - ${endTime}`;
  };

  const getEventType = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('competition') || titleLower.includes('challenge') || titleLower.includes('race')) {
      return 'Competition';
    } else if (titleLower.includes('workshop') || titleLower.includes('training')) {
      return 'Workshop';
    } else if (titleLower.includes('meeting')) {
      return 'Meeting';
    } else if (titleLower.includes('presentation')) {
      return 'Presentation';
    }
    return 'Event';
  };

  const addToGoogleCalendar = (event: CalendarEvent) => {
    // Handle both formats: Google Script events (date/time fields) and fallback events (start/end fields)
    let startDate: Date;
    let endDate: Date;

    if ((event as any).date && (event as any).time) {
      // Google Script format: "10/12/2025" and "11:00:00 AM"
      const dateStr = (event as any).date;
      const timeStr = (event as any).time;
      startDate = new Date(`${dateStr} ${timeStr}`);
      // Default to 1 hour duration
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    } else {
      // Fallback format with start/end
      startDate = new Date(event.start);
      endDate = new Date(event.end);
    }

    // Format dates for Google Calendar URL
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const start = formatDateForGoogle(startDate);
    const end = formatDateForGoogle(endDate);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${start}/${end}`,
      details: event.description || '',
      location: event.location || '',
    });

    const url = `https://www.google.com/calendar/render?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <section id="events" className="py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Upcoming Events</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvents}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with our latest activities, competitions, and team meetings.
          </p>
          {lastUpdated && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {events.slice(0, 4).map((event) => {
            const eventType = getEventType(event.title);
            return (
              <Card 
                key={event.id} 
                className="hover:shadow-solar transition-smooth cursor-pointer"
                onClick={() => addToGoogleCalendar(event)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      eventType === 'Competition' ? 'bg-accent/20 text-accent' :
                      eventType === 'Workshop' ? 'bg-secondary/20 text-secondary' :
                      eventType === 'Meeting' ? 'bg-primary/20 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {eventType}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {event.description && event.description !== 'DECA Chapter Event' && (
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{(event as any).date || formatDate(event.start)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{(event as any).time || formatTime(event.start, event.end)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}