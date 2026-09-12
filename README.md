# MyTechz CRM — Frontend

A professional, scalable CRM frontend for a company that manages and aggregates
business leads from multiple industries.

> **Phase 1 — Frontend only.** No APIs, no Supabase, no database, no auth logic.
> Every screen runs on realistic mock/static data so the UI can be demonstrated
> end to end.

## Tech stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Charts | Hand-built SVG components (no chart dependency) |

## Run the project

```bash
cd mytechz-crm
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
```

Node 18.18+ (tested on Node 24).

---

## 1. Project folder structure

```
mytechz-crm/
├── app/                          # App Router pages
│   ├── layout.tsx                # Root layout → <AppShell>
│   ├── page.tsx                  # Dashboard
│   ├── loading.tsx               # Global loading skeleton
│   ├── not-found.tsx             # 404 / record-not-found
│   ├── leads/
│   │   ├── page.tsx              # Leads list
│   │   ├── loading.tsx
│   │   ├── new/page.tsx          # Add Lead form
│   │   └── [id]/page.tsx         # Lead details + activity timeline
│   ├── companies/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx         # Company details (tabbed)
│   ├── contacts/page.tsx
│   ├── calls/page.tsx
│   ├── followups/page.tsx
│   ├── pipeline/page.tsx         # Kanban board (drag & drop)
│   ├── reports/page.tsx
│   ├── team/page.tsx
│   ├── settings/page.tsx
│   └── search/page.tsx           # Global search page
│
├── components/
│   ├── ui/                       # Design-system primitives
│   ├── layout/                   # AppShell, Sidebar, Topbar, PageHeader, nav
│   ├── dashboard/                # KpiCard, ChartCard, TodaysFollowUps
│   ├── charts/                   # BarChart, DonutChart, LineChart, FunnelChart
│   ├── leads/                    # LeadForm, ImportLeadsModal
│   ├── companies/                # CompanyForm
│   ├── calls/                    # CallResultModal
│   ├── followups/                # AddFollowUpModal
│   ├── pipeline/                 # PipelineBoard
│   ├── search/                   # GlobalSearch (command palette)
│   └── ActivityTimeline.tsx
│
├── lib/
│   ├── types.ts                  # All domain TypeScript types
│   ├── constants.ts              # Centralised enums + badge tones + palette
│   └── utils.ts                  # cn(), date/currency/duration formatters
│
└── mock/                         # Mock data (kept separate from UI)
    ├── employees.ts
    ├── companies.ts
    ├── contacts.ts
    ├── leads.ts
    ├── calls.ts
    ├── followups.ts
    ├── industries.ts
    ├── notifications.ts
    └── index.ts                  # Aggregation: KPIs, chart data, search, timeline
```

## 2. Pages created

| Route | Page |
|---|---|
| `/` | Dashboard — 8 KPI cards, 6 charts, Today's Follow-ups |
| `/leads` | Leads list — search, 9 combinable filters, pagination, row actions |
| `/leads/new` | Add Lead — 3-section validated form |
| `/leads/[id]` | Lead details — contact/lead info, activity timeline, calls, follow-ups |
| `/companies` | Companies list — search, filters, Add Company modal |
| `/companies/[id]` | Company details — Overview / Contacts / Leads / Calls / Activities tabs |
| `/contacts` | Contacts list — search + filters |
| `/calls` | Call history — filters, Call Result modal |
| `/followups` | Follow-ups — Today / Upcoming / Completed / Missed tabs |
| `/pipeline` | Kanban sales pipeline — 9 stages, drag & drop (local state) |
| `/reports` | Analytics — date-range presets + 6 report charts + summary tiles |
| `/team` | Employee management — performance table |
| `/settings` | Company / Lead Status / Industries / Lead Sources / Call Status / Preferences |
| `/search` | Global search across companies, contacts, leads |
| `not-found` | Shared empty/404 state |

Global search is also available from the top bar on every page (`⌘K` / `Ctrl+K`).

## 3. Reusable components

**`components/ui/`**

- `Button` — variants (primary/secondary/outline/ghost/danger), sizes, icon slots, renders as `<button>` or `<Link>`
- `Card`, `CardHeader`, `CardBody`
- `StatusBadge` — single component for lead status, interest, call status, follow-up status, company status, priority and role (tones from `constants.ts`)
- `Avatar` — initials avatar
- `Modal` — portal dialog, ESC/scroll-lock, sizes, footer slot
- `Drawer` — slide-in panel (used for mobile filters + mobile sidebar)
- `FormField` + `TextInput` / `Textarea` / `Select` — labels, required marker, error/hint text
- `SearchBar` — debounce-free controlled search input with clear button
- `DataTable<Row>` — generic column-driven table, **auto-collapses to cards on mobile**, loading + empty states built in
- `Pagination` — page size selector + windowed page numbers
- `FilterPanel` — config-driven multi-filter panel, inline on desktop / drawer on mobile, active-filter chips, "Clear all"
- `Tabs` — underline tabs with counts
- `EmptyState`, `LoadingState` (`Skeleton`, `TableLoadingState`, `CardsLoadingState`, `Spinner`)
- `ConfirmDialog`
- `RowActions` — kebab dropdown menu for table rows

**`components/layout/`** — `AppShell`, `Sidebar` (collapsible + mobile drawer), `Topbar` (search, notifications, profile, quick action), `PageHeader` (title, breadcrumbs, actions)

**`components/dashboard/`** — `KpiCard`, `ChartCard`, `TodaysFollowUps`

**`components/charts/`** — `BarChart` (vertical/horizontal, multicolor, hover tooltip), `DonutChart` (legend + hover), `LineChart` (area + crosshair), `FunnelChart`

**Feature components** — `LeadForm`, `ImportLeadsModal` (4-step wizard), `CompanyForm`, `CallResultModal` (result-driven conditional UI), `AddFollowUpModal`, `PipelineBoard`, `GlobalSearch`, `ActivityTimeline`

## 4. TypeScript types (`lib/types.ts`)

Enums / unions: `Industry`, `LeadStatus`, `InterestLevel`, `CallStatus`,
`FollowUpStatus`, `UserRole`, `LeadSource`, `Priority`, `CompanyStatus`

Entities: `Employee`, `Company`, `Contact`, `Lead`, `Call`, `FollowUp`,
`Notification`

Support types: `KpiStat`, `SelectOption<T>`, `Column<Row>`

Derived types live in `mock/index.ts`: `DashboardKpi`, `CategoryDatum`,
`ActivityEvent`, `SearchResult`.

Centralised constants (`lib/constants.ts`) — never hard-coded in components:
`INDUSTRIES`, `LEAD_STATUSES`, `PIPELINE_STAGES`, `INTEREST_LEVELS`,
`CALL_STATUSES`, `FOLLOWUP_STATUSES`, `COMPANY_STATUSES`, `PRIORITIES`,
`LEAD_SOURCES`, `USER_ROLES`, plus a `*_TONE` badge-colour map for each.

## 5. Mock data files (`mock/`)

| File | Contents |
|---|---|
| `employees.ts` | 8 employees across all 5 roles; stats recomputed in `index.ts` |
| `companies.ts` | 24 companies spanning all 10 industries / 10 cities |
| `contacts.ts` | ~50 contacts, 1–3 per company, deterministically generated |
| `leads.ts` | 47 leads with a realistic status distribution → believable funnel |
| `calls.ts` | 62 calls over the last 14 days, linked to leads & employees |
| `followups.ts` | Follow-ups derived from leads + historical completed/cancelled ones |
| `industries.ts` | Industry metadata for the settings screen |
| `notifications.ts` | Top-bar notifications + `currentUser` |
| `index.ts` | Reconciles counts, builds all dashboard/report datasets, `globalSearch()`, `activityForLead()` |

All data is generated with a seeded PRNG so it is **stable between reloads**.
Relationships are consistent: every lead points to a real company + contact +
employee; company contact/lead counts are reconciled at load.

## 6. Responsive behaviour

- **Sidebar** — collapsible on desktop (icon rail), becomes a drawer under `lg`
- **Tables** — `DataTable` renders a real table on `md+` and a card list on mobile
- **Filters** — inline panel on desktop, filter **drawer** on mobile
- **Dashboard / KPI cards** — 4-up → 2-up → stacked
- **Pipeline** — horizontal scroll with fixed-width columns
- Page body never scrolls horizontally; wide content scrolls inside its own container

---

## 7. What to connect to the backend / API in Phase 2

Nothing in this repo talks to a server yet. The following is the wiring checklist.

### Data layer
- Replace every `import { … } from "@/mock"` with API calls / server components
  fetching from Supabase (or your API). The mock module boundary was designed to
  be the single swap point.
- Create Supabase tables for: `employees`, `companies`, `contacts`, `leads`,
  `calls`, `follow_ups`, `notifications`, and lookup tables for
  `lead_statuses`, `industries`, `lead_sources`, `call_statuses`.
- Move the derived datasets in `mock/index.ts` (KPIs, `leadsByIndustry`,
  `conversionFunnel`, `employeePerformance`, `callsPerDay`, …) into SQL
  views / RPC functions or a reporting endpoint.

### Auth
- Add Supabase Auth; gate the app in `middleware.ts`.
- Replace `mock/notifications.ts → currentUser` with the real session user.
- Enforce the `UserRole` permissions (Admin/Manager/Sales/Marketing/Viewer) —
  currently roles are display-only.

### Feature endpoints to build
| UI action | Needs |
|---|---|
| Add Lead form (`LeadForm`) | `POST /leads` (+ create/link company & contact) |
| Add Company (`CompanyForm`) | `POST /companies` |
| Import Leads wizard | file upload, column-mapping persistence, batch insert, dedupe |
| Call Result modal | `POST /calls`, update lead status/interest, create follow-up |
| Add / Reschedule / Complete follow-up | `POST/PATCH /follow-ups` |
| Pipeline drag & drop | `PATCH /leads/:id { status }` (persist stage changes) |
| Leads/Companies/Contacts/Calls lists | server-side pagination, filtering, sorting, `Export` (CSV) |
| Global search | full-text search endpoint (currently client-side over mock arrays) |
| Notifications | realtime channel + read/unread persistence |
| Settings | CRUD for lookup tables + org settings + user preferences |
| Dashboard / Reports | reporting API with the date-range parameters wired |

### Client-side plumbing
- Introduce a data-fetching layer (React Query / SWR or RSC + server actions).
- Add optimistic updates for status changes, follow-up completion, pipeline moves.
- Wire `Export` buttons to a real CSV/Excel export.
- Replace hard-coded "today" (`lib/utils.ts → TODAY_ISO`) with `new Date()`.
