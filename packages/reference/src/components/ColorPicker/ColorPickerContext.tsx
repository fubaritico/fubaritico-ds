import { createContext, use, useSyncExternalStore } from 'react'

import type { ColorPickerService, ColorPickerSnapshot } from '@fubaritico/behaviors'

/** What `<ColorPicker>` hands down to its parts. */
interface ColorPickerContextValue {
  /** The behaviour service — colour state, drags, keyboard, hex draft and ARIA live there. */
  service: ColorPickerService
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
 * @returns The service.
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
 * Subscribes to one slice of the snapshot: the component re-renders only when the slice changes —
 * a pointer move does not re-render a part that reads `disabled`. The selector MUST return a
 * primitive: a fresh object differs on every read and would re-render forever.
 *
 * @param service - The colour picker service.
 * @param select - Picks a primitive out of the snapshot.
 * @returns The selected slice.
 */
export function useColorPickerSelector<T extends string | number | boolean | null>(
  service: ColorPickerService,
  select: (snapshot: ColorPickerSnapshot) => T
): T {
  const read = () => select(service.getState())
  return useSyncExternalStore(service.subscribe, read, read)
}

/** What {@link useColorPickerController} returns. */
export interface ColorPickerController {
  /** The live snapshot; the calling component re-renders when it changes. */
  state: ColorPickerSnapshot
  /** The service's imperative API (`setColor`, `setChannel`, `toggleAuto`…). */
  service: ColorPickerService
}

/**
 * Escape hatch for a custom part inside `<ColorPicker>` (a recent-colours strip, an RGB readout):
 * the live snapshot plus the service's imperative API.
 *
 * @returns The snapshot and the service.
 * @throws Error when used outside `<ColorPicker>`.
 */
export function useColorPickerController(): ColorPickerController {
  const { service } = useColorPickerContext()
  const state = useColorPickerSnapshot(service)
  return { state, service }
}
