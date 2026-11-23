# Google Apps Script Setup Instructions

This directory contains the Google Apps Script code needed to connect your Google Calendar, Drive, and Sheets to your Solar Car Team website.

## Step-by-Step Setup

### 1. Create a New Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click **"New project"**
3. Name it something like "Solar Car Team Integration"

### 2. Copy the Code

1. Open the `Code.gs` file in this directory
2. Copy all the code
3. In your Google Apps Script project, replace any existing code with the copied code

### 3. Deploy as Web App

1. Click **"Deploy"** > **"New deployment"**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Configure the deployment:
   - **Description**: "Solar Car Team API"
   - **Execute as**: **Me** (your-email@gmail.com)
   - **Who has access**: **Anyone** (important for public access)
5. Click **"Deploy"**
6. You may need to authorize the script:
   - Click **"Authorize access"**
   - Choose your Google account
   - Click **"Advanced"** if you see a warning
   - Click **"Go to [Project Name] (unsafe)"**
   - Click **"Allow"**
7. Copy the **Web app URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

### 4. Prepare Your Google Resources

#### A. Google Calendar
- Use your default calendar, or
- Create a new calendar specifically for team events
- To get Calendar ID:
  1. Go to [calendar.google.com](https://calendar.google.com)
  2. Click ⚙️ Settings
  3. Select your calendar
  4. Scroll to "Integrate calendar"
  5. Copy the **Calendar ID** (looks like: `abc123@group.calendar.google.com`)

#### B. Google Drive Folder for Gallery Images
1. Go to [drive.google.com](https://drive.google.com)
2. Create a new folder called "Solar Car Gallery"
3. Upload your team photos to this folder
4. To get Folder ID:
   - Open the folder
   - Look at the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the **Folder ID** (the part after `/folders/`)
5. **Important**: Make the folder publicly accessible:
   - Right-click the folder
   - Click "Share"
   - Click "Change to anyone with the link"
   - Set to "Viewer"

### 5. Configure Your Website

1. Go to your website's Settings form (`GoogleScriptConfig.tsx`)
2. Enter the following:
   - **Google Apps Script URL**: The web app URL you copied in step 3
   - **Calendar ID**: Your calendar ID (optional, leave blank for default calendar)
   - **Drive Folder ID**: Your gallery folder ID
3. Click **Save Configuration**

### 6. Test the Integration

1. Click "Refresh" on the Events section - you should see your calendar events
2. Visit the Gallery section - you should see images from your Drive folder

## Troubleshooting

### "Calendar not found" error
- Make sure you entered the correct Calendar ID
- Or leave it blank to use your default calendar
- Ensure the script has permission to access Google Calendar

### "Folder not found" error
- Verify the Folder ID is correct
- Make sure the folder is shared (at least "Anyone with link can view")

### "No images showing in gallery"
- Ensure there are actual image files in the folder (JPG, PNG, etc.)
- Check that the folder permissions are set to public

### "Script authorization required"
- When you first deploy, you need to authorize the script
- Follow the authorization steps in the deployment process
- You may see a "This app isn't verified" warning - this is normal for personal scripts

### CORS errors
- Make sure "Who has access" is set to "Anyone" in the deployment settings
- The script includes CORS headers to allow cross-origin requests

## Security Notes

- The script runs with YOUR Google account permissions
- Make sure you trust any code before deploying
- Only share the web app URL (not your script project)
- You can revoke access anytime from your Google Account settings

## Updating the Script

If you need to make changes:
1. Edit the code in your Google Apps Script project
2. Click **"Deploy"** > **"Manage deployments"**
3. Click the pencil icon ✏️ to edit
4. Change version to "New version"
5. Click **"Deploy"**
6. The URL stays the same, no need to reconfigure your website

## Testimonials (approval required)

The `/testimonials` page shows a **Solar Car Alumni** list (name, year(s) on the team, college, major) plus quote cards for alumni who wrote a message. Alumni can submit themselves with the "Share Your Story" form. Each submission goes into a Google Sheet **unapproved** and you get an email. It only appears on the website after you approve it.

### One-time setup

1. Create a new Google Sheet (for example "Solar Car Testimonials"). Keep it **private**. Don't share it publicly.
2. Copy its ID from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
3. In `Code.gs`, set `TESTIMONIALS_SHEET_ID` to that ID.
   - Optional: set `TESTIMONIAL_NOTIFY_EMAIL` to the address that should get the notification emails. If you leave it blank, the emails go to the Google account the script runs as.
4. Paste the updated `Code.gs` into your Apps Script project and deploy a **New version** (see "Updating the Script" above), so the website URL stays the same.
5. Google will ask you to authorize the script again, because it now uses Sheets and email. Approve it.
6. The script creates the "Testimonials" tab and its header row the first time someone submits.

### Approving a testimonial

1. You get an email titled **"New solar car alumni submission from … (needs approval)"** with a link to the sheet.
2. In the sheet, check the **Approved** checkbox (column I) on that row. You can also fix typos in the row first.
3. The person shows up on the website the next time someone loads the page: always in the alumni list, and also as a quote card if they wrote a message.

To reject one, delete its row or leave the checkbox unchecked. To remove someone later, uncheck the box.

### Adding alumni yourself

You don't need to wait for submissions. Add a new row to the "Testimonials" tab:

| Submitted | First Name | Last Name | Start Year | End Year | College | Major | Message | Approved |
|---|---|---|---|---|---|---|---|---|
| *(leave blank)* | Jane | Doe | 2019 | 2022 | Cornell University | Physics | *(optional)* | ☑ |

Type years as plain 4-digit numbers. For a current member who is still on the team, type `Current member` as the End Year. For someone who was on the team for a single year, put it in Start Year and leave End Year blank.

For the Approved cell, select it and choose **Insert > Checkbox**, then tick it. Typing `TRUE` also works. The list is sorted most recent first: current members at the top, then by End Year, then Start Year, then name.

## Support

If you encounter any issues:
1. Check the Google Apps Script logs (View > Logs)
2. Verify all IDs are correct
3. Ensure all permissions are properly set
4. Make sure your Google resources (Calendar, Drive, Sheets) are accessible
