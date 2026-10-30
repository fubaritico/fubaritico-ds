import { act, render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { StrictMode, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { createMultiSelectService } from '@fubaritico/behaviors'

import MultiSelect from './MultiSelect'

import type { MultiSelectProps } from './MultiSelect'
import type { MultiSelectOption } from '@fubaritico/behaviors'

const REASONS: MultiSelectOption[] = [
  { value: 'port', label: 'Port' },
  { value: 'pilgrimage', label: 'Pèlerinage' },
  { value: 'fair', label: 'Foire', disabled: true },
  { value: 'bishopric', label: 'Évêché' },
]

/**
 * A controlled MultiSelect, the way a form drives it.
 *
 * @param props - Props to override.
 * @returns The rendered field.
 */
function Controlled({ onChange, ...props }: Partial<MultiSelectProps>) {
  const [value, setValue] = useState<string[]>([])
  return (
    <MultiSelect
      label="Reasons"
      options={REASONS}
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
    />
  )
}

const combobox = () => screen.getByRole('combobox', { name: 'Reasons' })
const option = (name: string) => screen.getByRole('option', { name })
const removeButton = (label: string) =>
  screen.getByRole('button', { name: `Remove ${label}` })

describe('MultiSelect', () => {
  describe('happy path', () => {
    it('renders a labelled combobox, closed', () => {
      render(<Controlled />)
      expect(combobox()).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('opens a multi-selectable listbox on a click in the field', async () => {
      render(<Controlled />)
      await userEvent.click(combobox())
      const listbox = screen.getByRole('listbox')
      expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
      expect(listbox).toHaveAccessibleName('Reasons')
      expect(within(listbox).getAllByRole('option')).toHaveLength(4)
    })

    it('adds a badge on a choice, keeps the menu open and reports the new list', async () => {
      const onChange = vi.fn()
      render(<Controlled onChange={onChange} />)
      await userEvent.click(combobox())
      await userEvent.click(option('Port'))
      expect(onChange).toHaveBeenCalledWith(['port'])
      expect(removeButton('Port')).toBeInTheDocument()
      expect(option('Port')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(combobox()).toHaveFocus()
    })

    it('removes a choice picked a second time', async () => {
      render(<Controlled />)
      await userEvent.click(combobox())
      await userEvent.click(option('Port'))
      await userEvent.click(option('Port'))
      expect(screen.queryByRole('button', { name: 'Remove Port' })).toBeNull()
    })

    it('filters as you type, ignoring accents, and highlights the match', async () => {
      render(<Controlled />)
      await userEvent.type(combobox(), 'pele')
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent('Pèlerinage')
      expect(options[0].querySelector('mark')).toHaveTextContent('Pèle')
    })

    it('announces a choice in a polite live region', async () => {
      render(<Controlled />)
      await userEvent.click(combobox())
      await userEvent.click(option('Port'))
      expect(screen.getByRole('status')).toHaveTextContent('Port added')
    })
  })

  describe('variants', () => {
    it('chooses with the keyboard: Arrow Down then Enter', async () => {
      render(<Controlled />)
      await userEvent.click(combobox())
      await userEvent.keyboard('{Escape}{ArrowDown}{ArrowDown}{Enter}')
      expect(removeButton('Pèlerinage')).toBeInTheDocument()
    })

    it('points aria-activedescendant at the option under the cursor', async () => {
      render(<Controlled />)
      combobox().focus()
      await userEvent.keyboard('{ArrowDown}')
      expect(combobox()).toHaveAttribute(
        'aria-activedescendant',
        option('Port').id
      )
    })

    it('closes with Escape and keeps focus in the field', async () => {
      render(<Controlled />)
      await userEvent.click(combobox())
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(combobox()).toHaveFocus()
    })

    it('removes the last choice with Backspace in an empty field', async () => {
      render(<Controlled defaultValue={undefined} />)
      await userEvent.click(combobox())
      await userEvent.click(option('Port'))
      await userEvent.click(option('Évêché'))
      await userEvent.keyboard('{Backspace}')
      expect(screen.queryByRole('button', { name: 'Remove Évêché' })).toBeNull()
      expect(removeButton('Port')).toBeInTheDocument()
    })

    it('moves focus to the next badge after removing one by its button', async () => {
      render(
        <MultiSelect
          label="Reasons"
          options={REASONS}
          defaultValue={['port', 'bishopric']}
        />
      )
      await userEvent.click(removeButton('Port'))
      expect(removeButton('Évêché')).toHaveFocus()
      expect(screen.getByRole('status')).toHaveTextContent('Port removed')
    })

    it('moves focus to the field after removing the last badge', async () => {
      render(
        <MultiSelect
          label="Reasons"
          options={REASONS}
          defaultValue={['port']}
        />
      )
      await userEvent.click(removeButton('Port'))
      expect(combobox()).toHaveFocus()
    })

    it('marks a chosen option with a check', async () => {
      render(
        <MultiSelect
          label="Reasons"
          options={REASONS}
          defaultValue={['port']}
        />
      )
      await userEvent.click(combobox())
      expect(
        option('Port').querySelector('.ui-multi-select__check')
      ).not.toBeNull()
      expect(
        option('Évêché').querySelector('.ui-multi-select__check')
      ).toBeNull()
    })

    it('renders the dark scheme on the field, the badges and the menu', async () => {
      const { container } = render(
        <MultiSelect
          label="Reasons"
          options={REASONS}
          defaultValue={['port']}
          variant="dark"
        />
      )
      expect(container.firstChild).toHaveClass(
        'ui-field--dark',
        'ui-multi-select--dark'
      )
      expect(container.querySelector('.ui-badge')).toHaveClass(
        'ui-badge--secondary-dark'
      )
      await userEvent.click(combobox())
      expect(screen.getByRole('listbox')).toHaveClass('ui-listbox--dark')
    })

    it.each([
      ['sm', 'ui-multi-select--sm', 'ui-badge--sm'],
      ['lg', 'ui-multi-select--lg', 'ui-badge--lg'],
    ] as const)(
      'renders the %s size on the field and the badges',
      (size, field, badge) => {
        const { container } = render(
          <MultiSelect
            label="Reasons"
            options={REASONS}
            defaultValue={['port']}
            size={size}
          />
        )
        expect(container.firstChild).toHaveClass(field)
        expect(container.querySelector('.ui-badge')).toHaveClass(badge)
      }
    )

    it('shows the placeholder only while nothing is chosen', async () => {
      render(<Controlled placeholder="Pick reasons" />)
      expect(combobox()).toHaveAttribute('placeholder', 'Pick reasons')
      await userEvent.click(combobox())
      await userEvent.click(option('Port'))
      expect(combobox()).not.toHaveAttribute('placeholder')
    })

    it('carries the values in hidden inputs when named', () => {
      const { container } = render(
        <MultiSelect
          label="Reasons"
          options={REASONS}
          defaultValue={['port', 'bishopric']}
          name="reasons"
        />
      )
      const hidden = container.querySelectorAll('input[type="hidden"]')
      expect(
        [...hidden].map((input) => (input as HTMLInputElement).value)
      ).toEqual(['port', 'bishopric'])
    })

    it('translates the sentences it says', async () => {
      render(
        <MultiSelect
          label="Raisons"
          options={REASONS}
          defaultValue={['port']}
          messages={{
            remove: (label) => `Retirer ${label}`,
            noResults: 'Aucun résultat',
          }}
        />
      )
      expect(
        screen.getByRole('button', { name: 'Retirer Port' })
      ).toBeInTheDocument()
      await userEvent.type(screen.getByRole('combobox'), 'zzz')
      expect(
        screen.getByRole('option', { name: 'Aucun résultat' })
      ).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent('Aucun résultat')
    })

    it('is driven by an injected service', async () => {
      const service = createMultiSelectService({
        uid: 'injected',
        options: REASONS,
        defaultValue: ['bishopric'],
      })
      render(
        <MultiSelect label="Reasons" options={REASONS} service={service} />
      )
      expect(removeButton('Évêché')).toBeInTheDocument()
      act(() => {
        service.toggle('port')
      })
      expect(removeButton('Port')).toBeInTheDocument()
    })
  })

  describe('managed errors', () => {
    it('shows an error message, aria-invalid and the invalid modifier', () => {
      const { container } = render(
        <MultiSelect
          label="Reasons"
          options={REASONS}
          message="Pick at least one reason"
          messageType="error"
        />
      )
      expect(combobox()).toHaveAttribute('aria-invalid', 'true')
      expect(combobox()).toHaveAccessibleDescription('Pick at least one reason')
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Pick at least one reason'
      )
      expect(container.firstChild).toHaveClass('ui-multi-select--invalid')
    })

    it('describes the field with an info message, without aria-invalid', () => {
      render(
        <MultiSelect label="Reasons" options={REASONS} message="Optional" />
      )
      expect(combobox()).toHaveAccessibleDescription('Optional')
      expect(combobox()).not.toHaveAttribute('aria-invalid')
    })

    it('refuses a disabled option', async () => {
      const onChange = vi.fn()
      render(<Controlled onChange={onChange} />)
      await userEvent.click(combobox())
      expect(option('Foire')).toHaveAttribute('aria-disabled', 'true')
      await userEvent.click(option('Foire'), { pointerEventsCheck: 0 })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('opens nothing and removes nothing while disabled', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <MultiSelect
          label="Reasons"
          options={REASONS}
          defaultValue={['port']}
          onChange={onChange}
          disabled
        />
      )
      expect(combobox()).toBeDisabled()
      expect(removeButton('Port')).toBeDisabled()
      expect(container.firstChild).toHaveClass('ui-multi-select--disabled')
      await userEvent.click(removeButton('Port'), { pointerEventsCheck: 0 })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('shows a "No results" row when nothing matches', async () => {
      render(<Controlled />)
      await userEvent.type(combobox(), 'zzz')
      const empty = screen.getByRole('option', { name: 'No results' })
      expect(empty).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('unmanaged errors', () => {
    it('shows a value no option carries as is, so the mismatch stays visible', () => {
      render(
        <MultiSelect
          label="Reasons"
          options={REASONS}
          defaultValue={['ghost']}
        />
      )
      expect(removeButton('ghost')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('closes and clears the search when focus leaves with Tab', async () => {
      render(
        <>
          <Controlled />
          <button type="button">After</button>
        </>
      )
      await userEvent.type(combobox(), 'po')
      await userEvent.tab()
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(combobox()).toHaveValue('')
    })

    it('closes the menu when focus moves to a remove button, keeping the search', async () => {
      render(
        <MultiSelect label="Reasons" options={REASONS} defaultValue={['port']} />
      )
      await userEvent.type(combobox(), 'e')
      await userEvent.tab({ shift: true })
      expect(removeButton('Port')).toHaveFocus()
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(combobox()).toHaveValue('e')
    })

    it('closes on a press outside the field', async () => {
      render(
        <>
          <Controlled />
          <p>Outside</p>
        </>
      )
      await userEvent.click(combobox())
      await userEvent.click(screen.getByText('Outside'))
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('opens from a press on the empty area of the control', async () => {
      const { container } = render(<Controlled />)
      const control = container.querySelector('.ui-multi-select__control')
      if (!control) throw new Error('control not rendered')
      await userEvent.click(control)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(combobox()).toHaveFocus()
    })

    it('keeps closing on an outside press when the consumer passes a ref', async () => {
      const ref = { current: null as HTMLDivElement | null }
      render(
        <>
          <MultiSelect label="Reasons" options={REASONS} ref={ref} />
          <p>Outside</p>
        </>
      )
      expect(ref.current).toHaveClass('ui-multi-select')
      await userEvent.click(combobox())
      await userEvent.click(screen.getByText('Outside'))
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('works under StrictMode', async () => {
      render(
        <StrictMode>
          <Controlled />
        </StrictMode>
      )
      await userEvent.click(combobox())
      await userEvent.click(option('Port'))
      expect(removeButton('Port')).toBeInTheDocument()
    })

    it('renders with no option at all', async () => {
      render(<MultiSelect label="Reasons" options={[]} />)
      await userEvent.click(combobox())
      expect(
        screen.getByRole('option', { name: 'No results' })
      ).toBeInTheDocument()
    })

    it('does not steal focus on mount', () => {
      render(
        <MultiSelect
          label="Reasons"
          options={REASONS}
          defaultValue={['port']}
        />
      )
      expect(document.body).toHaveFocus()
    })
  })
})
