// Browser-side, typed access to the media command of `vitest.browser.commands.ts` (registered in
// `vitest.config.ts`). Typed here rather than by augmenting `BrowserCommands`, for the reason given
// in `vitest.browser.pointer.ts`.
import { commands } from 'vitest/browser'

/** The media emulation commands, as a test calls them. */
export interface MediaCommands {
  /** Turns forced colours (Windows high contrast) on or off for the page. */
  forcedColors: (active: boolean) => Promise<void>
}

/** The registered media emulation commands. */
export const media = commands as unknown as MediaCommands
