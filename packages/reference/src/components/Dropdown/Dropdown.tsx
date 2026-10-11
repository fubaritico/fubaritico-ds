import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import {
  DROPDOWN_ANCHOR_VAR,
  DROPDOWN_CLASS,
  DROPDOWN_CONTROL_CLASS,
  DROPDOWN_DIVIDER_CLASS,
  DROPDOWN_DOT_CLASS,
  DROPDOWN_ITEM_CLASS,
  DROPDOWN_ITEM_DESTRUCTIVE_CLASS,
  DROPDOWN_TRIGGER_CONTENT_CLASS,
  dropdownCaretVariants,
  dropdownMenuVariants,
} from '@fubaritico/variants'

import { Button } from '../Button'
import { Icon } from '../Icon'
import { Menu } from '../Menu'
import { Typography } from '../Typography'

import type { DropdownProps } from './Dropdown.types'
import type { CSSProperties, FocusEvent, KeyboardEvent, ReactNode } from 'react'

export type { DropdownProps, DropdownOption } from './Dropdown.types'

/** Pixel size of the leading icon / caret glyphs. */
const GLYPH_SIZE = 16

/**
 * Dropdown — a select-like control: a trigger button that opens a floating {@link Menu} of options.
 *
 * Web-only floating menu (the mobile bottom-sheet branch of the source component was dropped). The menu
 * is a `popover="manual"` element in the browser's TOP LAYER, rendered in place: above every
 * `z-index`, unclipped by any `overflow`, and — unlike a portal — still usable inside a `Modal` it is
 * opened from. The skin anchors it to the control in CSS and flips it above when there is no room.
 * Opening moves focus into the menu; it closes on selection, outside-click, `Escape` (the menu's,
 * never the surrounding dialog's) and when focus leaves it. Keyboard navigation (Arrow keys / Enter /
 * Escape) comes from the composed `Menu`. The skin owns the Dropdown-specific glue (`.ui-dropdown`);
 * the trigger and menu are composed primitives.
 *
 * @param props - {@link DropdownProps}.
 * @returns The rendered dropdown (label + trigger + floating menu).
 */
export function Dropdown({
  label,
  options,
  selectedValue,
  onSelect,
  'aria-label': ariaLabel,
  menuAriaLabel,
  withPortal,
  trigger,
  buttonVariant = 'outline',
  buttonSize = 'md',
  buttonClassName,
  buttonFullWidth,
  position = 'left',
  renderItem,
}: Readonly<DropdownProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuWrapperRef = useRef<HTMLDivElement>(null)
  const menuListRef = useRef<HTMLUListElement>(null)
  const menuId = useId()
  const triggerId = useId()
  // A dashed ident unique per instance: `useId` yields `«r1»`-like strings, not valid in an ident.
  const anchorStyle = useMemo(
    () =>
      ({
        [DROPDOWN_ANCHOR_VAR]: `--ui-dropdown-${menuId.replace(/[^\w-]/g, '')}`,
      }) as CSSProperties,
    [menuId]
  )

  const selectedOption = useMemo(
    () => options.find((o) => o.value === selectedValue),
    [options, selectedValue]
  )
  const selectedLabel = selectedOption?.label ?? selectedValue
  // The keyboard cursor opens on the selected option, or the first one that can be chosen.
  const defaultActiveIndex = useMemo(() => {
    const selected = options.findIndex(
      (o) => o.value === selectedValue && !o.disabled
    )
    return selected >= 0 ? selected : options.findIndex((o) => !o.disabled)
  }, [options, selectedValue])
  const fullWidth = buttonFullWidth ?? !trigger

  const handleClose = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }, [])

  // Closing from the trigger goes through `handleClose`: focus is in the menu, which unmounts, and
  // a click does not focus a button in every browser (Safari) — focus would fall to `<body>`.
  const handleToggle = useCallback(() => {
    if (isOpen) handleClose()
    else setIsOpen(true)
  }, [isOpen, handleClose])

  /**
   * Opens the menu from the keyboard with Arrow Down / Up, as a native select does — or sends focus
   * back into a menu already open (after Shift+Tab onto the trigger).
   *
   * @param event - The trigger's keydown event.
   */
  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      if (isOpen) menuListRef.current?.focus()
      else setIsOpen(true)
    },
    [isOpen]
  )

  /**
   * While open, Escape closes the menu wherever focus sits in the Dropdown (the trigger after
   * Shift+Tab included) and is consumed — it never reaches a surrounding `Modal`. The Menu consumes
   * its own Escape first; a prevented event is left alone.
   *
   * @param event - A keydown event bubbled to the root.
   */
  const handleRootKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!isOpen || event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      handleClose()
    },
    [isOpen, handleClose]
  )

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value)
      handleClose()
    },
    [onSelect, handleClose]
  )

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const inContainer = containerRef.current?.contains(target)
      const inMenu = menuWrapperRef.current?.contains(target)
      if (!inContainer && !inMenu) handleClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClose])

  // Opening moves focus into the menu, so its keyboard model (arrows, Enter, Escape) is live at once.
  // Escape then reaches the menu, which consumes it — instead of the trigger, where it would close a
  // surrounding `Modal`.
  useLayoutEffect(() => {
    if (isOpen) menuListRef.current?.focus()
  }, [isOpen])

  /**
   * Attaches the menu wrapper and lifts it into the top layer. An environment without the Popover
   * API (an old browser, jsdom) only renders the markup.
   *
   * @param node - The wrapper element, or `null` when it unmounts.
   */
  const attachMenu = useCallback((node: HTMLDivElement | null) => {
    menuWrapperRef.current = node
    if (!node || typeof node.showPopover !== 'function') return
    if (!node.matches(':popover-open')) node.showPopover()
  }, [])

  /**
   * Closes the menu when focus moves outside both the control and the menu (Tab away), without
   * pulling focus back — the user is going somewhere else.
   *
   * @param event - The blur event, bubbled to the root through the React tree — portalled menu included.
   */
  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (!(next instanceof Node)) return
    if (containerRef.current?.contains(next)) return
    if (menuWrapperRef.current?.contains(next)) return
    setIsOpen(false)
  }, [])

  const menuItems = options.flatMap((option, index) => {
    const nodes: ReactNode[] = []
    if (option.dividerBefore) {
      nodes.push(
        <li
          role="separator"
          className={DROPDOWN_DIVIDER_CLASS}
          key={`divider-${option.value}`}
        />
      )
    }
    const isSelected = option.value === selectedValue
    nodes.push(
      <Menu.Item
        key={option.value}
        value={option.value}
        index={index}
        disabled={option.disabled}
        className={
          option.destructive ? DROPDOWN_ITEM_DESTRUCTIVE_CLASS : undefined
        }
      >
        {renderItem ? (
          renderItem(option, { isSelected })
        ) : (
          <span className={DROPDOWN_ITEM_CLASS}>
            {option.color ? (
              <span
                className={DROPDOWN_DOT_CLASS}
                style={{ background: option.color }}
                aria-hidden="true"
              />
            ) : null}
            {option.icon ? (
              <Icon name={option.icon} size={GLYPH_SIZE} aria-hidden="true" />
            ) : null}
            <span>{option.label}</span>
          </span>
        )}
      </Menu.Item>
    )
    return nodes
  })

  const floatingMenu = (
    <div
      ref={attachMenu}
      popover="manual"
      // With `withPortal` the menu leaves the root's subtree and would not inherit the anchor name.
      style={anchorStyle}
      className={dropdownMenuVariants({ align: position })}
      // A press on the menu's own chrome (padding, a divider, a disabled option) must not take focus
      // off the listbox — its keyboard model, Escape included, would go dead. Clicks still select.
      onMouseDown={(event) => {
        event.preventDefault()
      }}
    >
      <Menu
        ref={menuListRef}
        id={menuId}
        selectedValue={selectedValue}
        variant="light"
        onSelect={handleSelect}
        onClose={handleClose}
        defaultActiveIndex={defaultActiveIndex}
        aria-label={menuAriaLabel}
        // Unnamed otherwise: the listbox takes the trigger's name ("Sort by: Newest").
        aria-labelledby={menuAriaLabel ? undefined : triggerId}
      >
        {menuItems}
      </Menu>
    </div>
  )

  return (
    <div
      className={DROPDOWN_CLASS}
      ref={containerRef}
      style={anchorStyle}
      onBlur={handleBlur}
      onKeyDown={handleRootKeyDown}
    >
      {label ? (
        <Typography as="span" variant="body2">
          {label}
        </Typography>
      ) : null}
      <div className={DROPDOWN_CONTROL_CLASS}>
        <Button
          ref={triggerRef}
          id={triggerId}
          type="button"
          variant={buttonVariant}
          size={buttonSize}
          onClick={handleToggle}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={ariaLabel ?? `${label ?? 'Select'}: ${selectedLabel}`}
          className={buttonClassName}
          style={fullWidth ? { width: '100%' } : undefined}
        >
          {trigger ? (
            trigger({ isOpen, selectedLabel })
          ) : (
            <>
              <span className={DROPDOWN_TRIGGER_CONTENT_CLASS}>
                {selectedOption?.color ? (
                  <span
                    className={DROPDOWN_DOT_CLASS}
                    style={{ background: selectedOption.color }}
                    aria-hidden="true"
                  />
                ) : null}
                {selectedOption?.icon ? (
                  <Icon
                    name={selectedOption.icon}
                    size={GLYPH_SIZE}
                    aria-hidden="true"
                  />
                ) : null}
                <span>{selectedLabel}</span>
              </span>
              <span className={dropdownCaretVariants({ open: isOpen })}>
                <Icon name="ChevronDown" size={GLYPH_SIZE} aria-hidden="true" />
              </span>
            </>
          )}
        </Button>

        {isOpen && !withPortal ? floatingMenu : null}
      </div>

      {isOpen && withPortal ? createPortal(floatingMenu, document.body) : null}
    </div>
  )
}

export default Dropdown
