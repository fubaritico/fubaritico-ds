import { COLOR_PICKER_STATUS_CLASS } from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'
import {
  useColorPickerContext,
  useColorPickerSelector,
} from './ColorPickerContext'

/**
 * The visually hidden polite live region: announces the colour after each settled change, never
 * during a drag. Rendered by `<ColorPicker>` itself — not a part to place.
 *
 * @returns The rendered live region.
 */
export function ColorPickerStatus() {
  const { service } = useColorPickerContext()
  // A slice: the region re-renders when the announcement changes, not on every pointer move.
  const announcement = useColorPickerSelector(
    service,
    (state) => state.announcement
  )

  return (
    <div
      {...toReactAttributes(service.statusAttrs())}
      className={COLOR_PICKER_STATUS_CLASS}
    >
      {announcement}
    </div>
  )
}

export default ColorPickerStatus
