/**
 * BEM block class for the truncated single line of text (`.ui-truncated-text`).
 *
 * No variant axis: the text inherits its typography from where it sits, and the only behaviour
 * (truncated or not) is measured at runtime, not chosen. A `cva()` with an empty `variants` map would
 * be ceremony — a plain constant states the contract (Modal precedent). Tune it through the
 * `--ui-truncated-text-*` component variables.
 */
export const TRUNCATED_TEXT_CLASS = 'ui-truncated-text'
