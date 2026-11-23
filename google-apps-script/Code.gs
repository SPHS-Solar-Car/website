// COMPLETE CORS FIX FOR GOOGLE APPS SCRIPT
// This version should handle all CORS issues properly

// Replace these with your actual IDs
const CALENDAR_ID = 'c_4878007f96309e248f2110cc9dac2f871654c890a1f9d769060a08d3dd5ffe92@group.calendar.google.com';
const DRIVE_FOLDER_ID = '16SpBTQsYJDZejgLrSZZcQP66KQUU3tDi';

// Sponsor Tier Folder IDs - Add your Google Drive folder IDs here
// To get folder ID: Open folder in Google Drive, copy ID from URL
// Example URL: https://drive.google.com/drive/folders/FOLDER_ID_HERE
const SPONSOR_FOLDERS = {
  bronze: 'YOUR_BRONZE_FOLDER_ID',
  silver: 'YOUR_SILVER_FOLDER_ID',
  gold: 'YOUR_GOLD_FOLDER_ID',
  platinum: 'YOUR_PLATINUM_FOLDER_ID',
  diamond: 'YOUR_DIAMOND_FOLDER_ID'  // Replace with your actual Diamond sponsor folder ID
};

// Testimonials - alumni submissions that wait for approval before going public.
// TESTIMONIALS_SHEET_ID: the ID from the Google Sheet URL
//   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
// TESTIMONIAL_NOTIFY_EMAIL: who gets emailed on each new submission.
//   Leave blank to email the Google account the script runs as.
const TESTIMONIALS_SHEET_ID = '1ZMJEIZ5clu4OrUYg3MHpD_ZZkvtKW5dCHTa9t6eW7zs';
const TESTIMONIALS_TAB_NAME = 'Testimonials';
const TESTIMONIAL_NOTIFY_EMAIL = 'president@stonypointsolarcar.org';
// Every approved row shows in the alumni list; rows with a Message also show as a quote.
// You can add alumni yourself: type a new row (Submitted can be blank) and tick Approved.
// Start Year / End Year are plain 4-digit years. End Year can also be "Current member";
// a blank End Year means just the Start Year.
const TESTIMONIAL_HEADERS = ['Submitted', 'Name', 'Start Year', 'End Year', 'College', 'Major', 'Message', 'Approved'];
const TESTIMONIAL_APPROVED_COL = 8; // column H
const TESTIMONIAL_LIMITS = { name: 100, college: 150, major: 100, message: 1000 };
const TESTIMONIAL_MIN_YEAR = 1990;

// CRITICAL: Proper OPTIONS handler for CORS preflight requests
function doOptions(e) {
  // This is essential for CORS preflight requests
  return ContentService
    .createTextOutput()
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '3600'
    });
}

// MAIN POST HANDLER
function doPost(e) {
  try {
    const data = e.postData ? JSON.parse(e.postData.contents) : {};
    const action = data.action;

    if (action === 'submitTestimonial') {
      return submitTestimonial(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Unknown action'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// MAIN GET HANDLER
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  try {
    var type = params.type;
    switch (type) {
      case 'events':
        return getCalendarEvents();
      case 'resources':
        return getGalleryImages();
      case 'sponsors':
        return getSponsorLogos();
      case 'testimonials':
        return getApprovedTestimonials();
      default:
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, message: 'Solar Car API running' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Calendar Events - Populates Events Section
function getCalendarEvents() {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  const now = new Date();
  const twoMonthsFromNow = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000));
  
  const events = calendar.getEvents(now, twoMonthsFromNow);
  
  const formattedEvents = events.map(event => ({
    title: event.getTitle(),
    date: event.getStartTime().toLocaleDateString(),
    time: event.getStartTime().toLocaleTimeString(),
    description: event.getDescription() || 'DECA Chapter Event',
    location: event.getLocation() || 'TBD',
    type: event.getTitle().toLowerCase().includes('competition') ? 'competition' : 
          event.getTitle().toLowerCase().includes('meeting') ? 'meeting' : 'event'
  }));

  return ContentService
    .createTextOutput(JSON.stringify({success: true, events: formattedEvents}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Gallery Images - Populates Gallery Section
function getGalleryImages() {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const files = folder.getFiles();
  const imageResources = [];
  
  // Get all images for gallery
  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getBlob().getContentType();
    
    // Only include images for gallery
    if (mimeType.startsWith('image/')) {
      const fileId = file.getId();
      
      imageResources.push({
        id: fileId,
        name: file.getName(),
        mimeType: mimeType,
        webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
        downloadLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
        thumbnailLink: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({success: true, resources: imageResources}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Event handling with better date safety and ISO format
function handleGetEvents() {
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    if (!calendar) {
      throw new Error('Calendar not found. Check your CALENDAR_ID.');
    }
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const events = calendar.getEvents(now, futureDate);
    
    const formattedEvents = events.map(event => {
      try {
        const startTime = event.getStartTime();
        const endTime = event.getEndTime();
        
        if (!startTime || !endTime || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          console.warn(`Invalid date for event: ${event.getTitle()}`);
          return {
            title: event.getTitle() || 'Untitled Event',
            date: 'Invalid Date',
            time: 'Invalid Time',
            location: event.getLocation() || 'TBD',
            description: event.getDescription() || 'No description available',
            type: getEventType(event.getTitle() || ''),
            urgent: false,
            calendarLink: event.getId(),
            startTimeISO: null,
            endTimeISO: null,
            error: 'Invalid date/time data'
          };
        }
        
        return {
          title: event.getTitle(),
          date: formatSafeDate(startTime),
          time: formatSafeTime(startTime) + ' - ' + formatSafeTime(endTime),
          location: event.getLocation() || 'TBD',
          description: event.getDescription() || 'No description available',
          type: getEventType(event.getTitle()),
          urgent: isUrgentEvent(event),
          calendarLink: event.getId(),
          startTimeISO: startTime.toISOString(),
          endTimeISO: endTime.toISOString()
        };
      } catch (eventError) {
        console.error(`Error processing event ${event.getTitle()}:`, eventError);
        return {
          title: event.getTitle() || 'Error Event',
          date: 'Error',
          time: 'Error',
          location: 'TBD',
          description: 'Error processing event data',
          type: 'Meeting',
          urgent: false,
          calendarLink: event.getId(),
          startTimeISO: null,
          endTimeISO: null,
          error: eventError.toString()
        };
      }
    }).filter(event => event !== null);
    
    console.log('Found', formattedEvents.length, 'events');
    return createCorsResponse({
      success: true,
      events: formattedEvents
    });
    
  } catch (error) {
    console.error('Error getting events:', error);
    return createCorsResponse({
      success: false,
      error: 'Failed to get calendar events: ' + error.toString()
    });
  }
}

function handleSyncCalendar(calendarId) {
  try {
    if (calendarId) {
      console.log('Calendar sync requested for:', calendarId);
    }
    
    return {
      success: true,
      message: 'Calendar sync completed',
      calendar_id: CALENDAR_ID
    };
    
  } catch (error) {
    console.error('Error syncing calendar:', error);
    return {
      success: false,
      error: 'Failed to sync calendar: ' + error.toString()
    };
  }
}

function handleGetResources() {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    if (!folder) {
      throw new Error('Drive folder not found. Check your DRIVE_FOLDER_ID.');
    }
    
    const files = folder.getFiles();
    const imageResources = [];
    
    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getBlob().getContentType();
      
      // Only include images for gallery
      if (mimeType.startsWith('image/')) {
        const fileId = file.getId();
        
        imageResources.push({
          id: fileId,
          name: file.getName(),
          mimeType: mimeType,
          webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
          downloadLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
          thumbnailLink: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
        });
      }
    }
    
    console.log('Found', imageResources.length, 'images');
    return createCorsResponse({
      success: true,
      resources: imageResources
    });
    
  } catch (error) {
    console.error('Error getting resources:', error);
    return createCorsResponse({
      success: false,
      error: 'Failed to get resources: ' + error.toString()
    });
  }
}

function handleSyncResources() {
  try {
    console.log('Resources sync requested');
    return {
      success: true,
      message: 'Resources sync completed',
      folder_id: DRIVE_FOLDER_ID
    };
    
  } catch (error) {
    console.error('Error syncing resources:', error);
    return {
      success: false,
      error: 'Failed to sync resources: ' + error.toString()
    };
  }
}

// Sponsor Logos - Populates Sponsors Page
function getSponsorLogos() {
  try {
    const sponsors = {
      bronze: [],
      silver: [],
      gold: [],
      platinum: [],
      diamond: []
    };
    
    // Fetch logos for each tier
    Object.keys(SPONSOR_FOLDERS).forEach(tier => {
      const folderId = SPONSOR_FOLDERS[tier];
      if (folderId) {
        try {
          const folder = DriveApp.getFolderById(folderId);
          const files = folder.getFiles();
          
          while (files.hasNext()) {
            const file = files.next();
            const mimeType = file.getBlob().getContentType();
            
            // Only include images
            if (mimeType.startsWith('image/')) {
              const fileId = file.getId();
              sponsors[tier].push({
                id: fileId,
                name: file.getName(),
                logo: `https://drive.google.com/uc?export=view&id=${fileId}`,
                thumbnailLink: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching ${tier} sponsors:`, err);
        }
      }
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, sponsors: sponsors }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    console.error('Error getting sponsor logos:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to get sponsor logos: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}


// ---------------------------------------------------------------------------
// Testimonials
// New submissions land in the sheet with the "Approved" box unchecked.
// Only rows whose box is checked are returned to the website.
// ---------------------------------------------------------------------------

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getTestimonialsSheet() {
  const spreadsheet = SpreadsheetApp.openById(TESTIMONIALS_SHEET_ID);
  let sheet = spreadsheet.getSheetByName(TESTIMONIALS_TAB_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(TESTIMONIALS_TAB_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(TESTIMONIAL_HEADERS);
    sheet.getRange(1, 1, 1, TESTIMONIAL_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Trim, cap length, and stop Sheets from treating text as a formula.
function cleanTestimonialField(value, maxLength) {
  let text = String(value == null ? '' : value).trim().slice(0, maxLength);
  if (/^[=+\-@]/.test(text)) {
    text = "'" + text;
  }
  return text;
}

function submitTestimonial(data) {
  // Honeypot: real visitors never see or fill the "website" field.
  if (data.website) {
    return jsonOutput({ success: true });
  }

  const name = cleanTestimonialField(data.name, TESTIMONIAL_LIMITS.name);
  const startYear = Number(data.startYear);
  const isPresent = data.endYear === 'present';
  const endYear = isPresent ? 'Current member' : Number(data.endYear);
  const college = cleanTestimonialField(data.college, TESTIMONIAL_LIMITS.college);
  const major = cleanTestimonialField(data.major, TESTIMONIAL_LIMITS.major);
  const message = cleanTestimonialField(data.message, TESTIMONIAL_LIMITS.message);

  if (!name || !college || !major) {
    return jsonOutput({ success: false, error: 'Name, college, and major are required.' });
  }

  const maxYear = new Date().getFullYear() + 1;
  const validYear = y => Number.isInteger(y) && y >= TESTIMONIAL_MIN_YEAR && y <= maxYear;
  if (!validYear(startYear) || (!isPresent && (!validYear(endYear) || endYear < startYear))) {
    return jsonOutput({ success: false, error: 'Please choose a valid first and last year on the team.' });
  }
  const years = startYear === endYear ? String(startYear) : startYear + '–' + endYear; // e.g. "2023–Current member"

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let sheet;
  try {
    sheet = getTestimonialsSheet();
    sheet.appendRow([new Date(), name, startYear, endYear, college, major, message, false]);
    sheet.getRange(sheet.getLastRow(), TESTIMONIAL_APPROVED_COL).insertCheckboxes();
  } finally {
    lock.releaseLock();
  }

  try {
    const to = TESTIMONIAL_NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
    const sheetUrl = sheet.getParent().getUrl() + '#gid=' + sheet.getSheetId();
    MailApp.sendEmail({
      to: to,
      subject: 'New solar car alumni submission from ' + name + ' (needs approval)',
      body:
        'A new alumni entry was submitted on the website.\n\n' +
        'Name: ' + name + '\n' +
        'Years on team: ' + years + '\n' +
        'College: ' + college + '\n' +
        'Major: ' + major + '\n' +
        'Message: ' + (message || '(none)') + '\n\n' +
        'It will NOT appear on the website until you tick its "Approved" checkbox:\n' +
        sheetUrl
    });
  } catch (mailError) {
    // The submission is already saved; a mail failure shouldn't lose it.
    console.error('Testimonial notification email failed:', mailError);
  }

  return jsonOutput({ success: true });
}

function getApprovedTestimonials() {
  const sheet = getTestimonialsSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return jsonOutput({ success: true, testimonials: [] });
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, TESTIMONIAL_HEADERS.length).getValues();
  const testimonials = rows
    .filter(row => row[TESTIMONIAL_APPROVED_COL - 1] === true && row[1])
    .map(row => {
      const startYear = Number(row[2]) || 0;
      // End Year: a year, "Current member" (still on the team; "Present" also works),
      // or blank (= single year).
      const endYear = /^\s*(current( member)?|present)\s*$/i.test(String(row[3])) ? 'present' : Number(row[3]) || startYear;
      return {
        name: String(row[1]),
        startYear: startYear,
        endYear: endYear,
        college: String(row[4]),
        major: String(row[5] || ''),
        message: String(row[6] || '')
      };
    });
  // The website sorts the list by year, so row order here doesn't matter.

  return jsonOutput({ success: true, testimonials: testimonials });
}
