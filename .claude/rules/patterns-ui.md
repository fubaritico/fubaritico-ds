# UI Component Patterns — packages/reference

## Component Template

```typescript
import clsx from 'clsx'

import type { ComponentProps, FC } from 'react'

export interface ComponentNameProps extends ComponentProps<'div'> {
  /** Prop description */
  propName?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

export function ComponentName ({
  className,
  propName,
  size = 'md',
  variant = 'primary',
  ...rest
}: ComponentNameProps) {
  return (
    <div
      className={clsx('ui:...', className)}
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
packages/reference/src/ComponentName/
├── ComponentName.tsx       # FC<ComponentNameProps> implementation
├── ComponentName.types.ts  # Only if props are complex (discriminated unions)
├── ComponentName.test.tsx  # Unit tests
└── index.ts               # export { default as ComponentName } from './ComponentName'
```

> This file covers **React** components in `packages/reference` (`ui:` prefix). For **Stencil**
> Web Components in `packages/stencil` (BEM + CSS variables, `ui-` tags), use the `stencil` skill.

Rules:

- `ui:` prefix on ALL Tailwind classes
- No domain logic
- Extend with `ComponentProps` (see below), never `HTMLAttributes`
- Export interface as named, component as default
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

## Compound Components Pattern

```typescript
const ComponentContext = createContext<ComponentContextValue | null>(null)

export function ComponentName ({ children, ...props }: ComponentNameProps& {
  Item: typeof ComponentItem
  Navigation: typeof ComponentNavigation
}) {
  const [state, setState] = useState(...)
  return (
    <ComponentContext.Provider value={{ state, setState }}>
      <div>{children}</div>
    </ComponentContext.Provider>
  )
}

const ComponentItem: FC<ItemProps> = ({ children }) => {
  const context = useContext(ComponentContext)
  if (!context) throw new Error('ComponentItem must be used within Component')
  return <div>{children}</div>
}

Component.Item = ComponentItem
Component.Navigation = ComponentNavigation
```

Rules:

- Throw error if sub-component used outside parent
- Used for: Carousel, Tabs (existing) — apply when component has related sub-components

## Storybook Pattern (Design System)

`layout: 'centered'` + `tags: ['autodocs']` + `Playground` + `Showcase` stories + `argTypes`

See `/story` skill for full template.
