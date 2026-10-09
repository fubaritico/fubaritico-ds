import type { DomAttributes } from '@fubaritico-ds/behaviors'

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
 * Turns the DOM-spelled attributes a `@fubaritico-ds/behaviors` service produces into React props.
 *
 * Services speak the DOM with presence semantics (`''` = on, `undefined` = omit) so every framework
 * applies them as-is. React is the exception on two counts, both handled here: it wants `tabIndex`,
 * and it wants a real `true` for a boolean attribute. `aria-*` / `data-*` pass through verbatim.
 *
 * @param attributes - The service's attributes.
 * @returns The same attributes, spreadable on a React element.
 */
export function toReactAttributes(attributes: DomAttributes): ReactAttributes {
  const props: ReactAttributes = {}
  for (const [name, value] of Object.entries(attributes)) {
    if (value === undefined) continue
    if (BOOLEAN_ATTRIBUTES.has(name)) props[name] = true
    else props[name === 'tabindex' ? 'tabIndex' : name] = value
  }
  return props
}
