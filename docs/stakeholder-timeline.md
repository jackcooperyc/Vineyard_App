# Cooper Estate Vineyard App — Development Timeline

**For:** Neil Cooper, vineyard managers, and field stewards  
**Live app:** [https://cev.cupr.app](https://cev.cupr.app)  
**Last updated:** July 2026

---

## What this app is

Cooper Estate Vineyard Management is your team’s **operational command center** on Red Mountain. Everything ties back to a **vineyard block**—the same blocks you walk in the field. When someone logs a spray, records irrigation, or taps a block on the map, that work is linked to the real place it happened.

The app runs in a web browser on phones, tablets, and desktops. Your team signs in once and can move between the map, field log, task list, and irrigation records without juggling spreadsheets or paper.

**Who it’s for:**

- **Owners and managers** — see estate status, plan work, manage the team, run reports
- **Field crew** — log tasks, irrigation, and equipment service quickly from the vineyard
- **Office staff** — schedules, records, bulk updates, and exports
- **Read-only guests** — view the estate without changing records (auditor / visitor access)

---

## How this helps daily operations

| What your team does | Where in the app | How it helps |
|---------------------|------------------|--------------|
| See the whole estate | **Map**, **Blocks** | Satellite view of every block; hover for a quick summary; tap for actions |
| Log work in the field | **Field**, block quick-log | One-handed logging without driving back to the office |
| Plan and track jobs | **Tasks** | Due dates, assignments, filters, and bulk updates |
| Manage watering | **Irrigation** | Schedules, application records, overdue alerts |
| Maintain tractors and sprayers | **Equipment** | Service history, photos, and “needs service” reminders |
| Prove field coverage | **Field** (GPS under Tasks) | Track path and % complete while spraying, mowing, or weeding |
| Host visitors / tell the story | **Tours** | Map pins for milestones, tasting spots, photo ops, and more |
| Export for records | **Reports** | Download CSV summaries |
| Manage who can do what | **Settings → Team users** | Owners create accounts and assign roles |

---

## Development timeline (oldest to newest)

Each milestone below is **already live** on [cev.cupr.app](https://cev.cupr.app).

### Early 2026 — Digital vineyard directory

**What we built:** Secure login, dashboard, and a directory of all vineyard blocks with varietal and planting details.

**Why it matters:**

- One place to look up block codes, names, and what’s planted where
- Replaces scattered notes with a shared, always-current record
- Foundation for everything that followed

**Where to find it:** `/dashboard`, `/blocks`

---

### Early 2026 — Task tracking

**What we built:** Create, assign, complete, and filter vineyard jobs (pruning, spraying, inspection, and more).

**Why it matters:**

- Managers see what’s open, overdue, or due this week
- Crew can log a task from a block page in seconds
- Work history stays tied to the right block

**Where to find it:** `/tasks`, `/tasks/new`, block detail “Log task”

---

### Early 2026 — Equipment records

**What we built:** Asset list, maintenance logs, and service-due tracking for vineyard equipment.

**Why it matters:**

- Know when the sprayer or tractor was last serviced
- Link equipment to open tasks
- Avoid missed service intervals

**Where to find it:** `/equipment`

---

### Early 2026 — Irrigation logging

**What we built:** Per-block irrigation schedules, application records, and alerts when water is overdue.

**Why it matters:**

- Schedules remind the team when blocks expect irrigation
- Field crew can log “irrigated today” in one tap
- Overdue blocks surface on the dashboard and map

**Where to find it:** `/irrigation`, block detail quick-log

---

### Early 2026 — Interactive map

**What we built:** Satellite map with block outlines; tap a block to open a drawer with quick actions.

**Why it matters:**

- See the estate layout at a glance
- Jump from geography to logging without searching lists
- Switch between **Varietal** colors (what’s planted) and **Status** colors (tasks / overdue water)

**Where to find it:** `/map`

---

### July 2026 — Real Cooper Estate map data

**What we built:** Imported actual GPS boundaries for **35 vineyard blocks** and **12 infrastructure areas** from Cooper Estate survey data.

**Why it matters:**

- Map matches real field boundaries—not demo shapes
- Block list and map use the same codes your team already knows
- Terrain and elevation data available on block detail pages

**Where to find it:** `/map`, `/blocks`

---

### July 2026 — Field-friendly mobile design

**What we built:** Dedicated **Field log** screen and bottom navigation sized for phones and gloves.

**Why it matters:**

- Crew can log tasks and irrigation standing in the row
- Large buttons and simple tabs reduce mistakes outdoors
- Map · Field · Tasks · Blocks always one tap away

**Where to find it:** `/field`

---

### July 2026 — Complete the basics (edit and polish)

**What we built:** Edit tasks, irrigation schedules, and equipment details; clearer dashboard; richer sample data across the estate.

**Why it matters:**

- Fix typos and due dates without recreating records
- Turn irrigation schedules on or off as seasons change
- Dashboard looks active and purposeful, not empty

**Where to find it:** Task / irrigation / equipment edit pages, `/dashboard`

---

### July 2026 — Estate intelligence (3D, weather, pumps, reports)

**What we built:** 3D hillside map view, weather on dashboard and map, irrigation pump locations, and downloadable reports.

**Why it matters:**

- **3D map** helps visualize slope and block layout for planning
- **Weather** supports frost/heat awareness at a glance
- **Pump pins** show where water infrastructure sits relative to blocks
- **Reports** export tasks, irrigation, and maintenance for office use

**Where to find it:** `/map?view=3d`, `/dashboard`, `/pumps`, `/reports`

---

### July 2026 — Professional operations hubs

**What we built:** Deeper filters, calendars, pagination, delete-with-recovery, and expanded report types.

**Why it matters:**

- Find tasks by assignee, equipment, or block quickly
- Irrigation hub supports search and record status filters
- Equipment calendar shows upcoming service
- Mistaken deletes can be recovered within 48 hours

**Where to find it:** `/tasks`, `/irrigation`, `/equipment`, `/reports`

---

### July 2026 — Custom job types

**What we built:** Admin-configurable task types (labels, colors, quick-log defaults) and bulk task updates.

**Why it matters:**

- Match task categories to how Cooper Estate actually works
- Update many tasks at once (status, assignee, due date)
- Quick-log defaults save typing in the field

**Where to find it:** `/tasks/settings`, tasks hub bulk bar

---

### July 2026 — Safety net for deletes

**What we built:** Soft delete with 48-hour recovery for tasks, irrigation records, schedules, and maintenance logs.

**Why it matters:**

- Accidental deletes don’t mean permanent data loss
- Trash view on tasks and irrigation hubs for recovery

**Where to find it:** `/tasks?trash=1`, irrigation deleted view

---

### July 2026 — Task reminders

**What we built:** Optional email notifications for task assignment, status changes, and due/overdue reminders.

**Why it matters:**

- Managers and assignees stay informed without checking the app constantly
- Each user controls which emails they receive

**Where to find it:** `/settings/notifications`

---

### July 2026 — GPS field progress

**What we built:** Phone GPS tracking during tract work (spraying, mowing, weeding) with block coverage % and row progress.

**Why it matters:**

- See how much of a block is actually covered while work is in progress
- Coverage shows on task cards, task detail, dashboard, and map tracks
- Row-level progress when row layout data exists for a block

**Where to find it:** `/field` (GPS under Task tab), task detail pages, `/map`

---

### July 2026 — Simpler field screen

**What we built:** Field log reorganized into **Task**, **Irrigation**, and **Service** tabs; GPS tracking nested under Task.

**Why it matters:**

- Less clutter on the main field screen
- Clear path: pick block → log task → start GPS when needed
- Irrigation alert dismissal for resolved warnings

**Where to find it:** `/field`

---

### July 2026 — Jobs spanning multiple blocks

**What we built:** Assign one task to several blocks; “Begin task” starts work and GPS on the primary block.

**Why it matters:**

- One spraying job can cover Block 12 and Block 14 without duplicate entries
- Per-block GPS progress rolls up to the task summary
- “Begin task” on create skips the extra step of finding the task later

**Where to find it:** `/tasks/new`, `/field`, quick-log sheets

---

### July 2026 — Recent conveniences

**What we built:** Select-all for tasks and irrigation schedules; varietal filter on the Blocks list; edit pump location on the map; equipment photo uploads; mobile hub polish.

**Why it matters:**

- Bulk activate/deactivate irrigation schedules in one action
- Filter vineyard blocks by grape variety when planning work
- Correct pump pin placement without developer help
- Recognize equipment at a glance from photos

**Where to find it:** `/tasks`, `/irrigation`, `/blocks`, `/pumps`, `/equipment`, `/map`

---

### July 2026 — Team roles and block master data

**What we built:** Role-based access (Owner, Manager, Field Worker, Read Only), team user creation with temporary passwords, and in-app editing of block details, plantings, and field notes.

**Why it matters:**

- Owners control who can change schedules, retire equipment, or invite crew
- Field workers can log work without seeing admin-only settings
- Read-only accounts can tour the estate without risk of edits
- Managers can update plantings and notes without a developer

**Where to find it:** `/settings/users`, `/blocks/[id]/edit`, block detail notes

---

### July 2026 — Custom map spaces

**What we built:** Draw and name custom areas on the map (shops, storage, parking, and similar) as purple polygons separate from vineyard blocks.

**Why it matters:**

- Capture estate areas that aren’t grape blocks but still matter operationally
- Owners and managers can add or redraw spaces themselves

**Where to find it:** `/map` → **Add space** / **Spaces** (Owner or Manager)

---

### July 2026 — Vineyard tours map

**What we built:** Dedicated **Tours** page with droppable, draggable points of interest (milestones, family stories, tasting bars, photo ops, bathrooms, and more).

**Why it matters:**

- Plan visitor routes and storytelling stops on the same estate map
- Category icons make each stop easy to recognize
- Switch Status / Varietal / Tours overlays while planning

**Where to find it:** `/tours`

---

### July 2026 — Map clarity (varietal colors and hover info)

**What we built:** Vineyard polygons colored by grape variety by default; hover a block for a quick pop-up with name, variety, acreage, and open-task or irrigation cues.

**Why it matters:**

- See what’s planted where without opening every block
- Hover for a fast status check; tap when you need full actions
- Switch to **Status** mode when you want task/irrigation overlays instead

**Where to find it:** `/map` (Varietal is the default; Status toggle still available)

---

## What you can do today

A short checklist for Neil and the team:

1. **Open the map** — `/map` shows blocks in varietal colors; hover for a summary; switch to 3D or Status as needed.
2. **Log irrigation from the field** — `/field` → Irrigation tab → select block → “Irrigation applied today.”
3. **Create a multi-block spray task** — `/tasks/new` → select multiple blocks → check “Begin task now” for GPS.
4. **Check overdue irrigation** — `/irrigation` → Alerts view, or switch the map to **Status**.
5. **Export a report** — `/reports` → choose dataset → download CSV.
6. **Recover a deleted task** — `/tasks?trash=1` within 48 hours of deletion.
7. **Adjust task reminder emails** — `/settings/notifications`.
8. **Add a crew account** — `/settings/users` (Owner) → create user with a temporary password.
9. **Drop a tour stop** — `/tours` → tap the map → name and categorize the point.
10. **Draw a shop or storage area** — `/map` → **Add space** → draw polygon → save.

---

## Quick reference

| Feature | Where | Manager | Field |
|---------|-------|---------|-------|
| Block directory | `/blocks` | ✓ | ✓ |
| Interactive map | `/map` | ✓ | ✓ |
| Field quick-log | `/field` | ✓ | ✓ |
| Task hub | `/tasks` | ✓ | ✓ |
| Irrigation hub | `/irrigation` | ✓ | ✓ |
| Equipment | `/equipment` | ✓ | — |
| GPS tracking | `/field` (Task tab) | — | ✓ |
| Reports export | `/reports` | ✓ | — |
| Task types admin | `/tasks/settings` | ✓ | — |
| Notification prefs | `/settings/notifications` | ✓ | ✓ |
| Irrigation pumps | `/pumps` | ✓ | — |
| Team users (Owner) | `/settings/users` | Owner | — |
| Block / planting edit | `/blocks/.../edit` | ✓ | — |
| Tours POIs | `/tours` | ✓ | View |
| Custom map spaces | `/map` | ✓ | View |

---

## Known gaps (honest limits)

- **Two blocks** (Blake’s House, Cowboy’s Place) do not yet have map polygons—they appear in the directory but not on the satellite map until boundaries are verified in the field.
- **GPS offline mode** is not available—tracking requires a live connection.
- **Email invites / password reset** are not built yet—owners create accounts and share temporary passwords securely.
- **Satellite / NDVI metrics** are reserved for a later phase (schema placeholder only).

---

*For technical sprint history and developer checklists, see [roadmap.md](./roadmap.md). For maintainers mapping milestones to commits, see [development-sources.md](./development-sources.md).*
