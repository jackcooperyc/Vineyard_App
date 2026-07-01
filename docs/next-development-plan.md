# Next Development Plan

**Date:** 2026-07-01  
**Context:** User feedback that Tasks, Equipment, and Irrigation UIs feel "undeveloped." This audit reconciles that perception with the codebase and proposes sequencing against Sprint 8 (intelligence layer).

**Related docs:** [roadmap.md](./roadmap.md) · [module-scope.md](./module-scope.md) · [sprint-8-plan.md](./sprint-8-plan.md)

---

## A) Current state — built vs missing

### Tasks (Sprint 2 — marked complete)

| Layer | Built | Missing / thin |
|-------|-------|----------------|
| **Routes** | `/tasks` list + status filters, `/tasks/new`, `/tasks/[id]` detail | No edit route; no block-scoped list URL in UI |
| **Domain** | `queries`, `actions` (create, quick-log, status workflow), `validators`, `constants` | No `updateTask` / `deleteTask`; `getTasks({ blockId })` exists but unused in pages |
| **Components** | Timeline grouping, filter bar, form, quick-log sheet, status badges/actions, list cards | No edit form; no block/type/search filters |
| **Integration** | Dashboard upcoming tasks; block detail task list; map drawer quick-log; `/field` one-tap log | Block detail "View all" links to `/tasks?status=ALL` (estate-wide, not block-scoped) |
| **Seed** | 4 demo tasks across 4 of 35 vineyard blocks | Sparse relative to estate size |

**Verdict:** Core v1 CRUD + workflow is **shipped**. Gaps are **edit metadata**, **block filtering**, and **data density** — not missing pages.

---

### Equipment (Sprint 3 — marked complete)

| Layer | Built | Missing / thin |
|-------|-------|----------------|
| **Routes** | `/equipment` list + status filters, `/equipment/new`, `/equipment/[id]` detail, `/equipment/[id]/edit` | — |
| **Domain** | `queries`, `actions` (create, maintenance log, status change, `updateEquipment`), `validators` | No delete/retire confirmation flow |
| **Components** | Filter bar, list card, form (create + edit), maintenance form, status actions, select field for tasks | No service-calendar view |
| **Integration** | Dashboard service-due section; task create/quick-log picker; equipment detail shows open tasks | **Not in mobile bottom nav** (buried under More); no `/field` equipment logging |
| **Seed** | 6 assets (1 retired) with 1 maintenance record | Enough to demo filters; thin history |

**Verdict:** Directory + maintenance logging works. **Edit asset metadata** shipped in Op-3; mobile discoverability remains low.

---

### Irrigation (Sprint 4 — marked complete)

| Layer | Built | Missing / thin |
|-------|-------|----------------|
| **Routes** | `/irrigation` hub (schedules / records / alerts), `/irrigation/schedules/new`, `/irrigation/schedules/[id]`, `/irrigation/schedules/[id]/edit`, `/irrigation/records/new`, `/irrigation/records/[id]` | — |
| **Domain** | `queries`, `actions` (create schedule/record, quick-log, `toggleScheduleActive`, `updateSchedule`), `validators`, `constants` | No hard delete (deactivate-only) |
| **Components** | View bar, filter bar, schedule/record/alert cards, forms, quick-log sheet, status badges, active toggle | — |
| **Integration** | Dashboard alerts; block detail schedule summary + recent records; map drawer quick-log; `/field` irrigation log; `?blockId=` hub filter | Most blocks still have **no** irrigation history |
| **Seed** | 3 active schedules; 3 imported records (blocks 3, 31, 32) | Most blocks have **no** irrigation history |

**Verdict:** Logging and alert logic exist. Feels empty due to **sparse seed**, **no schedule management UI**, and **records hub showing 3 items** against 35 blocks.

---

### Cross-cutting integration

| Surface | Operational modules present | Gaps |
|---------|----------------------------|------|
| **Dashboard** | Stat cards + conditional alert/task sections | Sections **hidden when empty** — quiet dashboard with thin seed reads as "nothing built" |
| **Block detail** | Quick-log task/irrigation, task list, irrigation summary | No terrain section (Sprint 8 Phase 3); weak deep-links to filtered module views |
| **`/field`** | Task + irrigation one-tap logging | No equipment touchpoint |
| **Map** | Drawer quick actions; open-task + overdue-irrigation overlays | No equipment/pump pins (Sprint 8 Phase 4) |
| **Nav** | Desktop sidebar: all modules | Mobile bottom nav: Map · Field · Tasks · Blocks · **More** → Dashboard, Equipment, Irrigation |

---

## B) Why the UI may feel empty

1. **Thin operational seed vs large estate** — 35 vineyard blocks but only 4 tasks, 3 irrigation records, and 3 schedules. Most list views show single-digit counts or empty states.
2. **Conditional dashboard sections** — Irrigation alerts, equipment service, and upcoming tasks render **only when data exists**. A healthy-looking estate with no overdue items shows stat cards alone.
3. **Mobile nav hierarchy** — Equipment and Irrigation are second-class (More menu). Users on phones land on Map/Field/Tasks and may never open Irrigation.
4. **Create-only ergonomics** — Tasks and equipment can be created and status-changed, but **cannot be edited** (title, dates, assignee, asset details). Incomplete workflows feel like stubs.
5. **Broken or weak deep links** — Block detail "View all tasks" does not scope to the block. Schedule cards skip schedule management entirely.
6. **Dead server action** — `toggleScheduleActive` exists with no UI, signaling unfinished irrigation admin.
7. **Roadmap perception mismatch** — `roadmap.md` and `module-scope.md` mark Sprints 2–4 complete while Sprint 8 (weather, 3D, reports) absorbs attention. Operational polish was never scheduled as its own sprint.
8. **Sprint 8 Phase 1 shipped** — 3D map and elevation drawer add intelligence visuals but do not populate task/equipment/irrigation lists.

---

## C) Prioritized next sprints

### Track 1 — Operational UI completion (recommended first)

**Goal:** Make existing modules feel finished without new domain concepts.

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| **Op-1** | Tasks polish | `updateTask` action + edit page; `?blockId=` filter on `/tasks` + block detail link fix; optional type filter chip | ✅ |
| **Op-2** | Irrigation admin | Schedule detail page; activate/deactivate toggle (wire `toggleScheduleActive`); edit schedule form; link block irrigation rows → record detail | ✅ |
| **Op-3** | Equipment polish | `updateEquipment` action + edit form; dashboard + irrigation-style empty states; optional "Log service" shortcut on dashboard | ✅ |
| **Op-4** | Density & discoverability | Expand seed script (tasks/schedules/records across ~10 blocks); dashboard empty-state CTAs; mobile More menu badges for alert counts | ✅ |

**Exit criteria:** Every operational entity supports create + read + update; block-scoped navigation works; fresh `db:seed` produces a dashboard that looks alive.

---

### Track 2 — Sprint 8 Phase 2+ (intelligence, per [sprint-8-plan.md](./sprint-8-plan.md))

| Phase | Status | Scope |
|-------|--------|-------|
| **Phase 1** | ✅ Done | 3D map, terrain, elevation drawer, `colorHex` |
| **Phase 2** | Next | Weather provider abstraction, dashboard weather card, environmental thresholds |
| **Phase 3** | Planned | Block detail terrain section, ViticultureMetrics schema, satellite placeholder |
| **Phase 4** | Planned | IrrigationPump CRUD + map pins, `/reports` CSV export |

**Recommendation:** Run **Op-1 + Op-2** in parallel with or immediately before Sprint 8 Phase 2. Weather and terrain add estate context but will not fix empty task/irrigation lists.

---

## D) Quick wins (< 1 day each)

| # | Change | Impact |
|---|--------|--------|
| 1 | Fix block detail link → `/tasks?blockId={id}` (add filter bar support or dedicated query param) | Correct block → tasks navigation | ✅ |
| 2 | Wire `toggleScheduleActive` on schedule list cards (active/inactive toggle) | Unblocks irrigation admin without new routes | ✅ |
| 3 | Link block irrigation record rows to `/irrigation/records/[id]` | Detail pages become reachable | ✅ |
| 4 | Dashboard empty states: "No overdue irrigation" with CTA to `/irrigation/schedules/new` (same pattern for tasks/equipment) | Dashboard feels intentional, not broken | ✅ |
| 5 | Show alert count badge on mobile More button when `irrigationAlerts > 0` or `equipmentNeedingService > 0` | Surfaces buried modules | ✅ |
| 6 | Add Equipment + Irrigation to dashboard Quick links (already has Field log / Full task form) | Desktop and mobile parity | ✅ |
| 7 | Seed 6–8 more tasks and 2–3 schedules on blocks without data | Lists populate on first clone | ✅ |

---

## E) Sequencing

```
Now (quick wins)
  ├── Block-scoped task link + schedule toggle + record deep links
  └── Dashboard empty states + seed density bump

Week 1–2: Op-1 (task edit + filters)
Week 2–3: Op-2 (irrigation schedule admin)
         └── Can overlap Sprint 8 Phase 2 (weather) — different files, low conflict

Week 3–4: Op-3 (equipment edit) + Op-4 (seed/nav polish)

Week 4+: Sprint 8 Phase 3 (block terrain on detail pages)
         └── Natural fit with block detail work from Op-1/Op-2 links

Week 5+: Sprint 8 Phase 4 (pumps + /reports)
         └── Reports reuses irrigation/task queries; build after Op tracks stabilize exports
```

### Decision gate

| If priority is… | Do first |
|-----------------|----------|
| Field crew daily use | Op-1 → Op-2 → seed density |
| Stakeholder demos / "smart vineyard" | Sprint 8 Phase 2 (weather) + Phase 3 (terrain on block detail) |
| Export / compliance | Sprint 8 Phase 4 (`/reports`) after Op-1 ensures task data is editable |

### Out of scope (defer to Sprint 9+)

- RBAC enforcement in UI
- Block CRUD admin
- Offline PWA
- ML / NDVI automation
- Labor hours YTD

---

## Appendix — file inventory (audit 2026-07-01)

```
src/app/(app)/tasks/          page, [id]/page, new/page
src/app/(app)/equipment/      page, [id]/page, [id]/edit, new/page
src/app/(app)/irrigation/     page, schedules/[id], schedules/[id]/edit, schedules/new, records/[id], records/new

src/domains/tasks/            actions, queries, validators, constants
src/domains/equipment/        actions, queries, validators, constants
src/domains/irrigation/       actions, queries, validators, constants

src/components/tasks/         8 components (form, timeline, quick-log, …)
src/components/equipment/     7 components
src/components/irrigation/    9 components

Integration: dashboard/page.tsx, blocks/[id]/page.tsx, field/page.tsx, map/block-map-drawer.tsx
```
