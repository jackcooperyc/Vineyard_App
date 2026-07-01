# Cooper Estate Vineyard Management
Founder Implementation Brief

## Project overview

Cooper Estate Vineyard Management is a web application for Cooper Wine Company designed to manage vineyard operations through a block-centered operational system. The platform should support vineyard data records, task tracking, equipment management, irrigation workflows, and an interactive map experience optimized for both office and field use.

The product should be built as a Next.js application, developed in Cursor, versioned in GitHub, and deployed through Vercel. The initial system should prioritize a strong operational foundation before advanced data integrations or 3D visualization are added.

## Product vision

The goal is to create a practical vineyard operating system that gives the team a clear, usable view of blocks, varietals, vine counts, planting history, equipment, irrigation activity, and field work. The app should be mobile-friendly and useful in real field conditions, with minimal-friction workflows for quick updates from the vineyard.

Every major workflow should connect back to a vineyard block. Blocks should act as the core organizational entity for viewing records, logging work, assigning equipment, reviewing irrigation history, and interacting with the vineyard map.

## Core modules

### 1. Vineyard database

The foundational database should capture the real structure of Cooper Estate Vineyards, including varietals, number of plants, year planted, vineyard location, and block assignment. This dataset should become the source of truth for the rest of the app.

Suggested foundational fields:

- Vineyard name
- Block ID
- Block name
- Varietal
- Number of vines or plants
- Year planted
- Rootstock, if relevant
- Location or GPS reference
- Vineyard notes
- Map geometry reference

### 2. Task management

The app should support vineyard work tracking such as pruning, spraying, harvesting, inspections, and notes. Users should be able to assign, update, and complete tasks while tying each task to a block and optionally to equipment.

Suggested task fields:

- Task type
- Status
- Assigned person
- Due date
- Completion date
- Related block
- Related equipment
- Notes and observations

### 3. Equipment management

The system should track tractors, sprayers, harvest equipment, and other operational assets. This module should support status monitoring, usage history, maintenance schedules, and possible assignment to tasks or blocks.

Suggested equipment fields:

- Equipment name
- Equipment type
- Serial or internal ID
- Maintenance status
- Last serviced date
- Next service date
- Usage history
- Task assignment linkage
- Notes

### 4. Irrigation workflows

The platform should allow planning and recording irrigation by block. This includes irrigation schedules, irrigation records, and future alerting based on missed events or environmental conditions.

Suggested irrigation fields:

- Related block
- Scheduled date
- Actual date
- Water volume
- Duration
- Method
- Notes
- Status
- Alert flag

### 5. Vineyard map

The app should include an interactive vineyard map with vineyard blocks as the main interactive unit. The map should support a simple, usable 2D mode first, with a path to future 3D support.

Map capabilities should include:

- Block visualization
- Block selection
- Block detail preview
- Color-coded overlays for status, irrigation, or work
- Block-linked quick actions
- Shared data model for both 2D and future 3D rendering

### 6. Mobile quick actions

The map should be mobile-optimized with tap-friendly interactions and a slide-up quick action interface. When a user taps a block, they should be able to log a task, mark work complete, add a note, or review irrigation details with minimal steps.

## User experience principles

The application should be built for real-world vineyard use, not just desktop administration. The field user experience should be treated as a first-class requirement.

Key UX principles:

- Mobile-first interaction design
- Large tap targets
- Outdoor-readable interface
- Quick task logging with minimal form friction
- Slide-up detail drawer for map interactions
- Fast navigation between blocks and operational actions

## Technical direction

- Frontend framework: Next.js
- Development environment: Cursor
- Version control: GitHub
- Deployment: Vercel
- Database: PostgreSQL with Prisma ORM
- Auth: Auth.js v5
- Map engine: Mapbox GL JS (2D first, 3D later)

## Architecture principles

- Use Block as the central operational anchor
- Keep domain boundaries clear: blocks, tasks, equipment, irrigation, map
- Build 2D mapping first, then 3D
- Support real data import early
- Avoid overengineering v1
- Build with phased delivery in mind

## Immediate build priorities

1. Define schema
2. Seed foundational vineyard data
3. Build block list and block detail interfaces
4. Add task tracking
5. Add irrigation and equipment workflows
6. Add 2D map
7. Integrate real vineyard data
8. Explore 3D and live integrations later

## Cursor kickoff prompt

"Initialize a production-ready Next.js application for Cooper Estate Vineyard Management. The app should center on vineyard blocks as the core operational entity and support foundational vineyard records, tasks, equipment management, irrigation workflows, and an interactive vineyard map. Use a phased architecture with PostgreSQL, Prisma, GitHub, and Vercel. Prioritize mobile-friendly field workflows, build 2D mapping first, and prepare the codebase for future 3D map support and real data imports."

## Execution note

This product should be built in layers. The first success is not a perfect vineyard operating system. The first success is a clean foundation with real block data, usable workflows, and an architecture that can expand without becoming brittle.
