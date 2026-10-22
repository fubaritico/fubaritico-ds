# Known issues — closed

> Entries closed, moved here verbatim the step they close. Not loaded at launch; read when a past
> problem comes back.

- **[RÉSOLU 2026-10-09 : Vitest Browser Mode, `Slider.browser.test.tsx`]** **Le clavier d'un `<input type="range">` n'existe pas sous jsdom (2026-10-09)** — flèches, Home,
  End, PageUp/Down sont des comportements **navigateur**. `userEvent` ne peut donc pas piloter un
  `Slider` en test unitaire. Les tests du Slider couvrent le **câblage** (mapping valeur→pourcentage,
  quel callback part sur quel événement DOM) via `fireEvent`, **exception assumée** à la règle
  « toujours userEvent » ; le clavier lui-même se vérifie dans Storybook. **Ne pas lire l'absence de
  test clavier comme une absence de support clavier.** → la vraie réponse est le **Vitest Browser
  Mode** (Playwright), consigné comme passe à faire dans `next.md`.
