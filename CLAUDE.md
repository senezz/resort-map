# Resort Map — Code Test

## Context

This is a take-home code test for a Junior Engineer position at a HotelTech company in Poznań.

The evaluators value:

- **Simplicity** — clear, easy-to-understand solutions over clever but complex code
- **Conciseness** — directly solve the problem without unnecessary layers or abstractions
- **Adherence to standards** — follow language and framework conventions, write idiomatic code
- **Practicality** — make reasonable trade-offs; prioritize readability and maintainability
- **Right-sized design** — avoid both overly large "god" files and unnecessary abstraction layers
- **Tested behavior** — tests should demonstrate working features, not just serve as boilerplate

They explicitly warn against over-engineering.

## Task (summary)

Build a webapp that displays an interactive resort map (parsed from ASCII) and allows guests to book cabanas.

- **Backend:** REST API (Node.js + Express + TypeScript)
- **Frontend:** React + TypeScript + Vite
- **Tests:** Vitest + Supertest (backend), Vitest + Testing Library (frontend)
- **Single entrypoint:** `./run.sh` accepting `--map <path>` and `--bookings <path>`
- **In-memory state** (no DB, no persistence)
- **No real auth** — knowing room number + guest name is enough

## Map legend

- `W` = cabana (bookable, clickable)
- `p` = pool
- `#` = path
- `c` = chalet
- `.` = empty space

## Key design decisions (already made)

1. **1 symbol W = 1 cabana** — simplest reading of the spec
2. **Cabana id format:** `cabana-{y}-{x}` — deterministic, human-readable, no UUIDs
3. **Single map endpoint:** `GET /api/map` returns tiles + cabanas + booking state in one response
4. **Booking endpoint:** `POST /api/bookings { cabanaId, room, guestName }`
5. **In-memory booking store** on backend (resets on restart)
6. **Guest validation:** `(room, guestName)` pair must match an entry in bookings.json
7. **One guest can book multiple cabanas** — not restricted by the spec

## Principles for this codebase

- Keep it simple. When in doubt, choose the simpler option.
- No over-engineering. No premature abstractions. No unnecessary layers.
- Idiomatic Express and React code.
- Tests should test behavior, not boilerplate.
- Prefer readability over cleverness.

## Reference files in project root

- `TASK.md` — original task description (do not modify)
- `map.ascii` — sample map file
- `bookings.json` — sample guest list
- `assets/` — PNG images for map tiles
