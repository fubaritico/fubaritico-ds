/** BEM block: the popover surface (`[popover]`, rendered in the top layer). */
export const POPOVER_CLASS = 'ui-popover'

/**
 * BEM block: the element the surface is anchored to. A separate block, not an element of
 * `.ui-popover`: the trigger is the surface's sibling in the DOM, not its child.
 */
export const POPOVER_TRIGGER_CLASS = 'ui-popover-trigger'

/**
 * Custom property carrying the CSS anchor name (a dashed ident, unique per popover). Set on BOTH
 * the trigger (`anchor-name`) and the surface (`position-anchor`) — they are siblings, so it cannot
 * be inherited from one to the other.
 */
export const POPOVER_ANCHOR_VAR = '--ui-popover-anchor'
