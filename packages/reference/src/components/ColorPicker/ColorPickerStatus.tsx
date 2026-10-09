import { COLOR_PICKER_STATUS_CLASS } from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'

import {
  useColorPickerContext,
  useColorPickerSnapshot,
} from './ColorPickerContext'

/**
 * The visually hidden polite live region: announces the colour after each settled change, never
 * during a drag. Rendered by `<ColorPicker>` itself — not a part to place.
 *
 * @returns The rendered live region.
 */
export function ColorPickerStatus() {
  const { service } = useColorPickerContext()
  const state = useColorPickerSnapshot(service)

  return (
    <div
      {...toReactAttributes(service.statusAttrs())}
      className={COLOR_PICKER_STATUS_CLASS}
    >
      {state.announcement}
    </div>
  )
}

export default ColorPickerStatus
