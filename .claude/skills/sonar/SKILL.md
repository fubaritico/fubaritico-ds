---
name: sonar
description: Fetch and display the SonarCloud analysis report for this project (quality gate + open issues by severity).
allowed-tools: Bash
metadata:
  version: "1.0"
---

# Sonar

Fetch and display the SonarCloud analysis report for this project.

## Project config (hardcoded — do not change)
- Project key: `fubaritico-ds`
- Organization: `fubaritico`
- API base: `https://sonarcloud.io`

## Steps

1. Extract SONAR_TOKEN from `.env` — never print it:
   ```bash
   grep -E "^SONAR_TOKEN=" .env | cut -d= -f2-
   ```
   If empty → tell the user to add `SONAR_TOKEN=<token>` to `.env` and stop.

2. Fetch quality gate status:
   ```bash
   curl -s -u "$(grep -E '^SONAR_TOKEN=' .env | cut -d= -f2-):" \
     "https://sonarcloud.io/api/qualitygates/project_status?projectKey=fubaritico-ds"
   ```

3. Fetch all open issues (sorted by severity, up to 500):
   ```bash
   curl -s -u "$(grep -E '^SONAR_TOKEN=' .env | cut -d= -f2-):" \
     "https://sonarcloud.io/api/issues/search?projectKeys=fubaritico-ds&organization=fubaritico&ps=500&resolved=false&s=SEVERITY&asc=false"
   ```

## Display format

### Quality Gate
`✅ PASSED` or `❌ FAILED` — list each failing condition with actual vs threshold.

### Issues by severity
Group issues in this order:
- 🔴 BLOCKER
- 🔴 CRITICAL
- 🟠 MAJOR
- 🟡 MINOR
- ⚪ INFO

For each issue: `file:line — message (rule)`
Strip the `fubaritico-ds:` prefix from component names for readability.

### Summary table
| Severity | Count |
|---|---|
| 🔴 Blocker | N |
| 🔴 Critical | N |
| 🟠 Major | N |
| 🟡 Minor | N |
| ⚪ Info | N |
| **Total** | **N** |

## Error handling
- 401 → token invalid or expired
- 404 → project key not found
- Empty issues → "No open issues — quality gate is happy 🎉"
