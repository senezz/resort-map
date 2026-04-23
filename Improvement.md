# Improvements

Main cause was TypeScript compiler was type-checking test
files (`*.test.tsx`) during the production build, but those files
rely on Vitest globals (`test`, `expect`) that aren't declared in
the production tsconfig(TypeScript didnt see where did test and expect come from). Thats why `npm run build` command was failing on a clean checkout of the repository.

The fix was to exclude test files from the tsc compilation pass.
They continue to work through Vitest's own compiler when running
`npm test`. Added to `frontend/tsconfig.json`:

```json"exclude": [
"src//*.test.ts",
"src//*.test.tsx",
"src/test-setup.ts"
]

Also i removed a leftover `App.test.tsx` file from the initial Vite
template — it wasn't exercising any real behavior and the actual
component tests live in `ResortMap.test.tsx`.

Verified: `npm install && npm run build` now completes without errors
on a clean checkout. `npm test` continues to pass.
```
