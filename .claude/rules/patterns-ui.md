# UI Component Patterns — packages/reference

## Component Template

```typescript
import clsx from 'clsx'

import { componentNameVariants } from '@fubaritico-ds/variants'

import type { ComponentNameSize, ComponentNameVariant } from '@fubaritico-ds/variants'
import type { ComponentProps } from 'react'

export type { ComponentNameSize, ComponentNameVariant } from '@fubaritico-ds/variants'

export interface ComponentNameProps extends ComponentProps<'div'> {
  /** What this prop controls. */
  propName?: string
  /** Size of the component. */
  size?: ComponentNameSize
  /** Visual look. */
  variant?: ComponentNameVariant
}

/**
 * ComponentName — one sentence on what it is and its presentational identity.
 *
 * @param props - ComponentName options.
 * @param props.size - Size; defaults to `'md'`.
 * @param props.variant - Visual look; defaults to `'primary'`.
 * @returns The rendered component.
 */
export function ComponentName ({
  className,
  propName,
  size = 'md',
  variant = 'primary',
  ...rest
}: ComponentNameProps) {
  return (
    <div
      className={clsx(componentNameVariants({ size, variant }), className)}
      {...rest}
    >
      {/* content */}
    </div>
  )
}

export default ComponentName
```

## Component with Types File (complex props)

Separate `ComponentName.types.ts` for discriminated unions (see Button):

```typescript
// ComponentName.types.ts
export type ComponentNameProps = ComponentAsVariantA | ComponentAsVariantB

// ComponentName.tsx
import type { ComponentNameProps } from './ComponentName.types'
export function ComponentName ({props}: ComponentNameProps) { ... }
```

## File Structure

```
packages/reference/src/components/ComponentName/
├── ComponentName.tsx       # `export function ComponentName` + `export default ComponentName`
├── ComponentName.types.ts  # Only if props are complex (discriminated unions)
├── ComponentName.test.tsx  # Unit tests (5-level policy — see tests.md)
├── README.md               # Co-located usage doc (mandatory — see component-docs.md)
└── index.ts                # export { default as ComponentName } from './ComponentName'
```

> This file covers **React** components in `packages/reference/src/components/`. For **Stencil**
> Web Components in `packages/stencil` (BEM + CSS variables, `ui-` tags), use the `stencil` skill.

Rules:

- **Styling = the native BEM skin, NOT Tailwind.** A new component consumes a CVA resolver from
  `@fubaritico-ds/variants` (emitting `.ui-<block>` classes) backed by a `<component>.css` in
  `@fubaritico-ds/styles`. The `ui:` Tailwind prefix only survives in the components still queued for
  migration (Tabs, Drawer, Carousel, Typeahead, `next/Image`) — **never write new `ui:` classes**.
- No domain logic
- Extend with `ComponentProps` (see below), never `HTMLAttributes`
- Export the props interface as a named export, the component as default; re-export both from `index.ts`
- `clsx` for conditional classes

## ComponentProps Rule

Always use `ComponentProps` from React — never `HTMLAttributes` or `InputHTMLAttributes`.

```typescript
// Extending an intrinsic HTML element:
import type { ComponentProps } from 'react'
export interface ButtonProps extends ComponentProps<'button'> { ... }
export interface InputProps extends ComponentProps<'input'> { ... }
export interface ListProps extends ComponentProps<'ul'> { ... }

// Composing another component (deriving its props):
import type { ComponentProps } from 'react'
import { Input } from '../Input'
export type TypeaheadInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange'>

// Composing with extension:
export interface MenuItemProps extends Omit<ComponentProps<typeof ListboxItem>, 'variant' | 'ref'> {
  value: string
  index: number
}
```

**Why**: `ComponentProps` includes `ref` (React 19), `key`, and all HTML attributes in one type.
It also works uniformly for intrinsic elements (`'div'`, `'input'`) and custom components (`typeof Input`).

## Import Order (ESLint enforced)

```typescript
// 1. External
import clsx from 'clsx'

// 2. Internal packages
import { Section } from '@fubaritico-ds/shared'

// 3. Relative
import type { ComponentNameProps } from './ComponentName.types'

// 4. Types
import type { FC } from 'react'
```

## Discriminated Union Pattern (polymorphic components)

```typescript
// ComponentName.types.ts
export type ComponentAsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' }
export type ComponentAsLink   = BaseProps & LinkProps & { as: 'link' }
export type ComponentProps = ComponentAsButton | ComponentAsLink

// ComponentName.tsx
export function ComponentName ({props}: ComponentNameProps) {
  if (props.as === 'link') {
    const { as: _, variant: _v, size: _s, className: _c, children: _ch, ...linkProps } = props
    return <Link className={classes} {...linkProps}>{content}</Link>
  }
  const { as: _, variant: _v, size: _s, className: _c, children: _ch, ...buttonProps } = props as ComponentAsButton
  return <button className={classes} {...buttonProps}>{content}</button>
}
```

Note: ESLint `ignoreRestSiblings` is enabled — `{ as: _, ...rest }` pattern is allowed.

## Compound Components Pattern (React 19)

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

const ComponentItem: FC<ItemProps> = ({ children }) => {
  const { state } = useComponentContext() // dedicated hook, never `use(...)` inline
  return <div>{children}</div>
}

Component.Item = ComponentItem
```

Rules (apply to ALL compound/context components — Carousel, Tabs, Avatar, …):

- **Dedicated access hook per context** (`useXxxContext`) — encapsulates the `use()` read + the guard.
  No sub-component reads a context inline. Required → `throw`; optional/standalone → `return null`.
- **React 19 idioms**: render `<Context value>` (the context **is** the provider — no `.Provider`);
  read with `use()` (not `useContext`); `ref` is a plain prop (no `forwardRef`); use `useEffectEvent`
  for consumer callbacks fired inside effects (keeps them out of deps → no over-firing).
- **Memoize** the provided value; **split contexts by change frequency** (stable config vs dynamic
  state) so a dynamic update doesn't re-render stable consumers. Precedent: `Avatar` (`AvatarContext`).

## Storybook Pattern (Design System)

`layout: 'centered'` + `tags: ['autodocs']` + `Playground` + `Showcase` stories + `argTypes`

See `/story` skill for full template.
