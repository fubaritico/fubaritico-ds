import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Card } from '../Card'
import { Modal } from '../Modal'

import Typeahead from './Typeahead'

import type { TypeaheadProps } from './Typeahead'

// Real Chromium: the top layer, CSS anchor positioning, hit-testing, a real `<dialog>` and its
// inertness are the platform's — none of it exists under jsdom.

const COUNTRIES = [
  'France',
  'Francia',
  'Franconia',
  'Frankfurt',
  'Frankish Empire',
  'Frankia',
]

/**
 * A Typeahead over a fixed list, filtering on what is typed.
 *
 * @param props - Typeahead props to override.
 * @returns The rendered typeahead.
 */
function Search(props: Partial<TypeaheadProps>) {
  const [query, setQuery] = useState('')
  const results = COUNTRIES.filter((name) =>
    name.toLowerCase().startsWith(query.toLowerCase())
  )
  return (
    <Typeahead onSearch={setQuery} onSelect={vi.fn()} minChars={1} {...props}>
      <Typeahead.Input aria-label="Polity" />
      <Typeahead.Menu aria-label="Suggestions">
        {results.map((name, index) => (
          <Typeahead.Item key={name} value={name} index={index}>
            {name}
          </Typeahead.Item>
        ))}
      </Typeahead.Menu>
    </Typeahead>
  )
}

const input = () => screen.getByRole('combobox', { name: 'Polity' })
const listbox = () => screen.getByRole('listbox')

/**
 * Whether a pointer at the centre of the element would reach it — nothing paints over it, nothing
 * clips it, and it is not inert.
 *
 * @param element - The element to hit-test.
 * @returns `true` when the element (or a descendant) is the hit target.
 */
function reachable(element: HTMLElement) {
  const box = element.getBoundingClientRect()
  const hit = document.elementFromPoint(
    box.left + box.width / 2,
    box.top + box.height / 2
  )
  return hit !== null && element.contains(hit)
}

describe('Typeahead (browser)', () => {
  describe('happy path', () => {
    it('opens in the top layer, under the field and as wide, with focus kept in the field', async () => {
      render(
        <div style={{ padding: '40px', inlineSize: '260px' }}>
          <Search />
        </div>
      )
      await userEvent.type(input(), 'Fra')
      expect(listbox().matches(':popover-open')).toBe(true)
      expect(listbox()).toHaveAccessibleName('Suggestions')
      expect(input()).toHaveFocus()

      const fieldBox = input().getBoundingClientRect()
      const menuBox = listbox().getBoundingClientRect()
      expect(menuBox.top).toBeGreaterThanOrEqual(fieldBox.bottom)
      expect(Math.abs(menuBox.left - fieldBox.left)).toBeLessThan(1)
      expect(Math.abs(menuBox.width - fieldBox.width)).toBeLessThan(1)
    })
  })

  describe('variants', () => {
    it('opens above the field when there is no room below', async () => {
      render(
        <div style={{ position: 'fixed', insetInline: 0, bottom: '8px' }}>
          <Search />
        </div>
      )
      await userEvent.type(input(), 'Fra')
      const fieldBox = input().getBoundingClientRect()
      expect(listbox().getBoundingClientRect().bottom).toBeLessThanOrEqual(
        fieldBox.top
      )
    })

    it('stays anchored to its field when portalled', async () => {
      render(
        <div style={{ padding: '80px', inlineSize: '260px' }}>
          <Search portal />
        </div>
      )
      await userEvent.type(input(), 'Fra')
      expect(listbox().closest('.ui-typeahead')).toBeNull()
      const fieldBox = input().getBoundingClientRect()
      const menuBox = listbox().getBoundingClientRect()
      expect(menuBox.top).toBeGreaterThanOrEqual(fieldBox.bottom)
      // Portalled, the menu declares the skin's defaults itself: the offset still applies.
      expect(menuBox.top - fieldBox.bottom).toBeGreaterThan(1)
      expect(Math.abs(menuBox.left - fieldBox.left)).toBeLessThan(1)
    })
  })

  describe('managed errors', () => {
    it('inside a Modal: every suggestion is reachable and Escape closes the menu only', async () => {
      /**
       * A Modal holding a Card, which clips its content (`overflow: hidden`).
       *
       * @returns The fixture.
       */
      function InModal() {
        const [open, setOpen] = useState(true)
        return (
          <Modal
            isOpen={open}
            onClose={() => {
              setOpen(false)
            }}
            aria-label="Polity"
          >
            <Card style={{ inlineSize: '300px' }}>
              <Card.Body>
                <Search />
              </Card.Body>
            </Card>
          </Modal>
        )
      }
      render(<InModal />)
      await userEvent.type(input(), 'Fra')
      expect(reachable(screen.getByText('Frankia'))).toBe(true)

      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(document.querySelector('dialog')?.open).toBe(true)
      expect(input()).toHaveFocus()
    })
  })

  describe('focus', () => {
    it('keeps focus in the field when a suggestion is pressed', async () => {
      const onSelect = vi.fn()
      render(<Search onSelect={onSelect} />)
      await userEvent.type(input(), 'Fra')
      await userEvent.click(screen.getByText('Francia'))
      expect(onSelect).toHaveBeenCalledWith('Francia')
      expect(input()).toHaveFocus()
    })

    it('closes the list when focus leaves the field with Tab', async () => {
      render(
        <>
          <Search />
          <button type="button">After</button>
        </>
      )
      await userEvent.type(input(), 'Fra')
      await userEvent.keyboard('{Tab}')
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
      expect(screen.queryByRole('listbox')).toBeNull()
    })
  })

  // L4: N/A — the search is the consumer's; the component only renders what it is given.

  describe('edge cases', () => {
    it('escapes an overflow-hidden ancestor and a z-index 9999 layer', async () => {
      render(
        <>
          <div
            style={{
              overflow: 'hidden',
              blockSize: '48px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Search />
          </div>
          <div
            style={{
              position: 'relative',
              zIndex: 9999,
              blockSize: '300px',
              background: 'white',
            }}
          />
        </>
      )
      await userEvent.type(input(), 'Fra')
      expect(reachable(screen.getByText('Frankia'))).toBe(true)
    })
  })
})
