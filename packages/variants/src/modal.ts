/**
 * BEM block class for the native `<dialog>` shell (`.ui-modal`).
 *
 * Modal exposes NO variant axis: the dialog is a transparent, full-viewport top-layer container and
 * the visible panel is the consumer's own markup, so there is nothing to vary. A `cva()` with an
 * empty `variants` map would be ceremony with no behaviour — a plain constant states the contract
 * honestly. Appearance is tuned through the `--ui-modal-*` component variables instead.
 */
export const MODAL_CLASS = 'ui-modal'
