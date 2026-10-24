---
name: release
description: Guided release of the @fubaritico packages to GitHub Packages — preflight, commit-type audit, lerna version bump, the Release workflow, proof of publication, consumer handoff. Use when the developer says release, publish, publier, bump the version, ship 0.x.y, or "fais une release".
disable-model-invocation: true
argument-hint: '[patch|minor]'
allowed-tools: Bash(git:*) Bash(gh:*) Bash(pnpm:*) Read Edit Write
metadata:
  author: fubaritico-ds
  version: '1.0'
---

# Release

**Source of truth: `README.md` → "Publishing a release".** This skill runs that procedure. It does
not replace it: if they disagree, fix the README first.

**Teaching mode, always.** The developer must stay able to release without you. Before each
command, say in one line **what it does and why**. After it, say **what to look at** in the output.
Show the real command, never a paraphrase. Keep it short; this is not a lecture.

**Two explicit "go"s from the developer**, never assumed and never carried over from an earlier
release: one before `lerna version` (it pushes a commit and a tag), one before the real publish
(irreversible: a published version cannot be reused).

## 1. Preflight

```bash
git status --short                     # must be empty
git fetch && git status -sb             # main, not behind/ahead of origin
gh run list --branch main --limit 3     # last CI run on main: success
git describe --tags --abbrev=0          # last release tag
```

Work is committed on `main` (`rules/architecture.md`): check the board (`/trello` `list`) — a ticket
**En cours** may have half its work on `main`; stop and ask the dev before releasing.

Stop and report if anything is red. Never release over a failing CI.

## 2. Audit the commits BEFORE bumping

```bash
git log --oneline $(git describe --tags --abbrev=0)..HEAD
```

The changelog is generated from commit **types**: only `feat` and `fix` appear (and `!` /
`BREAKING CHANGE` for breaking ones). For each commit, flag:

- a bug fix typed `test`, `refactor`, `chore` or `docs` → it will be **missing** from the
  changelog;
- a new capability not typed `feat` → same.

Report them in a table (commit · current type · what it really is). They are pushed, so do not
rewrite them. Plan a follow-up `docs(<scope>)` commit that completes the CHANGELOG after step 3.

Then **propose the bump**: `patch` if fixes only, `minor` if any `feat` or anything a consumer must
adapt to (breaking changes go in a minor while in `0.x`). Say which commits decide it. If an
argument was passed (`/release patch`), challenge it when the commits disagree.

**→ Ask for the first go.**

## 3. Version

```bash
pnpm exec lerna version <patch|minor> --yes
```

Narrate: packages changed since the last tag → new shared version (fixed mode) → `package.json` +
`lerna.json` → CHANGELOGs from the commits → commit `chore(release): vX.Y.Z` + tag → push.
Which packages move depends on the bump: a **patch** moves only the changed ones; a **minor in
`0.x`** counts as breaking in fixed mode and moves **all** of them ("Version bump only" on the
unchanged ones is then expected, not a missing changelog). Tell the developer which case it is.
In the handoff, remember that a consumer's `^0.x.y` range does NOT accept the next minor.

Verify, and show the developer what you check:

```bash
git show --stat HEAD                        # expect lerna.json, package.json(s), CHANGELOG.md(s)
git ls-remote --tags origin vX.Y.Z          # the tag reached GitHub
```

- `pnpm-lock.yaml` with a large diff → reformatted: inspect it before going on.
- A bumped package's CHANGELOG says "Version bump only" while step 2 found fixes → complete it with
  a `docs(<scope>): list the X.Y.Z fixes the changelog missed` commit, then push.
- **Never** amend the release commit or move a pushed tag.

## 4. Publish

Optional rehearsal (offer it on a first release or after workflow changes):

```bash
gh workflow run release.yml -f dry_run=true
```

**→ Ask for the second go**, then:

```bash
gh workflow run release.yml -f dry_run=false
gh run list --workflow release.yml --limit 1          # run id
gh run watch <run-id> --exit-status
gh run view <run-id> --log | grep "+ @fubaritico/"    # the proof
```

Narrate: the workflow checks out `main`, builds and publishes. It does **not** test: tests ran in
the pre-commit hook and `ci.yml`. Private (`shared`) and already-published versions are skipped,
so a re-run is safe. **The publication is proven only by the `+ @fubaritico/<pkg>@X.Y.Z` lines.**
A green run with no such line published nothing.

Then, on the board (`/trello`): `published X.Y.Z` — creates `[REPO] Release X.Y.Z` in Fait with every
« à publier » ticket in its checklist, and removes the label. Narrate it like the other commands. If the
proof line is missing, do NOT run it: nothing was published.

## 5. Handoff

Write `~/Desktop/WebstormProjects/europe-map/HANDOFF-from-fubaritico-ds.md` (untracked; they delete
it once read). **Read their code first.** Grep how they use what changed, and state the real
impact on them, not a generic one. Sections: what moved (packages, versions, the `pnpm update`
command; say if their `^` range accepts it), why (each fix and feature, its consumer-facing effect),
what to check on their side, nothing else to change (or what to change).

Close with a 3-line summary: version published, proof line, handoff written.

## Gotchas

- `lerna version` interrupted halfway leaves modified files with no commit and no tag (0.4.0
  incident). `git restore .` and rerun. Never "finish by hand".
- `lerna.json` says `version: X.Y.Z` (fixed mode); `CLAUDE.md` / older docs may say
  "independent". `lerna.json` wins.
- A publish refused by the permission classifier is an outward action: report it and let the
  developer run it (`! gh workflow run …`). Never work around it.
- Feedback memory: a fix shipped under `test(...)` produced "Version bump only" at 0.4.1. The
  commit audit (step 2) exists for that.
