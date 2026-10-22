---
paths:
  - "packages/reference/src/components/**"
  - "packages/styles/src/**"
  - "packages/variants/src/**"
  - "apps/storybook-react/stories/**"
---
# Compound Components Pattern (React 19) — packages/reference

> Split out of `patterns-ui.md` (200-line cap). Load it for any compound / context component
> (Avatar, Card, Tabs, Carousel, …). The generic template, file structure, `ComponentProps` rule and
> import order stay in `patterns-ui.md`. Reference implementation: `Avatar` (`AvatarContext`).

```typescript
const ComponentContext = createContext<ComponentContextValue | null>(null)

// MANDATORY: every context ships a dedicated access hook that encapsulates the read + guard.
// Sub-components NEVER call `use(Context)` inline — they call the hook.
//  - REQUIRED context (sub-component is meaningless without the parent) → THROW.
//  - OPTIONAL context (sub-component may render standalone) → return null (document why).
export function useComponentContext (): ComponentContextValue {
  const ctx = use(ComponentContext) // React 19: `use`, not `useContext`
  if (!ctx) throw new Error('Component.* must be used within <Component>')
  return ctx
}

export function ComponentName ({ children }: ComponentNameProps) {
  const [state, setState] = useState(...)
  const value = useMemo(() => ({ state, setState }), [state])
  // React 19: render the context directly as the provider (NOT `<Context.Provider>`).
  return <ComponentContext value={value}><div>{children}</div></ComponentContext>
}

function ComponentItem ({ children }: ComponentItemProps) {
  const { state } = useComponentContext() // dedicated hook, never `use(...)` inline
  return <div>{children}</div>
}

ComponentName.Item = ComponentItem
```

Rules (apply to ALL compound/context components — Carousel, Tabs, Avatar, …):

- **Dedicated access hook per context** (`useXxxContext`) — encapsulates the `use()` read + the guard.
  No sub-component reads a context inline. Required → `throw`; optional/standalone → `return null`.
- **React 19 idioms**: render `<Context value>` (the context **is** the provider — no `.Provider`);
  read with `use()` (not `useContext`); `ref` is a plain prop (no `forwardRef`); use `useEffectEvent`
  for consumer callbacks fired inside effects (keeps them out of deps → no over-firing).
- **Memoize** the provided value; **split contexts by change frequency** (stable config vs dynamic
  state) so a dynamic update doesn't re-render stable consumers. Precedent: `Avatar` (`AvatarContext`).
