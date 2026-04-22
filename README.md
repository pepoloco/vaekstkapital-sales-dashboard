# Vaekstkapital — Sales Activity Dashboard

A Next.js 14 App Router dashboard that pulls live data from HubSpot and displays 12-week sales performance metrics for investment consultants.

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **NextAuth v4** (authentication)
- **HubSpot CRM API v3** (data source)
- **Deployed on Vercel**

---

## Project Structure

```
├── app/
│   ├── layout.tsx                        # Root layout + global CSS
│   ├── page.tsx                          # Redirects / → /dashboard/sales
│   ├── globals.css                       # Full design system
│   ├── dashboard/
│   │   └── sales/
│   │       └── page.tsx                  # Main dashboard page (server component)
│   └── api/
│       ├── auth/[...nextauth]/route.ts   # NextAuth handler
│       └── hubspot/
│           └── sales/route.ts            # HubSpot data API route
├── components/
│   └── sales/
│       ├── KpiCards.tsx                  # Top 6 KPI summary cards
│       └── SalesTable.tsx                # Full sortable/filterable metrics table
├── lib/
│   └── hubspot/
│       ├── client.ts                     # Authenticated fetch wrapper
│       ├── deals.ts                      # Deals + owners + leads fetchers
│       ├── activities.ts                 # Meetings fetcher + type classifier
│       └── metrics.ts                    # Index calculations + week helpers
├── types/
│   └── sales.ts                          # Shared TypeScript interfaces
├── .env.local.example                    # Environment variable template
└── .gitignore
```

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_ORG/vaekstkapital-sales.git
cd vaekstkapital-sales
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Then fill in `.env.local`:

```env
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxxxxxx
HUBSPOT_PORTAL_ID=12345678
NEXTAUTH_SECRET=your-secret-here   # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

**Getting your HubSpot token:**
1. Go to HubSpot → Settings → Integrations → Private Apps
2. Create a new Private App
3. Give it these scopes:
   - `crm.objects.deals.read`
   - `crm.objects.contacts.read`
   - `crm.objects.owners.read`
   - `crm.objects.engagements.read`
4. Copy the token → paste as `HUBSPOT_ACCESS_TOKEN`

### 3. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Customisation Checklist

| What | File | Variable/Function |
|---|---|---|
| Meeting type detection | `lib/hubspot/activities.ts` | `classifyMeetingType()` — add your meeting title keywords |
| Meeting index weights | `lib/hubspot/metrics.ts` | `calcMeetingIndex()` — adjust pts per type |
| Sales target (for index) | `lib/hubspot/metrics.ts` | `calcSalesIndex(totalAmount, target)` — change `target` |
| Deal stage filter | `lib/hubspot/deals.ts` | Change `"closedwon"` to your deal stage ID |
| Auth provider | `app/api/auth/[...nextauth]/route.ts` | Add your provider (Google, Azure AD, etc.) |
| Currency locale | `components/sales/SalesTable.tsx` | Change `"da-DK"` to your locale |

---

## Deploy to Vercel

### Option A — GitHub (recommended)

```bash
git init
git add .
git commit -m "feat: initial sales dashboard"
git remote add origin https://github.com/YOUR_ORG/vaekstkapital-sales.git
git push -u origin main
```

Then in Vercel:
1. **Add New Project** → import the GitHub repo
2. Framework: **Next.js** (auto-detected)
3. Add environment variables (same as `.env.local` but with production values):
   - `HUBSPOT_ACCESS_TOKEN`
   - `HUBSPOT_PORTAL_ID`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → your Vercel domain e.g. `https://vaekstkapital-sales.vercel.app`
4. Click **Deploy** ✅

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## Dashboard Features

| Feature | Description |
|---|---|
| **KPI Cards** | Total revenue, deals closed, avg hit rate, trending up count, avg meeting & sales index |
| **Sortable table** | Click any column header to sort asc/desc |
| **Search** | Filter consultants by name |
| **W1–W12 toggle** | Expand/collapse weekly meeting breakdown |
| **Trend badge** | Green ▲ Yes / Red ▼ No based on 4w vs 8w comparison |
| **Index bars** | Visual green/amber/red progress bars for meeting & sales index |
| **Auth guard** | All routes require NextAuth session |
| **1h cache** | HubSpot data cached for 1 hour via Next.js fetch revalidation |
