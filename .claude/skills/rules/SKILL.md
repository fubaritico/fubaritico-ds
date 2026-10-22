---
name: rules
description: Load the rule files and known-issues slices a subject of the design system needs, from the one table the prompt hook also reads. Use when a subject comes up that the hook did not name, before reasoning about a package whose files are not open yet, at start-session for the subjects of next.md, after a compaction, or when the dev says "charge les règles", "rules", "va chercher les règles".
argument-hint: '[topic…] — components, styles, datatable, behaviors, stencil, tests, tooling, claude'
allowed-tools: Read Bash
metadata:
  author: fubaritico-ds
  version: '1.0'
---

# Rules — load what a subject needs

Since 2026-10-22 most of `.claude/rules/` is **path-scoped** (ported from europe-map): a rule loads only when
a file it names is read or written. Three triggers keep that from turning into forgetting:

| trigger                                               | when                                        | who                                     |
| ----------------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| `paths:` in a rule's frontmatter                      | a matching file is read or written          | Claude Code                             |
| the prompt hook, `.claude/hooks/rules-for-prompt.mjs` | a word of the dev's message is in the table | Claude Code, once per topic per session |
| **this skill**                                        | a subject the two above missed              | me                                      |

Still loaded at every session: `CLAUDE.md`, `next.md`, `completed.md`, the index `known-issues.md`,
`rules/decision-tree.md`.

## Steps

1. **Pick the topics** — from `$ARGUMENTS`, or from the subject at hand (the components and tickets under
   discussion; at start-session, those `next.md` points to). Keys and files: `.claude/skills/rules/topics.json`.
2. **Read each file of those topics** not already in context this session.
3. **Say it in one line**, French: _« Règles chargées : les composants (patterns-ui.md, known-issues/components.md…) »_.

## Keeping the table right

- **A new rule file or known-issues slice gets its topic in `topics.json` in the same change.**
- **A trigger word that loads the wrong thing is removed**, not argued for. Never: `tableau` (the Trello
  board), `carte` (the Card component), `ci` (« celui-ci »), `coin` (« dans un coin »), `contexte`.
- Tests: `node --test .claude/hooks/rules-for-prompt.test.mjs` — they read the real table and check that
  every file it names exists (a plan under `files/plans/` exists only on the dev's disk: git-ignored).
