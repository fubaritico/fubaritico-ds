# React Best Practices — Review Rules

> **ALL rules in this file are GLOBAL** — they apply to every file in the entire codebase
> (`apps/`, `packages/`, scripts, configs) without exception. When a rule specifies a file
> pattern, it means ALL files matching that pattern everywhere, not just in one package.
> JSDoc requirements from QUAL-003/004/005 apply here too — every interface, function,
> type, hook, param, and return value must be documented with JSDoc everywhere.

## Critical Violations (REACT-0xx)

### REACT-001: Inline arrow function as callback prop
- **Files**: All `*.tsx` (components, screens, pages)
- **Check**: No inline arrow functions passed as callback props in JSX
- **Forbidden**: `<Child onPress={() => doSomething(item)} />` — creates a new function reference every render
- **Required**: Declare the handler as a `useCallback` expression and pass it by name
  ```tsx
  const handlePress = useCallback(() => {
    doSomething(item)
  }, [item])

  <Child onPress={handlePress} />
  ```
- **For lists**: Create a wrapper component that receives the item and memoizes its own handler, or use a memoized factory
- **Exception**: One-shot config builders (e.g. modal action `onPress`) where the function is not a React prop rendered in a component tree
- **Rationale**: Inline arrows break `React.memo`, `useCallback` dependency chains, and cause unnecessary re-renders in children
