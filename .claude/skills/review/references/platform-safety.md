# Platform Safety — Review Rules

> **ALL rules in this file are GLOBAL** — they apply to every file in the entire codebase
> (`apps/`, `packages/`, scripts, configs) without exception. When a rule specifies a file
> pattern, it means ALL files matching that pattern everywhere, not just in one package.
> JSDoc requirements from QUAL-003/004/005 apply here too — every interface, function,
> type, hook, param, and return value must be documented with JSDoc everywhere.

## Critical Violations (PLAT-0xx)

### PLAT-001: React Native imports in web files
- **Files**: `*.web.tsx`
- **Check**: No imports from `react-native`, `expo-*`, `twrnc`, or any RN-specific package
- **Forbidden**: `import { View, Text, Pressable, ... } from 'react-native'`
- **Forbidden**: `import tw from '../../lib/tw'`

### PLAT-002: HTML/DOM imports in native files
- **Files**: `*.native.tsx`
- **Check**: No HTML elements (`<div>`, `<span>`, `<button>`, `<input>`, etc.)
- **Forbidden**: `import { cn } from '../../lib/cn'`
- **Forbidden**: Any use of `className` prop

### PLAT-003: Renderer imports in shared packages
- **Files**: All shared/platform-agnostic files (hooks, shared packages, variants — e.g. `*.variants.ts`, `packages/shared/**`, any `hooks/` directory)
- **Check**: No imports from `react-native` OR `react-dom`
- **Check**: No `tw` or `cn` imports
- **These files must be pure TypeScript** — no renderer coupling

### PLAT-004: Forbidden classes in shared CVA variants
- **Files**: All `*.variants.ts`
- **Check**: None of these class patterns appear in variant definitions:
  - `hover:*`, `focus:*`, `active:*`, `focus-visible:*`
  - `group-*`, `peer-*`
  - `transition-*`, `duration-*`, `ease-*`, `animate-*`
  - `cursor-*`, `select-*`, `pointer-events-*`
  - `shadow-*`, `drop-shadow-*`
  - `ring-*`, `outline-*`

## High Violations

### PLAT-005: Missing platform file in component
- **Files**: All cross-platform component directories
- **Check**: Every component directory must have ALL of:
  - `ComponentName.tsx` (types only)
  - `ComponentName.native.tsx` (RN implementation)
  - `ComponentName.web.tsx` (DOM implementation)
  - `index.ts` (re-export)
- **Exception**: Components explicitly marked as platform-specific in docs

### PLAT-006: JSX in types file
- **Files**: All `*.tsx` types files in cross-platform component directories (NOT `.native.tsx`, NOT `.web.tsx`)
- **Check**: No JSX syntax, no `React.createElement`, no runtime code
- **Must contain**: Only type/interface exports and variant re-exports

### PLAT-007: StyleSheet mixed with tw
- **Files**: `*.native.tsx`
- **Check**: Do not combine `StyleSheet.create()` with `tw` in the same component
- **Pick one**: Either `tw` for all styles or `StyleSheet` for all styles (prefer `tw`)

## Medium Violations

### PLAT-008: String concatenation for classNames (web)
- **Files**: `*.web.tsx`
- **Check**: Use `cn()` for all className composition
- **Forbidden**: Template literals or `+` for className: `` className={`${base} ${extra}`} ``

### PLAT-009: Inline styles where tw should be used (native)
- **Files**: `*.native.tsx`
- **Check**: Avoid `style={{ color: '...', padding: ... }}` when tw classes exist
- **Prefer**: `style={tw`text-primary p-4`}`
