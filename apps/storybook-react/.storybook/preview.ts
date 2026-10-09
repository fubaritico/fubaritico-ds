// Theme + skin are decoupled and loaded separately (see @fubaritico/styles):
// tokens provide the --color-*/--spacing-*/--font-* variables; the skin provides the BEM classes.
import '@fubaritico/shared/fonts.css'
import '@fubaritico/tokens/css'
import '@fubaritico/styles/styles.css'

// The host application's base typography, which the DS deliberately does not ship.
import './preview-base.css'

import type { Preview } from '@storybook/react-vite'

/**
 * Global Storybook preview: loads tokens + native skin so the BEM classes emitted by
 * `@fubaritico/variants` render with the real design-system look.
 */
const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
