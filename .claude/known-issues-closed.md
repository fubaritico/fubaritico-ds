# Known issues — closed

> Entries closed, moved here verbatim the step they close. Not loaded at launch; read when a past
> problem comes back.

- **[CLOSED 2026-10-09: Vitest Browser Mode, `Slider.browser.test.tsx`]** **An `<input type="range">`'s
  keyboard does not exist under jsdom (2026-10-09)** — arrows, Home, End, PageUp/Down are **browser**
  behaviours. `userEvent` therefore cannot drive a `Slider` in a unit test. The Slider's unit tests cover the
  **wiring** (value → percentage, which callback fires on which DOM event) through `fireEvent`, an **assumed
  exception** to « always userEvent »; the keyboard itself was checked in Storybook. **Do not read a missing
  keyboard test as missing keyboard support.** → the real answer was **Vitest Browser Mode** (Playwright).
