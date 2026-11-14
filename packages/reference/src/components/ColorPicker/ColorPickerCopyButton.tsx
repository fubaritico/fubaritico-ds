import { ColorPickerActionButton } from './ColorPickerActionButton'

import type { ColorPickerActionButtonProps } from './ColorPickerActionButton'

/** Props of {@link ColorPickerCopyButton}: the IconButton's, minus what the service owns. */
export type ColorPickerCopyButtonProps = ColorPickerActionButtonProps

/**
 * Copies the current colour (the hex the field shows) to the clipboard, and says so in the live
 * region. Disabled while the value is not a colour. Renders nothing without a clipboard (an insecure
 * page, or `clipboard={null}`). A consumer `onClick` runs first and may `preventDefault()`.
 *
 * Must be rendered inside a `<ColorPicker>`.
 *
 * @param props - {@link ColorPickerCopyButtonProps}.
 * @returns The rendered button, or `null`.
 */
export function ColorPickerCopyButton(
  props: Readonly<ColorPickerCopyButtonProps>
) {
  return <ColorPickerActionButton {...props} kind="copy" />
}

export default ColorPickerCopyButton
