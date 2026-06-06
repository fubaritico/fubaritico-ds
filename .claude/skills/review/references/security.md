# Security — Review Rules

> **ALL rules in this file are GLOBAL** — they apply to every file in the entire codebase
> (`apps/`, `packages/`, scripts, configs) without exception. When a rule specifies a file
> pattern, it means ALL files matching that pattern everywhere, not just in one package.
> JSDoc requirements from QUAL-003/004/005 apply here too — every interface, function,
> type, hook, param, and return value must be documented with JSDoc everywhere.

## Critical Violations (SEC-0xx)

### SEC-001: Hardcoded secrets or credentials
- **Files**: All (except `.env*`)
- **Check**: No API keys, tokens, passwords, or connection strings in source code
- **Patterns**: Strings matching `sk-*`, `pk-*`, `supabase.*key`, `password =`, `secret =`
- **Exception**: `.env.example` with placeholder values

### SEC-002: SQL injection risk
- **Files**: All files using Supabase client or raw queries
- **Check**: No string interpolation in `.rpc()`, `.from()` filters, or raw SQL
- **Must use**: Parameterized queries, Supabase query builder methods

### SEC-003: XSS via dangerouslySetInnerHTML
- **Files**: `*.web.tsx`, `*.tsx` (web context)
- **Check**: No use of `dangerouslySetInnerHTML` without sanitization
- **If unavoidable**: Must use DOMPurify or equivalent sanitizer

### SEC-004: Eval or Function constructor
- **Files**: All
- **Check**: No `eval()`, `new Function()`, `setTimeout(string)`, `setInterval(string)`

## High Violations

### SEC-005: Insecure storage of sensitive data
- **Files**: All (especially mobile)
- **Check**: No sensitive data in `AsyncStorage` or `localStorage` without encryption
- **Sensitive data**: tokens, passwords, PII, financial data
- **Must use**: `expo-secure-store` for mobile, encrypted storage for web

### SEC-006: Missing input validation at boundaries
- **Files**: Form handlers, API response consumers
- **Check**: User inputs must be validated (zod schema, type guard, or explicit check)
- **Check**: External API responses should be validated before use

### SEC-007: Deep link / URL scheme injection
- **Files**: Navigation config, deep link handlers
- **Check**: Deep link parameters must be validated before navigation
- **Check**: No unvalidated URL construction from user input

### SEC-008: Exposed error details
- **Files**: All
- **Check**: Error messages shown to users must not expose stack traces, internal paths, or system info
- **Check**: `catch` blocks must not re-throw raw errors to UI

## Medium Violations

### SEC-009: Console statements with sensitive data
- **Files**: All
- **Check**: No logging of tokens, passwords, user PII, or financial amounts
- **Note**: `console.log` is already forbidden (use warn/error) — but even warn/error must not log secrets

### SEC-010: Missing HTTPS enforcement
- **Files**: API clients, fetch calls
- **Check**: All URLs must use `https://` — no `http://` except `localhost` in dev

### SEC-011: Overly permissive CORS or permissions
- **Files**: API config, app.json (permissions)
- **Check**: Only request permissions actually needed
- **Check**: CORS should not be `*` in production configs

## API-Specific Violations

### SEC-013: Route missing requireAuth middleware
- **Files**: `apps/api/src/routes/*.ts`
- **Check**: Every router must call `router.use(requireAuth)` at the top — no unprotected data routes
- **Exception**: `/health` endpoint (mounted directly on `app`, not on a router)

### SEC-014: Service role key exposed to client
- **Files**: All (except `apps/api/`)
- **Check**: `SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in client-side code, configs, or bundles
- **Check**: No import of `apps/api/src/lib/supabase` from packages or other apps

### SEC-015: Supabase query missing user_id filter
- **Files**: `apps/api/src/routes/*.ts`
- **Check**: Every `.from()` query must include `.eq('user_id', res.locals.userId)`
- **Check**: Every `.rpc()` call must pass `p_user_id: res.locals.userId`
- **Rationale**: Service role key bypasses RLS — user_id filtering is the access control

### SEC-016: Unvalidated request body/query
- **Files**: `apps/api/src/routes/*.ts`
- **Check**: POST/PUT handlers must use `validateBody(Schema)` middleware
- **Check**: GET handlers with query params must use `validateQuery(Schema)` middleware
- **Check**: No `req.body` or `req.query` access without prior Zod validation

## Low Violations

### SEC-012: Outdated security patterns
- **Files**: All
- **Check**: No deprecated crypto APIs, no MD5/SHA1 for security purposes
- **Check**: No `Math.random()` for security-sensitive operations (use `crypto.getRandomValues`)
