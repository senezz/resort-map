# Improvements

Main cause was TypeScript compiler was type-checking test
files (`*.test.tsx`) during the production build, but those files
rely on Vitest globals (`test`, `expect`) that aren't declared in
the production tsconfig(TypeScript didnt see where did test and expect come from). Thats why `npm run build` command was failing on a clean checkout of the repository.

The fix was to exclude test files from the tsc compilation pass.
They continue to work through Vitest's own compiler when running
`npm test`. Added to `frontend/tsconfig.json`:

json"exclude": [
"src//*.test.ts",
"src//*.test.tsx",
"src/test-setup.ts"
]

Also i removed a leftover `App.test.tsx` file from the initial Vite
template — it wasn't exercising any real behavior and the actual
component tests live in `ResortMap.test.tsx`.

Verified: `npm install && npm run build` now completes without errors
on a clean checkout. `npm test` continues to pass.

## Security hardening

The initial implementation had several missing protections. Addressed them in one pass:

1. Payload size limit `express.json()` was using the 100KB default.
   Restricted to `10kb` since our largest request is a few hundred bytes.
2. Input length validation added explicit length guards on
   `cabanaId`, `room`, and `guestName` so oversized strings are rejected
   at the API boundary instead of reaching `guestStore.isValidGuest`.
3. CORS restricted replaced the open `cors()` with an explicit
   allow-list of just `http://localhost:5173`, 5174 and 5175 (the Vite dev server).
4. helmet middleware adds the standard set of defensive HTTP headers
   (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`,
   and others).
5. Rate limiting on bookings `express-rate-limit` at 20 requests
   per IP per 15-minute window on `/api/bookings`. Map endpoint left
   unrate-limited since it's a safe GET called on every render.
