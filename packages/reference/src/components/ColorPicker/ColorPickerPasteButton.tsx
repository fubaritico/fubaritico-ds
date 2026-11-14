import { ColorPickerActionButton } from './ColorPickerActionButton'

import type { ColorPickerActionButtonProps } from './ColorPickerActionButton'

/** Props of {@link ColorPickerPasteButton}: the IconButton's, minus what the service owns. */
export type ColorPickerPasteButtonProps = ColorPickerActionButtonProps

/**
 * Reads the clipboard and applies the hex colour it holds — a settled change, which also leaves
 * "automatic" and "no colour". Text that is not a colour changes nothing and is announced. Renders
 * nothing without a clipboard. A consumer `onClick` runs first and may `preventDefault()`.
 *
 * Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerPasteButtonProps}.
 * @returns The rendered button, or `null`.
 */
export function ColorPickerPasteButton(
  props: Readonly<ColorPickerPasteButtonProps>
) {
  return <ColorPickerActionButton {...props} kind="paste" />
}

export default ColorPickerPasteButton
