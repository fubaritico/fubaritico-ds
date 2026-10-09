import { createContext, use, useSyncExternalStore } from 'react'

import type {
  ColorPickerDirection,
  ColorPickerService,
  ColorPickerSnapshot,
} from '@fubaritico/behaviors'

/** What `<ColorPicker>` hands down to its parts. */
interface ColorPickerContextValue {
  /** The behaviour service — colour state, drags, keyboard, hex draft and ARIA live there. */
  service: ColorPickerService
  /** Text direction read from the DOM — the tracks' gradients follow it. */
  dir: ColorPickerDirection
}

/**
 * Carries the service INSTANCE, not its state: state travels through subscriptions, so a pointer
 * move re-renders the parts that read what changed, not the whole panel.
 */
export const ColorPickerContext = createContext<ColorPickerContextValue | null>(
  null
)

/**
 * Reads the surrounding `<ColorPicker>`.
 *
 * @returns The service and the text direction.
 * @throws Error when used outside `<ColorPicker>`.
 */
export function useColorPickerContext(): ColorPickerContextValue {
  const context = use(ColorPickerContext)
  if (!context) {
    throw new Error('ColorPicker parts must be used within <ColorPicker>')
  }
  return context
}

/**
 * Subscribes to the whole snapshot. `getState` is pure and DOM-free, so it doubles as the server
 * snapshot.
 *
 * @param service - The colour picker service.
 * @returns The current snapshot.
 */
export function useColorPickerSnapshot(
  service: ColorPickerService
): ColorPickerSnapshot {
  return useSyncExternalStore(
    service.subscribe,
    service.getState,
    service.getState
  )
}

/**
 * Escape hatch for a custom part inside `<ColorPicker>` (a recent-colours strip, an RGB readout):
 * the live snapshot plus the service's imperative API.
 *
 * @returns The snapshot and the service.
 * @throws Error when used outside `<ColorPicker>`.
 */
export function useColorPickerController(): {
  /** The live snapshot. */
  state: ColorPickerSnapshot
  /** The service's imperative API (`setColor`, `setChannel`, `setAuto`…). */
  service: ColorPickerService
} {
  const { service } = useColorPickerContext()
  const state = useColorPickerSnapshot(service)
  return { state, service }
}
