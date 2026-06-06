import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Typeahead from './Typeahead'

const fruits = [
  { id: '1', label: 'Apple' },
  { id: '2', label: 'Banana' },
  { id: '3', label: 'Cherry' },
]

const renderTypeahead = (
  props: Partial<React.ComponentProps<typeof Typeahead>> = {},
  items = fruits
) =>
  render(
    <Typeahead onSearch={vi.fn()} onSelect={vi.fn()} minChars={1} {...props}>
      <Typeahead.Input placeholder="Search fruits..." icon="MagnifyingGlass" />
      <Typeahead.Menu>
        {items.map((item, i) => (
          <Typeahead.Item key={item.id} value={item.id} index={i}>
            {item.label}
          </Typeahead.Item>
        ))}
      </Typeahead.Menu>
    </Typeahead>
  )

const renderTypeaheadWithEmpty = (
  props: Partial<React.ComponentProps<typeof Typeahead>> = {}
) =>
  render(
    <Typeahead onSearch={vi.fn()} onSelect={vi.fn()} minChars={1} {...props}>
      <Typeahead.Input placeholder="Search fruits..." />
      <Typeahead.Menu>
        <Typeahead.Empty>No results found</Typeahead.Empty>
      </Typeahead.Menu>
    </Typeahead>
  )

const renderTypeaheadWithDisabled = (
  props: Partial<React.ComponentProps<typeof Typeahead>> = {}
) =>
  render(
    <Typeahead onSearch={vi.fn()} onSelect={vi.fn()} minChars={1} {...props}>
      <Typeahead.Input placeholder="Search..." />
      <Typeahead.Menu>
        <Typeahead.Item index={0} value="apple">
          Apple
        </Typeahead.Item>
        <Typeahead.Item index={1} value="banana" disabled>
          Banana
        </Typeahead.Item>
        <Typeahead.Item index={2} value="cherry">
          Cherry
        </Typeahead.Item>
      </Typeahead.Menu>
    </Typeahead>
  )

describe('Typeahead', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // --- Rendering ---

  it('should render a combobox input', () => {
    renderTypeahead()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should render with placeholder', () => {
    renderTypeahead()
    expect(screen.getByPlaceholderText('Search fruits...')).toBeInTheDocument()
  })

  it('should not render the listbox when closed', () => {
    renderTypeahead()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should set aria-expanded=false when closed', () => {
    renderTypeahead()
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  // --- Opening ---

  it('should open menu when typing', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('should set aria-expanded=true when open', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('should render all items when open', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('should reopen menu on click when input has value', async () => {
    renderTypeahead()
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'test')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await userEvent.click(input)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  // --- Closing ---

  it('should close menu on Escape', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should close menu on click outside', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.click(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should close menu when input is cleared', async () => {
    renderTypeahead()
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'abc')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.clear(input)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  // --- Keyboard Navigation ---

  it('should open menu on ArrowDown when closed', async () => {
    renderTypeahead()
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('should move down through items with ArrowDown', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-1')
    )
  })

  it('should wrap to first item when ArrowDown at end', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-0')
    )
  })

  it('should move up through items with ArrowUp', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-0')
    )
  })

  it('should wrap to last item when ArrowUp at start', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-2')
    )
  })

  it('should jump to first item on Home', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-0')
    )
  })

  it('should jump to last item on End', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{End}')
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-2')
    )
  })

  it('should skip disabled items during keyboard navigation', async () => {
    const onSelect = vi.fn()
    renderTypeaheadWithDisabled({ onSelect })
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('cherry')
  })

  // --- Selection ---

  it('should select item on Enter', async () => {
    const onSelect = vi.fn()
    renderTypeahead({ onSelect })
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('should select item on click', async () => {
    const onSelect = vi.fn()
    renderTypeahead({ onSelect })
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.click(screen.getByText('Banana'))
    expect(onSelect).toHaveBeenCalledWith('2')
  })

  it('should close menu after selection', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.click(screen.getByText('Banana'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should clear input after selection by default', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.click(screen.getByText('Banana'))
    expect(screen.getByRole('combobox')).toHaveValue('')
  })

  it('should keep input after selection when clearOnSelect=false', async () => {
    renderTypeahead({ clearOnSelect: false })
    await userEvent.type(screen.getByRole('combobox'), 'test')
    await userEvent.click(screen.getByText('Banana'))
    expect(screen.getByRole('combobox')).toHaveValue('test')
  })

  it('should not select disabled items on click', async () => {
    const onSelect = vi.fn()
    renderTypeaheadWithDisabled({ onSelect })
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.click(screen.getByText('Banana'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  // --- Search callback ---

  it('should call onSearch when typing', async () => {
    const onSearch = vi.fn()
    renderTypeahead({ onSearch })
    await userEvent.type(screen.getByRole('combobox'), 'abc')
    expect(onSearch).toHaveBeenCalledWith('a')
    expect(onSearch).toHaveBeenCalledWith('ab')
    expect(onSearch).toHaveBeenCalledWith('abc')
  })

  it('should call onSearch with empty string when input cleared', async () => {
    const onSearch = vi.fn()
    renderTypeahead({ onSearch })
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'abc')
    onSearch.mockClear()
    await userEvent.clear(input)
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('should debounce onSearch when debounceMs is set', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    renderTypeahead({ onSearch, debounceMs: 300 })
    const input = screen.getByRole('combobox')
    // Use fireEvent for this timing-specific test (fake timers + userEvent conflict)
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(onSearch).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onSearch).toHaveBeenCalledOnce()
    expect(onSearch).toHaveBeenCalledWith('abc')
  })

  // --- Empty state ---

  it('should render empty state', async () => {
    renderTypeaheadWithEmpty()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('should set aria-disabled on empty state', async () => {
    renderTypeaheadWithEmpty()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    const emptyOption = screen
      .getByText('No results found')
      .closest('[role="option"]')
    expect(emptyOption).toHaveAttribute('aria-disabled', 'true')
  })

  // --- Variant ---

  it('should apply dark styles to menu', async () => {
    renderTypeahead({ variant: 'dark' })
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.getByRole('listbox')).toHaveClass('ui:bg-neutral-900')
  })

  it('should apply dark text to items', async () => {
    renderTypeahead({ variant: 'dark' })
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.getAllByRole('option')[0]).toHaveClass('ui:text-neutral-200')
  })

  it('should apply light styles by default', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.getByRole('listbox')).toHaveClass('ui:bg-popover')
  })

  // --- ARIA ---

  it('should set aria-autocomplete=list on input', () => {
    renderTypeahead()
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-autocomplete',
      'list'
    )
  })

  it('should link input to listbox via aria-controls', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    const input = screen.getByRole('combobox')
    const listbox = screen.getByRole('listbox')
    expect(input).toHaveAttribute('aria-controls', listbox.id)
  })

  it('should set aria-selected on active item', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getAllByRole('option')[0]).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should not set aria-controls when closed', () => {
    renderTypeahead()
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-controls')
  })

  // --- Mouse interaction ---

  it('should highlight item on mouse enter', async () => {
    renderTypeahead()
    await userEvent.type(screen.getByRole('combobox'), 'a')
    await userEvent.hover(screen.getByText('Cherry'))
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      expect.stringContaining('item-2')
    )
  })

  // --- Context errors ---

  it('should throw if Typeahead.Input is used outside Typeahead', () => {
    expect(() => render(<Typeahead.Input placeholder="test" />)).toThrow(
      'Typeahead.Input must be used within Typeahead'
    )
  })

  it('should throw if Typeahead.Menu is used outside Typeahead', () => {
    expect(() => render(<Typeahead.Menu />)).toThrow(
      'Typeahead.Menu must be used within Typeahead'
    )
  })

  it('should throw if Typeahead.Item is used outside Typeahead', () => {
    expect(() =>
      render(
        <Typeahead.Item index={0} value="test">
          Test
        </Typeahead.Item>
      )
    ).toThrow('Typeahead.Item must be used within Typeahead')
  })

  it('should throw if Typeahead.Empty is used outside Typeahead', () => {
    expect(() => render(<Typeahead.Empty>No results</Typeahead.Empty>)).toThrow(
      'Typeahead.Empty must be used within Typeahead'
    )
  })

  it('should throw if Typeahead.Highlight is used outside Typeahead', () => {
    expect(() =>
      render(<Typeahead.Highlight>text</Typeahead.Highlight>)
    ).toThrow('Typeahead.Highlight must be used within Typeahead')
  })

  // --- Highlight ---

  it('should bold matching characters in Highlight', async () => {
    render(
      <Typeahead onSearch={vi.fn()} onSelect={vi.fn()}>
        <Typeahead.Input placeholder="Search..." />
        <Typeahead.Menu>
          <Typeahead.Item index={0} value="apple">
            <Typeahead.Highlight>Apple</Typeahead.Highlight>
          </Typeahead.Item>
        </Typeahead.Menu>
      </Typeahead>
    )
    await userEvent.type(screen.getByRole('combobox'), 'app')
    const marks = screen.getAllByText('App')
    expect(marks[0].tagName).toBe('MARK')
    expect(marks[0]).toHaveClass('ui:font-extrabold')
  })

  it('should preserve original casing in Highlight', async () => {
    render(
      <Typeahead onSearch={vi.fn()} onSelect={vi.fn()}>
        <Typeahead.Input placeholder="Search..." />
        <Typeahead.Menu>
          <Typeahead.Item index={0} value="apple">
            <Typeahead.Highlight>Apple</Typeahead.Highlight>
          </Typeahead.Item>
        </Typeahead.Menu>
      </Typeahead>
    )
    await userEvent.type(screen.getByRole('combobox'), 'app')
    expect(screen.getByText('App').tagName).toBe('MARK')
    expect(screen.getByText('le')).toBeInTheDocument()
  })

  // --- minChars ---

  it('should not open menu when input length is below minChars', async () => {
    renderTypeahead({ minChars: 3 })
    await userEvent.type(screen.getByRole('combobox'), 'ab')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('should open menu when input length reaches minChars', async () => {
    renderTypeahead({ minChars: 3 })
    await userEvent.type(screen.getByRole('combobox'), 'abc')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('should default minChars to 2', async () => {
    render(
      <Typeahead onSearch={vi.fn()} onSelect={vi.fn()}>
        <Typeahead.Input placeholder="Search..." />
        <Typeahead.Menu>
          <Typeahead.Item index={0} value="apple">
            Apple
          </Typeahead.Item>
        </Typeahead.Menu>
      </Typeahead>
    )
    await userEvent.type(screen.getByRole('combobox'), 'a')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await userEvent.type(screen.getByRole('combobox'), 'b')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  // --- portal ---

  it('should render menu in a portal when portal is enabled', async () => {
    renderTypeahead({ portal: true })
    await userEvent.type(screen.getByRole('combobox'), 'a')
    const listbox = screen.getByRole('listbox')
    expect(listbox.closest('#portal')).toBeInTheDocument()
  })

  it('should render menu inline when portal is disabled', async () => {
    renderTypeahead({ portal: false })
    await userEvent.type(screen.getByRole('combobox'), 'a')
    const listbox = screen.getByRole('listbox')
    expect(listbox.closest('#portal')).not.toBeInTheDocument()
  })

  it('should position portal menu with fixed positioning', async () => {
    renderTypeahead({ portal: true })
    await userEvent.type(screen.getByRole('combobox'), 'a')
    const listbox = screen.getByRole('listbox')
    expect(listbox.style.position).toBe('fixed')
  })

  it('should render full text when no match in Highlight', async () => {
    render(
      <Typeahead onSearch={vi.fn()} onSelect={vi.fn()}>
        <Typeahead.Input placeholder="Search..." />
        <Typeahead.Menu>
          <Typeahead.Item index={0} value="apple">
            <Typeahead.Highlight>Apple</Typeahead.Highlight>
          </Typeahead.Item>
        </Typeahead.Menu>
      </Typeahead>
    )
    await userEvent.type(screen.getByRole('combobox'), 'xyz')
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.queryByRole('mark')).not.toBeInTheDocument()
  })
})
