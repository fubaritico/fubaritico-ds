import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/**/*.{ts,tsx}', '!src/**/*.test.*'],
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
