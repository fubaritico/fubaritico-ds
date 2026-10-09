import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  // Carousel and the Next adapters still carry Tailwind `ui:` classes, so they are kept in the
  // repo (migration backlog) but excluded from the published build, which ships Tailwind-free.
  entry: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.*',
    '!src/components/Carousel/**',
    '!src/components/next/**',
    '!src/components/WithTooltip/**',
  ],
  format: ['esm'],
  bundle: false,
  dts: false,
  clean: !options.watch,
  minify: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    'next',
    'next/link',
    'next/image',
  ],
  esbuildOptions(esbuildOpts) {
    esbuildOpts.jsx = 'automatic'
  },
}))
