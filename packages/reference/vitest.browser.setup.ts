// Browser project setup: the REAL design system, so layout, `:has()`, `:dir()`, `<dialog>` rules and
// geometry behave as in an application. No browser mocks here — the platform is the point.
import '@testing-library/jest-dom/vitest'
import '@fubaritico/tokens/css'
import '@fubaritico/styles'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library only auto-cleans with `globals: true`; this project keeps globals off.
afterEach(() => {
  cleanup()
})
