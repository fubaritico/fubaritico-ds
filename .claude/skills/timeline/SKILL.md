---
name: timeline
description: Query the project's activity log — time really spent, work spans, chantiers spread over several days, most-touched files, the gap since the last session. Use when the user asks "combien de temps", "depuis quand", "on a passé combien sur X", "timeline", "historique", "quand est-ce qu'on a travaillé sur", how long something took, when work happened, or how much time went into a file or a component.
allowed-tools: Bash Read
metadata:
  author: fubaritico-ds
  version: '1.1'
---

# Timeline — query the activity log

Answers questions about **real working time** from `files/session-log.jsonl` (git-ignored), fed by the
time-stamping hooks (`~/.claude/hooks/session-log.sh`).

## Time model (do not confuse)

| Notion                | Definition                                                | Reliable? |
| --------------------- | --------------------------------------------------------- | --------- |
| **Technical session** | the Claude Code process (`session_start` → `session_end`) | **NO**    |
| **Work span**         | actions less than 90 min apart — the real work            | **YES**   |
| **Chantier**          | spans less than 48 h apart — may cover several days       | **YES**   |

**NEVER answer a duration based on the technical session.** A terminal left open overnight would give
« 14 h de travail » for 40 real minutes, and three `/clear` in a day would give three sessions for one day of
work. Spans are **derived from the actions' timestamps** — the only honest measure. When quoting a figure,
say which notion it comes from.

## Base command

```bash
~/.claude/hooks/session-log.sh report "$PWD" 30   # 30 = window in days
```

Prints: the chantier's state (in progress / interrupted, since when, total), the spans one by one, and the
most-touched files. It covers most questions — always start there.

## Recipes for finer questions

The log is JSONL: `{ts, epoch, ev, f?, cmd?}` with `ev ∈ edit|bash|session_start|session_end`. Always parse
with `fromjson?` to skip a corrupt line.

**Time spent on a file / a component** (spans holding ONLY actions on it):

```bash
jq -Rrn --arg pat 'DataTable' '
  [inputs | fromjson? | select(.ev=="edit" and (.f // "" | test($pat)))]
  | sort_by(.epoch)
  | reduce .[] as $e ([]; if (length==0) or ($e.epoch - .[-1].end > 5400)
      then . + [{start:$e.epoch,end:$e.epoch,n:1}]
      else .[:-1] + [{start:.[-1].start,end:$e.epoch,n:(.[-1].n+1)}] end)
  | "\(length) spans, \((map(.end-.start)|add)/3600*10|round/10) h, \(map(.n)|add) edits"
' files/session-log.jsonl
```

**Activity per day**:

```bash
jq -Rrn '[inputs | fromjson? | select(.ev=="edit")] | group_by(.ts[0:10])
  | map("\(.[0].ts[0:10]) — \(length) edits")[]' files/session-log.jsonl
```

**When was this file last touched?**

```bash
jq -Rrn --arg f 'next.md' '[inputs | fromjson? | select(.ev=="edit" and (.f//""|test($f)))]
  | last | .ts' files/session-log.jsonl
```

## Complete with git

The log only covers sessions **since the hooks were installed** (2026-09-16). For the earlier history,
cross it with git — which time-stamps everything committed:

```bash
git log --format='%ad %s' --date=format:'%Y-%m-%d %H:%M' -- <path>
```

The log and git are **complementary**: git knows the deep past but misses the sessions without a commit; the
log catches all the work, committed or not, but only since its installation.

## Gotchas

- **The log may not exist** (`files/session-log.jsonl` missing = hooks never fired in this project). Say so
  plainly rather than answer an invented figure, and fall back on git.
- **It is git-ignored** (`files/`): local to the machine, never shared, never committed.
- **Reads are not logged** — only `Edit`/`Write` and `Bash`. A session spent reading code looks empty: do not
  conclude « nothing was done », say « no change recorded in this span ».
- **The log is written relative to the cwd** (`<cwd>/files/session-log.jsonl`): a `cd` forks it into a second
  file the report never reads — hence CLAUDE.md's « never `cd` ». One such fork exists:
  `.claude/skills/files/session-log.jsonl` (5 actions, 2026-09-16).
- **The thresholds (90 min / 48 h) are constants** of the script (`SPAN_GAP`, `STREAK_GAP`). If a result looks
  absurd, check them before concluding.
