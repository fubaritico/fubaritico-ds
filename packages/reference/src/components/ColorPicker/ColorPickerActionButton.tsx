import clsx from 'clsx'

import { COLOR_PICKER_ACTION_CLASS } from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'
import { IconButton } from '../IconButton'

import {
  useColorPickerContext,
  useColorPickerSelector,
} from './ColorPickerContext'

import type { IconButtonProps } from '../IconButton'
import type { MouseEvent } from 'react'

/**
 * Props a clipboard action button takes from its consumer: the IconButton's, minus what the service
 * owns (the icon, the name, the disabled state, the type).
 */
export type ColorPickerActionButtonProps = Omit<
  IconButtonProps,
  'icon' | 'aria-label' | 'disabled' | 'type'
>

/** The two clipboard actions. */
type ColorPickerAction = 'copy' | 'paste'

/** Props of {@link ColorPickerActionButton}: the consumer's, plus which action it is. */
interface ColorPickerActionButtonOwnProps extends ColorPickerActionButtonProps {
  /** Which action: everything else (icon, name, attributes, call) follows from it. */
  kind: ColorPickerAction
}

/**
 * The copy / paste button body, shared: an outline IconButton squared to the swatch (`__action`,
 * its icon kept at 20px, its corners the swatch's), hidden without a clipboard. Everything read
 * from the service (attributes, name) is read HERE, in the component that subscribes — a parent
 * reading it would hand stale values down.
 * A consumer `onClick` runs first and may `preventDefault()`. Internal — the public parts are
 * `ColorPicker.CopyButton` and `ColorPicker.PasteButton`.
 *
 * @param props - {@link ColorPickerActionButtonOwnProps}.
 * @returns The rendered button, or `null` without a clipboard.
 */
export function ColorPickerActionButton({
  kind,
  size = 'md',
  variant = 'outline',
  className,
  onClick,
  ...rest
}: Readonly<ColorPickerActionButtonOwnProps>) {
  const { service } = useColorPickerContext()
  const hasClipboard = useColorPickerSelector(
    service,
    (state) => state.hasClipboard
  )
  // Subscriptions to what the attributes below read (mode, disabled); labels change with a parent
  // render, which re-renders this one too.
  useColorPickerSelector(service, (state) => state.mode)
  useColorPickerSelector(service, (state) => state.disabled)
  if (!hasClipboard) return null

  const isCopy = kind === 'copy'
  const labels = service.getLabels()

  /**
   * Runs the consumer's handler first; acts unless prevented.
   *
   * @param event - The click.
   */
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    void (isCopy ? service.copy() : service.paste())
  }

  return (
    <IconButton
      size={size}
      variant={variant}
      className={clsx(COLOR_PICKER_ACTION_CLASS, className)}
      {...rest}
      {...toReactAttributes(
        isCopy ? service.copyButtonAttrs() : service.pasteButtonAttrs()
      )}
      icon={isCopy ? 'DocumentDuplicate' : 'ClipboardDocument'}
      aria-label={isCopy ? labels.copy : labels.paste}
      onClick={handleClick}
    />
  )
}

export default ColorPickerActionButton
