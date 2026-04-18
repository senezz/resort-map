# AI-Assisted Workflow

## Tools used

- **Claude Code** (VS Code extension) — main coding agent
- **Claude (web chat)** — architecture discussions, design review, decision-making, code review

## My approach

Before touching code, I used Claude (web) to discuss the task itself — not as a code
generator, but as a sounding board.

I chose Node+Express+TypeScript on the backend because it's what I've been building
up to in my portfolio, and because Express fits this well. For the frontend I stayed with React+TS+Vite which I use
daily. Vitest over Jest because Vite is already in the toolchain and Vitest runs
TypeScript without extra config.

Once decisions were made, I moved to Claude Code for actual implementation. My pattern throughout: one small
stage at a time, read the generated code, after each stage I review the generated code before committing. I plan to update this file as I go, not retrofit it at the end.

## Stages and prompts

### Stage 0 — Project skeleton

Asked Claude Code to scaffold a monorepo with backend (Node+Express+TS+Vitest+Supertest)
and frontend (Vite+React+TS+Vitest+Testing Library) workspaces, plus a root `run.sh`
accepting `--map` and `--bookings`.

The initial `run.sh` used inline env var syntax
(`MAP_PATH=$MAP_PATH BOOKINGS_PATH=$BOOKINGS_PATH npm run start ...`) which failed on
Windows Git Bash because `concurrently` spawns commands via `cmd.exe` there, and cmd
doesn't understand Unix-style inline env assignments. Since the vars were already
exported earlier in the script, the inline assignment was redundant — removed it,
relying on `export` for cross-platform propagation to child processes.

Verified end-to-end: `./run.sh` starts both backend (port 3001) and frontend (port 5173).

### Stage 1 — Backend: map parser and GET /api/map

<to be filled>

### Stage 2 — Backend: POST /api/bookings

<to be filled>

### Stage 3 — Backend tests

<to be filled>

### Stage 4 — Frontend: render map from API

<to be filled>

### Stage 5 — Frontend: booking flow

<to be filled>

### Stage 6 — Frontend: visual distinction for booked cabanas

<to be filled>

### Stage 7 — Frontend tests

<to be filled>

### Stage 8 — Documentation and polish

<to be filled>
