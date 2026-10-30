import clsx from 'clsx'
import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { createMultiSelectService } from '@fubaritico/behaviors'
import {
  INPUT_LABEL_CLASS,
  INPUT_MESSAGE_CLASS,
  INPUT_MESSAGE_ERROR_CLASS,
  MULTI_SELECT_ANCHOR_VAR,
  MULTI_SELECT_CONTROL_CLASS,
  MULTI_SELECT_INPUT_CLASS,
  MULTI_SELECT_LIVE_CLASS,
  inputFieldVariants,
  multiSelectVariants,
} from '@fubaritico/variants'

import { useMergedRef } from '../../hooks'
import { toReactAttributes } from '../../utils/toReactAttributes'
import { Icon } from '../Icon'

import { MultiSelectMenu } from './MultiSelectMenu'
import { MultiSelectTag } from './MultiSelectTag'
import { useMultiSelectDom } from './useMultiSelectDom'

import type {
  MultiSelectMessages,
  MultiSelectOption,
  MultiSelectOptions,
  MultiSelectService,
} from '@fubaritico/behaviors'
import type { MultiSelectSize, MultiSelectVariant } from '@fubaritico/variants'
import type {
  ComponentProps,
  FocusEvent,
  MouseEvent,
} from 'react'

export type {
  MultiSelectMessages,
  MultiSelectOption,
} from '@fubaritico/behaviors'
export type { MultiSelectSize, MultiSelectVariant } from '@fubaritico/variants'

/** Semantic of the helper message — drives the colour, `aria-invalid` and `role="alert"`. */
export type MultiSelectMessageType = 'error' | 'info'

/** Props of the {@link MultiSelect}. */
export interface MultiSelectProps
  extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** The options offered, in display order. */
  options: readonly MultiSelectOption[]
  /** Controlled selection: the chosen values, in the order they were chosen. */
  value?: readonly string[]
  /** Initial selection when uncontrolled. */
  defaultValue?: readonly string[]
  /** Called with the new list of values after a choice or a removal. */
  onChange?: (value: string[]) => void
  /** The field's label — required: it names the combobox. */
  label: string
  /** Helper or error message rendered below the control. */
  message?: string
  /** Semantic of {@link MultiSelectProps.message}; defaults to `'info'`. */
  messageType?: MultiSelectMessageType
  /** Placeholder of the search input, shown while nothing is chosen. */
  placeholder?: string
  /** Control size; defaults to `'md'`. */
  size?: MultiSelectSize
  /** Colour scheme; `'dark'` for a field on an inverse panel. Defaults to `'light'`. */
  variant?: MultiSelectVariant
  /** Disables the whole control: no menu, no choice, no removal. */
  disabled?: boolean
  /** DOM id of the search input (the label's target); generated when absent. */
  inputId?: string
  /** Name of the hidden inputs carrying the values, for a native `<form>` submission. */
  name?: string
  /** Translations of the sentences the component says (remove button, announcements, no results). */
  messages?: Partial<MultiSelectMessages>
  /**
   * A behaviour service to drive the component (dependency injection — tests, a shared instance).
   * Read once, at mount: to swap it, remount the component (`key`).
   */
  service?: MultiSelectService
}

/** Pixel size of the error-message icon. */
const ICON_SIZE = 16

/**
 * The service options the props drive. `uid` and the initial selection are set at creation only.
 *
 * @param props - The props the service reads.
 * @param props.options - The options offered.
 * @param props.value - The controlled selection, or `undefined`.
 * @param props.disabled - Whether the control is disabled.
 * @param props.messages - The translated sentences.
 * @param props.onChange - The consumer's change callback.
 * @returns A patch for `setOptions`.
 */
function toServiceOptions({
  options,
  value,
  disabled,
  messages,
  onChange,
}: Pick<
  MultiSelectOptions,
  'options' | 'value' | 'disabled' | 'messages' | 'onChange'
>): Partial<MultiSelectOptions> {
  return { options, value, disabled, messages, onChange }
}

/**
 * MultiSelect — a field holding several choices as removable badges, with a search over a listbox
 * of options. The behaviour (selection, search, keyboard, focus, announcements, ARIA) lives in the
 * framework-agnostic `MultiSelectService`; this component renders it.
 *
 * The search input is the ARIA combobox (focus stays in it, `aria-activedescendant` points at the
 * option under the cursor); the menu is a `popover="manual"` listbox in the top layer, anchored under
 * the control and usable inside a `Modal`. Each badge carries a native remove button.
 *
 * @param props - {@link MultiSelectProps}.
 * @returns The rendered field.
 */
export function MultiSelect({
  options,
  value,
  defaultValue,
  onChange,
  label,
  message,
  messageType = 'info',
  placeholder,
  size = 'md',
  variant = 'light',
  disabled = false,
  inputId: externalInputId,
  name,
  messages,
  service: injectedService,
  className,
  style,
  onBlur,
  ref,
  ...rest
}: Readonly<MultiSelectProps>) {
  // Ids for the service namespace and the input; called unconditionally (rules of hooks).
  const uid = useId()
  const inputId = externalInputId ?? `${uid}-input`
  const labelId = `${inputId}-label`
  const messageId = message ? `${inputId}-message` : undefined
  const hasError = messageType === 'error' && !!message

  // `useState`, not `useMemo`: the instance must live as long as the component, and a StrictMode
  // remount reuses it — so it is never destroyed in a cleanup.
  const [service] = useState(
    () =>
      injectedService ??
      createMultiSelectService({
        ...toServiceOptions({ options, value, disabled, messages, onChange }),
        uid,
        options,
        defaultValue,
      })
  )

  // Props → service before paint; the service notifies only when its snapshot really changes.
  useLayoutEffect(() => {
    service.setOptions(
      toServiceOptions({ options, value, disabled, messages, onChange })
    )
  }, [service, options, value, disabled, messages, onChange])

  // Subscribes to the service: every render reads its current snapshot.
  const state = useSyncExternalStore(
    service.subscribe,
    service.getState,
    service.getState
  )

  const rootRef = useRef<HTMLDivElement>(null)
  // A consumer `ref` must not replace the root ref the outside-press and blur handlers read.
  const mergedRootRef = useMergedRef(rootRef, ref)
  const inputRef = useRef<HTMLInputElement>(null)
  // The remove buttons by value, so a removal can move focus to the next one.
  const removeRefs = useRef(new Map<string, HTMLButtonElement>())

  // The focus move after a removal, the active option kept in view, the outside press.
  useMultiSelectDom(service, state, { rootRef, inputRef, removeRefs })

  // A dashed ident unique per instance: `useId` yields `«r1»`-like strings, not valid in an ident.
  const anchorStyle = useMemo(
    () => ({
      [MULTI_SELECT_ANCHOR_VAR]: `--ui-multi-select-${uid.replace(/[^\w-]/g, '')}`,
    }),
    [uid]
  )

  // Stable for the memoised badges: records or forgets a remove button by value.
  const registerRemove = useCallback(
    (chosen: string, node: HTMLButtonElement | null) => {
      if (node) removeRefs.current.set(chosen, node)
      else removeRefs.current.delete(chosen)
    },
    []
  )

  /**
   * Closes the menu when focus leaves the input: the menu belongs to the combobox, so it closes too
   * when focus moves to a remove button. Leaving the whole field (Tab away) also drops the search. A
   * blur with no destination (a press on a non-focusable spot) is left to the outside-press handler.
   *
   * @param event - The blur event, bubbled from the input or a remove button.
   */
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event)
    const next = event.relatedTarget
    if (!(next instanceof Node) || next === inputRef.current) return
    service.close({ clearQuery: !rootRef.current?.contains(next) })
  }

  /**
   * A press on the control: on its empty area or a badge's label, focus the input and toggle the
   * menu; on the input itself, open it (the caret is placed as usual). A remove button handles its
   * own press.
   *
   * @param event - The mousedown on the control.
   */
  const handleControlMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element
    if (target.closest('button')) return
    if (target === inputRef.current) {
      service.open()
      return
    }
    // Keeps focus where it is (no blur to <body>), then hands it to the input.
    event.preventDefault()
    inputRef.current?.focus()
    service.toggleOpen()
  }

  return (
    <div
      {...rest}
      ref={mergedRootRef}
      className={clsx(
        inputFieldVariants({ size, variant }),
        multiSelectVariants({ variant, size, invalid: hasError, disabled }),
        className
      )}
      // The anchor name goes last: a consumer style must not unhook the menu.
      style={{ ...style, ...anchorStyle }}
      onBlur={handleBlur}
    >
      <label id={labelId} htmlFor={inputId} className={INPUT_LABEL_CLASS}>
        {label}
      </label>
      {/* Pointer convenience only: the input and the remove buttons are the keyboard targets. */}
      <div
        className={MULTI_SELECT_CONTROL_CLASS}
        onMouseDown={handleControlMouseDown}
      >
        {state.tags.map((tag) => (
          <MultiSelectTag
            key={tag.value}
            tag={tag}
            removeLabel={service.removeAttrs(tag.value)['aria-label'] as string}
            service={service}
            variant={variant}
            size={size}
            disabled={disabled}
            registerRemove={registerRemove}
          />
        ))}
        <input
          id={inputId}
          ref={inputRef}
          className={MULTI_SELECT_INPUT_CLASS}
          value={state.query}
          placeholder={state.tags.length === 0 ? placeholder : undefined}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={messageId}
          onChange={(event) => service.setQuery(event.target.value)}
          onKeyDown={(event) => service.handleKeydown(event)}
          {...toReactAttributes(service.comboboxAttrs())}
        />
      </div>
      {state.open ? (
        <MultiSelectMenu
          service={service}
          items={state.items}
          noResultsText={state.noResultsText}
          variant={variant}
          labelId={labelId}
        />
      ) : null}
      {message ? (
        <p
          id={messageId}
          role={hasError ? 'alert' : undefined}
          className={clsx(
            INPUT_MESSAGE_CLASS,
            hasError && INPUT_MESSAGE_ERROR_CLASS
          )}
        >
          {hasError ? <Icon name="ExclamationCircle" size={ICON_SIZE} /> : null}
          {message}
        </p>
      ) : null}
      <div className={MULTI_SELECT_LIVE_CLASS} role="status" aria-live="polite">
        {state.announcement}
      </div>
      {name
        ? state.value.map((chosen) => (
            <input key={chosen} type="hidden" name={name} value={chosen} />
          ))
        : null}
    </div>
  )
}

export default MultiSelect
