# Resort Map

An interactive resort map where guests can view cabana availability and book cabanas poolside.

## Stack

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, TypeScript, Vite
- **Tests:** Vitest + Supertest (backend), Vitest + Testing Library (frontend)

## Prerequisites

- Node.js 18+
- npm

## Quick start

From the project root:

```bash
npm install
./run.sh
```

Opens the backend on `http://localhost:3001` and the frontend on `http://localhost:5173`.

![Resort Map screenshot](./screenshot.png)

## CLI arguments

Override the default map and bookings files:

```bash
./run.sh --map path/to/map.ascii --bookings path/to/bookings.json
```

Defaults are `map.ascii` and `bookings.json` in the project root.

## Running tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Project structure

```
resort-map/
├── backend/
│   └── src/
│       ├── services/   # mapLoader, bookingStore, guestStore
│       ├── routes/     # map, bookings
│       ├── app.ts      # Express app factory
│       └── index.ts    # startup / entry point
├── frontend/
│   └── src/
│       ├── api/        # fetch wrappers
│       └── components/ # ResortMap, MapTile, BookingDialog
├── map.ascii
├── bookings.json
└── run.sh
```

## Design decisions

The project is a monorepo with npm workspaces, so `npm install` and `./run.sh` work from a single root without entering subdirectories. On the backend, map parsing is a pure function with no side effects — it reads a string and returns data — kept separate from the Express routes and the in-memory booking store. This makes the logic easy to test without spinning up a server. The booking store is a plain closure over a `Map`, independent of the parsed map data, so the map itself stays immutable after startup. On the frontend, the entire API surface is two `fetch` calls wrapped in `client.ts`. The map view uses CSS Grid with fixed 32 px tiles — the simplest layout for a regular grid. State is three `useState` calls in `ResortMap`; no state library is needed for two endpoints and one modal.

## Trade-offs

- **One guest can book multiple cabanas** — the spec doesn't restrict this, so it isn't restricted here.
- **No persistence** — booking state resets on restart, as required by the spec.
- **No real auth** — knowing room number and guest name is sufficient, as specified.
