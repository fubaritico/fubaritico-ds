---
paths:
  - 'packages/*/src/**'
---

# Rules — Error handling is a decision, not an implementation detail

> Ported from europe-map on 2026-10-22 and adapted to a library (the dev's call: "on fera évoluer au besoin").
> Atlas is an application: it logs every declined gesture in its own console. The DS runs inside **someone
> else's** application, so its console is the consumer's: we throw on misuse and stay quiet otherwise.

## The rule

When the code reaches a point where something can be missing, wrong or absent, there is more than one thing
to do about it — **surface it** (throw), **handle it** (a declared degraded mode), or **substitute** (a
fallback value). **Choosing is the dev's call, every time**: it settles what the consumer sees when the world
is not as expected. Stop and ask before writing any of these:

- `?? something` standing in for a value that failed to arrive;
- a `catch` that continues rather than re-throwing;
- a default parameter covering a missing collaborator rather than an optional one;
- a guard that returns early where the caller expected an answer;
- anything its own comment calls a "fallback".

Bring three things, not one: **what breaks**, **who learns that it happened**, **what the alternative costs**.

## In a library — what each case does

| case                                                                                                                                            | what the DS does                                                          | examples in the code                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **The consumer breaks a contract** (a slot outside its parent, a required prop missing at run time, a malformed value the API cannot represent) | **throws**, with a message naming the component and the fix               | `Card.Header` outside `<Card>`, `Avatar.Image` outside `Avatar.Fallback`, hex formatters on non-finite input (`RangeError`) |
| **A user gesture the component declines** (a click on a disabled item, Escape with nothing open)                                                | **silent** — no log in the consumer's console; the UI state is the answer | disabled `Menu` items, a closed `Popover`                                                                                   |
| **Invalid user input the component owns** (a hex typed wrong)                                                                                   | **shown** to the user, through the component's own error state            | `ColorPicker` hex error message                                                                                             |
| **A declared degraded mode** (a feature the platform lacks) | does less, **decided and written down** — a README that does not say it yet is a doc debt to raise | anchor placement behind `@supports (position-anchor: …)` in `popover.css`, `dropdown.css`, `typeahead.css` |

A `console.warn` / `console.error` from library code is a product decision like any other: it is proposed,
never slipped in. The house rule stays: never `console.log`.

## The distinction that makes the discussion tractable

The danger is not how bad a failure is, but **whether anyone finds out**: a wrong value that stays visibly
wrong reports itself; a plausible substitute hides it (Atlas's `NaN` elevation read as sea level). Same here:
`toSortableNumber` used to return `NaN` and a comparator that never returned 0 — found by review, not by a
consumer (REACT-65).

## Existing handlers

Code written before 2026-10-22 is not re-opened retroactively, but **touching a file re-opens its error
handling**: a fallback in code being changed is raised with the dev.
