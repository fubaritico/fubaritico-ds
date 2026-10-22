---
name: end-session
description: Update the Session State in CLAUDE.md to reflect the current state of work before closing the session.
allowed-tools: Read Edit Bash
metadata:
  version: '1.1'
---

# End Session

Update the Session State in CLAUDE.md to reflect the current state of work before closing the session.

## Steps

1. **Get the real timings** — run `~/.claude/hooks/session-log.sh report "$PWD" 14`.
   Use its numbers in the `### Completed` entry instead of estimating: the **spans** (real working
   stretches) and the **files actually touched**. Never write a duration you guessed — a session left
   open overnight is not 14 h of work, and the report already accounts for that (it derives spans from
   action timestamps, ignoring the unreliable process start/end markers).
   If the chantier spans several days, say so explicitly in the entry (e.g. "chantier du 15 au 17/09,
   3 plages, 4h20") rather than dating it as a single day.
2. Read @.claude/CLAUDE.md to see the current Session State
3. Review the conversation history to identify:
   - What was completed this session (new items to add to `### Completed`)
   - What the next actionable step is (`### Next`)
   - Any new known issues surfaced (`### Known Issues`)
4. Edit the session files (`completed.md`, `next.md`, the known-issues slices):
   - `completed.md` — add this session's account on top (spans, the dev's words, my faults), short,
     **citing the tickets** (`STYLES-12`), never re-describing what the Fait ticket already says. **Two
     sessions at most**: the older one moves to `completed-archive.md`, verbatim
   - `next.md` — replace with the resume point: where we stopped, what is mid-flight, the tickets in
     À valider par le développeur / En cours / top of À faire — never a list of tasks (that is the board)
   - known-issues — a new entry goes in its slice `.claude/rules/known-issues/<place>.md` (the map is
     `known-issues.md`); one asking for an action gets its ticket (` — REACT-12`); a closed one moves to
     `known-issues-closed.md`, verbatim, never deleted
   - `.claude/` changed this session → run `/doctor prompt-audit` and go through its findings with the dev
     (`rules/claude-config.md`); only what he accepts is applied
5. **The Trello board — run the sync check of the `/trello` skill**: every ticket touched this session
   carries a comment saying where it stands; every ticket En cours / À valider is named in `next.md`;
   every plan, known-issue or `next.md` changed this session has its ticket, and every ticket it cites
   exists in a coherent column.
6. If a new architectural decision or stable pattern was established this session, update the relevant memory file in `.claude/projects/.../memory/` (e.g. `MEMORY.md`, `patterns.md`)
7. Propose all changes to the user before writing — do not write without confirmation
