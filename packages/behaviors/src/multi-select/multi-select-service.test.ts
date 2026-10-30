import { describe, expect, it, vi } from 'vitest'

import { findMatch, fold } from './match.js'
import { createMultiSelectService } from './multi-select-service.js'

import type { MultiSelectOption, MultiSelectOptions } from './types.js'

const OPTIONS: MultiSelectOption[] = [
  { value: 'port', label: 'Port' },
  { value: 'pilgrimage', label: 'Pèlerinage' },
  { value: 'fair', label: 'Foire', disabled: true },
  { value: 'bishopric', label: 'Évêché' },
]

/**
 * Builds a service over the four test options.
 *
 * @param options - Options overriding the defaults.
 * @returns The service.
 */
const setup = (options: Partial<MultiSelectOptions> = {}) =>
  createMultiSelectService({ uid: 'ms', options: OPTIONS, ...options })

/**
 * A keyboard event whose `preventDefault` is a spy.
 *
 * @param key - The key.
 * @param extra - Modifier flags.
 * @returns The event.
 */
const key = (key: string, extra: Record<string, boolean> = {}) => ({
  key,
  preventDefault: vi.fn(),
  ...extra,
})

describe('MultiSelectService', () => {
  describe('happy path', () => {
    it('starts closed, with every option visible and nothing chosen', () => {
      const state = setup().getState()
      expect(state.open).toBe(false)
      expect(state.value).toEqual([])
      expect(state.items.map((item) => item.value)).toEqual([
        'port',
        'pilgrimage',
        'fair',
        'bishopric',
      ])
    })

    it('adds a toggled option to the selection and reports it', () => {
      const onChange = vi.fn()
      const service = setup({ onChange })
      service.toggle('port')
      expect(service.getState().value).toEqual(['port'])
      expect(service.getState().tags).toEqual([
        { value: 'port', label: 'Port', known: true },
      ])
      expect(onChange).toHaveBeenCalledWith(['port'])
    })

    it('removes an option toggled a second time', () => {
      const service = setup({ defaultValue: ['port'] })
      service.toggle('port')
      expect(service.getState().value).toEqual([])
    })

    it('keeps the menu open after a choice and empties the search', () => {
      const service = setup()
      service.setQuery('po')
      service.toggle('port')
      expect(service.getState().open).toBe(true)
      expect(service.getState().query).toBe('')
      expect(service.getState().items).toHaveLength(4)
    })

    it('announces an added and a removed choice', () => {
      const service = setup()
      service.toggle('port')
      expect(service.getState().announcement).toBe('Port added')
      service.toggle('port')
      expect(service.getState().announcement).toBe('Port removed')
    })

    it('marks chosen options selected in the items and their attributes', () => {
      const service = setup({ defaultValue: ['pilgrimage'] })
      const item = service.getState().items[1]
      expect(item.selected).toBe(true)
      expect(service.optionAttrs('pilgrimage')['aria-selected']).toBe('true')
      expect(service.optionAttrs('port')['aria-selected']).toBe('false')
    })
  })

  describe('variants', () => {
    it('filters by a query, ignoring case and accents', () => {
      const service = setup()
      service.setQuery('pele')
      expect(service.getState().items.map((item) => item.value)).toEqual([
        'pilgrimage',
      ])
      expect(service.getState().items[0].match).toEqual({ start: 0, end: 4 })
    })

    it('announces how many options a search leaves', () => {
      const service = setup()
      service.setQuery('e')
      expect(service.getState().announcement).toBe('3 results')
      service.setQuery('por')
      expect(service.getState().announcement).toBe('1 result')
    })

    it('opens on a query, the cursor on the first enabled match', () => {
      const service = setup()
      service.setQuery('e')
      expect(service.getState().open).toBe(true)
      expect(service.getState().activeValue).toBe('pilgrimage')
    })

    it('stays controlled: a toggle reports the intent and waits for the parent', () => {
      const onChange = vi.fn()
      const service = setup({ value: ['port'], onChange })
      service.toggle('bishopric')
      expect(onChange).toHaveBeenCalledWith(['port', 'bishopric'])
      expect(service.getState().value).toEqual(['port'])
      service.setOptions({ value: ['port', 'bishopric'] })
      expect(service.getState().value).toEqual(['port', 'bishopric'])
    })

    it('moves the cursor down and up, wrapping and skipping the disabled option', () => {
      const service = setup()
      service.handleKeydown(key('ArrowDown'))
      expect(service.getState().activeValue).toBe('port')
      service.handleKeydown(key('ArrowDown'))
      service.handleKeydown(key('ArrowDown'))
      expect(service.getState().activeValue).toBe('bishopric')
      service.handleKeydown(key('ArrowDown'))
      expect(service.getState().activeValue).toBe('port')
      service.handleKeydown(key('ArrowUp'))
      expect(service.getState().activeValue).toBe('bishopric')
    })

    it('opens on Arrow Up with the cursor on the last option', () => {
      const service = setup()
      service.handleKeydown(key('ArrowUp'))
      expect(service.getState()).toMatchObject({
        open: true,
        activeValue: 'bishopric',
      })
    })

    it('jumps with Home and End while open, and leaves them to the caret while closed', () => {
      const service = setup()
      const closedHome = key('Home')
      expect(service.handleKeydown(closedHome)).toBe(false)
      expect(closedHome.preventDefault).not.toHaveBeenCalled()
      service.open()
      service.handleKeydown(key('End'))
      expect(service.getState().activeValue).toBe('bishopric')
      service.handleKeydown(key('Home'))
      expect(service.getState().activeValue).toBe('port')
    })

    it('toggles the option under the cursor with Enter', () => {
      const service = setup()
      service.handleKeydown(key('ArrowDown'))
      const enter = key('Enter')
      expect(service.handleKeydown(enter)).toBe(true)
      expect(enter.preventDefault).toHaveBeenCalled()
      expect(service.getState().value).toEqual(['port'])
    })

    it('closes with Escape, then clears the search with a second Escape', () => {
      const service = setup()
      service.setQuery('po')
      service.handleKeydown(key('Escape'))
      expect(service.getState()).toMatchObject({ open: false, query: 'po' })
      service.handleKeydown(key('Escape'))
      expect(service.getState().query).toBe('')
      expect(service.handleKeydown(key('Escape'))).toBe(false)
    })

    it('removes the last choice with Backspace in an empty input only', () => {
      const service = setup({ defaultValue: ['port', 'bishopric'] })
      service.handleKeydown(key('Backspace'))
      expect(service.getState().value).toEqual(['port'])
      service.setQuery('x')
      expect(service.handleKeydown(key('Backspace'))).toBe(false)
      expect(service.getState().value).toEqual(['port'])
    })

    it('moves focus to the next badge after a removal by its button', () => {
      const service = setup({ defaultValue: ['port', 'pilgrimage'] })
      service.remove('port')
      expect(service.getState()).toMatchObject({
        value: ['pilgrimage'],
        focusTarget: { kind: 'remove', value: 'pilgrimage' },
        focusToken: 1,
      })
    })

    it('moves focus to the input when the last badge is removed', () => {
      const service = setup({ defaultValue: ['port', 'pilgrimage'] })
      service.remove('pilgrimage')
      expect(service.getState().focusTarget).toEqual({ kind: 'input' })
    })

    it('closes and clears the search when focus leaves', () => {
      const service = setup()
      service.setQuery('po')
      service.close({ clearQuery: true })
      expect(service.getState()).toMatchObject({ open: false, query: '' })
    })

    it('translates the sentences it says', () => {
      const service = setup({
        defaultValue: ['port'],
        messages: {
          remove: (label) => `Retirer ${label}`,
          removed: (label) => `${label} retiré`,
          noResults: 'Aucun résultat',
        },
      })
      expect(service.removeAttrs('port')['aria-label']).toBe('Retirer Port')
      expect(service.getState().noResultsText).toBe('Aucun résultat')
      service.remove('port')
      expect(service.getState().announcement).toBe('Port retiré')
    })

    it('exposes the combobox attributes, open and closed', () => {
      const service = setup()
      expect(service.comboboxAttrs()).toEqual({
        role: 'combobox',
        'aria-expanded': 'false',
        'aria-controls': undefined,
        'aria-activedescendant': undefined,
        'aria-autocomplete': 'list',
        autocomplete: 'off',
      })
      service.handleKeydown(key('ArrowDown'))
      expect(service.comboboxAttrs()).toMatchObject({
        'aria-expanded': 'true',
        'aria-controls': 'multi-select-ms-listbox',
        'aria-activedescendant': 'multi-select-ms-option-port',
      })
      expect(service.listboxAttrs()).toEqual({
        id: 'multi-select-ms-listbox',
        role: 'listbox',
        'aria-multiselectable': 'true',
        tabindex: -1,
      })
    })
  })

  describe('managed errors', () => {
    it('refuses a disabled option', () => {
      const onChange = vi.fn()
      const service = setup({ onChange })
      expect(service.toggle('fair')).toBe(false)
      expect(onChange).not.toHaveBeenCalled()
      expect(service.optionAttrs('fair')['aria-disabled']).toBe('true')
    })

    it('does nothing while the control is disabled', () => {
      const service = setup({ disabled: true, defaultValue: ['port'] })
      service.open()
      service.setQuery('po')
      expect(service.toggle('bishopric')).toBe(false)
      expect(service.remove('port')).toBe(false)
      expect(service.handleKeydown(key('ArrowDown'))).toBe(false)
      expect(service.getState()).toMatchObject({ open: false, value: ['port'] })
      expect(service.removeAttrs('port').disabled).toBe('')
    })

    it('closes the menu when the control becomes disabled', () => {
      const service = setup()
      service.open()
      service.setOptions({ disabled: true })
      expect(service.getState().open).toBe(false)
    })

    it('leaves a modified key to the browser', () => {
      const service = setup()
      const event = key('ArrowDown', { altKey: true })
      expect(service.handleKeydown(event)).toBe(false)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('shows no item and no cursor when nothing matches', () => {
      const service = setup()
      service.setQuery('zzz')
      expect(service.getState()).toMatchObject({ items: [], activeValue: null })
      expect(service.comboboxAttrs()['aria-activedescendant']).toBeUndefined()
      // Open with nothing to choose: Enter is consumed, so an enclosing form does not submit.
      const enter = key('Enter')
      expect(service.handleKeydown(enter)).toBe(true)
      expect(enter.preventDefault).toHaveBeenCalled()
      expect(service.getState().announcement).toBe('No results')
    })

    it('leaves Enter to the browser while the menu is closed', () => {
      expect(setup().handleKeydown(key('Enter'))).toBe(false)
    })
  })

  describe('unmanaged errors', () => {
    it('shows a value no option carries as is, and warns', () => {
      const onWarn = vi.fn()
      const service = setup({ defaultValue: ['ghost'], onWarn })
      expect(service.getState().tags).toEqual([
        { value: 'ghost', label: 'ghost', known: false },
      ])
      expect(onWarn).toHaveBeenCalledWith(
        '[multi-select:ms] no option for the value: ghost'
      )
    })

    it('warns about a duplicate option value', () => {
      const onWarn = vi.fn()
      setup({
        options: [...OPTIONS, { value: 'port', label: 'Harbour' }],
        onWarn,
      })
      expect(onWarn).toHaveBeenCalledWith(
        '[multi-select:ms] duplicate option value: port'
      )
    })

    it('refuses to toggle an unknown value', () => {
      expect(setup().toggle('ghost')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('notifies nothing for a no-op setOptions', () => {
      const service = setup()
      const listener = vi.fn()
      service.subscribe(listener)
      service.setOptions({ onChange: () => undefined, options: [...OPTIONS] })
      expect(listener).not.toHaveBeenCalled()
    })

    it('does not report the initial selection', () => {
      const onChange = vi.fn()
      setup({ defaultValue: ['port'], onChange })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('makes a repeated sentence differ so the live region reads it again', () => {
      // Controlled, the parent ignores the change: the same choice is announced twice in a row.
      const service = setup({ value: [] })
      service.toggle('port')
      const first = service.getState().announcement
      service.toggle('port')
      const second = service.getState().announcement
      expect(second).not.toBe(first)
      expect(second.trim()).toBe(first)
      service.toggle('port')
      expect(service.getState().announcement).toBe(first)
    })

    it('drops the cursor when the options no longer hold its value', () => {
      const service = setup()
      service.open()
      service.setOptions({ options: OPTIONS.slice(1) })
      expect(service.getState().activeValue).toBe('pilgrimage')
    })

    it('handles an empty option list', () => {
      const service = setup({ options: [] })
      service.handleKeydown(key('ArrowDown'))
      expect(service.getState()).toMatchObject({
        open: true,
        items: [],
        activeValue: null,
      })
    })

    it('slugs a value with spaces in the option id', () => {
      expect(setup().optionId('a b')).toBe('multi-select-ms-option-a-b')
    })

    it('keeps working after destroy', () => {
      const service = setup()
      service.destroy()
      service.toggle('port')
      expect(service.getState().value).toEqual(['port'])
    })
  })
})

describe('findMatch', () => {
  it('maps the match back onto the original characters', () => {
    expect(findMatch('Évêché', 'eve')).toEqual({ start: 0, end: 3 })
    expect(findMatch('Grand Évêché', ' ÉVÊ ')).toEqual({ start: 6, end: 9 })
  })

  it('returns null for an empty or absent query', () => {
    expect(findMatch('Port', '   ')).toBeNull()
    expect(findMatch('Port', 'x')).toBeNull()
  })

  it('folds case and accents', () => {
    expect(fold('Pèlerinage')).toBe('pelerinage')
  })
})
