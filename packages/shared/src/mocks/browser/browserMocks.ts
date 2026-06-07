/**
 * Browser API mocks for jsdom test environment
 * These mocks are required for components that use browser APIs not available in jsdom
 */

/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor, @typescript-eslint/no-unsafe-assignment */
export const setupBrowserMocks = () => {
  // Mock ResizeObserver for jsdom environment
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock IntersectionObserver for jsdom environment
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any

  // Mock HTMLDialogElement methods for jsdom environment
  if (typeof HTMLDialogElement !== 'undefined') {
    HTMLDialogElement.prototype.showModal = () => {}
    HTMLDialogElement.prototype.close = () => {}
  }
}
/* eslint-enable @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any, @typescript-eslint/no-useless-constructor, @typescript-eslint/no-unsafe-assignment */
