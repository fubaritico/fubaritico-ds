import type { Frame, Page } from 'playwright'
import type { BrowserCommand } from 'vitest/node'

// The Playwright provider augments the command context with `page` / `frame` — but on ITS copy of
// `vitest/node`. vitest and the provider are mutual peers, so pnpm can install two vitest copies
// (different peer hashes) and the augmentation then misses the copy this package resolves. Declare
// it here, on our own `vitest/node`: a duplicate on the other copy is harmless.
declare module 'vitest/node' {
  interface BrowserCommandContext {
    /** The Playwright page running the tests. */
    page: Page
    /** The frame the test file runs in. */
    frame: () => Promise<Frame>
  }
}

/**
 * Pointer commands for browser tests that need a gesture `userEvent` cannot express — a press,
 * moves, then something else (a key) BEFORE the release. They run in Node with Playwright's real
 * mouse; the element is found by CSS selector inside the test frame, so coordinates account for
 * the iframe the tests run in.
 */

/** The test frame a command resolves elements in. */
type TestFrame = Frame

/**
 * Intermediate positions per mouse move: enough `pointermove` events for a drag handler to see a
 * path, not a teleport.
 */
const MOVE_STEPS = 4

/** Position inside an element, as fractions of its box (`0`–`1`). */
export interface Fraction {
  /** Fraction of the width, from the left. */
  x: number
  /** Fraction of the height, from the top. */
  y: number
}

/**
 * Resolves a point inside an element to page coordinates.
 *
 * @param frame - The test frame.
 * @param selector - CSS selector of the element.
 * @param at - Position inside the element.
 * @returns Page coordinates.
 * @throws Error when the element has no box (absent, hidden).
 */
async function pagePoint(
  frame: TestFrame,
  selector: string,
  at: Fraction
): Promise<{ x: number; y: number }> {
  const box = await frame.locator(selector).first().boundingBox()
  if (box === null) throw new Error(`pointer command: no box for "${selector}"`)
  return { x: box.x + box.width * at.x, y: box.y + box.height * at.y }
}

/**
 * Moves the mouse to a point of an element and presses the left button.
 *
 * @param context - Command context (Playwright page and frame).
 * @param selector - CSS selector of the element.
 * @param at - Position inside the element.
 */
export const pointerDown: BrowserCommand<
  [selector: string, at: Fraction]
> = async (context, selector, at) => {
  const { x, y } = await pagePoint(await context.frame(), selector, at)
  await context.page.mouse.move(x, y)
  await context.page.mouse.down()
}

/**
 * Moves the (possibly pressed) mouse to a point of an element, in a few steps.
 *
 * @param context - Command context.
 * @param selector - CSS selector of the element.
 * @param at - Position inside the element; may lie outside it (`< 0`, `> 1`).
 */
export const pointerMove: BrowserCommand<
  [selector: string, at: Fraction]
> = async (context, selector, at) => {
  const { x, y } = await pagePoint(await context.frame(), selector, at)
  await context.page.mouse.move(x, y, { steps: MOVE_STEPS })
}

/**
 * Releases the left button where the mouse is.
 *
 * @param context - Command context.
 */
export const pointerUp: BrowserCommand<[]> = async (context) => {
  await context.page.mouse.up()
}
