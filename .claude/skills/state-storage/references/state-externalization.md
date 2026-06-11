# Externaliser l'état : niveaux + machine simplifiée + catalogue de hooks

> Documentation de référence du skill `state-storage`. Trois façons de ranger un état **hors de React**,
> du plus léger au plus riche, chacune illustrée par un **composant pertinent** et son **cycle de vie**.
> Puis une **proposition de machine simplifiée** (sans reprendre toute l'abstraction de Headless UI).
> Enfin un **catalogue des hooks de comportement** réutilisables : rôle, usage, exemple, pertinence.
> Aucun acronyme non expliqué. Les API Headless UI citées sont réelles (v2.2.10) ; le code marqué
> « proposition » est une proposition interne au projet.

**Plan** — A. Trois niveaux d'état (createStore · Zustand · machine simplifiée) — B. La machine
simplifiée, en détail — C. Catalogue des hooks — D. Récap appliqué aux composants du design system.

---

## A. Trois niveaux d'externalisation de l'état

« Externaliser » = sortir l'état du composant React pour le poser dans un **objet en mémoire** que React
se contente de **lire**. On le fait quand l'état local (`useState`/`useReducer`) ne suffit plus :
partage entre composants éloignés, ou beaucoup d'abonnés qui veulent chacun une petite tranche.

| Niveau               | Ce que c'est                                                                        | Sélecteurs ?           | Effets ?       | Quand l'utiliser                                                       | Composant pertinent              |
| -------------------- | ----------------------------------------------------------------------------------- | ---------------------- | -------------- | ---------------------------------------------------------------------- | -------------------------------- |
| **1. `createStore`** | Un store « fermeture » : `lire / s'abonner / dispatcher`.                           | ❌ (abonnement global) | ❌             | Petit **singleton global** lu en entier par tous.                      | **Scroll-lock** (Modal + Drawer) |
| **2. Zustand**       | Une librairie (~1 Ko) = `createStore` **+ sélecteurs intégrés** + un hook `create`. | ✅ (intégrés)          | via middleware | État **global** partagé, **API impérative** appelable de partout.      | **Toaster** (notifications)      |
| **3. Machine**       | Une classe `état + reduce + subscribe + send` (+ sélecteurs/effets optionnels).     | ✅ (délégués au hook)  | ✅ (optionnel) | **Cerveau** d'un composant **complexe** (beaucoup d'enfants, clavier). | **Listbox / Typeahead**          |

> Rappel : « fermeture » (_closure_) = une fonction qui **capture** des variables locales et les garde
> vivantes après son retour. Un store en fermeture = des variables (`state`, `listeners`) enfermées
> dans une fonction d'usine, accessibles seulement via les méthodes qu'elle expose.

---

### Niveau 1 — `createStore` (le plus léger)

**Ce que c'est.** Une petite usine qui renvoie trois fonctions : `getSnapshot()` (lire l'état),
`subscribe(cb)` (être prévenu à **chaque** changement), `dispatch(action)` (déclencher un changement).
**Pas de sélecteur** : tout abonné est réveillé à chaque changement. Donc réservé à un **petit
singleton** lu **en entier**.

```ts
// proposition — packages/behaviors/src/create-store.ts  (≈ utils/store.ts de Headless UI)
type Listener = () => void

export function createStore<
  T,
  Actions extends Record<string, (this: T, ...a: any[]) => T | void>,
>(initial: () => T, actions: Actions) {
  let state = initial()
  let listeners = new Set<Listener>()

  return {
    getSnapshot: () => state, // lire
    subscribe(cb: Listener) {
      listeners.add(cb)
      return () => listeners.delete(cb) // rend une fonction de désabonnement
    },
    dispatch(key: keyof Actions, ...args: any[]) {
      let next = actions[key].call(state, ...args)
      if (next) {
        state = next as T
        listeners.forEach((l) => l()) // réveille TOUS les abonnés
      }
    },
  }
}
```

**D'où vient `createStore` ?** Ni un standard React ni une librairie : c'est une **utilité maison de
Headless UI** (`utils/store.ts:12`, 39 lignes, zéro dépendance). La proposition ci-dessus en est une
adaptation **fonctionnellement identique**. L'original exact :

```ts
// utils/store.ts (Headless UI v2.2.10) — l'original
type ChangeFn = () => void
type UnsubscribeFn = () => void
type ActionFn<T> = (this: T, ...args: any[]) => T | void
type StoreActions<Key extends string, T> = Record<Key, ActionFn<T>>

export interface Store<T, ActionKey extends string> {
  getSnapshot(): T
  subscribe(onChange: ChangeFn): UnsubscribeFn
  dispatch(action: ActionKey, ...args: any[]): void
}

export function createStore<T, ActionKey extends string>(
  initial: () => T,
  actions: StoreActions<ActionKey, T>
): Store<T, ActionKey> {
  let state: T = initial()
  let listeners = new Set<ChangeFn>()
  return {
    getSnapshot() {
      return state
    },
    subscribe(onChange) {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    dispatch(key, ...args) {
      let newState = actions[key].call(state, ...args)
      if (newState) {
        state = newState
        listeners.forEach((listener) => listener()) // réveille TOUS les abonnés
      }
    },
  }
}
```

Un seul consommateur dans tout Headless UI : `hooks/document-overflow` (le scroll-lock), branché à React
via `hooks/use-store.ts:4` (`useStore` → `useSyncExternalStore`). C'est exactement ce Niveau 1.

> ⚠️ **Ne pas confondre.** Le nom `createStore` est porté par trois choses **distinctes** : cet
> utilitaire **interne** de Headless UI (Niveau 1, maison) ; le `createStore` de **Zustand** (Niveau 2,
> librairie) ; celui de **Redux** (encore autre chose). Le Niveau 1 n'importe **rien** — ~20 lignes à
> écrire (ou à copier).

**Le composant pertinent : le verrou de défilement (scroll-lock) partagé par Modal + Drawer.** Quand un
sur-calque s'ouvre, on veut empêcher la page de défiler derrière. Plusieurs sur-calques peuvent être
ouverts ; il faut donc un **compteur** (on ne déverrouille que quand le dernier se ferme).

```ts
// proposition — packages/behaviors/src/scroll-lock.ts
export const scrollLock = createStore(() => ({ count: 0 }), {
  lock() {
    if (this.count === 0) document.body.style.overflow = 'hidden' // 1er overlay → on verrouille
    return { count: this.count + 1 }
  },
  unlock() {
    let count = Math.max(0, this.count - 1)
    if (count === 0) document.body.style.overflow = '' // dernier fermé → on déverrouille
    return { count }
  },
})

// le hook React qui s'y branche
export function useScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    scrollLock.dispatch('lock')
    return () => scrollLock.dispatch('unlock') // nettoyage à la fermeture/démontage
  }, [enabled])
}
```

```tsx
// usage dans Modal (et, à l'identique, dans Drawer)
function Modal({ open, children }: ModalProps) {
  useScrollLock(open) // ← tout le verrou tient dans cette ligne
  return open ? <div className="ui-modal">{children}</div> : null
}
```

**Cycle de vie (déroulé).**

1. Le Modal s'ouvre → `useScrollLock(true)` → `dispatch('lock')` → `count` 0 → 1 → on pose
   `overflow:hidden` sur `<body>`.
2. Un Drawer s'ouvre par-dessus → `dispatch('lock')` → `count` 1 → 2 (le `<body>` est déjà verrouillé,
   rien de plus à faire).
3. Le Drawer se ferme → nettoyage de son `useEffect` → `dispatch('unlock')` → `count` 2 → 1 (toujours
   verrouillé, car le Modal est encore là).
4. Le Modal se ferme → `dispatch('unlock')` → `count` 1 → 0 → on **restaure** le défilement.

**Pertinence.** Idéal quand l'état est **un petit fait global** (verrouillé ou non, thème courant,
densité) que personne ne lit « par tranche ». Pas de sélecteur = pas de complexité inutile. C'est
exactement l'usage qu'en fait Headless UI (`hooks/document-overflow`).

---

### Niveau 2 — Zustand (store + sélecteurs, sans le réécrire)

**Ce que c'est.** **Zustand** est une librairie externe (~1 Ko) : en gros, un `createStore` **avec les
sélecteurs intégrés** et un hook prêt à l'emploi (`create`). L'abonnement se fait directement à une
**tranche**. À assumer comme **dépendance** (mais minuscule, sans contexte, sans _provider_).

**Le composant pertinent : le système de notifications (Toaster).** Un toast peut être déclenché de
**n'importe où** dans l'appli — y compris hors d'un composant React (dans un `catch`, une fonction
utilitaire). C'est le cas d'école d'une **API impérative globale**.

```ts
// proposition — packages/behaviors-react/src/toasts.ts
import { create } from 'zustand'

type Toast = { id: string; message: string }

export const useToasts = create<{
  toasts: Toast[]
  add: (message: string) => void
  remove: (id: string) => void
}>((set) => ({
  toasts: [],
  add: (message) =>
    set((s) => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), message }],
    })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// API impérative appelable PARTOUT, même hors React :
export const toast = (message: string) => useToasts.getState().add(message)
```

```tsx
// le rendu : <Toaster> s'abonne à la TRANCHE `toasts`
function Toaster() {
  let toasts = useToasts((s) => s.toasts) // ← sélecteur intégré : ne re-render que si `toasts` change
  let remove = useToasts((s) => s.remove)
  return (
    <div className="ui-toaster">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
      ))}
    </div>
  )
}

// ailleurs, dans un gestionnaire d'erreur quelconque :
toast('Sauvegarde échouée') // ← aucun composant, aucun contexte requis
```

**Cycle de vie (déroulé).**

1. Quelque part, `toast('Sauvegardé')` → `useToasts.getState().add(...)` → la liste `toasts` change.
2. `<Toaster>`, abonné à `s.toasts`, se redessine et affiche le nouveau toast.
3. Le `ToastItem` programme sa propre disparition (un minuteur) → appelle `remove(id)` → la liste change
   → `<Toaster>` se redessine sans lui.
4. Un composant qui ne lirait que `useToasts((s) => s.toasts.length)` ne se réveillerait **que** sur un
   changement de **nombre** — c'est le bénéfice des sélecteurs intégrés.

**Pertinence.** Quand on veut une **API impérative globale** (`toast()`, `openCommandPalette()`) + des
abonnements fins, **sans** écrire la mécanique soi-même. Le prix : une dépendance de plus. **Sans aucune
dépendance**, le Niveau 1 + `useSyncExternalStore` fait la même chose en plus verbeux — voici le détail.

#### Variante **sans dépendance** : `createStore` (Niveau 1) + `useSyncExternalStore` natif

`useSyncExternalStore` est livré **dans** React 18 (donc zéro dépendance). On refait le même Toaster avec
le `createStore` du Niveau 1, puis un hook qui lit la liste :

```ts
// proposition — toaster SANS dépendance (réutilise createStore du Niveau 1)
type Toast = { id: string; message: string }

export const toastStore = createStore(() => ({ toasts: [] as Toast[] }), {
  add(message: string) {
    return { toasts: [...this.toasts, { id: crypto.randomUUID(), message }] }
  },
  remove(id: string) {
    return { toasts: this.toasts.filter((t) => t.id !== id) }
  },
})
export const toast = (message: string) => toastStore.dispatch('add', message)
```

```tsx
import { useSyncExternalStore } from 'react' // natif, ZÉRO dépendance

function useToasts() {
  return useSyncExternalStore(
    toastStore.subscribe, // comment s'abonner
    () => toastStore.getSnapshot().toasts, // instantané (navigateur)
    () => toastStore.getSnapshot().toasts // instantané (serveur, pour le rendu côté serveur)
  )
}

function Toaster() {
  let toasts = useToasts()
  return (
    <div className="ui-toaster">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
```

> ⚠️ **Le piège du natif (à connaître absolument).** `useSyncExternalStore` exige que l'instantané
> (`getSnapshot`) **renvoie la même référence** tant que rien n'a changé. Ici ça marche : `state.toasts`
> n'est un **nouvel** array que quand la liste change. **Mais** pour une tranche **dérivée** (calculée à
> la volée — ex. `toasts.filter((t) => t.urgent)` ou `{ count, dernier }`), chaque appel crée un
> **nouvel** objet → React croit que « ça change tout le temps » → **boucle de re-render** (ou
> l'avertissement « getSnapshot should be cached »). Pour une tranche dérivée, il faut **mémoïser
> explicitement**… ou passer à `useSyncExternalStoreWithSelector`.

#### Le sélecteur **sûr** : `useSyncExternalStoreWithSelector`

```ts
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'
```

`use-sync-external-store` est un **petit paquet officiel de l'équipe React** (un seul fichier, ~1 Ko).
React 18 a intégré `useSyncExternalStore` **mais pas** la variante « avec sélecteur » — c'est elle que
fournit l'entrée `/with-selector`. Beaucoup ne la comptent pas vraiment comme « une dépendance » : c'est
officiel, minuscule, et c'est elle qu'utilise Headless UI. Elle prend **en plus** un **sélecteur** + un
**comparateur**, et **mémoïse** le résultat → pas de boucle, même pour une tranche dérivée :

```ts
import { shallowEqual } from '@fubaritico-ds/behaviors' // ou la version de Headless UI

let urgents = useSyncExternalStoreWithSelector(
  toastStore.subscribe,
  () => toastStore.getSnapshot(), // instantané COMPLET
  () => toastStore.getSnapshot(), // (serveur)
  (s) => s.toasts.filter((t) => t.urgent), // tranche DÉRIVÉE (nouvel array à chaque appel) — OK ici
  shallowEqual // "la tranche a-t-elle VRAIMENT changé ?" (comparaison superficielle)
)
```

**La règle, en une ligne :**

- Tranche = l'**objet entier** ou une **référence stable** → `useSyncExternalStore` **natif** (zéro dépendance).
- Tranche **dérivée/calculée** → `useSyncExternalStoreWithSelector` (paquet officiel ~1 Ko) — ou mémoïsation manuelle.

> C'est **exactement** le choix de Headless UI : `useSyncExternalStoreWithSelector` dans
> `react-glue.tsx` (le `useSlice` des machines, pour sélectionner librement) ; `useSyncExternalStore`
> natif dans `hooks/use-store.ts` (où la tranche est l'état entier, référence stable).

---

### Niveau 3 — La machine (cerveau d'un composant complexe)

C'est le sujet de la **Partie B** (proposition de version simplifiée). En un mot : une classe `état +
reduce + subscribe + send`, créée **une fois par instance** de composant, sur laquelle chaque enfant
s'abonne **par tranche**. À réserver aux composants **à beaucoup d'enfants + clavier** : Listbox,
Typeahead. Composant pertinent montré ci-dessous : une **Listbox** (liste déroulante mono-sélection).

---

## B. Proposition : une machine **simplifiée**

Headless UI met **beaucoup** dans sa classe `Machine` : sélecteurs internes, abonnés d'événements
(`on`), `disposables` (nettoyage), `batch` (regroupement), `DefaultMap`, un `shallowEqual` maison. **Tout
n'est pas nécessaire d'emblée.** On garde le **noyau** et on rajoute le reste **à la demande**.

### Ce qu'on garde / ce qu'on jette

| Pièce Headless UI                                              | On garde ?    | Pourquoi                                                                                              |
| -------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| `state` + `reduce` + `send` + `subscribe`                      | ✅            | Le cœur irréductible.                                                                                 |
| Sélecteurs **dans** la classe                                  | ❌ (au début) | Délégués au **hook React** (voir glue). Plus simple.                                                  |
| `on(type, cb)` (effets d'événement)                            | ❌ (au début) | À rajouter **seulement** en cas de besoin de coordination/effets (ex. fermer quand un autre s'ouvre). |
| `disposables` / `batch` / `DefaultMap` / `shallowEqual` maison | ❌            | Optimisations avancées. À réintroduire si la perf l'exige.                                            |

### Le noyau (≈ 25 lignes, sans framework)

```ts
// proposition — packages/behaviors/src/machine.ts
type Listener = () => void

export abstract class Machine<State, Event> {
  private state: State
  private listeners = new Set<Listener>()

  constructor(initial: State) {
    this.state = initial
  }

  /** La SEULE règle de transition : (état, événement) => nouvel état. Pure, immutable. */
  abstract reduce(state: State, event: Event): State

  /** Lire l'instantané courant (pour React). */
  getSnapshot = (): State => this.state

  /** S'abonner aux changements ; rend une fonction de désabonnement. */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Le SEUL point d'entrée des changements. */
  send = (event: Event): void => {
    let next = this.reduce(this.state, event)
    if (next === this.state) return // immutabilité : même objet ⇒ rien n'a changé ⇒ on s'arrête
    this.state = next
    this.listeners.forEach((l) => l()) // on réveille les abonnés
  }
}
```

### La glue React (le pont, ≈ 8 lignes)

Les **sélecteurs** sont délégués ici : c'est React (via `useSyncExternalStoreWithSelector`) qui ne
réveille un composant que si **sa tranche** change. (`useSyncExternalStore` = l'outil React 18 fait
exprès pour lire un état hors de React, sans incohérence d'affichage pendant un rendu.)

```ts
// proposition — packages/behaviors-react/src/use-machine.ts
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'
import type { Machine } from '@fubaritico-ds/behaviors'

export function useMachineSlice<S, E, Slice>(
  machine: Machine<S, E>,
  selector: (state: S) => Slice,
  isEqual?: (a: Slice, b: Slice) => boolean
): Slice {
  return useSyncExternalStoreWithSelector(
    machine.subscribe, // comment s'abonner
    machine.getSnapshot, // instantané (navigateur)
    machine.getSnapshot, // instantané (serveur — pour le rendu côté serveur)
    selector, // la tranche
    isEqual // comparateur (défaut : ===)
  )
}
```

### Un composant concret : Listbox (mono-sélection)

```ts
// proposition — packages/behaviors/src/listbox-machine.ts
export type ListboxState = {
  open: boolean
  options: string[]
  activeIndex: number | null // l'option "survolée" au clavier
  value: string | null // l'option choisie
}
export type ListboxEvent =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'selectActive' }
  | { type: 'setOptions'; options: string[] }

export class ListboxMachine extends Machine<ListboxState, ListboxEvent> {
  reduce(state: ListboxState, event: ListboxEvent): ListboxState {
    switch (event.type) {
      case 'open':
        if (state.open) return state // garde
        return { ...state, open: true, activeIndex: state.activeIndex ?? 0 }
      case 'close':
        if (!state.open) return state
        return { ...state, open: false, activeIndex: null }
      case 'next':
        return {
          ...state,
          activeIndex: clamp(
            (state.activeIndex ?? -1) + 1,
            state.options.length
          ),
        }
      case 'prev':
        return {
          ...state,
          activeIndex: clamp(
            (state.activeIndex ?? state.options.length) - 1,
            state.options.length
          ),
        }
      case 'selectActive':
        if (state.activeIndex === null) return state
        return {
          ...state,
          value: state.options[state.activeIndex],
          open: false,
        }
      case 'setOptions':
        return { ...state, options: event.options }
    }
  }

  // Des "sélecteurs" comme simples fonctions (utilisées par le hook) :
  isActive = (state: ListboxState, index: number) => state.activeIndex === index
}

function clamp(i: number, length: number) {
  return Math.max(0, Math.min(i, length - 1))
}
```

```tsx
// proposition — côté React : le Context porte la MACHINE, pas l'état
const ListboxContext = createContext<ListboxMachine | null>(null)

function Listbox({ options, children }: ListboxProps) {
  let machine = useMemo(() => {
    let m = new ListboxMachine({
      open: false,
      options,
      activeIndex: null,
      value: null,
    })
    return m
  }, []) // créée UNE fois
  return (
    <ListboxContext.Provider value={machine}>
      {children}
    </ListboxContext.Provider>
  )
}

function Option({ index, children }: OptionProps) {
  let machine = useContext(ListboxContext)!
  // s'abonne à SA tranche : "suis-je l'option active ?"
  let active = useMachineSlice(machine, (s) => machine.isActive(s, index))
  return (
    <li
      className={clsx(
        'ui-listbox__option',
        active && 'ui-listbox__option--active'
      )}
    >
      {children}
    </li>
  )
}
```

**Cycle de vie (déroulé).**

1. `<Listbox>` crée la machine **une fois** (`useMemo`) et la met dans le Context. Le Context transporte
   **la machine** (référence stable), pas l'état.
2. Chaque `<Option>` s'abonne à sa tranche `isActive(index)` via `useMachineSlice`.
3. Flèche bas → appel de `machine.send({ type: 'next' })` → `reduce` calcule `activeIndex` (3 → 4) →
   `send` réveille les abonnés.
4. Seules l'option 3 (active → inactive) et l'option 4 (inactive → active) changent de tranche ⇒ **2
   redessins**, pas N. Les autres options ne bougent pas.
5. Entrée → `send({ type: 'selectActive' })` → `value` mis à jour, `open` repasse à `false`.

**Quand réintroduire ce qui a été jeté ?** Le jour où une Listbox doit **se fermer quand un autre overlay
s'ouvre** → réintroduire `on(type, cb)` + une petite machine globale d'empilement. Le jour où
l'enregistrement de 300 options déclenche 300 transitions → réintroduire `batch`. **Pas avant.**

---

## C. Catalogue des hooks de comportement (réutilisables tels quels)

Ces hooks sont du **comportement pur** (accessibilité, focus, clavier, cycle de vie) — réutilisables
**quelle que soit** l'architecture d'état choisie ci-dessus. Pour chacun : rôle · usage · exemple ·
pertinence (composant concerné). Signatures réelles de Headless UI v2.2.10.

> **Code source complet** de chaque hook (copiable, ordonné par dépendances) :
> `behavior-hooks-source.md`.

### `useEvent(cb)` — un callback à identité **stable**

- **Rôle.** Rend une fonction dont la **référence ne change jamais**, mais qui appelle toujours la
  **dernière** version de la closure. Résout les _stale closures_ (lire une vieille valeur) et l'identité
  instable qui casse les `memo`/dépendances.
- **Exemple.**
  ```ts
  let onSelect = useEvent(() => props.onChange(value)) // stable, mais lit toujours le dernier props.onChange
  ```
- **Pertinence.** **Partout** où un handler est passé à un enfant mémoïsé, ou à un `addEventListener`.

### `useLatestValue(value)` — la **dernière** valeur dans un ref

- **Rôle.** Garde `value` dans une boîte `{ current }` mise à jour après chaque rendu. Permet de lire une
  valeur **fraîche** depuis un code à longue vie sans s'y ré-abonner.
- **Exemple.**
  ```ts
  let latest = useLatestValue(props.value)
  useEffect(() => {
    const id = setInterval(() => console.log(latest.current), 1000)
    return () => clearInterval(id)
  }, [])
  ```
- **Pertinence.** Le pont « prop vivante → logique durable » (c'est le `dataRef` du Combobox en petit).

### `useControllable(controlledValue, onChange?, defaultValue?)` — contrôlé **ou** non-contrôlé

- **Rôle.** Le pattern à valeur : si le parent passe `value` + `onChange`, le composant est **contrôlé** ;
  sinon il gère un état **interne** (`defaultValue`). Retourne `[value, onChange]` unifiés. (Avertit même
  en console en cas de bascule de l'un à l'autre.)
- **Exemple.**
  ```ts
  let [value, setValue] = useControllable(
    props.value,
    props.onChange,
    props.defaultValue
  )
  ```
- **Pertinence.** **Tout composant à valeur** : Checkbox, Switch, Input, Tabs, Typeahead, DatePicker.

### `useSyncRefs(...refs)` — fusionner plusieurs refs en une

- **Rôle.** Un composant a sa **ref interne** (pour manipuler l'élément) **et** doit transmettre la **ref
  externe** du consommateur. Ce hook les écrit toutes les deux.
- **Exemple.**
  ```ts
  let internalRef = useRef<HTMLButtonElement>(null)
  let ref = useSyncRefs(internalRef, props.ref) // <button ref={ref} />
  ```
- **Pertinence.** **Tout composant `forwardRef`** ayant aussi besoin de l'élément en interne (Button,
  Input, Option…).

### `useId()` — un identifiant **stable et SSR-safe**

- **Rôle.** Un identifiant unique, **identique côté serveur et client** (évite les mismatches
  d'hydratation). Chez Headless UI, c'est un simple ré-export du `useId` de React.
- **Exemple.**
  ```ts
  let id = useId() // <label htmlFor={id} /> + <input id={id} />
  ```
- **Pertinence.** Lier label ↔ contrôle, `aria-labelledby`, `aria-describedby` : Input, Tooltip, Field,
  toute la couche accessibilité.

### `useIsoMorphicEffect(fn, deps)` — un effet de **layout** SSR-safe

- **Rôle.** `useLayoutEffect` (qui s'exécute **avant** la peinture, pour mesurer/positionner sans
  scintillement) mais qui **ne casse pas** le rendu serveur (où il devient `useEffect`).
- **Exemple.**
  ```ts
  useIsoMorphicEffect(() => {
    setWidth(ref.current!.offsetWidth)
  }, [])
  ```
- **Pertinence.** Positionner un Popover/Tooltip, mesurer un élément, synchroniser une mesure sans flash.

### `useResolveButtonType(props, element)` — le bon `type` de bouton

- **Rôle.** Déduit le bon attribut `type` (`'button'` vs autre) selon le `as`/l'élément réel, pour éviter
  qu'un `<button>` ne soumette un formulaire par accident.
- **Exemple.**
  ```ts
  let type = useResolveButtonType({ type: props.type, as: props.as }, element)
  ```
- **Pertinence.** Button, IconButton, tout déclencheur polymorphe (Menu.Button, Disclosure.Button…).

### `useOutsideClick(enabled, containers, cb)` — fermer au **clic dehors**

- **Rôle.** Appelle `cb` quand un clic se produit **hors** des conteneurs donnés (et seulement si
  `enabled`).
- **Exemple.**
  ```ts
  useOutsideClick(open, [buttonEl, panelEl], () => close())
  ```
- **Pertinence.** Menu, Dropdown, Popover, Typeahead, DatePicker — tout ce qui s'ouvre en surcouche.

### `useEscape(enabled, view, cb)` — fermer sur **Échap**

- **Rôle.** Appelle `cb` quand on presse `Échap` — **seulement** si le composant est la couche du dessus
  (il s'appuie sur la notion de « couche au sommet »).
- **Exemple.**
  ```ts
  useEscape(open, undefined, () => close()) // `view` = fenêtre, par défaut document.defaultView
  ```
- **Pertinence.** Modal, Drawer, Menu, Tooltip, BottomSheet.

### `useDocumentOverflowLockedEffect(...)` — bloquer le **défilement** de la page

- **Rôle.** Verrouille le scroll du `<body>` tant qu'un overlay est ouvert (avec comptage, comme le
  Niveau 1 ci-dessus, dont c'est précisément l'implémentation chez Headless UI).
- **Exemple.** voir **Niveau 1** (`useScrollLock(open)`).
- **Pertinence.** Modal, Drawer, BottomSheet.

### Piège à focus : `focus-trap` + `use-inert-others`

- **Rôle.** **Piéger** le focus clavier **dans** un dialog (Tab ne sort pas), et rendre **inertes** (non
  focusables, ignorés par les lecteurs d'écran) les éléments **derrière**.
- **Exemple.** (composant) `<FocusTrap>…</FocusTrap>` autour du contenu d'un dialog.
- **Pertinence.** Modal, Drawer, Dialog — **obligatoire** pour l'accessibilité d'un overlay modal.

### `useDisposables()` — un registre de **nettoyage** lié au composant

- **Rôle.** Un panier de ressources (minuteurs, écouteurs, `requestAnimationFrame`) qui se **vide
  automatiquement** au démontage. Évite d'oublier un `clearTimeout`/`removeEventListener`.
- **Exemple.**
  ```ts
  let d = useDisposables()
  d.setTimeout(() => close(), 3000) // nettoyé tout seul au démontage
  ```
- **Pertinence.** Tout composant avec minuteurs/écouteurs : Tooltip (délai), Toast (auto-fermeture),
  Carousel (autoplay).

### Recherche clavier : `useTextValue` + `useTreeWalker`

- **Rôle.** Permettre de **taper des lettres** pour sauter à l'option correspondante (`useTextValue`
  extrait le texte d'une option ; `useTreeWalker` parcourt les nœuds).
- **Exemple.** dans une option : `let text = useTextValue(optionRef)` → la machine compare à la frappe.
- **Pertinence.** Listbox, Menu, Typeahead (la recherche « tape pour trouver »).

### `useWatch(cb, deps)` — réagir à un **changement de valeur**

- **Rôle.** Exécuter `cb` quand des valeurs changent (proche d'un `useEffect`, orienté synchronisation).
- **Exemple.**
  ```ts
  useWatch(
    ([open]) => {
      if (!open) resetSearch()
    },
    [open]
  )
  ```
- **Pertinence.** Synchroniser un état dérivé (réinitialiser la recherche à la fermeture, par ex.).

---

## D. Récap appliqué aux composants du design system

| Composant                        | Niveau d'état                                        | Hooks de comportement clés                                                         |
| -------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Switch / Checkbox**            | local (`useState`)                                   | `useControllable`, `useId`, `useSyncRefs`                                          |
| **Input**                        | local                                                | `useControllable`, `useId`, `useSyncRefs`                                          |
| **Tooltip**                      | local (+ store global si besoin)                     | `useId`, `useDisposables` (délai), `useIsoMorphicEffect` (position)                |
| **Modal / Drawer / BottomSheet** | **createStore** (scroll-lock partagé)                | `useScrollLock`, `useEscape`, `focus-trap` + `use-inert-others`, `useId`           |
| **Menu / Dropdown**              | local ou machine simple                              | `useOutsideClick`, `useEscape`, `useResolveButtonType`, recherche clavier          |
| **Tabs**                         | local (`useReducer`) ou machine simple               | `useControllable` (onglet actif), `useId`, clavier                                 |
| **Listbox**                      | **machine simplifiée**                               | `useMachineSlice`, `useOutsideClick`, recherche clavier, `useId`                   |
| **Typeahead** (Combobox)         | **machine simplifiée** (+ `on`/empilement plus tard) | `useControllable`, `useOutsideClick`, `useId`, recherche clavier, `useLatestValue` |
| **Toaster / notifications**      | **Zustand** (API impérative globale)                 | `useDisposables` (auto-fermeture)                                                  |

**À retenir.** La grande majorité des composants n'a besoin que d'**état local + quelques hooks de
comportement**. La **machine simplifiée** ne sert que pour **Listbox/Typeahead**. Le **createStore** ne
sert que pour le **scroll-lock**. **Zustand** uniquement pour une **API impérative globale** (toasts).
Les **hooks (Partie C)** sont, eux, le vrai trésor réutilisable — du comportement pur, indépendant de
l'architecture d'état.
