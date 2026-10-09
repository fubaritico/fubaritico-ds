# HeroImage — parked, not deleted

Suffixed `.bak` on 2026-10-09 so the TypeScript, ESLint and Vitest globs (which match `.ts` / `.tsx`)
skip it, while the code stays visible in the tree rather than only in git history.

**Why it was parked.** `HeroImageProps` takes a `backdropPath` described as coming "from the TMDB
API", so the component is domain-coupled to the project this design system was extracted from —
the same reason the MovieCard composites were removed in `5953964`. It also still carries 26
Tailwind `ui:` classes, which blocked the Tailwind-free v1 package.

**To revive it**, it needs the same treatment every shipped component got: drop the TMDB-specific
props for a neutral presentational API, migrate the Tailwind classes onto a BEM block in
`@fubaritico/styles` with a resolver in `@fubaritico/variants`, then add 5-level tests, a
story and a README. At that point it may well turn out to be a variant of `Image` rather than its
own component — worth deciding before rewriting it.

It also imports `getOptimizedImageUrl` from `@fubaritico/shared`, which the published
`reference` package no longer depends on.
