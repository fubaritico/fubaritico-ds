# Accessibility — Review Rules

> **ALL rules in this file are GLOBAL** — they apply to every file in the entire codebase
> (`apps/`, `packages/`, scripts, configs) without exception. When a rule specifies a file
> pattern, it means ALL files matching that pattern everywhere, not just in one package.
> JSDoc requirements from QUAL-003/004/005 apply here too — every interface, function,
> type, hook, param, and return value must be documented with JSDoc everywhere.

## WCAG 2.1 AA Mapping

Each rule maps to one or more WCAG 2.1 Level AA success criteria.

| Rule ID  | WCAG SC      | WCAG Name                                      | Principle              |
|----------|--------------|------------------------------------------------|------------------------|
| A11Y-001 | 1.1.1, 4.1.2 | Non-text Content, Name Role Value             | Perceivable, Robust    |
| A11Y-002 | 1.1.1        | Non-text Content                               | Perceivable            |
| A11Y-003 | 2.5.5, 2.5.8 | Target Size (Enhanced), Target Size (Minimum) | Operable               |
| A11Y-004 | 1.3.1, 4.1.2 | Info and Relationships, Name Role Value        | Perceivable, Robust    |
| A11Y-005 | 1.3.1, 3.3.2 | Info and Relationships, Labels or Instructions | Perceivable, Understand |
| A11Y-005b | 1.4.3, 1.4.11 | Contrast Minimum, Non-text Contrast           | Perceivable            |
| A11Y-006 | 1.4.1        | Use of Color                                   | Perceivable            |
| A11Y-007 | 2.1.1, 2.4.7 | Keyboard, Focus Visible                        | Operable               |
| A11Y-008 | 4.1.2        | Name, Role, Value                              | Robust                 |
| A11Y-009 | 4.1.3        | Status Messages                                | Robust                 |
| A11Y-010 | 1.4.4        | Resize Text                                    | Perceivable            |
| A11Y-011 | 2.3.3        | Animation from Interactions                    | Operable               |
| A11Y-012 | 2.4.3        | Focus Order                                    | Operable               |

## Critical Violations (A11Y-0xx)

### A11Y-001: Interactive element without accessible label
- **Native files** (`*.native.tsx`):
  - `Pressable`, `TouchableOpacity`, `TouchableHighlight` must have `accessibilityLabel`
  - Image-only buttons must have `accessibilityLabel` (not just decorative)
- **Web files** (`*.web.tsx`):
  - `<button>`, `<a>`, `<input>` must have visible text, `aria-label`, or `aria-labelledby`
  - Icon-only buttons must have `aria-label`

### A11Y-002: Image without alt text
- **Native**: `<Image>` must have `accessibilityLabel` (or `accessible={false}` if decorative)
- **Web**: `<img>` must have `alt` attribute (empty string `alt=""` acceptable for decorative)

## High Violations

### A11Y-003: Touch target too small
- **Native files** (`*.native.tsx`):
  - Interactive elements must be at least 44x44 points
  - Check: `hitSlop` or explicit width/height >= 44
  - Common issue: icon buttons with 24x24 icons and no padding/hitSlop
- **Web files** (`*.web.tsx`):
  - Clickable elements should have min 44x44px touch area
  - Check via padding, min-width/min-height, or explicit size classes

### A11Y-004: Missing semantic role
- **Native**:
  - `Pressable` acting as button must have `accessibilityRole="button"`
  - Navigation links must have `accessibilityRole="link"`
  - Headings must have `accessibilityRole="header"`
- **Web**:
  - Use semantic HTML (`<button>`, `<nav>`, `<h1>`-`<h6>`, `<main>`, `<aside>`)
  - Avoid `<div onClick>` without `role="button"` and `tabIndex={0}`

### A11Y-005: Form input without label
- **Native**: `TextInput` must have `accessibilityLabel` or be wrapped with accessible label
- **Web**: `<input>` must have associated `<label>` (via `htmlFor`) or `aria-label`

### A11Y-005b: Color contrast below WCAG AA threshold
- **Files**: `packages/tokens/src/semantic/**` and all files consuming color tokens across `apps/` and `packages/`
- **Standard**: WCAG 2.1 SC 1.4.3 (Contrast Minimum)
- **Requirements**:
  - Normal text (< 18pt / < 14pt bold): ratio >= 4.5:1
  - Large text (>= 18pt / >= 14pt bold): ratio >= 3:1
  - UI components & graphical objects (borders, icons): ratio >= 3:1
- **What the reviewer checks**:
  - Semantic tokens defining foreground/background pairs (e.g., `color.text.primary` used on `color.background.default`) must meet AA
  - Any new semantic color token must have a declared contrast pair in `packages/tokens/src/contrast-pairs.json`
  - Components using explicit `text-*` + `bg-*` class combinations — verify the underlying token pair passes
- **Automated validation**: Token build script runs `color-contrast-checker` (BBC) against all declared pairs. Build fails if any pair < required ratio.
- **Pairs file format** (`packages/tokens/src/contrast-pairs.json`):
  ```json
  {
    "pairs": [
      {
        "foreground": "{color.text.primary}",
        "background": "{color.background.default}",
        "usage": "body text on main background",
        "minRatio": 4.5
      },
      {
        "foreground": "{color.text.inverse}",
        "background": "{color.background.button.primary}",
        "usage": "button label on primary button",
        "minRatio": 4.5
      },
      {
        "foreground": "{color.border.input}",
        "background": "{color.background.default}",
        "usage": "input border on main background",
        "minRatio": 3.0
      }
    ]
  }
  ```
- **When to flag**:
  - New semantic color token added without corresponding contrast pair → **high**
  - Existing pair ratio drops below threshold after token value change → **critical**
  - Component uses raw color combination not covered by any declared pair → **medium**

## Medium Violations

### A11Y-006: Color as sole information indicator
- **Files**: All component files
- **Check**: Status, errors, or states must not rely on color alone
- **Must also have**: Text, icon, or pattern to convey information
- **Example violation**: Red text for errors without error icon or prefix text

### A11Y-007: Missing keyboard navigation (web)
- **Files**: `*.web.tsx`
- **Check**: Custom interactive components must be keyboard-accessible
- **Check**: `onKeyDown`/`onKeyUp` handlers for custom widgets
- **Check**: ALL interactive elements (`<button>`, `<a>`, custom clickables) MUST have `focus-visible` styles
- **Required pattern**: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900`
- **Check**: No `outline: none` without replacement focus style

### A11Y-008: Missing accessibilityState (native)
- **Files**: `*.native.tsx`
- **Check**: ALL interactive elements (Pressable, TouchableOpacity) MUST include `accessibilityState` matching their state
- **Check**: Disabled elements must have `accessibilityState={{ disabled: true }}`
- **Check**: Selected/checked items must have `accessibilityState={{ selected: true }}`
- **Check**: Expanded/collapsed must have `accessibilityState={{ expanded: true/false }}`

### A11Y-009: Missing live region for dynamic content
- **Native**: Use `accessibilityLiveRegion="polite"` for content that updates
- **Web**: Use `aria-live="polite"` for dynamic status messages, errors, notifications

## Low Violations

### A11Y-010: Hardcoded font size without scaling
- **Native**: Avoid fixed `fontSize` that won't respect system accessibility settings
- **Prefer**: Relative sizing or `allowFontScaling` (default true in RN)
- **Web**: Use `rem`/`em` over fixed `px` for text

### A11Y-011: Animation without reduced motion respect
- **Files**: All files with animations
- **Native**: Check for `useReducedMotion()` hook from `react-native-reanimated`
- **Web**: Check for `prefers-reduced-motion` media query
- **Severity increases** if animation is essential to understanding content

### A11Y-012: Tab order issues (web)
- **Files**: `*.web.tsx`
- **Check**: No positive `tabIndex` values (use 0 or -1 only)
- **Check**: Logical DOM order matching visual order
