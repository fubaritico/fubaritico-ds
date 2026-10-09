// Browser-side, typed access to the pointer commands of `vitest.browser.commands.ts`.
//
// The commands are registered in `vitest.config.ts`; `commands` from `vitest/browser` exposes them
// at runtime. Their types are declared here rather than by augmenting `BrowserCommands`: vitest and
// its Playwright provider are mutual peers, pnpm may install two vitest copies, and an
// augmentation can land on the copy the test file does not see.
import { commands } from 'vitest/browser'

import type { Fraction } from './vitest.browser.commands'

/** The pointer commands, as a test calls them. */
export interface PointerCommands {
  /** Presses the mouse at a point of an element (CSS selector, fractions of its box). */
  pointerDown: (selector: string, at: Fraction) => Promise<void>
  /** Moves the mouse to a point of an element — inside or out (`< 0`, `> 1`). */
  pointerMove: (selector: string, at: Fraction) => Promise<void>
  /** Releases the mouse. */
  pointerUp: () => Promise<void>
}

/** The registered pointer commands. */
export const pointer = commands as unknown as PointerCommands
