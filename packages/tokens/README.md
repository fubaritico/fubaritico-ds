# @fubaritico-ds/tokens

Design tokens for the fubaritico-ds project, built with [Style Dictionary](https://styledictionary.com/).

## Structure

```
tokens/
├── color/
│   ├── primitive.json    # Raw color palette (not for direct use)
│   └── semantic.json     # Semantic color aliases (use these)
├── spacing.json          # Spacing scale
├── radius.json           # Border radius scale
├── font.json             # Typography tokens
└── shadow.json           # Box shadow scale
```

## Build

```bash
pnpm build
```

This generates:

- `dist/css/variables.css` - CSS custom properties
- `dist/tailwind/theme.css` - Tailwind CSS v4 @theme format
- `dist/js/tokens.js` - JavaScript ES6 export
- `dist/ts/tokens.ts` - TypeScript export with types

## Usage

### In CSS

```css
@import '@fubaritico-ds/tokens/css';

.my-component {
  background: var(--color-semantic-background-default);
  color: var(--color-semantic-foreground-default);
}
```

### In Tailwind CSS v4

```css
@import '@fubaritico-ds/tokens/tailwind';
```

### In JavaScript/TypeScript

```typescript
import { tokens } from '@fubaritico-ds/tokens'

const primaryColor = tokens.color.semantic.primary.default
```

## Token Categories

### Colors

- **Primitive**: Raw color palette (neutral, amber, red, green)
- **Semantic**: Contextual colors (background, foreground, primary, header, footer, badge, rating, etc.)

### Spacing

Based on 0.25rem (4px) increments, from `0` to `96` (24rem).

### Radius

Border radius scale: `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`.

### Font

- **Family**: sans, mono
- **Size**: xs to 9xl
- **Weight**: thin to black
- **Line Height**: none, tight, snug, normal, relaxed, loose

### Shadow

Box shadow scale: `none`, `sm`, `default`, `md`, `lg`, `xl`, `2xl`.
