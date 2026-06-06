# @fubaritico-ds/shared

Shared utilities and plugins for the vite-mf-monorepo project.

## Contents

### Utilities (`src/utils/`)

#### `retry.ts` - Retry with Exponential Backoff

Generic retry utility that executes a function with automatic retries and exponential backoff.

```typescript
import { retry } from '@fubaritico-ds/shared'

const result = await retry(
  async () => {
    // Your async operation that might fail
    return await fetchData()
  },
  {
    maxRetries: 3,      // Number of retry attempts
    retryDelay: 1000,   // Initial delay in ms (doubles each retry)
  }
)
```

**Exponential backoff**: If `retryDelay` is 1000ms:
- 1st retry: 1000ms delay
- 2nd retry: 2000ms delay
- 3rd retry: 4000ms delay

#### `healthCheck.ts` - Remote Health Check

Checks if a remote Module Federation app is available before loading it.

```typescript
import { checkRemoteHealth } from '@fubaritico-ds/shared'

const isAvailable = await checkRemoteHealth(
  'http://localhost:3001/remoteEntry.js',
  {
    maxRetries: 5,    // Default: 5
    retryDelay: 1000, // Default: 1000ms
    timeout: 5000,    // Default: 5000ms per request
  }
)

if (isAvailable) {
  // Safe to load the remote
}
```

### Tailwind Theme (`src/tailwind/`)

#### `theme.css` - Shared Design Tokens

Tailwind CSS v4 theme configuration using the `@theme` directive. Defines color tokens based on shadcn/ui Neutral palette in OKLCH format.

```css
@import '@fubaritico-ds/shared/src/tailwind/theme.css';
```

**Available tokens**:
- `--color-background`, `--color-foreground` - Base colors
- `--color-primary`, `--color-primary-foreground` - Primary action colors
- `--color-secondary`, `--color-secondary-foreground` - Secondary colors
- `--color-muted`, `--color-muted-foreground` - Muted/disabled colors
- `--color-accent`, `--color-accent-foreground` - Accent colors
- `--color-destructive`, `--color-destructive-foreground` - Error/danger colors
- `--color-card`, `--color-card-foreground` - Card component colors
- `--color-border`, `--color-input`, `--color-ring` - Form/border colors
- `--radius` - Default border radius

### Vite Plugins (`src/vite/`)

#### `notifyHostOnHmr.ts` - HMR Sync for Module Federation

See the [HMR Sync Plugin](#hmr-sync-plugin) section below for details.

## Usage

```typescript
// In vite.config.ts
import { notifyHostOnHmr } from '@fubaritico-ds/shared'

// In application code
import { checkRemoteHealth, retry } from '@fubaritico-ds/shared'
```

## Build

This package must be compiled before use:

```bash
pnpm --filter @fubaritico-ds/shared build
```

The compiled files are output to `./dist`.

## TypeScript Configuration

### Why this package needs special tsconfig options

The root `tsconfig.json` is configured for Vite-based apps with:

| Option | Root Value | Purpose |
|--------|------------|---------|
| `noEmit` | `true` | Vite handles compilation, TypeScript only type-checks |
| `allowImportingTsExtensions` | `true` | Allows `import './file.ts'` syntax |
| `moduleResolution` | `bundler` | Resolution strategy for bundlers like Vite |

But this package needs to be **compiled to JavaScript** because it's used in `vite.config.ts` files, which run in Node.js (not through Vite).

### Overridden options in this package

| Option | Value | Why |
|--------|-------|-----|
| `noEmit` | `false` | Generate JS files in `./dist` |
| `allowImportingTsExtensions` | `false` | Required when emitting JS (can't have `.ts` imports in output) |
| `moduleResolution` | `NodeNext` | Node.js ESM requires explicit file extensions |
| `module` | `NodeNext` | Generate ESM-compatible JavaScript |

### Why `.js` extensions in imports?

With `moduleResolution: "NodeNext"`, TypeScript requires explicit `.js` extensions:

```typescript
// ✅ Correct - even though the source file is .ts
import { foo } from './bar.js'

// ❌ Error with NodeNext
import { foo } from './bar'
```

This is because Node.js ESM **requires** explicit extensions. TypeScript understands that `./bar.js` refers to `./bar.ts` during compilation.

### The `tsconfig.tsbuildinfo` file

This file is a build cache created when `composite: true` is set. It speeds up incremental builds.

**If the build seems stuck or produces wrong output**, delete the cache and rebuild:

```bash
rm -rf packages/shared/dist packages/shared/tsconfig.tsbuildinfo
pnpm --filter @fubaritico-ds/shared build
```

## HMR Sync Plugin

### The Problem

In Module Federation with Vite, HMR doesn't work between host and remotes because:

1. The HMR WebSocket connection is established by the **host**
2. When a file changes in a **remote**, the remote's Vite server detects it
3. But the browser (displaying the host) doesn't know about it
4. Result: You have to manually refresh to see changes

### The Solution

Two plugins working together:

```
┌─────────────────┐         HTTP GET          ┌─────────────────┐
│   Remote App    │ ────────────────────────► │    Host App     │
│  (list/detail)  │   /on-child-rebuild       │                 │
│                 │                           │                 │
│ notifyHostOnHmr │                           │ listenForRemote │
│    (custom)     │                           │    Rebuilds()   │
└─────────────────┘                           └─────────────────┘
```

1. **Remote** (`notifyHostOnHmr`): On every HMR update, sends HTTP request to host
2. **Host** (`listenForRemoteRebuilds`): Receives request, triggers full page reload

### Why a custom plugin?

The `notifyOnRebuild` plugin from `@antdevx/vite-plugin-hmr-sync` uses Vite's `buildEnd` hook, which only triggers after a **complete build**. In dev mode with `vite dev`, Vite uses HMR without full rebuilds, so `buildEnd` is never called.

Our `notifyHostOnHmr` plugin uses `handleHotUpdate` instead, which fires on every HMR update.

### Note

This is **Live Reload** (full page refresh), not true HMR. True HMR would preserve React state, but that's not possible with Module Federation because modules are loaded dynamically from another server.

## See Also

- `apps/host/vite.config.ts` - Host-side plugin configuration
- `packages/list/vite.config.ts` - Remote-side plugin configuration
