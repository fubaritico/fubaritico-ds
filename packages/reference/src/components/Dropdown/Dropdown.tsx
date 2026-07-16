import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  DROPDOWN_CLASS,
  DROPDOWN_CONTROL_CLASS,
  DROPDOWN_DIVIDER_CLASS,
  DROPDOWN_DOT_CLASS,
  DROPDOWN_ITEM_CLASS,
  DROPDOWN_ITEM_DESTRUCTIVE_CLASS,
  DROPDOWN_TRIGGER_CONTENT_CLASS,
  dropdownCaretVariants,
  dropdownMenuVariants,
} from '@fubaritico-ds/variants'

import { Button } from '../Button'
import { Icon } from '../Icon'
import { Menu } from '../Menu'
import { Portal } from '../Portal'
import { Typography } from '../Typography'

import type { DropdownProps } from './Dropdown.types'
import type { CSSProperties, ReactNode } from 'react'

export type { DropdownProps, DropdownOption } from './Dropdown.types'

/** Gap in px between the trigger and the floating menu (used for flip math). */
const MENU_GAP = 8

/** z-index that lifts the portalled menu above page content (mirrors `--ui-dropdown-z` in the skin). */
const MENU_Z_INDEX = 50

/** Pixel size of the leading icon / caret glyphs. */
const GLYPH_SIZE = 16

/**
 * Dropdown — a select-like control: a trigger button that opens a floating {@link Menu} of options.
 *
 * Web-only floating menu (the mobile bottom-sheet branch of the source component was dropped). The menu
 * auto-flips above the trigger when there isn't room below, can render in a `Portal` to escape
 * `overflow:hidden` ancestors, closes on outside-click / `Escape`, and returns focus to the trigger.
 * Keyboard navigation (Arrow keys / Enter / Escape) comes from the composed `Menu`. The skin owns the
 * Dropdown-specific glue (`.ui-dropdown`); the trigger and menu are composed primitives.
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
  const [flipped, setFlipped] = useState(false)
  const [portalStyle, setPortalStyle] = useState<CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuWrapperRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const selectedOption = useMemo(
    () => options.find((o) => o.value === selectedValue),
    [options, selectedValue]
  )
  const selectedLabel = selectedOption?.label ?? selectedValue
  const fullWidth = buttonFullWidth ?? !trigger

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }, [])

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

  /** Computes the flip direction (and the fixed portal coordinates when portalled). */
  const updatePlacement = useCallback(() => {
    const triggerEl = triggerRef.current
    const wrapper = menuWrapperRef.current
    if (!triggerEl || !wrapper) return

    const triggerRect = triggerEl.getBoundingClientRect()
    const menuHeight = wrapper.offsetHeight
    const spaceBelow = window.innerHeight - triggerRect.bottom - MENU_GAP
    const spaceAbove = triggerRect.top - MENU_GAP
    const shouldFlip = menuHeight > spaceBelow && spaceAbove > spaceBelow
    setFlipped(shouldFlip)

    if (withPortal) {
      const top = shouldFlip
        ? triggerRect.top - menuHeight - MENU_GAP
        : triggerRect.bottom + MENU_GAP
      const horizontal =
        position === 'right'
          ? { right: window.innerWidth - triggerRect.right }
          : { left: triggerRect.left }
      setPortalStyle({
        position: 'fixed',
        top,
        ...horizontal,
        zIndex: MENU_Z_INDEX,
        ...(position === 'right'
          ? { minWidth: triggerRect.width }
          : { width: triggerRect.width }),
      })
    }
  }, [withPortal, position])

  useLayoutEffect(() => {
    if (!isOpen) {
      setFlipped(false)
      return
    }
    updatePlacement()
  }, [isOpen, updatePlacement])

  // After portal mount, recompute; close on external scroll (stale positioning).
  useEffect(() => {
    if (!isOpen || !withPortal) return

    const raf = requestAnimationFrame(updatePlacement)
    const handleScroll = (e: Event) => {
      if (
        e.target instanceof Node &&
        menuWrapperRef.current?.contains(e.target)
      ) {
        return
      }
      handleClose()
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, withPortal, updatePlacement, handleClose])

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
      ref={menuWrapperRef}
      style={withPortal ? portalStyle : undefined}
      className={
        withPortal
          ? undefined
          : dropdownMenuVariants({ flipped, align: position })
      }
    >
      <Menu
        id={menuId}
        selectedValue={selectedValue}
        variant="light"
        onSelect={handleSelect}
        onClose={handleClose}
        aria-label={menuAriaLabel}
      >
        {menuItems}
      </Menu>
    </div>
  )

  return (
    <div className={DROPDOWN_CLASS} ref={containerRef}>
      {label ? (
        <Typography as="span" variant="body2">
          {label}
        </Typography>
      ) : null}
      <div className={DROPDOWN_CONTROL_CLASS}>
        <Button
          ref={triggerRef}
          type="button"
          variant={buttonVariant}
          size={buttonSize}
          onClick={handleToggle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={menuId}
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

      {isOpen && withPortal ? <Portal>{floatingMenu}</Portal> : null}
    </div>
  )
}

export default Dropdown
