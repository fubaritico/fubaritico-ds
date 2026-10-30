import { memo, useCallback } from 'react'

import {
  MULTI_SELECT_CHECK_CLASS,
  MULTI_SELECT_EMPTY_CLASS,
  MULTI_SELECT_MENU_CLASS,
  MULTI_SELECT_OPTION_CLASS,
} from '@fubaritico/variants'

import { toReactAttributes } from '../../utils/toReactAttributes'
import { Icon } from '../Icon'
import { ListboxItem, ListboxList } from '../Listbox'

import { MultiSelectHighlight } from './MultiSelectHighlight'

import type { MultiSelectItem, MultiSelectService } from '@fubaritico/behaviors'
import type { MultiSelectVariant } from '@fubaritico/variants'

/** Pixel size of a chosen option's check. */
const CHECK_SIZE = 16

/** Props of {@link MultiSelectMenu}. */
export interface MultiSelectMenuProps {
  /** The service the choices go through and the attributes come from. */
  service: MultiSelectService
  /** The visible options. */
  items: readonly MultiSelectItem[]
  /** Text of the row shown when no option matches. */
  noResultsText: string
  /** Colour scheme, forwarded to the list AND its items. */
  variant: MultiSelectVariant
  /** Id of the field's label, which names the listbox. */
  labelId: string
}

/** Props of {@link MultiSelectOption}. */
interface MultiSelectOptionProps {
  /** The option and its computed state. */
  item: MultiSelectItem
  /** The service the choice goes through. */
  service: MultiSelectService
  /** Colour scheme of the item. */
  variant: MultiSelectVariant
}

/**
 * One option of the menu. Memoised with stable handlers: moving the cursor re-renders the two rows
 * whose `active` changed, not the whole list.
 *
 * @param props - {@link MultiSelectOptionProps}.
 * @returns The option row.
 */
const MultiSelectOption = memo(function MultiSelectOption({
  item,
  service,
  variant,
}: Readonly<MultiSelectOptionProps>) {
  const { value } = item

  // Stable handlers bound to this option's value.
  const handleClick = useCallback(() => service.toggle(value), [service, value])
  const handleMouseMove = useCallback(() => {
    service.setActive(value)
  }, [service, value])

  return (
    <ListboxItem
      variant={variant}
      isActive={item.active}
      isSelected={item.selected}
      disabled={item.disabled}
      {...toReactAttributes(service.optionAttrs(value))}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      <span className={MULTI_SELECT_OPTION_CLASS}>
        <span>
          <MultiSelectHighlight label={item.label} match={item.match} />
        </span>
        {item.selected ? (
          <Icon
            name="Check"
            size={CHECK_SIZE}
            className={MULTI_SELECT_CHECK_CLASS}
          />
        ) : null}
      </span>
    </ListboxItem>
  )
})

/**
 * The menu of the MultiSelect: a `popover="manual"` listbox lifted into the top layer, rendered in
 * place (usable inside a `Modal`) and anchored under the control by the skin.
 *
 * @param props - {@link MultiSelectMenuProps}.
 * @returns The listbox.
 */
export function MultiSelectMenu({
  service,
  items,
  noResultsText,
  variant,
  labelId,
}: Readonly<MultiSelectMenuProps>) {
  /**
   * Lifts the menu into the top layer on every mount. An environment without the Popover API
   * (jsdom, an old browser) only renders the markup.
   *
   * @param node - The listbox element, or `null` when it unmounts.
   */
  const attachMenu = useCallback((node: HTMLUListElement | null) => {
    if (!node || typeof node.showPopover !== 'function') return
    if (!node.matches(':popover-open')) node.showPopover()
  }, [])

  return (
    <ListboxList
      ref={attachMenu}
      variant={variant}
      popover="manual"
      className={MULTI_SELECT_MENU_CLASS}
      // A listbox needs a name of its own: the field's label.
      aria-labelledby={labelId}
      {...toReactAttributes(service.listboxAttrs())}
      // Focus stays in the input: a press on an option must not move it to <body>.
      onMouseDown={(event) => {
        event.preventDefault()
      }}
    >
      {items.map((item) => (
        <MultiSelectOption
          key={item.value}
          item={item}
          service={service}
          variant={variant}
        />
      ))}
      {items.length === 0 ? (
        // A non-selectable row keeps the listbox valid (a listbox owns at least one option).
        <li
          role="option"
          aria-selected="false"
          aria-disabled="true"
          className={MULTI_SELECT_EMPTY_CLASS}
        >
          {noResultsText}
        </li>
      ) : null}
    </ListboxList>
  )
}

export default MultiSelectMenu
