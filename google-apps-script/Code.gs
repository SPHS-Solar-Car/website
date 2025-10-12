// COMPLETE CORS FIX FOR GOOGLE APPS SCRIPT
// This version should handle all CORS issues properly

// Replace these with your actual IDs
const CALENDAR_ID = 'c_4878007f96309e248f2110cc9dac2f871654c890a1f9d769060a08d3dd5ffe92@group.calendar.google.com';
const DRIVE_FOLDER_ID = '16SpBTQsYJDZejgLrSZZcQP66KQUU3tDi';
const POINTS_SHEET_ID = '1aF2N7PQhSSfBqhEjjGHSAqlD4t8KuH6VQ0pI0veBeC0';

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
    
    if (action === 'lookup_student') {
      return lookupStudent(data.student_id);
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
    // Direct GET lookup: /exec?student_name=Full+Name
    if (params.student_name) {
      var result = handleLookupStudent(params.student_name);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var type = params.type;
    switch (type) {
      case 'events':
        return getCalendarEvents();
      case 'resources':
        return getGalleryImages();
      case 'points':
        return getMemberPoints();
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

// Member Points - Populates Points Page
function getMemberPoints() {
  const sheet = SpreadsheetApp.openById(POINTS_SHEET_ID).getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  const members = data.slice(1).map((row, index) => ({
    name: row[0],
    studentId: row[0],
    saturdayPoints: row[1] || 0,
    logisticsPoints: row[2] || 0,
    communityPoints: row[3] || 0,
    referrals: row[4] || 0,
    totalPoints: row[5] || 0,
    rank: index + 1
  })).sort((a, b) => b.totalPoints - a.totalPoints);

  return ContentService
    .createTextOutput(JSON.stringify({success: true, members: members}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Lookup individual student
function lookupStudent(studentId) {
  const sheet = SpreadsheetApp.openById(POINTS_SHEET_ID).getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Search by name (case-insensitive)
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] && values[i][0].toString().trim().toLowerCase() === studentId.toString().trim().toLowerCase()) {
      const saturdayPoints = values[i][1] || 0;
      const logisticsPoints = values[i][2] || 0;
      const communityPoints = values[i][3] || 0;
      const referrals = values[i][4] || 0;
      const totalPoints = values[i][5] || 0;
      
      let rank = 1;
      for (let j = 1; j < values.length; j++) {
        if (j !== i && (values[j][5] || 0) > totalPoints) {
          rank++;
        }
      }
      
      const studentData = {
        name: values[i][0] || 'Unknown Student',
        studentId: values[i][0],
        totalPoints: totalPoints,
        rank: rank,
        categories: {
          saturday: { 
            points: saturdayPoints, 
            activities: saturdayPoints > 0 ? [`Earned ${saturdayPoints} Saturday points`] : ['No Saturday activities recorded'] 
          },
          logistics: { 
            points: logisticsPoints, 
            activities: logisticsPoints > 0 ? [`Earned ${logisticsPoints} logistics points`] : ['No logistics activities recorded'] 
          },
          community: { 
            points: communityPoints, 
            activities: communityPoints > 0 ? [`Earned ${communityPoints} community points`] : ['No community activities recorded'] 
          },
          referrals: { 
            points: referrals, 
            activities: referrals > 0 ? [`${referrals} referrals`] : ['No referrals recorded'] 
          }
        },
        recentActivity: [
          { date: new Date().toISOString().split('T')[0], activity: "Data from Google Sheets", points: totalPoints, type: "system" }
        ]
      };
      
      return ContentService
        .createTextOutput(JSON.stringify({success: true, student: studentData}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({success: false, message: 'Student name not found'}))
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

function handleLookupStudent(studentId) {
  try {
    const sheet = SpreadsheetApp.openById(POINTS_SHEET_ID).getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    console.log('Looking up student:', studentId);
    
    // Search by name (case-insensitive)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] && values[i][0].toString().trim().toLowerCase() === studentId.toString().trim().toLowerCase()) {
        const saturdayPoints = values[i][1] || 0;
        const logisticsPoints = values[i][2] || 0;
        const communityPoints = values[i][3] || 0;
        const referrals = values[i][4] || 0;
        const totalPoints = values[i][5] || (saturdayPoints + logisticsPoints + communityPoints + referrals);
        
        let rank = 1;
        for (let j = 1; j < values.length; j++) {
          if (j !== i && values[j][5] > totalPoints) {
            rank++;
          }
        }
        
        const studentData = {
          name: values[i][0] || 'Unknown Student',
          studentId: values[i][0], // Using name as ID since there's no student ID column
          totalPoints: totalPoints,
          rank: rank,
          categories: {
            saturday: { 
              points: saturdayPoints, 
              activities: saturdayPoints > 0 ? [`Earned ${saturdayPoints} Saturday points`] : ['No Saturday activities recorded'] 
            },
            logistics: { 
              points: logisticsPoints, 
              activities: logisticsPoints > 0 ? [`Earned ${logisticsPoints} logistics points`] : ['No logistics activities recorded'] 
            },
            community: { 
              points: communityPoints, 
              activities: communityPoints > 0 ? [`Earned ${communityPoints} community points`] : ['No community activities recorded'] 
            },
            referrals: { 
              points: referrals, 
              activities: referrals > 0 ? [`${referrals} referrals`] : ['No referrals recorded'] 
            }
          },
          recentActivity: [
            { date: new Date().toISOString().split('T')[0], activity: "Data from Google Sheets", points: totalPoints, type: "system" }
          ]
        };
        
        console.log('Student found:', studentData.name);
        return {
          success: true,
          student: studentData
        };
      }
    }
    
    console.log('Student not found:', studentId);
    return {
      success: false,
      message: 'Student name not found'
    };
    
  } catch (error) {
    console.error('Error looking up student:', error);
    return {
      success: false,
      error: 'Failed to lookup student: ' + error.toString()
    };
  }
}

function handleGetAllPoints() {
  try {
    const sheet = SpreadsheetApp.openById(POINTS_SHEET_ID).getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    const members = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i][0]) { // Check if name exists
        const totalPoints = values[i][5] || 0;
        
        let rank = 1;
        for (let j = 1; j < values.length; j++) {
          if (j !== i && values[j][5] > totalPoints) {
            rank++;
          }
        }
        
        members.push({
          name: values[i][0] || 'Unknown',
          studentId: values[i][0], // Using name as ID
          saturdayPoints: values[i][1] || 0,
          logisticsPoints: values[i][2] || 0,
          communityPoints: values[i][3] || 0,
          referrals: values[i][4] || 0,
          totalPoints: totalPoints,
          rank: rank
        });
      }
    }
    
    members.sort((a, b) => b.totalPoints - a.totalPoints);
    
    console.log('Found', members.length, 'members');
    return createCorsResponse({
      success: true,
      members: members
    });
    
  } catch (error) {
    console.error('Error getting all points:', error);
    return createCorsResponse({
      success: false,
      error: 'Failed to get points data: ' + error.toString()
    });
  }
}

