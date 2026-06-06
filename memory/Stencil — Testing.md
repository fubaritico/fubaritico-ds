---
title: Stencil — Testing
type: guide
permalink: main/stencil/stencil-testing
tags:
- stencil
- testing
- vitest
- playwright
---

# Stencil — Testing

> **État (Stencil v4.x → v5) :** le runner Jest intégré (`stencil test --spec` / `--e2e`) est
> **déprécié, retiré en v5**. Stack recommandé :
> - **`@stencil/vitest`** — unit + spec (`jsdom`, `happy-dom`, ou `mock-doc`) + tests navigateur avec screenshots.
> - **`@stencil/playwright`** — e2e cross-browser.

## Moderne : `@stencil/vitest`

Rendre et asserter contre le composant, querier son shadow root, espionner les events émis :

```tsx
import { render, h, describe, it, expect } from '@stencil/vitest'

describe('ui-button', () => {
  it('renders and hydrates', async () => {
    const { root } = await render(<ui-button variant="primary">Go</ui-button>)
    expect(root).toHaveClass('hydrated')
  })

  it('emits uiClick on press', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(<ui-button>Go</ui-button>)
    const spy = spyOnEvent('uiClick')
    root.shadowRoot?.querySelector('button')?.click()
    await waitForChanges()
    expect(spy).toHaveReceivedEvent()
  })

  it('reflects variant prop', async () => {
    const { root, waitForChanges } = await render(<ui-button>Go</ui-button>)
    root.variant = 'secondary'
    await waitForChanges()
    expect(root.shadowRoot?.querySelector('button')).toHaveClass('btn-secondary')
  })
})
```
Helpers clés : `render`, `waitForChanges`, `spyOnEvent`, matchers `toHaveReceivedEvent`,
`toHaveReceivedEventDetail`, `toHaveClass`, `toEqualHtml`.

## Moderne : `@stencil/playwright` (e2e)

Tests browser-driven pour interaction/visuel réels — même API Playwright. Pour flux cross-composants et screenshots.

## Tester `@Method()`

```tsx
const { root } = await render(<ui-drawer></ui-drawer>)
await root.open() // méthode async publique
await waitForChanges()
expect(root.shadowRoot?.querySelector('[part=panel]')).toBeTruthy()
```

## Legacy (`newSpecPage` / `newE2EPage`)

Marche encore en v4 mais voué à disparaître. À reconnaître dans du code ancien :

```tsx
import { newSpecPage } from '@stencil/core/testing'
const page = await newSpecPage({ components: [UiButton], html: `<ui-button>Go</ui-button>` })
expect(page.root).toEqualHtml(`...`)
```
```tsx
import { newE2EPage } from '@stencil/core/testing'
const page = await newE2EPage()
await page.setContent('<ui-button>Go</ui-button>')
const el = await page.find('ui-button')
expect(el).toHaveClass('hydrated')
```
Pour de nouveaux tests, préférer `@stencil/vitest` et migrer tout `newSpecPage`/`newE2EPage`.

## Politique de test 5 niveaux (alignée sur le repo source)

- **L1** happy path : render + classe `hydrated`
- **L2** variants : chaque branche `variant`/`size`/`as`
- **L3** erreurs gérées : états disabled/empty, events `cancelable` empêchés
- **L4** erreurs non gérées : props manquantes/`undefined`, valeurs malformées → les fallbacks tiennent
- **L5** edge : slot vide vs rempli, attach/detach rapide (cleanup `disconnectedCallback`)

## Relations

- API composants : [[Stencil — API des composants (décorateurs & lifecycle)]]
- Port React→WC : [[Stencil — Porter un composant React vers un Web Component]]
