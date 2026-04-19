# AI-Assisted Workflow

## Tools used

- **Claude Code** (VS Code extension) - main coding agent
- **Claude (web chat)** - architecture discussions, design review, decision-making, code review

## My approach

Before touching code, I used Claude (web) to discuss the task itself not as a code
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
exported earlier in the script, the inline assignment was redundant removed it,
relying on `export` for cross-platform propagation to child processes.

Verified end-to-end: `./run.sh` starts both backend (port 3001) and frontend (port 5173).

### Stage 1 — Backend: map parser and GET /api/map

Split the backend into small files:

`types.ts` Tile, Cabana, MapData types
`services/mapLoader.ts` parses ASCII into data, plus a helper to read the file
`routes/map.ts` Express router with GET /map
`index.ts` reads env vars, loads the map, starts the server

Kept the parser as a pure function so I can test it with just a string later,
no need to touch the file system. For the router I used a factory that takes mapData as an argument. This way I
can pass fake data in tests instead of mocking file reads. Asked Claude Code to split lines with `/\r?\n/` instead of `\n` so Windows line
endings don't mess things up. First run crashed with `ENOENT: map.ascii not found`. The path in the error
pointed to `backend/map.ascii`, but the file is at the project root. Turns out `npm run --workspace=backend` changes the working directory into
`backend/` before running the command. So the relative path was being resolved
from the wrong place. Fixed it in `run.sh` turned MAP_PATH and BOOKINGS_PATH into absolute paths
before exporting them. After that it didn't matter where the backend started
from.

### Stage 2 — Backend: POST /api/bookings

Added three new files:

`services/guestStore.ts` loads guests from bookings.json, checks if
a (room, guestName) pair matches a real guest
`services/bookingStore.ts` keeps track of which cabanas are booked.
Uses a Map inside a closure so the state is truly private.
`routes/bookings.ts` POST /bookings handler
Also updated `routes/map.ts` to merge booking state into the cabana list
before sending the response.

Kept the map data and the booking state separate. The map is loaded once
and never changes. Bookings are mutable runtime state, stored in the
booking store. When GET /api/map is called, the route merges them into
one response. One source of truth for each kind of data.

Used guard clauses four checks in a row, each with an early return:
400(Missing or wrong-type fields);
404(Cabana not found on the map);
401(Guest credentials don't match);
409(Cabana already booked)
The happy path sits at the bottom. No try/catch, no nested ifs. Reads
like a checklist.

Also tested all of it with curl so successful booking returns 201 with the updated cabana,GET /api/map after booking shows `booked: true` with `bookedBy` and all four error paths return the correct HTTP codes

### Stage 3 — Backend tests

Before writing tests, split `index.ts` into two files:

`app.ts` builds and returns the Express app
`index.ts` reads env vars, loads data, creates stores, calls `createApp`,
and starts listen()
This way tests can import the app without triggering a real listen() on a port.

Wrote three test files:
`mapLoader.test.ts` tests the pure parser. Small hand-written maps
(3×2, 3×3) are easier to reason about than the real map.ascii.
`bookingStore.test.ts` fresh store is empty, booking works, double
booking throws, multiple bookings coexist.
`app.test.ts` full integration via supertest. Covers GET /api/map,
POST /api/bookings happy path, all four error codes (400/401/404/409),
and that GET reflects bookings after POST.

For integration tests, `mapData` and `guests` are built once at the top
they don't change. But `bookingStore` is created fresh in `createTestApp()`
for each test, so state doesn't leak between tests.

All tests pass on first run with `npm test` from the backend folder.

### Stage 4 — Frontend: render map from API

Copied the `assets/` folder into `frontend/public/assets/` so Vite serves
the images as static files. This way the frontend is self-contained and
the backend doesn't have to serve images.

Four new files:
`types.ts` mirrors the backend response shape (Tile, Cabana, MapData), copied by hand since this is a tiny project.
`api/client.ts` `fetchMap()` and `bookCabana()` using plain `fetch`.
No axios or another tools, two endpoints don't need a client library.
`components/MapTile.tsx` one 32×32 cell with a background image based
on tile type. Empty tiles render transparent.
`components/ResortMap.tsx` loads the map on mount, renders a CSS Grid,
handles loading/error/empty states.

The map is a rectangle of fixed-size cells. CSS Grid does exactly that with
two lines: `gridTemplateColumns: repeat(width, 32px)` and `gridAutoRows: 32px`.
Children render left-to-right, top-to-bottom in the order I give them.
Canvas or SVG would be overkill for static tiles.

Three separate useState flags (mapData, error, loading) instead of one
status object. For three independent booleans it's the simpler option.
Early returns for each state at the top of the render function keep the
happy path clean.

### Stage 5 — Frontend: booking flow

Built a single BookingDialog component that handles both cases:
If the cabana is free shows a form with room + guest name, submits to the API, keeps the modal open on error so the user can fix and retry.
If the cabana is already booked shows who booked it, with a Close button.

One component for both views because the content is simple and the behavior
(close on overlay / button) is the same. Two separate components would
duplicate the wrapper and styling.

The modal doesn't know about the map. `ResortMap` owns `selectedCabana` the modal only gets the cabana object and two callbacks (`onClose`,
`onBooked`). Clicks on cabana tiles set the state; the modal reads it.
Kept it as a single useState in ResortMap rather than lifting further or
using context one component needs this, no one else does.
After a successful booking I refetch GET /api/map instead of patching
local state. Simpler and guarantees the UI matches the backend. For a
small map the refetch cost is nothing.
Extracted the fetch logic out of useEffect into a named `loadMap` function
so it can be called both on mount and after a successful booking.

MapTile takes an optional `onClick`. ResortMap passes a handler only for
cabana tiles non-cabana tiles get `undefined` and stay non-interactive.
One MapTile component, conditional behavior driven by the parent.

Also tested manually Booked a cabana - modal closed, refetched map. Clicked same cabana again

- modal showed the booked-by info. Wrong guest name - modal showed the
  error from the server and stayed open. Cancel closed without booking.

### Stage 6 — Frontend: visual distinction for booked cabanas

Added conditional styling to MapTile: when `cabana.booked` is true, the tile
gets a semi-transparent red overlay (via `boxShadow: inset`) and a red border.
Free cabanas stay as the default monochrome drawing.

### Stage 7 — Frontend tests

<to be filled>

### Stage 8 — Documentation and polish

<to be filled>
