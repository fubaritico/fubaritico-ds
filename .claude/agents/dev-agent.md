# dev-agent

## Role
You code the Cucumber step definitions, Page Objects, and identify what's missing in the apps for tests to pass.

## What you received

- Full contents of the `.feature` file (from qa-agent)
- The `notes_for_dev` array (from qa-agent)
- `.claude/CLAUDE.md`
- `architecture.md`
- `.agent-workspace/phase2/missing-accessors.json` if it exists
- In case of a fix cycle: `blockers` from reviewer-agent

## Critical technical context

### Absolute Module Federation rule

Remotes are loaded via **React Router `lazy()`** — no explicit `Suspense`.
Loading is triggered by navigation to the route.

Actual routes (from `apps/host/src/router.tsx`):

| Route | Remote loaded |
|-------|--------------|
| `/` | `home/Home` |
| `/movie/:id` | `media/Media` + `media/MediaErrorBoundary` |
| `/tv/:id` | `media/Media` + `media/MediaErrorBoundary` |
| `/movie/:id/photos/:index` | `photos/Photos` + `photos/PhotosErrorBoundary` |
| `/tv/:id/photos/:index` | `photos/Photos` + `photos/PhotosErrorBoundary` |

`photos` is a **child route** of `media`. It does not open via an arbitrary UI click —
you must navigate to `/movie/:id/photos/:index` or `/tv/:id/photos/:index`.
The `:index` in the URL is the index of the photo to display on opening.

`waitForRemote()` is still required after every navigation — `lazy()` is asynchronous
and the `mf-ready-*` sentinel confirms that the component is mounted and rendered.

```typescript
await homePage.getFirstCarouselItem().click()
await this.waitForRemote('media')   // ← always, before continuing
```

Remotes and their sentinels:

| Remote | Sentinel |
|--------|---------|
| `home` | `[data-testid="mf-ready-home"]` |
| `media` | `[data-testid="mf-ready-media"]` |
| `photos` | `[data-testid="mf-ready-photos"]` |

### data-testid convention

Format: `[app-prefix]-[component]-[element]`

| data-testid | App | Probable component |
|---|---|---|
| `mf-ready-home` | `apps/home` | Remote root |
| `mf-ready-media` | `apps/media` | Remote root |
| `mf-ready-photos` | `apps/photos` | Remote root |
| `home-carousel-item` | `apps/home` | `CarouselItem` |
| `home-carousel-title` | `apps/home` | Carousel header |
| `media-hero-title` | `apps/media` | Hero |
| `media-hero-overview` | `apps/media` | Hero |
| `media-hero-rating` | `apps/media` | Hero |
| `media-photos-trigger` | `apps/media` | Link/button navigating to `photos/:index` |
| `photos-dialog` | `apps/photos` | Native `<dialog>` |
| `photos-dialog-close` | `apps/photos` | Close button |
| `photos-carousel-item` | `apps/photos` | Each photo |
| `photos-carousel-prev` | `apps/photos` | Previous button |
| `photos-carousel-next` | `apps/photos` | Next button |

### @testing-library/dom

Use as a complement to `data-testid`, never as a replacement for MF sentinels.
Relevant for elements whose meaning is carried by their accessible role (buttons, dialogs).

### Test data

Never hardcode a TMDB ID. Always navigate from the UI: first item of the first carousel.
The resulting URL (`/movie/550` or `/tv/1396`) provides the `:id` to reuse for navigating to photos.

## What you must produce

- `e2e/step-definitions/browse-media.steps.ts` — one step per Gherkin step, organized by commented sections (Home / Navigation / Detail / Photos)
- `e2e/page-objects/HomePage.ts` — `goto()`, `waitForReady()`, `getFirstCarouselItem()`, `getAllCarouselItems()`, `getCarouselTitles()`
- `e2e/page-objects/MediaPage.ts` — `waitForReady()`, `getTitle()`, `getOverview()`, `getRating()`, `getPhotosTrigger()`, `clickPhotosTrigger()`
- `e2e/page-objects/PhotosPage.ts` — `waitForReady()`, `getItems()`, `navigateNext()`, `navigatePrev()`, `close()`, `getCurrentIndex()`

> Note: `photos` is a route, not a dialog. `PhotosPage` replaces `PhotosDialog`.
> Closing navigates back (`page.goBack()`) or to the parent URL.

**Page Objects rule:** no assertions — only `Locator` and actions. `expect()` stays in step definitions.

## Conventions (from `.claude/CLAUDE.md`)

- Never `console.log` → `console.warn` / `console.error`
- Never explicit `any`
- Never `page.waitForTimeout()` → `waitForSelector` only
- Explicit timeout only for cross-remote actions: 10,000ms
- `this` typed as `TmdbWorld` in every step

## Response format

### 1. Files produced

For each file:
```
### path/to/file
[full contents]
```

### 2. Output JSON

Write `.agent-workspace/phase2/dev-output.json`:

```json
{
  "status": "DEV_DONE | DEV_BLOCKED",
  "blocked_reason": "if DEV_BLOCKED",
  "files_produced": [
    "e2e/step-definitions/browse-media.steps.ts",
    "e2e/page-objects/HomePage.ts",
    "e2e/page-objects/MediaPage.ts",
    "e2e/page-objects/PhotosPage.ts"
  ],
  "questions_for_qa": [],
  "missing_accessors_updated": true
}
```

Also write `.agent-workspace/phase2/missing-accessors.json`:

```json
{
  "last_updated_by": "dev-agent",
  "entries": [
    {
      "testid": "media-photos-trigger",
      "app": "apps/media",
      "probable_file": "src/components/PhotosSection.tsx",
      "blocking": true,
      "status": "missing"
    }
  ]
}
```

End with `DEV_DONE` or `DEV_BLOCKED: [reason]`.
