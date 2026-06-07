# 09 — Testing

> **Current state (Stencil v4.x → v5):** the built-in Jest-based test runner (`stencil test --spec`
> / `--e2e`) is **deprecated and will be removed in v5**. The recommended stack is now:
>
> - **`@stencil/vitest`** — unit + spec tests (choice of `jsdom`, `happy-dom`, or `mock-doc`), plus
>   browser tests with screenshots.
> - **`@stencil/playwright`** — true end-to-end across browsers.
>
> This aligns well with this monorepo, which already uses **Vitest** (catalog-pinned).

## Modern: `@stencil/vitest`

Render and assert against the component, query its shadow root, and spy on emitted events:

```tsx
import { render, h, describe, it, expect } from '@stencil/vitest'

describe('ui-button', () => {
  it('renders and hydrates', async () => {
    const { root } = await render(<ui-button variant="primary">Go</ui-button>)
    expect(root).toHaveClass('hydrated')
  })

  it('emits uiClick on press', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      <ui-button>Go</ui-button>
    )
    const spy = spyOnEvent('uiClick')

    root.shadowRoot?.querySelector('button')?.click()
    await waitForChanges()

    expect(spy).toHaveReceivedEvent()
  })

  it('reflects variant prop', async () => {
    const { root, waitForChanges } = await render(<ui-button>Go</ui-button>)
    root.variant = 'secondary'
    await waitForChanges()
    expect(root.shadowRoot?.querySelector('button')).toHaveClass(
      'btn-secondary'
    )
  })
})
```

Key helpers: `render`, `waitForChanges`, `spyOnEvent`, matchers like `toHaveReceivedEvent`,
`toHaveReceivedEventDetail`, `toHaveClass`, `toEqualHtml`.

## Modern: `@stencil/playwright` (e2e)

Browser-driven tests for real interaction/visual checks — same Playwright API the repo's
`packages/e2e` already uses. Use for cross-component flows and screenshots.

## Testing `@Method()`

```tsx
const { root } = await render(<ui-drawer></ui-drawer>)
await root.open() // public async method
await waitForChanges()
expect(root.shadowRoot?.querySelector('[part=panel]')).toBeTruthy()
```

## Legacy reference (`newSpecPage` / `newE2EPage`)

Still works in v4 but slated for removal. Recognise it in older code:

```tsx
import { newSpecPage } from '@stencil/core/testing'
const page = await newSpecPage({
  components: [UiButton],
  html: `<ui-button>Go</ui-button>`,
})
expect(page.root).toEqualHtml(`...`)
```

```tsx
import { newE2EPage } from '@stencil/core/testing'
const page = await newE2EPage()
await page.setContent('<ui-button>Go</ui-button>')
const el = await page.find('ui-button')
expect(el).toHaveClass('hydrated')
```

When writing new tests, prefer `@stencil/vitest` and migrate any `newSpecPage`/`newE2EPage` code.

## 5-level policy alignment

This repo's `tests.md` 5-level policy (happy / variants / managed errors / unmanaged errors / edge)
applies to Stencil components too:

- **L1** renders + hydrated class
- **L2** each `variant`/`size`/`as` branch
- **L3** disabled/empty states, prevented (`cancelable`) events
- **L4** missing/`undefined` props, malformed values → fallbacks hold
- **L5** slot empty vs filled, rapid attach/detach (`disconnectedCallback` cleanup)
