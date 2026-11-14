import type { DomAttributes } from '@fubaritico/behaviors'

/** Attributes ready to spread on a React element. */
export type ReactAttributes = Record<string, string | number | boolean>

/**
 * HTML boolean attributes a service may emit. React treats them as booleans, and an empty string
 * — the DOM's "on" value — reads as `false` there, which would REMOVE the attribute.
 */
const BOOLEAN_ATTRIBUTES = new Set([
  'hidden',
  'disabled',
  'inert',
  'open',
  'required',
  'readonly',
])

/**
 * DOM PROPERTIES a service emits with presence semantics, that React must always receive as a
 * boolean: an input whose `checked` is sometimes `true` and sometimes absent switches between
 * controlled and uncontrolled (React warns, and the DOM may drift from the service).
 */
const BOOLEAN_PROPERTIES = new Set(['checked'])

/**
 * DOM attribute names React spells differently (camelCase props). Anything not listed — `aria-*`,
 * `data-*`, `role`, `id` — passes through verbatim.
 */
const REACT_NAMES: ReadonlyMap<string, string> = new Map([
  ['tabindex', 'tabIndex'],
  ['maxlength', 'maxLength'],
  ['spellcheck', 'spellCheck'],
  ['autocapitalize', 'autoCapitalize'],
  ['autocomplete', 'autoComplete'],
  ['readonly', 'readOnly'],
  ['popovertarget', 'popoverTarget'],
])

/**
 * Turns the DOM-spelled attributes a `@fubaritico/behaviors` service produces into React props.
 *
 * Services speak the DOM with presence semantics (`''` = on, `undefined` = omit) so every framework
 * applies them as-is. React is the exception on three counts, all handled here: it wants `tabIndex`,
 * it wants a real `true` for a boolean attribute, and a real `false` too for a controlled property
 * such as `checked`. `aria-*` / `data-*` pass through verbatim.
 *
 * @param attributes - The service's attributes.
 * @returns The same attributes, spreadable on a React element.
 */
export function toReactAttributes(attributes: DomAttributes): ReactAttributes {
  const props: ReactAttributes = {}
  for (const [name, value] of Object.entries(attributes)) {
    if (BOOLEAN_PROPERTIES.has(name)) {
      props[name] = value !== undefined
      continue
    }
    if (value === undefined) continue
    const reactName = REACT_NAMES.get(name) ?? name
    props[reactName] = BOOLEAN_ATTRIBUTES.has(name) ? true : value
  }
  return props
}
