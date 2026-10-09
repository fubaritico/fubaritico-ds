/**
 * BEM block: a colour form field — mixed onto the ColorPicker root (`.ui-color-picker.ui-color-field`),
 * it turns the panel into a compact field: a label, a swatch button and the hex input, the panel
 * itself opening in a popover.
 */
export const COLOR_FIELD_CLASS = 'ui-color-field'

/** BEM element: the field's visible label. */
export const COLOR_FIELD_LABEL_CLASS = 'ui-color-field__label'

/** BEM element: the row holding the swatch button and the hex input. */
export const COLOR_FIELD_CONTROL_CLASS = 'ui-color-field__control'

/** BEM element: the swatch button that opens the panel (also a `.ui-popover-trigger`). */
export const COLOR_FIELD_TRIGGER_CLASS = 'ui-color-field__trigger'

/** BEM element: the panel inside the popover. */
export const COLOR_FIELD_PANEL_CLASS = 'ui-color-field__panel'
