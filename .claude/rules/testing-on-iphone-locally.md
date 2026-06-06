# Testing on iPhone Locally

## Quick Start

```bash
pnpm dev:mobile    # builds, starts servers, waits for readiness, prints URL
```

1. Wait for "All servers ready!" message
2. Open `http://{LAN_IP}:3000` on iPhone Safari — **always start from home page**
3. Navigate to other pages from there
4. Ctrl+C to stop — `.env.local` auto-restored

```bash
pnpm dev:local     # safety net: manual restore if dev-mobile exited abnormally
```

---

## How It Works

### The Problem

iOS Safari blocks cross-port dynamic `import()` on LAN IPs. When the host on `:3000` tries to `import("http://192.168.x.x:3001/remoteEntry.js")`, Safari fails with "Could not connect to the server" — even though the URL is reachable via `fetch()` or direct navigation. Desktop browsers don't have this limitation.

### The Solution: Reverse Proxy

All remote assets are proxied through the host Express server on port 3000. The browser only ever talks to one origin — no cross-port issues.

```
iPhone → http://192.168.1.212:3000/_remote/home/remoteEntry.js
                  ↓ (Express proxy)
         http://localhost:3001/remoteEntry.js
```

### What `pnpm dev:mobile` Does (step by step)

1. **Detects LAN IP** — `ipconfig getifaddr en0` (macOS Wi-Fi)
2. **Backs up `.env.local`** → `.env.local.bak`
3. **Rewrites URLs** in `.env.local`:
   - `VITE_HOME_URL=http://localhost:3001` → `http://192.168.x.x:3000/_remote/home`
   - Same for media, photos, search — all through port 3000
4. **Builds production** — `vite build --mode production` bakes these proxy URLs into the bundles
5. **Starts Express servers** — host on 3000, remotes on 3001-3004
6. **Waits for readiness** — `wait-on` checks all 5 servers respond before printing URL
7. **On Ctrl+C** — trap restores `.env.local` from backup, kills servers

### Files Involved

| File | Role |
|---|---|
| `scripts/dev-mobile.sh` | Orchestrator: backup, URL rewrite, build, wait, restore |
| `scripts/dev-local.sh` | Manual restore fallback |
| `apps/host/server.js` | `/_remote/:app` reverse proxy (only when `DEV_MOBILE=true`) |
| `.env.local` | Temporarily rewritten with proxy URLs, restored on exit |
| `.env.local.bak` | Backup of original `.env.local` (gitignored) |

### The Reverse Proxy (host/server.js)

Only active when `DEV_MOBILE=true`. Maps URL paths to local ports:

| Request path | Proxied to |
|---|---|
| `/_remote/home/*` | `localhost:3001/*` |
| `/_remote/media/*` | `localhost:3002/*` |
| `/_remote/photos/*` | `localhost:3003/*` |
| `/_remote/search/*` | `localhost:3004/*` |

The proxy forwards status codes, headers, and body as-is. It skips `transfer-encoding` because Express handles chunking itself.

---

## Important Caveats

### Always Start from the Home Page

Opening a deep route directly (e.g. `/tv/2345`) on the first load **will fail**. The Module Federation runtime needs the home remote to load first to initialize shared singletons (react, react-dom, react-router-dom, @tanstack/react-query). Always:

1. Open `http://{LAN_IP}:3000` first (loads home)
2. Then navigate via the app UI to the page you want to test

### No Effect on Other Scripts

- `pnpm dev` — unchanged, uses localhost, `DEV_MOBILE` not set, proxy inactive
- `pnpm prod:server` — unchanged, `DEV_MOBILE` not set, proxy inactive
- CI/CD — `.env.production` points to Netlify, server.js not used

### Requirements

- iPhone and Mac on the **same Wi-Fi network**
- No firewall blocking ports 3000-3004

---

## Debugging (Safari Remote Inspector)

If something doesn't work, use Safari's remote debugger to see iPhone console errors:

### Setup (one-time)
1. **iPhone**: Réglages → Safari → Avancé → Inspecteur web → ON
2. **Mac**: Safari → Réglages → Avancé → cocher "Afficher les fonctionnalités pour les développeurs web"

### Usage
1. Connect iPhone to Mac via **USB cable**
2. Open the page in Safari on iPhone
3. On Mac: Safari → menu **Développement** → your iPhone name → select the tab
4. Console and Network tabs work like desktop DevTools

### Useful Console Commands

```javascript
// Test if fetch works (should return 200 + correct content-type)
fetch('/_remote/home/remoteEntry.js')
  .then(r => console.log(r.status, r.headers.get('content-type')))
  .catch(e => console.error(e))

// Test if dynamic import works
import('/_remote/home/remoteEntry.js')
  .then(m => console.log('OK', m))
  .catch(e => console.error('FAIL', e))
```

---

## What Was Tried and Failed

### Approach 1: `host: true` in Vite dev server
**Why it failed**: Vite dev mode `remoteEntry.js` uses root-relative paths (`/node_modules/.vite/deps/...`). When imported cross-origin, the browser resolves these paths against the host's origin, not the remote's origin. All sub-imports 404.

### Approach 2: LAN IP URLs in dev mode
**Why it failed**: Same root-relative path issue as above. The `remoteEntry.js` loads but its internal imports break.

### Approach 3: LAN IP URLs in production mode (direct cross-port)
**Why it failed**: iOS Safari specifically blocks cross-port dynamic `import()` on LAN IPs. `fetch()` works, direct navigation works, but `import()` fails with "Could not connect to the server". This is an iOS Safari-specific limitation — desktop browsers handle it fine.

### Approach 4: Reverse proxy (current solution)
**Why it works**: All requests go through port 3000. The browser sees a single origin. The Express proxy transparently forwards requests to the actual remote servers on localhost. iOS Safari has no issues with same-origin `import()`.

---

## iOS Safari Input Zoom Fix

iOS Safari auto-zooms when focusing an `<input>` with `font-size < 16px`. The fix is to use 16px on mobile:

```typescript
// packages/ui/src/Input/Input.tsx
'ui:h-8 ui:px-3 ui:text-base ui:sm:text-sm': inputSize === 'sm',
//                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                 16px on mobile (no zoom), 14px on desktop (sm: breakpoint)
```

This was the original reason for setting up mobile testing.
