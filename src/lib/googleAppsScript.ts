// Google Apps Script Integration Service
// This service handles communication with Google Apps Script endpoints
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

export interface SheetData {
  range: string;
  values: string[][];
}

export interface DriveResource {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  downloadLink?: string;
  thumbnailLink?: string;
}

class GoogleAppsScriptService {
  private baseUrl: string = '';

  // Set the Google Apps Script web app URL
  setScriptUrl(url: string) {
    this.baseUrl = url;
  }

  // Fetch events from Google Calendar
  async getCalendarEvents(calendarId?: string): Promise<CalendarEvent[]> {
    if (!this.baseUrl) {
      console.warn('Google Apps Script URL not configured');
      return [];
    }

    try {
      const params = new URLSearchParams();
      if (calendarId) params.append('calendarId', calendarId);
      
      const response = await fetch(`${this.baseUrl}?action=getCalendarEvents&${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  }

  // Fetch data from Google Sheets
  async getSheetData(spreadsheetId: string, range: string): Promise<SheetData | null> {
    if (!this.baseUrl) {
      console.warn('Google Apps Script URL not configured');
      return null;
    }

    try {
      const params = new URLSearchParams({
        action: 'getSheetData',
        spreadsheetId,
        range,
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      return null;
    }
  }

  // Add data to Google Sheets (for contact form submissions, etc.)
  async appendToSheet(spreadsheetId: string, range: string, values: string[][]): Promise<boolean> {
    if (!this.baseUrl) {
      console.warn('Google Apps Script URL not configured');
      return false;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'appendToSheet',
          spreadsheetId,
          range,
          values,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error appending to sheet:', error);
      return false;
    }
  }

  // Get resources from Google Drive folder
  async getDriveResources(folderId: string): Promise<DriveResource[]> {
    if (!this.baseUrl) {
      console.warn('Google Apps Script URL not configured');
      return [];
    }

    try {
      const params = new URLSearchParams({
        action: 'getDriveResources',
        folderId,
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.resources || [];
    } catch (error) {
      console.error('Error fetching drive resources:', error);
      return [];
    }
  }

  // Upload image to Google Drive folder
  async uploadImage(folderId: string, fileName: string, imageData: string): Promise<boolean> {
    if (!this.baseUrl) {
      console.warn('Google Apps Script URL not configured');
      return false;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'uploadImage',
          folderId,
          fileName,
          imageData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Error uploading image:', error);
      return false;
    }
  }

  // Get all student points
  async getAllPoints(): Promise<any> {
    if (!this.baseUrl) {
      console.warn('Google Apps Script URL not configured');
      return { success: false, members: [] };
    }

    try {
      const response = await fetch(`${this.baseUrl}?type=points`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all points:', error);
      return { success: false, members: [] };
    }
  }

  // Lookup individual student by ID
  async lookupStudent(studentId: string): Promise<any> {
    if (!this.baseUrl) {
      console.warn('Google Apps Script URL not configured');
      return { success: false, message: 'Not configured' };
    }

    try {
      const params = new URLSearchParams({ student_name: studentId.trim() });
      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error looking up student:', error);
      return { success: false, message: 'Lookup failed' };
    }
  }

  // Get sponsor logos from Drive folders
  async getSponsorLogos(): Promise<any> {
    if (!this.baseUrl) {
      console.warn('Google Apps Script URL not configured');
      return { success: false, sponsors: {} };
    }

    try {
      const response = await fetch(`${this.baseUrl}?type=sponsors`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sponsor logos:', error);
      return { success: false, sponsors: {} };
    }
  }
}

// Export singleton instance
export const googleAppsScript = new GoogleAppsScriptService();