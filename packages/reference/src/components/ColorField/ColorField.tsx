import clsx from 'clsx'
import { useId } from 'react'

import {
  COLOR_FIELD_CLASS,
  COLOR_FIELD_CONTROL_CLASS,
  COLOR_FIELD_LABEL_CLASS,
  COLOR_FIELD_PANEL_CLASS,
  COLOR_FIELD_TRIGGER_CLASS,
} from '@fubaritico/variants'

import { ColorPicker } from '../ColorPicker'
import { useColorPickerContext } from '../ColorPicker/ColorPickerContext'
import { Popover } from '../Popover'

import type { ColorPickerProps } from '../ColorPicker'

/**
 * Props of the {@link ColorField}: the ColorPicker's, plus the field's own label and texts. The
 * visible `label` names the field, so `aria-label` / `aria-labelledby` are not accepted.
 */
export interface ColorFieldProps
  extends Omit<ColorPickerProps, 'children' | 'aria-label' | 'aria-labelledby'> {
  /** Visible label of the field; it also names the field's group for screen readers. */
  label: string
  /** Accessible name of the swatch button that opens the picker; defaults to `'Choose color'`. */
  triggerLabel?: string
  /** Controlled open state of the picker popover. */
  open?: boolean
  /** Initial open state of the picker popover when uncontrolled. */
  defaultOpen?: boolean
  /** Called when the picker popover opens or closes. */
  onOpenChange?: (open: boolean) => void
}

/** Props of {@link ColorFieldControl}. */
interface ColorFieldControlProps {
  /** Id of the visible field label. */
  labelId: string
  /** Accessible name of the swatch button. */
  triggerLabel: string
  /** Disables the swatch button. */
  disabled?: boolean
}

/**
 * The swatch button and the hex input. Each one is named by its own label FOLLOWED by the field's
 * ("Choose color Fill", "Hex color Fill"), so two ColorFields on a form stay distinguishable out of
 * their group. Reads the picker service for the hex input's id.
 *
 * @param props - {@link ColorFieldControlProps}.
 * @returns The rendered control row.
 */
function ColorFieldControl({
  labelId,
  triggerLabel,
  disabled,
}: Readonly<ColorFieldControlProps>) {
  const { service } = useColorPickerContext()
  const triggerId = useId()
  const hexId = String(service.hexInputAttrs().id)

  return (
    <div className={COLOR_FIELD_CONTROL_CLASS}>
      <Popover.Trigger
        id={triggerId}
        className={COLOR_FIELD_TRIGGER_CLASS}
        aria-label={triggerLabel}
        aria-labelledby={`${triggerId} ${labelId}`}
        disabled={disabled}
      >
        <ColorPicker.Swatch aria-hidden="true" />
      </Popover.Trigger>
      <ColorPicker.HexField aria-labelledby={`${hexId} ${labelId}`} />
    </div>
  )
}

/**
 * ColorField — a colour form field: a label, a swatch button and an editable hex input; the swatch
 * opens the full picker in a popover, above everything on the page.
 *
 * Pure composition: a `ColorPicker` (one `ColorPickerService` behind the hex input AND the panel,
 * so they always agree) arranged as a field, with its area / hue / alpha / automatic toggle inside a
 * `Popover`. Typing a hex applies on Enter or blur, without opening anything. Every ColorPicker
 * prop works the same (value, nullable, alpha, labels…).
 *
 * @param props - {@link ColorFieldProps}.
 * @param props.label - Visible label.
 * @param props.triggerLabel - Accessible name of the swatch button.
 * @param props.open - Controlled open state of the popover.
 * @param props.defaultOpen - Initial open state of the popover when uncontrolled.
 * @param props.onOpenChange - Called when the popover opens or closes.
 * @returns The rendered field.
 */
export function ColorField({
  label,
  triggerLabel = 'Choose color',
  open,
  defaultOpen,
  onOpenChange,
  className,
  labels,
  disabled,
  ...pickerProps
}: Readonly<ColorFieldProps>) {
  const labelId = useId()

  return (
    <ColorPicker
      {...pickerProps}
      disabled={disabled}
      labels={labels}
      className={clsx(COLOR_FIELD_CLASS, className)}
      aria-labelledby={labelId}
    >
      <span id={labelId} className={COLOR_FIELD_LABEL_CLASS}>
        {label}
      </span>
      <Popover
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        label={label}
      >
        <ColorFieldControl
          labelId={labelId}
          triggerLabel={triggerLabel}
          disabled={disabled}
        />
        <Popover.Content>
          <div className={COLOR_FIELD_PANEL_CLASS}>
            <ColorPicker.Area />
            <ColorPicker.Hue />
            <ColorPicker.Alpha />
            <ColorPicker.AutoToggle />
          </div>
        </Popover.Content>
      </Popover>
    </ColorPicker>
  )
}

export default ColorField
