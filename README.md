# SPHS Solar Car Team Website

The public website for the Stony Point High School (SPHS) Solar Car Team — home page, events, gallery, sponsorships, and contact/join forms.

## Tech Stack

- **React 18 + TypeScript**, built with **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix UI primitives) for components
- **React Router** for client-side routing
- **Supabase** — Edge Functions only (payments + transactional email), no database tables
- **Google Apps Script** — acts as a free JSON API in front of Google Calendar, Drive, and Sheets (events, gallery photos, sponsor logos, points)
- **Netlify** — hosting/build/deploy
- **Stripe** — sponsorship/donation payments
- **Resend** — transactional emails (receipts, admin notifications, contact form)

## Project Structure

```
src/
  pages/                  Route-level pages (Index, JoinPage, ContactPage, PointsPage,
                           SponsorsPage, SponsorPage, SponsorSuccessPage, ...)
  components/
    sections/              Home page sections (Hero, About, Gallery, Events, Footer)
    navigation/             Header/nav
    settings/GoogleScriptConfig.tsx   UI for entering Google Apps Script IDs
    ui/                     shadcn/ui components (buttons, cards, dialogs, etc.)
  lib/googleAppsScript.ts  Client for talking to the Google Apps Script web app
  config/googleScript.ts  Hardcoded production Google Apps Script web app URL
  integrations/supabase/  Auto-generated Supabase client + types
supabase/
  functions/               Supabase Edge Functions (Deno)
    create-payment/          Creates a Stripe Checkout session for sponsorships/donations
    process-payment-success/ Verifies a completed Stripe session, triggers receipt/notification
    send-receipt/            Emails a donor receipt via Resend
    send-admin-notification/ Emails the team when a new donation/sponsorship comes in
    send-contact-form/       Emails the team when someone submits the Contact form
google-apps-script/
  Code.gs                  The Apps Script source that powers events/gallery/points/sponsors
  README.md                Step-by-step setup guide for the Apps Script + Google resources
public/netlify.toml        Netlify build/deploy config
```

## Running Locally

Requires Node.js (18+) and npm (or bun — a `bun.lockb` is present).

```bash
npm install
npm run dev       # starts Vite dev server, usually http://localhost:5173
npm run build     # production build to dist/
npm run lint      # eslint
npm run preview   # preview a production build locally
```

### Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project's public values:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Note: `src/integrations/supabase/client.ts` is auto-generated and currently has the project URL/anon key hardcoded directly in the file (this is safe — it's a public anon key, same pattern Lovable/Supabase scaffolding uses). The `.env` values are a fallback/alternative wiring point if you regenerate that file to read from `import.meta.env` instead.

## How the Website Is Organized

- `Index.tsx` composes the home page out of the section components in `src/components/sections/` (Hero, About, Gallery, Events, Footer).
- Each other page (Join, Contact, Points, Sponsors, Sponsor/Donate, Sponsor Success) is its own file in `src/pages/` and is wired up as a route in `src/App.tsx`.
- Styling is Tailwind utility classes plus shadcn/ui components in `src/components/ui/` — these are generated components you can restyle directly, not a third-party package to upgrade.

To add a new page: create a file in `src/pages/`, then add a `<Route>` for it in `src/App.tsx`. To change site copy/branding, edit the relevant section component directly (e.g. `AboutSection.tsx`, `HeroSection.tsx`).

## Making Content Changes via Google (Gallery, Sponsors, Events, Points)

This site does **not** store the gallery photos, sponsor logos, event calendar, or points leaderboard in code or in Supabase. Instead, it reads them live from Google Drive / Google Calendar / Google Sheets through a single Google Apps Script "web app" that acts as a lightweight API. This means non-developers can update these sections just by editing Google Drive folders/Sheets/Calendar — no code changes or redeploys needed.

### How it works

1. `google-apps-script/Code.gs` is deployed (by a team admin) as an Apps Script Web App, which exposes a URL like `https://script.google.com/macros/s/XXXX/exec`.
2. That URL is called with a query param to select what data to return:
   - `?type=events` → upcoming events from a Google Calendar
   - `?type=resources` → images from a Google Drive folder (powers the Gallery)
   - `?type=sponsors` → logos from Google Drive folders, grouped by sponsor tier (bronze/silver/gold/platinum/diamond)
   - `?type=points` → rows from a Google Sheet (powers the Points leaderboard)
   - `?student_name=Full+Name` → look up one student's points
3. On the frontend:
   - `src/config/googleScript.ts` holds the **production** Apps Script URL, hardcoded and used by `GallerySection.tsx` and `SponsorsPage.tsx` directly.
   - `src/lib/googleAppsScript.ts` + `src/components/settings/GoogleScriptConfig.tsx` provide an alternate path where an admin can paste a script URL and various Calendar/Drive/Sheet IDs into a settings form; these are saved to `localStorage` and used by the Points page.

### To change what shows up in the Gallery

1. Open the Google Drive folder used for the gallery (folder ID is set as `DRIVE_FOLDER_ID` in `Code.gs`).
2. Add, remove, or rename image files in that folder. Only image files (`image/*` mime types) are picked up.
3. Changes appear on the site the next time the Gallery section loads — no deploy needed.

### To change Sponsor logos

1. Each sponsor tier (Bronze, Silver, Gold, Platinum, Diamond) has its own Google Drive folder, configured as `SPONSOR_FOLDERS` in `Code.gs` (or via the Settings form's Sponsor Logo Folder fields).
2. Add/remove logo image files in the relevant tier's folder to change what's shown on `/sponsors`.

### To change Events

1. Events come from a Google Calendar (`CALENDAR_ID` in `Code.gs`).
2. Add/edit/delete events directly in that Google Calendar. Event title/date/time/description/location map directly onto the Events section; events with "competition" or "meeting" in the title get auto-tagged.

### To change the Points leaderboard

1. Points come from a Google Sheet (`POINTS_SHEET_ID` in `Code.gs`), with columns: `Name | Saturday Points | Logistics Points | Community Points | Referrals | Total Points`.
2. Edit rows directly in the Sheet.

### Updating the Apps Script itself (adding new IDs, new endpoints, bug fixes)

If you need to point the site at different Drive folders/Sheets/Calendars, or change the API logic:

1. Follow the full walkthrough in [`google-apps-script/README.md`](google-apps-script/README.md) — it covers creating the Apps Script project, deploying it as a Web App, getting Calendar/Drive/Sheet IDs, and configuring the site.
2. Edit `google-apps-script/Code.gs` locally, then copy/paste the updated code into the Apps Script editor at [script.google.com](https://script.google.com).
3. Redeploy via **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**. The web app URL stays the same, so nothing on the site needs to change unless you rotate the URL.
4. If the URL does change, update `GOOGLE_SCRIPT_URL` in `src/config/googleScript.ts` and redeploy the site.

## Supabase (Edge Functions Only — No Database)

This project uses Supabase purely as a **serverless functions host**; there are no database tables (`src/integrations/supabase/types.ts` defines an empty schema). The Supabase project is `dejyjyilonbykdpskbww` (see `supabase/config.toml`).

The frontend calls these functions via `supabase.functions.invoke(...)` (see `src/integrations/supabase/client.ts` for the client setup):

| Function | Purpose | Called from |
|---|---|---|
| `create-payment` | Creates a Stripe Checkout session for a sponsorship/donation (tier-based or custom amount, adds Stripe fee) | `SponsorPage.tsx` |
| `process-payment-success` | Verifies a completed Stripe session server-side and kicks off receipt/notification emails | `SponsorSuccessPage.tsx` |
| `send-receipt` | Emails the donor a receipt via Resend | `TestEmailPage.tsx`, `process-payment-success` |
| `send-admin-notification` | Emails the team when a new donation/sponsorship comes in | `TestAdminEmailPage.tsx`, `process-payment-success` |
| `send-contact-form` | Emails the team when someone submits the Contact page form | `ContactPage.tsx` |

Edge Function source lives in `supabase/functions/*/index.ts` (Deno runtime). They rely on secrets set in the Supabase project (not in this repo):

- `STRIPE_SECRET_KEY` — used by `create-payment` / `process-payment-success`
- `RESEND_API_KEY` — used by `send-receipt`, `send-admin-notification`, `send-contact-form`
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — used by `process-payment-success` to call other functions with elevated privileges

### Deploying Edge Function changes

Edge functions are deployed to Supabase separately from the Netlify site build (Netlify only builds/deploys the static frontend). Using the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase login
supabase link --project-ref dejyjyilonbykdpskbww
supabase functions deploy create-payment
# or deploy all functions:
supabase functions deploy
```

Secrets are managed with `supabase secrets set KEY=value` (or via the Supabase dashboard under Project Settings → Edge Functions), not through this repo.

## Hosting & Deployment (Netlify)

The frontend is built and hosted on **Netlify**. Configuration lives in `public/netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback redirect: all routes (`/*`) rewrite to `/index.html` with a `200`, so React Router can handle client-side routing.

Typical flow: push/merge to the connected branch (e.g. `main`) → Netlify picks up the change, runs `npm run build`, and deploys `dist/` automatically. No manual deploy step is required once the Netlify site is connected to this GitHub repo. Environment variables used at build time (if any beyond the hardcoded Supabase client values) should be set in the Netlify site's **Site configuration → Environment variables**, not committed to the repo.

## Summary: Who Changes What

| Content | Where to edit | Needs a code deploy? |
|---|---|---|
| Gallery photos | Google Drive folder | No |
| Sponsor logos | Google Drive folders (per tier) | No |
| Events | Google Calendar | No |
| Points leaderboard | Google Sheet | No |
| Page copy, layout, styling, new pages/routes | This repo (`src/`) | Yes (push → Netlify auto-deploys) |
| Payment/email logic | `supabase/functions/*` | Yes (`supabase functions deploy`) |
| Which Drive folders/Sheet/Calendar are used | `google-apps-script/Code.gs` (redeploy the Apps Script) | No site deploy needed, unless the script URL changes |
