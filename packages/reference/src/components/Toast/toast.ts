import { cloneElement, isValidElement } from 'react'

import { getGlobalToaster } from '@fubaritico/behaviors'

import { Alert } from '../Alert'

import { REACT_KIND } from './constants'

import type {
  ReactToastContent,
  ReactToaster,
  ToastCustomOptions,
  ToastMessageOptions,
  ToastOptions,
} from './Toast.types'
import type { ToastVariant } from '@fubaritico/variants'
import type { AlertProps } from '../Alert'
import type { ReactNode } from 'react'

/** A message toast of one intent: the title, then the other options. */
type IntentToast = (
  title: string,
  options?: Omit<ToastMessageOptions, 'variant'>
) => string

/** The imperative toast API — callable from anywhere, inside React or not (a `catch`, a util). */
export interface ToastApi {
  /**
   * Shows a message toast.
   *
   * @param title - The headline.
   * @param options - {@link ToastMessageOptions}.
   * @returns The toast's id.
   */
  (title: string, options?: ToastMessageOptions): string
  /** A `success` toast. */
  success: IntentToast
  /** An `info` toast. */
  info: IntentToast
  /** A `warning` toast. */
  warning: IntentToast
  /** An `error` toast. */
  error: IntentToast
  /**
   * Shows free content — any node, an `Alert` included (pass `bare`; its live role is taken off).
   *
   * @param node - What to render.
   * @param options - {@link ToastCustomOptions}.
   * @returns The toast's id.
   */
  custom: (node: ReactNode, options: ToastCustomOptions) => string
  /**
   * Starts a toast's exit.
   *
   * @param id - The toast's id.
   * @returns Whether a toast started leaving.
   */
  dismiss: (id: string) => boolean
  /** Starts the exit of every toast on screen. */
  dismissAll: () => void
}

/**
 * Picks the timing / a11y options a toast passes on untouched.
 *
 * @param options - Any toast options.
 * @returns Only {@link ToastOptions}.
 */
function base({
  id,
  duration,
  dismissible,
  urgent,
}: ToastOptions): ToastOptions {
  return { id, duration, dismissible, urgent }
}

/**
 * Takes the live role off an `Alert` shown as a toast: its own `role="alert"` / `"status"` would be
 * announced on top of the stack's live region — the message twice, and an interruption for a toast
 * that is not urgent. An Alert given an explicit `role` keeps it.
 *
 * @param node - The free content.
 * @returns The node, an Alert without a `role` cloned with `role="none"`.
 */
function silenceAlert(node: ReactNode): ReactNode {
  if (!isValidElement<AlertProps>(node) || node.type !== Alert) return node
  if (node.props.role !== undefined) return node
  return cloneElement(node, { role: 'none' })
}

/**
 * Builds the toast API on a toaster — the page's shared one for {@link toast}, an injected one for
 * a test or a story.
 *
 * @param resolve - Returns the toaster to drive; called on every use, so the shared one is reached
 *   only when a toast is shown (importing the module has no effect).
 * @returns The {@link ToastApi}.
 */
export function createToastApi(resolve: () => ReactToaster): ToastApi {
  /**
   * Shows a message toast of an intent.
   *
   * @param variant - The intent.
   * @param title - The headline.
   * @param options - {@link ToastMessageOptions}.
   * @returns The toast's id.
   */
  const message = (
    variant: ToastVariant | undefined,
    title: string,
    options: ToastMessageOptions = {}
  ): string =>
    resolve().show({
      ...base(options),
      message: {
        title,
        description: options.description,
        icon: options.icon,
        variant: variant ?? options.variant,
      },
    })

  /**
   * Shows a message toast; its intent comes from the options.
   *
   * @param title - The headline.
   * @param options - {@link ToastMessageOptions}.
   * @returns The toast's id.
   */
  const api = (title: string, options?: ToastMessageOptions): string =>
    message(undefined, title, options)

  /**
   * A message toast of a fixed intent.
   *
   * @param variant - The intent.
   * @returns The `toast.<intent>` function.
   */
  const intent =
    (variant: ToastVariant): IntentToast =>
    (title, options) =>
      message(variant, title, options)

  return Object.assign(api, {
    success: intent('success'),
    info: intent('info'),
    warning: intent('warning'),
    error: intent('error'),
    custom: (node: ReactNode, options: ToastCustomOptions): string => {
      const value: ReactToastContent = {
        node: silenceAlert(node),
        bare: options.bare ?? false,
      }
      return resolve().show({
        ...base(options),
        message: { title: options.label },
        custom: { kind: REACT_KIND, value },
      })
    },
    dismiss: (id: string): boolean => resolve().dismiss(id),
    dismissAll: (): void => {
      resolve().dismissAll()
    },
  })
}

/**
 * The page's toasts — `toast('Saved')`, `toast.error('Upload failed')`, `toast.custom(<Alert …/>)`.
 * Shown by the page's `<Toaster>`, one per page, whichever bundle mounted it.
 */
export const toast: ToastApi = createToastApi(() =>
  getGlobalToaster<ReactToastContent>()
)

export default toast
