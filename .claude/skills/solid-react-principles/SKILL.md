---
name: solid-react-principles
description:
  SOLID design principles applied to React components. Use when writing,
  reviewing, or refactoring React components for architecture quality,
  separation of concerns, component responsibility, prop interface design,
  dependency injection, or component substitutability. Triggers on tasks
  involving component splitting, fat components, prop drilling, tight coupling,
  or extensibility.
metadata:
  author: financial-app
  version: '1.0'
  source: 'Frontend Highlights — Applying SOLID Principles in React Applications'
---

# SOLID Principles in React

The five SOLID principles adapted to React component architecture. Use these
as a checklist when designing, reviewing, or refactoring components.

## When to Apply

Reference these principles when:

- Splitting a component that does too much
- Designing component props interfaces
- Creating component variants or specializations
- Decoupling components from data sources or services
- Reviewing component architecture for maintainability
- Refactoring fat components with many unrelated props

## Principles by Priority

| Priority | Principle                   | Key Question                                              | Prefix |
| -------- | --------------------------- | --------------------------------------------------------- | ------ |
| 1        | Single Responsibility (SRP) | Does this component have more than one reason to change?  | `srp-` |
| 2        | Interface Segregation (ISP) | Is this component forced to accept props it doesn't use?  | `isp-` |
| 3        | Dependency Inversion (DIP)  | Is this component tightly coupled to a specific service?  | `dip-` |
| 4        | Open/Closed (OCP)           | Do I need to modify this component to add behavior?       | `ocp-` |
| 5        | Liskov Substitution (LSP)   | Can a variant replace the base without breaking anything? | `lsp-` |

## Rules

### SRP — Single Responsibility Principle

**A component should have one, and only one, reason to change.**

Each component handles a single concern. When a component manages UI rendering
AND business logic AND side effects, it becomes hard to maintain.

```tsx
// BAD — Form handles rendering AND validation
const LoginForm = () => {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!values.email) errs.email = 'Required'
    if (!values.password) errs.password = 'Required'
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    fetch('/api/login', { method: 'POST', body: JSON.stringify(values) })
  }

  return <form onSubmit={handleSubmit}>...</form>
}

// GOOD — Separated concerns
// 1. Validation logic (pure function or hook)
const useLoginValidation = (values) => {
  /* ... */
}

// 2. Form UI (presentational)
const LoginForm = ({ onSubmit, errors }) => <form onSubmit={onSubmit}>...</form>

// 3. Screen (container wiring)
const LoginScreen = () => {
  const { validate, errors } = useLoginValidation(values)
  const handleSubmit = () => {
    /* validate + fetch */
  }
  return <LoginForm onSubmit={handleSubmit} errors={errors} />
}
```

**Pattern**: split a container (fetches data, wires callbacks) from a
presentational component (pure props, renders UI). The container owns the
"reason to change" tied to data/wiring; the presentational owns rendering.

### OCP — Open/Closed Principle

**Components should be open for extension but closed for modification.**

Extend behavior via composition (HOCs, hooks, wrapper components) rather than
modifying the component's internals with new conditionals.

```tsx
// BAD — Modifying component internals for each new feature
const Button = ({ label, onClick, withLogging, withAnalytics }) => {
  const handleClick = () => {
    if (withLogging) console.log('clicked')
    if (withAnalytics) trackEvent('click')
    onClick()
  }
  return <button onClick={handleClick}>{label}</button>
}

// GOOD — Extend via composition
const Button = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
)

// Extend with a hook
const useWithLogging = (handler, label) =>
  useCallback(() => {
    console.log(`${label} clicked`)
    handler()
  }, [handler, label])

// Or extend with a wrapper component
const AnalyticsButton = ({ eventName, ...props }) => {
  const handleClick = useCallback(() => {
    trackEvent(eventName)
    props.onClick()
  }, [eventName, props.onClick])
  return <Button {...props} onClick={handleClick} />
}
```

**Pattern**: extend visual behavior through variant maps (e.g. `clsx`-driven
variants or discriminated-union props) and extend logic through custom hooks —
without editing the base component's internals.

### LSP — Liskov Substitution Principle

**A specialized component must be substitutable for its base component.**

When creating variants or specializations, they must accept the same interface
as the base and produce no unexpected side effects.

```tsx
// Base component
const Button = ({ children, onClick, ...rest }) => (
  <button onClick={onClick} {...rest}>{children}</button>
)

// Specialization — adds behavior but remains substitutable
const SubmitButton = (props) => (
  <Button {...props} type="submit">
    {props.children ?? 'Submit'}
  </Button>
)

// GOOD — both work interchangeably
<Button onClick={save}>Save</Button>
<SubmitButton onClick={save}>Save</SubmitButton>
```

**Violation signals**:

- Specialized component ignores or overrides base props silently
- Swapping base for variant causes layout shift or runtime error
- Variant adds required props that the base doesn't have

### ISP — Interface Segregation Principle

**Components should not be forced to depend on props they don't use.**

Split fat interfaces into focused ones. A component receiving 15 props where
it only uses 5 is a design smell.

```tsx
// BAD — Monolithic interface
interface IUserCardProps {
  name: string
  age: number
  email: string
  onLogin: () => void
  onLogout: () => void
  onUpdateProfile: () => void
  onDeleteAccount: () => void
  isAdmin: boolean
  showActions: boolean
}

// GOOD — Segregated interfaces, composed in parent
const UserInfo = ({ name, age, email }) => (/* ... */)
const UserActions = ({ onLogin, onLogout }) => (/* ... */)
const AdminActions = ({ onUpdateProfile, onDeleteAccount }) => (/* ... */)

// Parent composes what's needed
const UserCard = ({ user, actions }) => (
  <Card>
    <UserInfo {...user} />
    {actions.showAuth && <UserActions {...actions} />}
    {actions.isAdmin && <AdminActions {...actions} />}
  </Card>
)
```

**Pattern**: keep leaf components' prop interfaces minimal; compose them in
parents that own the broader interface. Prefer `ComponentProps<'el'>` /
`ComponentProps<typeof X>` over wide hand-written prop bags.

### DIP — Dependency Inversion Principle

**Components should depend on abstractions, not concrete implementations.**

Inject dependencies (API services, storage, formatters) via props, context,
or hooks — never hardcode them inside components.

```tsx
// BAD — Tightly coupled to a specific API
const MovieList = () => {
  const [movies, setMovies] = useState([])
  useEffect(() => {
    fetch('/api/movies')
      .then((r) => r.json())
      .then(setMovies)
  }, [])
  return (
    <ul>
      {movies.map((m) => (
        <li key={m.id}>{m.title}</li>
      ))}
    </ul>
  )
}

// GOOD — Data source injected via hook abstraction
const useMovies = () => useQuery(getMoviesOptions())

const MovieList = ({ movies }) => (
  <ul>
    {movies.map((m) => (
      <li key={m.id}>{m.title}</li>
    ))}
  </ul>
)

// Screen wires the dependency
const MovieScreen = () => {
  const { data: movies } = useMovies()
  return <MovieList movies={movies ?? []} />
}
```

**Pattern**: inject server state via data-fetching hooks (e.g. TanStack Query)
and global concerns via context providers — the presentational component
receives data through props, never reaches for `fetch`/storage itself.

## Checklist for Code Review

When reviewing a component, ask these 5 questions:

1. **SRP** — Does this component have exactly one reason to change?
   If it mixes rendering + data fetching + business logic → split it.

2. **OCP** — Can I add behavior without editing this component?
   If I need to add a boolean prop for each new feature → use composition.

3. **LSP** — If I swap this for a variant, does everything still work?
   If a specialized version breaks when used in place of the base → fix the interface.

4. **ISP** — Are all props actually used by this component?
   If it receives props just to pass them down unchanged → restructure.

5. **DIP** — Is this component independent of its data sources?
   If it imports `fetch`, `supabase`, or `localStorage` directly → inject via hook/context.

## Relationship to Other Skills

- **`composition-patterns`** — detailed compound component and context patterns (OCP/ISP implementation)
- **`react-best-practices`** — performance-focused rules (re-render optimization, bundle size)
- **`react-view-transitions`** — animated transitions for component/route state changes
