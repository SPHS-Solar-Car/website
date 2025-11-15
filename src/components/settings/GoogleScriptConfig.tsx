import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { googleAppsScript } from "@/lib/googleAppsScript";
import { Save } from "lucide-react";

const STORAGE_KEYS = {
  SCRIPT_URL: 'google_apps_script_url',
  CALENDAR_ID: 'google_calendar_id',
  DRIVE_FOLDER_ID: 'google_drive_folder_id',
  POINTS_SHEET_ID: 'google_points_sheet_id',
  POINTS_SHEET_RANGE: 'google_points_sheet_range',
  SPONSOR_BRONZE_FOLDER: 'google_sponsor_bronze_folder',
  SPONSOR_SILVER_FOLDER: 'google_sponsor_silver_folder',
  SPONSOR_GOLD_FOLDER: 'google_sponsor_gold_folder',
  SPONSOR_PLATINUM_FOLDER: 'google_sponsor_platinum_folder',
  SPONSOR_DIAMOND_FOLDER: 'google_sponsor_diamond_folder'
};

export function GoogleScriptConfig() {
  const [scriptUrl, setScriptUrl] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.SCRIPT_URL) || ''
  );
  const [calendarId, setCalendarId] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.CALENDAR_ID) || ''
  );
  const [driveFolderId, setDriveFolderId] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.DRIVE_FOLDER_ID) || ''
  );
  const [pointsSheetId, setPointsSheetId] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.POINTS_SHEET_ID) || ''
  );
  const [pointsSheetRange, setPointsSheetRange] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.POINTS_SHEET_RANGE) || 'Sheet1!A:C'
  );
  const [bronzeFolder, setBronzeFolder] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.SPONSOR_BRONZE_FOLDER) || ''
  );
  const [silverFolder, setSilverFolder] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.SPONSOR_SILVER_FOLDER) || ''
  );
  const [goldFolder, setGoldFolder] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.SPONSOR_GOLD_FOLDER) || ''
  );
  const [platinumFolder, setPlatinumFolder] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.SPONSOR_PLATINUM_FOLDER) || ''
  );
  const [diamondFolder, setDiamondFolder] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.SPONSOR_DIAMOND_FOLDER) || ''
  );

  useEffect(() => {
    if (scriptUrl) {
      googleAppsScript.setScriptUrl(scriptUrl);
    }
  }, [scriptUrl]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, scriptUrl);
    localStorage.setItem(STORAGE_KEYS.CALENDAR_ID, calendarId);
    localStorage.setItem(STORAGE_KEYS.DRIVE_FOLDER_ID, driveFolderId);
    localStorage.setItem(STORAGE_KEYS.POINTS_SHEET_ID, pointsSheetId);
    localStorage.setItem(STORAGE_KEYS.POINTS_SHEET_RANGE, pointsSheetRange);
    localStorage.setItem(STORAGE_KEYS.SPONSOR_BRONZE_FOLDER, bronzeFolder);
    localStorage.setItem(STORAGE_KEYS.SPONSOR_SILVER_FOLDER, silverFolder);
    localStorage.setItem(STORAGE_KEYS.SPONSOR_GOLD_FOLDER, goldFolder);
    localStorage.setItem(STORAGE_KEYS.SPONSOR_PLATINUM_FOLDER, platinumFolder);
    localStorage.setItem(STORAGE_KEYS.SPONSOR_DIAMOND_FOLDER, diamondFolder);
    
    googleAppsScript.setScriptUrl(scriptUrl);

    toast({
      title: "Settings Saved",
      description: "Google Apps Script configuration has been saved successfully.",
    });

    window.dispatchEvent(new Event('google-config-updated'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Apps Script Configuration</CardTitle>
        <CardDescription>
          Configure your Google Apps Script integration for calendar, gallery, and points tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scriptUrl">Google Apps Script URL</Label>
          <Input
            id="scriptUrl"
            type="url"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={scriptUrl}
            onChange={(e) => setScriptUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="calendarId">Google Calendar ID (optional)</Label>
          <Input
            id="calendarId"
            type="text"
            placeholder="your-calendar-id@group.calendar.google.com"
            value={calendarId}
            onChange={(e) => setCalendarId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="driveFolderId">Google Drive Folder ID</Label>
          <Input
            id="driveFolderId"
            type="text"
            placeholder="1a2b3c4d5e6f7g8h9i0j"
            value={driveFolderId}
            onChange={(e) => setDriveFolderId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pointsSheetId">Points Sheet ID</Label>
          <Input
            id="pointsSheetId"
            type="text"
            placeholder="1a2b3c4d5e6f7g8h9i0j"
            value={pointsSheetId}
            onChange={(e) => setPointsSheetId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pointsSheetRange">Points Sheet Range</Label>
          <Input
            id="pointsSheetRange"
            type="text"
            placeholder="Sheet1!A:C"
            value={pointsSheetRange}
            onChange={(e) => setPointsSheetRange(e.target.value)}
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Sponsor Logo Folders</h3>
          
          <div className="space-y-2">
            <Label htmlFor="diamondFolder">Diamond Sponsors Folder ID</Label>
            <Input
              id="diamondFolder"
              type="text"
              placeholder="1a2b3c4d5e6f7g8h9i0j"
              value={diamondFolder}
              onChange={(e) => setDiamondFolder(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platinumFolder">Platinum Sponsors Folder ID</Label>
            <Input
              id="platinumFolder"
              type="text"
              placeholder="1a2b3c4d5e6f7g8h9i0j"
              value={platinumFolder}
              onChange={(e) => setPlatinumFolder(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goldFolder">Gold Sponsors Folder ID</Label>
            <Input
              id="goldFolder"
              type="text"
              placeholder="1a2b3c4d5e6f7g8h9i0j"
              value={goldFolder}
              onChange={(e) => setGoldFolder(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="silverFolder">Silver Sponsors Folder ID</Label>
            <Input
              id="silverFolder"
              type="text"
              placeholder="1a2b3c4d5e6f7g8h9i0j"
              value={silverFolder}
              onChange={(e) => setSilverFolder(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bronzeFolder">Bronze Sponsors Folder ID</Label>
            <Input
              id="bronzeFolder"
              type="text"
              placeholder="1a2b3c4d5e6f7g8h9i0j"
              value={bronzeFolder}
              onChange={(e) => setBronzeFolder(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
}

export { STORAGE_KEYS };
