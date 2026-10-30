// Multi-select — CSS-free subpath (no Tailwind leak in Storybook).
import { Formik } from 'formik'
import { useState } from 'react'

import { Button } from '@fubaritico/react/Button'
import { Modal } from '@fubaritico/react/Modal'
import { MultiSelect } from '@fubaritico/react/MultiSelect'

import type {
  MultiSelectOption,
  MultiSelectProps,
} from '@fubaritico/react/MultiSelect'
import type { Meta, StoryObj } from '@storybook/react-vite'

/** A list that grows — the reasons of a city in Atlas. */
const REASONS: MultiSelectOption[] = [
  { value: 'port', label: 'Port' },
  { value: 'pilgrimage', label: 'Pèlerinage' },
  { value: 'fair', label: 'Foire' },
  { value: 'bishopric', label: 'Évêché' },
  { value: 'university', label: 'Université' },
  { value: 'capital', label: 'Capitale' },
  { value: 'crossroads', label: 'Carrefour commercial' },
  { value: 'fortress', label: 'Place forte' },
  { value: 'mint', label: 'Atelier monétaire', disabled: true },
  { value: 'abbey', label: 'Abbaye' },
]

/** The French sentences, as Atlas would pass them. */
const FRENCH = {
  remove: (label: string) => `Retirer ${label}`,
  added: (label: string) => `${label} ajouté`,
  removed: (label: string) => `${label} retiré`,
  results: (count: number) =>
    count === 1 ? '1 résultat' : `${String(count)} résultats`,
  noResults: 'Aucun résultat',
}

/**
 * A controlled MultiSelect: the story owns the list of values, as a form would.
 *
 * @param props - MultiSelect props; `value` and `onChange` are driven here.
 * @returns The field, with the current value printed below it.
 */
function Controlled(props: Partial<MultiSelectProps>) {
  const [value, setValue] = useState<string[]>(
    props.defaultValue ? [...props.defaultValue] : []
  )
  return (
    <div style={{ inlineSize: '22rem' }}>
      <MultiSelect
        label="Raisons"
        options={REASONS}
        placeholder="Choisir des raisons"
        messages={FRENCH}
        {...props}
        defaultValue={undefined}
        value={value}
        onChange={setValue}
      />
    </div>
  )
}

/**
 * A button opening a Modal that holds the field.
 *
 * @returns The fixture.
 */
function InModal() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
        }}
      >
        Ouvrir la fiche
      </Button>
      <Modal
        isOpen={open}
        onClose={() => {
          setOpen(false)
        }}
        aria-label="Fiche ville"
      >
        <div style={{ padding: '1.5rem' }}>
          <Controlled />
        </div>
      </Modal>
    </>
  )
}

/**
 * MultiSelect — a field holding several choices as removable badges, with a search over a listbox
 * of options. Behaviour in `@fubaritico/behaviors` (`MultiSelectService`), skin in
 * `@fubaritico/styles` (`.ui-multi-select`), classes from `@fubaritico/variants`.
 */
const meta = {
  title: 'Reference/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['light', 'dark'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    message: { control: 'text' },
    messageType: { control: 'inline-radio', options: ['info', 'error'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    options: { table: { disable: true } },
    value: { table: { disable: true } }, // controlled state
    defaultValue: { table: { disable: true } },
    onChange: { table: { disable: true } }, // callback
    messages: { table: { disable: true } },
    service: { table: { disable: true } },
  },
  args: {
    label: 'Raisons',
    options: REASONS,
    placeholder: 'Choisir des raisons',
    variant: 'light',
    size: 'md',
    messageType: 'info',
  },
} satisfies Meta<typeof MultiSelect>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel (controlled by the story). */
export const Playground: Story = {
  render: (args) => (
    <div
      style={{
        padding: '1rem',
        backgroundColor:
          args.variant === 'dark' ? 'var(--color-surface-inverse)' : undefined,
      }}
    >
      <Controlled {...args} />
    </div>
  ),
}

/** Every case (sizes, chosen values, many badges, error, disabled, dark) in one view. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Controlled size="sm" label="Small" />
      <Controlled
        label="Medium (default), two chosen"
        defaultValue={['port', 'bishopric']}
      />
      <Controlled size="lg" label="Large" defaultValue={['capital']} />
      <Controlled
        label="Many choices — the field wraps"
        defaultValue={REASONS.filter((reason) => !reason.disabled).map(
          (reason) => reason.value
        )}
      />
      <Controlled
        label="In error"
        message="Choisissez au moins une raison."
        messageType="error"
      />
      <Controlled
        label="With help"
        message="Les raisons qui font de ce lieu une ville."
      />
      <Controlled label="Disabled" defaultValue={['port']} disabled />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--color-surface-inverse)',
        }}
      >
        <Controlled
          variant="dark"
          label="Dark"
          message="Sur un panneau sombre (l'admin de Payload)."
          defaultValue={['pilgrimage', 'fair']}
        />
        <Controlled
          variant="dark"
          label="Dark, in error"
          message="Choisissez au moins une raison."
          messageType="error"
        />
      </div>
    </div>
  ),
}

/** Inside a Modal: the menu is in the top layer, every option reachable, Escape closes it only. */
export const InAModal: Story = {
  parameters: { controls: { disable: true } },
  render: () => <InModal />,
}

/** Values of the Formik story's form. */
interface CityForm {
  /** The chosen reasons. */
  reasons: string[]
}

/**
 * A Formik form around the field, printing what it submits.
 *
 * @returns The fixture.
 */
function CityFormik() {
  const [submitted, setSubmitted] = useState<CityForm | null>(null)
  return (
    <Formik<CityForm>
      initialValues={{ reasons: [] }}
      validate={(values) =>
        values.reasons.length === 0
          ? { reasons: 'Choisissez au moins une raison.' }
          : {}
      }
      validateOnMount
      onSubmit={(values, { setSubmitting }) => {
        setSubmitted(values)
        setSubmitting(false)
      }}
    >
      {({
        values,
        errors,
        touched,
        isValid,
        handleSubmit,
        setFieldValue,
        setFieldTouched,
      }) => (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            inlineSize: '22rem',
          }}
        >
          <MultiSelect
            label="Raisons"
            name="reasons"
            options={REASONS}
            messages={FRENCH}
            placeholder="Choisir des raisons"
            value={values.reasons}
            onChange={(next) => void setFieldValue('reasons', next)}
            onBlur={() => void setFieldTouched('reasons', true)}
            // Formik types an array field's error as string | string[]: ours is one sentence.
            message={
              touched.reasons && typeof errors.reasons === 'string'
                ? errors.reasons
                : undefined
            }
            messageType="error"
          />
          <Button type="submit" disabled={!isValid}>
            Ajouter
          </Button>
          {submitted ? (
            <output>Envoyé : {submitted.reasons.join(', ')}</output>
          ) : null}
        </form>
      )}
    </Formik>
  )
}

/**
 * In a Formik form, as Atlas uses it: `setFieldValue` on change, `setFieldTouched` on blur, the
 * error shown once touched, the submit button disabled while the form is invalid.
 */
export const WithFormik: Story = {
  parameters: { controls: { disable: true } },
  render: () => <CityFormik />,
}
