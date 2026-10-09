# ColorField

A colour form field: a label, a swatch button and an editable hex input; the swatch opens the full
colour picker in a popover, above everything on the page. A composition of `ColorPicker` and
`Popover` — one `ColorPickerService` behind the field and the panel, so they always agree.

## Capabilities

- **Type or pick** — the hex input applies on Enter or blur, without opening anything; the swatch
  opens the picker (area, hue, alpha, automatic toggle) in a popover.
- **Everything the ColorPicker does** — HSVA value, the optional "automatic / no colour" state
  (`nullable`), alpha, two callbacks (`onChange` / `onChangeComplete`), localised labels.
- **Popover** — top layer (no portal, no z-index), anchored below the field, Escape / click outside
  close it and focus returns to the swatch; focus lands on the area when it opens.

## Import

```tsx
import { ColorField } from '@fubaritico/react/ColorField'
```

## Basic usage

```tsx
<ColorField label="Fill color" defaultValue={{ h: 210, s: 80, v: 60, a: 1 }} />
```

## Variants & options

Automatic state and alpha:

```tsx
<ColorField label="Stroke" nullable alpha defaultValue={null} />
```

Controlled, in a form:

```tsx
import { useState } from 'react'

import { ColorField } from '@fubaritico/react/ColorField'

import type { ColorValue } from '@fubaritico/react/ColorPicker'

export function FillField() {
  const [fill, setFill] = useState<ColorValue>({ h: 210, s: 80, v: 60, a: 1 })
  return <ColorField label="Fill" value={fill} onChange={setFill} />
}
```

Localised:

```tsx
<ColorField
  label="Couleur de remplissage"
  triggerLabel="Choisir une couleur"
  labels={{ hex: 'Couleur hexadécimale', automatic: 'Automatique' }}
/>
```

## Edge cases

A `null` default on a field that is not nullable starts from the placeholder (pure red):

```tsx
<ColorField label="Fill" defaultValue={null} />
```

Opened from the start:

```tsx
<ColorField label="Fill" defaultOpen />
```

Inside a modal dialog — the picker opens above it:

```tsx
import { ColorField } from '@fubaritico/react/ColorField'
import { Modal } from '@fubaritico/react/Modal'

export function EditLayer({ onClose }: Readonly<{ onClose: () => void }>) {
  return (
    <Modal isOpen onClose={onClose} aria-label="Edit layer">
      <ColorField label="Fill" alpha />
    </Modal>
  )
}
```

## Props

Every `ColorPicker` prop (`value`, `defaultValue`, `onChange`, `onChangeComplete`, `nullable`,
`alpha`, `disabled`, `placeholder`, `labels`, `describeColor`, `service`, `<div>` props except
`aria-label` / `aria-labelledby` — the visible label names the field), plus:

| Name           | Type                      | Default        | Description                                   |
| -------------- | ------------------------- | -------------- | --------------------------------------------- |
| `label`        | `string`                  | —              | Visible label; names the field. **Required.** |
| `triggerLabel` | `string`                  | `Choose color` | Accessible name of the swatch button.         |
| `open`         | `boolean`                 | —              | Controlled open state of the popover.         |
| `defaultOpen`  | `boolean`                 | `false`        | Initial open state when uncontrolled.         |
| `onOpenChange` | `(open: boolean) => void` | —              | Called when the popover opens or closes.      |

## Accessibility

- The field is a `group` named by its visible label.
- The swatch button and the hex input are each named by their own label followed by the field's
  ("Choose color Fill", "Hex color Fill"), so two fields stay distinct out of their group. The swatch
  never speaks the colour words — the colour is read from the hex field and the live region.
- The popover is a non-modal dialog named after the field; the picker inside keeps all its own
  accessibility (2D slider, colour words, announcements).

## Notes

> **Note** — the field and the popover share one service: dragging in the popover updates the hex
> field live, typing in the field moves the thumbs.

> **Note** — works inside a `Modal`: the popover opens above the dialog and Escape closes the
> popover first, then the dialog.

> **Note** — see the `ColorPicker` README for the value model (HSVA, `null` = automatic) and the
> `Popover` README for positioning and browser support.
