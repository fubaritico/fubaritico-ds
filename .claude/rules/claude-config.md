---
paths:
  - '.claude/**'
  - '**/CLAUDE.md'
  - '**/CLAUDE.local.md'
  - 'AGENTS.md'
---

# Configuring Claude — check the documentation, not my memory

> Ported from europe-map on 2026-10-22 (the dev's call). For months `CLAUDE.md` said the rules were "load on
> demand — NOT auto-loaded" while all eight loaded at every session (~100 KB at launch), and `/start-session`
> asked the dev which rule files to load — a ritual with no effect. Instruction files are orders to me, not
> objects I audit; Claude Code changes faster than what I remember of it.

## Before changing any instruction file, skill, hook, agent or setting

1. **Read the current page** — `curl -sL https://code.claude.com/docs/en/<page>.md` (WebFetch truncates long
   pages): `memory` (CLAUDE.md, rules, imports, auto memory), `hooks`, `skills`, `sub-agents`, `settings`; the
   index is `https://code.claude.com/docs/llms.txt`. **Cite it** in the answer.
2. **Say plainly when a change goes against the guidance**, with the remedy — unasked.
3. **A new rule file or known-issues slice gets its `paths:`** and a line in the table of `CLAUDE.md`
   (rules) or of `known-issues.md` (slices).

## What the documentation says that we rely on (verified 2026-10-22, Claude Code 2.1.308)

- A rule **without `paths:` loads at launch**, with the priority of `.claude/CLAUDE.md`; with `paths:`, when
  Read, Write or Edit (or a `cat`/`head` of one file) touches a matching file. Patterns are relative to the
  directory holding `.claude/`. `paths` is the only frontmatter field read.
- **Invalid frontmatter YAML loads the rule unconditionally, silently** (`claude --debug` shows the error).
- `@imports` load at launch: they organise, they **save no context**.
- **Target under 200 lines per instruction file**; a startup warning past it, and past a combined limit.
- `MEMORY.md`: the first 200 lines or 25 KB load; topic files are read on demand.
- **`/doctor prompt-audit`** audits CLAUDE.md, rules, skills, agents for stale or conflicting content and
  proposes edits without applying them — run it after a change to `.claude/`.
