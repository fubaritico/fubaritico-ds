# Troubleshooting & Architectural Decisions

## Common Issues & Solutions

### Font paths broken in remotes
**Problem**: `@font-face` paths in `theme.css` are relative to wrong location in remotes.
**Solution**: `remote-input.css` imports `theme-no-fonts.css` instead of full theme.
**Applied to**: apps/media/src/remote-input.css, apps/home/src/remote-input.css

### Tailwind reserved class names
**Problem**: Using `container` conflicts with Tailwind's built-in `.container` utility.
**Solution**: Use custom names — `media-section` instead of `container`.
**Applied to**: Container component uses `media-section` for CSS nth-of-type targeting.

### Query key missing dynamic parameters
**Problem**: TanStack Query cache conflicts when queryKey omits dynamic params.
**Symptom**: Stale data shown when switching tabs, images missing on 2nd tab click.
**Solution**: Include ALL dynamic params in queryKey: `['trending', timeWindow]` not `['trending']`.
**Rule**: queryKey must uniquely identify the data.

### TypeScript errors with optional TMDB API fields
**Problem**: TMDB types use optional fields (`name?: string`), causes TS errors on required props.
**Solution**: Make UI component props optional, use `??` fallbacks (`name ?? 'Unknown'`).
**Applied to**: Talent component, Cast components.

### ESLint optional chaining warning
**Problem**: `!credits || !credits.crew` → ESLint warns (prefer-optional-chain).
**Solution**: `!credits?.crew` (more concise).

### Conditional hook calls (React rules violation)
**Problem**: Cannot call hooks conditionally.
**Solution**: Function overloads pattern:
```typescript
const query = mediaType === 'tv' ? useTVDetails : useMovieDetails
return query(contentId)
```
**Applied to**: useMediaDetails hook.

### Netlify CLI "multiple projects detected" in pnpm monorepo
**Problem**: `netlify deploy` scans the entire repo, finds all `package.json` files, and errors with "We've detected multiple projects inside your repository".
**Symptom**: Error even with `--site` and `--filter` flags set.
**Root cause**: `--filter home` does not match `@fubaritico-ds/home` (full package name required). And even with the correct name, detection runs before the filter applies.
**Solution**: Use `--cwd apps/<app>` to scope the CLI to a single `package.json`. Keep `--dir` as the full path from the repo root.
```bash
netlify deploy --prod --dir=apps/home/dist --site=$SITE_ID --no-build --cwd apps/home
```
**Rule**: `--cwd` = directory with the single `package.json`. `--dir` = full path to built assets from repo root.
**Applied to**: All 5 deploy workflows (deploy-home, deploy-host, deploy-media, deploy-photos, deploy-storybook).

### Sentry tracePropagationTargets CORS issue with third-party APIs
**Problem**: Setting `tracePropagationTargets` to a third-party API (e.g. TMDB) causes Sentry to inject `sentry-trace` and `baggage` headers. Third-party CORS policies block these → all API calls fail.
**Symptom**: TMDB returns `{"status_code":7,"status_message":"Invalid API key"}` — looks like auth but is actually CORS.
**Solution**: `tracePropagationTargets: []` — disables header injection on all outgoing requests.
**Rule**: Never target third-party APIs. Only use for services you control CORS headers of.
**Applied to**: all 4 instrument.ts files.

### TypeScript with NodeNext module resolution
**Problem**: Requires `.js` extensions for relative imports.
**Solution**: `import { foo } from './utils.js'` (write .js even though source is .ts).

### Cucumber.js does not support `.ts` config files
**Problem**: `@cucumber/cucumber` v11 throws `Unsupported configuration file extension ".ts"`.
**Solution**: Use `.cjs` extension (`cucumber.config.cjs`) with `module.exports` syntax.
**Rule**: If `package.json` has `"type": "module"`, config must be `.cjs` (not `.js`).
**Applied to**: packages/e2e/src/cucumber.config.cjs

### Cucumber.js ESM/CJS conflict with ts-node
**Problem**: `"type": "module"` in `package.json` makes `.ts` files ESM. `--require` with `ts-node/register` uses `require()` which fails with `ERR_REQUIRE_ESM`.
**Solution**: Remove `"type": "module"` from `packages/e2e/package.json` — the E2E package uses CommonJS via ts-node.
**Rule**: E2E test packages using `ts-node/register` + `--require` must not be ESM.

### Cucumber.js step timeout too short for MF remote loading
**Problem**: Default Cucumber step timeout is 5s. Module Federation remotes loaded via `lazy()` can take longer on cold start (first hit builds + fetches remote bundles).
**Symptom**: `Error: function timed out, ensure the promise resolves within 5000 milliseconds` on `waitForRemote()`.
**Solution**: Add `{ timeout: 15_000 }` to any step that waits for cross-remote navigation.
```typescript
Then<E2EWorld>('the home page is visible', { timeout: 15_000 }, async function () {
  await this.waitForRemote('home')
})
```
**Rule**: All steps calling `waitForRemote()` or navigating between MF remotes need explicit timeout >= 15s.

### Playwright `mf-ready-photos` sentinel "resolved to hidden"
**Problem**: Photos remote wraps content in `<div data-testid="mf-ready-photos">` but the child is a `<dialog>` shown via `showModal()` (top layer). Playwright considers the wrapping div "hidden" because dialog content is in the top layer, not in normal DOM flow.
**Symptom**: `waitForSelector('[data-testid="mf-ready-photos"]')` times out with "locator resolved to hidden".
**Solution**: For photos, wait for the `dialog[open]` element instead of the sentinel.
```typescript
await photosPage.getDialog().waitFor({ state: 'visible', timeout: 10_000 })
```
**Rule**: MF sentinels wrapping `<dialog>` top-layer content are not "visible" to Playwright. Use `dialog[open]` as the readiness check.

### Playwright strict mode violation on ambiguous selectors
**Problem**: `button[aria-label="Next"]` matches multiple elements (carousel nav in photos dialog + carousel navs in media page behind it).
**Symptom**: `locator.click: Error: strict mode violation: locator resolved to 3 elements`.
**Solution**: Scope selectors to the relevant container.
```typescript
// Bad: matches all "Next" buttons on the page
this.page.locator('button[aria-label="Next"]')
// Good: scoped to the dialog
this.getDialog().locator('button[aria-label="Next"]')
```
**Rule**: Always scope Playwright selectors to the nearest unique container, especially when `<dialog>` overlays other content.

### `wait-port` only accepts one port argument
**Problem**: `wait-port 3000 3001 3002 3003` only waits for port 3000 — extra arguments are ignored. Tests start before all servers are ready.
**Symptom**: `Failed to fetch dynamically imported module: http://localhost:3001/remoteEntry.js` — remote not built yet.
**Solution**: Use `wait-on` (already in devDeps) which supports multiple HTTP targets and waits for ALL to respond 200.
```bash
# Bad
wait-port 3000 3001 3002 3003
# Good
wait-on http://localhost:3000 http://localhost:3001 http://localhost:3002 http://localhost:3003
```
**Rule**: Always use `wait-on` with full HTTP URLs for multi-server readiness checks.
**Applied to**: root package.json `test:e2e` and `test:e2e:smoke` scripts.

### `prod:server` build race condition
**Problem**: `vite build --mode production & node server.js` (with `&`) starts the server before the build finishes. Server serves empty/stale `dist/` folder.
**Symptom**: 404s or stale content when tests run immediately after server starts.
**Solution**: Change `&` to `&&` so build completes before server starts. Lerna still runs all 4 apps in parallel.
```json
"prod:server": "vite build --mode production && node server.js"
```
**Rule**: Never `&` between build and serve — always `&&`.
**Applied to**: All 4 apps (host, home, media, photos).

### iOS Safari zoom on input focus
**Problem**: iOS Safari auto-zooms the viewport when focusing an `<input>` with `font-size < 16px`.
**Symptom**: Page zooms in when tapping the search input on iPhone, breaking the layout.
**Solution**: Use `text-base` (16px) on mobile, `text-sm` (14px) from `sm:` breakpoint up.
```typescript
'ui:h-8 ui:px-3 ui:text-base ui:sm:text-sm': inputSize === 'sm',
```
**Rule**: Any input that may appear on mobile must have `font-size >= 16px` below the `sm` breakpoint.
**Applied to**: `packages/ui/src/Input/Input.tsx` — `inputSize="sm"` variant.

### iOS Safari blocks cross-origin dynamic `import()` on LAN
**Problem**: Module Federation `import()` of `remoteEntry.js` from a different port (e.g. `192.168.1.212:3000` → `192.168.1.212:3001`) fails on iOS Safari with "Could not connect to the server" / "Importing a module script failed", even though the file is accessible via direct navigation and `fetch()`.
**Symptom**: Host loads on iPhone but all remotes fail. Works fine on desktop browsers.
**Root cause**: iOS Safari handles cross-port dynamic `import()` differently from desktop browsers on LAN IPs. The `<link rel="modulepreload">` tags also fail, blocking the import chain.
**What does NOT work**:
- `host: true` in Vite dev server — remotes use relative paths in `remoteEntry.js` that break cross-origin
- Direct LAN IP URLs in `.env.local` for dev mode — same relative path issue
- Direct LAN IP URLs for prod mode — iOS Safari blocks cross-port `import()`
**Solution**: Reverse proxy all remote assets through the host Express server on a single port. The host server proxies `/_remote/:app/*` to `localhost:{port}/*` when `DEV_MOBILE=true`. Build URLs point to `http://{LAN_IP}:3000/_remote/{app}/remoteEntry.js` — same origin, no cross-port issues.
**Workflow**: `pnpm dev:mobile` (see below).
**Note**: First page load may fail if remote servers aren't ready yet (cold start). Reload the page — subsequent loads work from cache.

### Mobile testing workflow (`pnpm dev:mobile`)
**What it does**:
1. Detects Mac's LAN IP automatically
2. Backs up `.env.local` to `.env.local.bak`
3. Rewrites `VITE_*_URL` to `http://{LAN_IP}:3000/_remote/{app}` (proxy through host)
4. Sets `DEV_MOBILE=true` and runs `pnpm prod:server` (production builds + Express)
5. On Ctrl+C, restores `.env.local` from backup

**How to use**:
```bash
pnpm dev:mobile          # builds + starts servers, waits for readiness, prints iPhone URL
# IMPORTANT: always open http://{LAN_IP}:3000 (home page) FIRST on iPhone
# Then navigate to other routes from there
# Ctrl+C to stop — .env.local auto-restored
pnpm dev:local           # safety net: manual restore if trap failed
```

**Important — always start from the home page**: Opening a deep route directly (e.g. `/tv/2345`) on the first load will fail. The Module Federation runtime needs the home remote to load first to initialize shared singletons (react, react-dom, etc.). Always navigate to `/` first, then use in-app navigation to reach other pages.

**Architecture**:
- `scripts/dev-mobile.sh` — orchestrates backup, URL rewrite, build, wait-on readiness, restore
- `scripts/dev-local.sh` — manual restore fallback
- `apps/host/server.js` — `/_remote/:app` reverse proxy (only when `DEV_MOBILE=true`)
- No changes to Vite configs — proxy is Express-only, production builds only

**Requirements**: iPhone and Mac on the same Wi-Fi network.

---

## Key Architectural Decisions

### Embedded Queries (Phase 4)
Each section fetches its own data via useQuery — no React Router loaders at page level.
- **Why**: parallel loading, independent cache, isolated error handling, progressive UX
- **Applied to**: MediaHero, Synopsis, Crew, Cast

### CSS Alternating Section Backgrounds
All `Container` components use `variant="default"`. CSS controls backgrounds:
```css
.media-section:nth-of-type(odd) { background: white; }
.media-section:nth-of-type(even) { background: var(--muted); }
```
- **Why**: centralized styling, no hardcoded per-section variants
- **Applied to**: apps/media/src/index.css + remote-input.css

### Avatar Size Extension
Add size variants as needed. Current sizes: xs(24) sm(32) md(40) lg(48) xl(64) 2xl(96) 3xl(128).
- 2xl (96px) — actors / cast members
- 3xl (128px) — crew photos (Director)

### Optional Props for API-Driven Components
UI components accept optional props matching TMDB API reality.
Use `??` operator with sensible defaults.
- **Applied to**: Talent, Cast components

### Mock Data
Always use real TMDB data via curl for accurate structure:
```bash
curl "https://api.themoviedb.org/3/movie/278/credits" -H "Authorization: Bearer $TOKEN"
```
Mock data in `packages/shared/src/mocks/data/` typed with TMDB types.

### Storybook withRouter Decorator
Curried function accepting route parameter:
```typescript
decorators: [withRouter('/movie/278')]
```
Always add to stories using useParams. withQueryClient is in global decorators.
