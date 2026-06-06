---
name: review
description: Multi-agent code review for rules compliance, security, accessibility, quality, architecture, and React best practices. Produces JSON findings and iterates up to 3 times.
triggers:
  - review code
  - check compliance
  - run review
  - code review
---

# Review — Multi-Agent Code Reviewer

Orchestrates 6 parallel domain-expert subagents to review changed files against project rules.
Produces a structured JSON report with findings sorted by severity.

## Prerequisites

- `pnpm type-check && pnpm lint && pnpm test` must PASS before triggering review
- If any of those fail, fix them first — the reviewer assumes clean static analysis

## Execution Flow

### Step 1 — Scope Detection

Determine which files to review (priority order):

1. User-specified files/directories
2. Files changed on current branch vs main/master (`git diff --name-only main...HEAD`)
3. Staged files (`git diff --cached --name-only`)
4. Files in last commit (`git diff --name-only HEAD~1`)

Filter to only: `*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.json` (exclude `node_modules`, `build/`, `dist/`, lock files)

### Step 2 — Load Context

Read all files in scope. For each file, determine which reference guides apply:

- `.native.tsx` → platform-safety.md, accessibility.md
- `.web.tsx` → platform-safety.md, security.md, accessibility.md
- `*.variants.ts` → platform-safety.md (forbidden classes)
- `packages/ui/src/components/**` → architecture.md, quality.md
- `packages/tokens/**` → architecture.md
- `apps/api/src/routes/**` → security.md (SEC-013..016), architecture.md (ARCH-013..016), quality.md (QUAL-020..22)
- `apps/api/src/schemas/**` → architecture.md (ARCH-014), quality.md (QUAL-023)
- `apps/api/src/middleware/**` → security.md
- `apps/**` → security.md, quality.md, accessibility.md, react-best-practices.md
- All `*.tsx` → react-best-practices.md
- All files → quality.md

### Step 3 — Dispatch 6 Parallel Custom Subagents

Launch all 6 **custom subagents** simultaneously using the Agent tool. Each subagent is defined
in `.claude/agents/review/` and has its own system prompt with domain-specific rules.

Pass each subagent the list of files in scope as user message content (file paths + content).

Subagents (by `name` / `agent_type`):

1. **`review-platform-safety`** — cross-platform safety (RN in web, HTML in native, CVA classes)
2. **`review-security`** — security vulnerabilities (XSS, injection, secrets, auth)
3. **`review-architecture`** — architecture rules (layers, SOLID, component patterns)
4. **`review-quality`** — code quality (JSDoc, any types, console.log, dead code)
5. **`review-accessibility`** — WCAG 2.1 AA compliance
6. **`review-react`** — React best practices (memoization, composition, callbacks)

Each subagent returns ONLY a JSON array of findings (no prose). The finding schema
is defined in `references/schema.json`.

### Step 4 — Aggregate & Score

Merge all findings into a single report. Calculate scores:

```
category_score = max(0, 100 - (critical * 25) - (high * 10) - (medium * 3) - (low * 1))
```

Weights for overall score:

- Platform Safety: 20%
- Security: 20%
- Architecture: 15%
- Quality: 15%
- Accessibility: 15%
- React Best Practices: 15%

Verdict thresholds:

- 80-100 + no critical/high remaining → `ready`
- 60-79 → `needs-attention`
- < 60 → `needs-work`

### Step 5 — Report to User

Present findings grouped by severity (critical first), then by category.
Format as a readable table, followed by the score summary and verdict.

### Step 6 — Verify Ambiguous Findings (context7)

Before fixing, check findings where `needs_verification: true`:

1. Run the `verification_query` through context7 to confirm the finding is valid
2. If context7 confirms the issue → proceed with fix
3. If context7 shows the usage is correct → discard the finding, adjust score
4. This prevents false positives from outdated assumptions about library APIs

Common verification scenarios:

- Deprecated API detection (is this prop/method still valid in current SDK version?)
- Prop signature changes (did accessibilityState shape change?)
- Library-specific patterns (is this Supabase usage safe in current version?)
- Expo/RN version-specific behavior

### Step 7 — Fix Loop (max 3 iterations)

If verdict is NOT `ready`:

1. Fix all `critical` findings immediately
2. Fix `high` findings
3. Re-run affected agents only (not all 5) on modified files
4. Repeat up to 3 times total

### Step 8 — Handle Remaining Violations

If violations remain after 3 iterations:

- Present remaining violations to the user
- Ask: **store** (write to `review-results/`) or **ignore** (proceed without storing)
- If stored, write to `review-results/YYYY-MM-DD_HHmmss.json`

## Output Format

The final JSON report follows the schema in `references/schema.json`.

## Integration

This skill is triggered by the main agent after every code session that produces changes,
immediately after `pnpm type-check && pnpm lint && pnpm test` passes.

The main agent MUST NOT skip this step. The review is mandatory for:

- New components
- Modified components
- New packages or significant refactors
- Any changes to shared code (variants, hooks, utils)

Optional (user decides) for:

- Config-only changes (tsconfig, package.json)
- Documentation-only changes
- Changelog updates
