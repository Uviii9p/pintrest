# Copilot instructions for this repository

Purpose
- Help AI contributors understand the codebase quickly and follow established patterns.

Big picture
 - Next.js App Router app in `app/` — root layout at [app/layout.tsx](../app/layout.tsx). The UI is client-driven with server-side API routes under `app/api/` (not a separate backend).
 - Client <> Server flow: UI components call the client helper `getAllPins()` in [lib/api.ts](../lib/api.ts), which calls internal API routes such as [app/api/pins/route.ts](../app/api/pins/route.ts). The server routes aggregate many public sources (Reddit, Pexels, Pixabay, Giphy, NASA, Picsum, YouTube via Invidious) and return a normalized `Pin` array.

Key files to inspect (examples)
 - Entry/layout: [app/layout.tsx](../app/layout.tsx)
 - Home page: [app/page.tsx](../app/page.tsx) — uses `getAllPins()` and lazy-loads the Lightbox.
 - Client API helper: [lib/api.ts](../lib/api.ts) — `getAllPins()` wraps `/api/pins`.
 - Server aggregator: [app/api/pins/route.ts](../app/api/pins/route.ts) — contains fetchers for each external source and the `safeFetch()` pattern.
 - Download proxy: [app/api/download/route.ts](../app/api/download/route.ts) — proxy for downloads with content-type handling.
 - Auth & persistence: [context/AuthContext.tsx](../context/AuthContext.tsx) — localStorage-backed mock auth and save/unsave logic.
- UI patterns: `components/Pin/PinCard.tsx`, `components/PinGrid/PinGrid.tsx`, `components/Header/Header.tsx`.

Important conventions and patterns
- App Router + Client Components: Files that run in the browser include the `use client` directive (e.g., `app/page.tsx`, `components/*`), expect React hooks and browser APIs.
- Server API routes: Use Node-style `fetch()` inside `app/api/*` with a `safeFetch()` helper that enforces an ~8s timeout and returns null on errors. Preserve this behavior when editing, to avoid adding blocking or uncaught network errors.
- Image handling: `PinCard` uses `next/image` with `unoptimized={true}` and an `onError` fallback to `picsum.photos`. Changes to image loading should keep the fallback and unoptimized behavior unless you also update `next.config.ts` remoteImagePatterns.
 - Lazy loading & Suspense: `Lightbox` is dynamically imported with `ssr:false` in [app/page.tsx](../app/page.tsx) — keep dynamic imports for heavy client-only components.
- Memoization: `PinGrid` is memoized (`React.memo`) to reduce re-renders; follow this pattern for list components.
- Local state persistence: `AuthContext` persists the mock user in `localStorage` under the key `pinterest_user` — don't break the storage schema without migrating code.

External integrations and gotchas
- Many public/demo API keys & endpoints are embedded in `app/api/pins/route.ts` (Pexels demo key, Pixabay demo key, Giphy public key, NASA demo key, Invidious instances). These are intentionally permissive; do not hard-replace them with production keys without adding configuration support.
- Rate limits and availability: The server aggregates multiple sources and rotates instances (e.g., Invidious). Keep or improve the existing fallback/resilience strategies — the app expects many sources to fail occasionally.
- NSFW sources: The server contains optional NSFW sources (Rule34, NSFW Reddit feeds). Be cautious when modifying or surfacing these; they are additive and currently soft-failed in code.

Developer workflows (commands)
- Install: `npm install`
- Dev server: `npm run dev` (or `npm run dev:safe` to change port)
- Build: `npm run build`
- Start prod: `npm start`
- There's a `force_start.bat` referenced as `npm run force-start` for platform-specific startup; inspect it before automated runs.

What AI agents should avoid changing without CI/owner confirmation
- Replacing `unoptimized={true}` or removing the `onError` fallback in `PinCard` — these were chosen for broad external image compatibility.
- Removing `safeFetch()` timeouts or changing `next: { revalidate: 3600 }` semantics used in server fetches without testing serverless behavior.
- Swapping API keys or removing demo keys without adding environment variable support in `next.config.ts` and `app/api/*`.

Small examples for quick edits
- To add a new external source: add a fetcher function in `app/api/pins/route.ts`, follow existing return type `Pin[]`, and include it in the aggregator. Keep the same error handling and slice limits.
- To add config for API keys: add env lookups (`process.env.MY_KEY`) and update `next.config.ts`/deployment docs; do not hardcode secrets.

If something is unclear or you need more details
- Tell me which area you want expanded (server routes, image handling, auth, or deployment scripts) and I will update this file with concrete code snippets or migration steps.

-- End of instructions
