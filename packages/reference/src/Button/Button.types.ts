import type { ButtonVisualProps } from './Button.shared'
import type { ComponentProps } from 'react'

/** Props for the plain {@link Button}: visual props plus native `<button>` attributes. */
export type ButtonProps = ButtonVisualProps & ComponentProps<'button'>
