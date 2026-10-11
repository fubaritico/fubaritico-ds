# fubaritico-ds

A multi-framework design system: framework-agnostic behaviour services (`@fubaritico/behaviors`),
CVA resolvers (`@fubaritico/variants`), a native BEM skin (`@fubaritico/styles`), design tokens
(`@fubaritico/tokens`) and the React components (`@fubaritico/react`). A Stencil sandbox
(`packages/stencil`) explores generating Web Components and Angular/Vue wrappers from one source.

- **Using the packages in another project** → [`INTEGRATION.md`](./INTEGRATION.md)
- **Per-component docs** → `packages/reference/src/components/<Component>/README.md`
- **Storybook** → `pnpm storybook:ref`

## Everyday commands

```bash
pnpm install
pnpm type-check && pnpm lint && pnpm test   # the gate — the pre-commit hook runs it too
pnpm storybook:ref                          # React Storybook (reads the BUILT packages: rebuild + restart)
```

## Publishing a release

Packages go to **GitHub Packages** (scope `@fubaritico`). A release takes **two steps**, deliberately
separated: **versioning** happens on your machine, **publishing** only in GitHub Actions. Nothing
is ever published from a laptop.

### 0. Before you start

- `main` is clean and green: `git status` shows nothing, CI passed on the last push.
- **Commit types drive the changelog.** Lerna writes `CHANGELOG.md` from conventional commits:
  `feat` → _Features_, `fix` → _Bug Fixes_. Anything else (`test`, `docs`, `chore`, `refactor`)
  does not appear. A bug fix shipped under `test(...)` gives "Version bump only". Use `fix` for
  anything a consumer would call a fix, even when the commit is mostly tests.
- Pick the bump: **patch** (`0.4.0 → 0.4.1`) for fixes only, **minor** (`0.4.x → 0.5.0`) for new
  features or anything a consumer must adapt to. While we are in `0.x`, breaking changes also go
  in a minor.

### 1. Version (local): `pnpm exec lerna version <patch|minor> --yes`

In one command, Lerna:

1. finds the packages **changed since the last tag** (`v0.4.0`). Lerna runs in **fixed mode**
   (`lerna.json`), so every package that moves gets the same number. Which ones move depends on
   the bump: a **patch** moves only the changed packages (0.4.1 moved `react` alone), but a
   **minor while in `0.x`** counts as breaking and moves **all** of them (0.5.0 moved all five,
   unchanged `tokens` and `variants` included, with "Version bump only");
2. writes the new version into their `package.json` and into `lerna.json`;
3. generates the `CHANGELOG.md` files from the commit messages;
4. commits `chore(release): vX.Y.Z`, tags `vX.Y.Z` and **pushes both**.

Then check the release commit before going further:

```bash
git show --stat HEAD
```

Expect `lerna.json`, the bumped `package.json` files and the `CHANGELOG.md` files. If
`pnpm-lock.yaml` shows a large diff, it was reformatted; inspect it before publishing. Also read
the generated changelog. If it says "Version bump only" while you shipped fixes, complete it by
hand in a follow-up `docs(...)` commit. **Never** amend or re-tag a pushed release.

> **Do not interrupt `lerna version`.** Stopped halfway, it leaves modified files with no commit
> and no tag (it happened at 0.4.0). Restore them with `git restore .` and run it again.

### 2. Publish (CI): the `Release` workflow

```bash
gh workflow run release.yml -f dry_run=true    # optional rehearsal: packs, reports, publishes nothing
gh workflow run release.yml -f dry_run=false   # the real thing
gh run list --workflow release.yml --limit 1   # get the run id
gh run watch <run-id> --exit-status            # follow it to the end
gh run view <run-id> --log | grep "+ @fubaritico/"   # proof: one line per package published
```

The workflow (`.github/workflows/release.yml`) checks out `main`, builds the packages and runs
`pnpm publish` on them. It does **not** run the tests: they already ran in the pre-commit hook
and in `ci.yml` on the push. Private packages (`shared`) and versions already on the registry are
skipped, so **re-running it is safe**.

You can also launch it without the CLI: GitHub → _Actions_ → _Release_ → _Run workflow_.

### 3. After

- Tell the consumers. For `europe-map`, a `HANDOFF-from-fubaritico-ds.md` at its root says what
  moved, why, and what to check.
- They pick it up with `pnpm update @fubaritico/react` (a `^0.4.0` range accepts `0.4.1`; a minor
  needs the range raised).
