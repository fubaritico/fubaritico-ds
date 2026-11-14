import type { ComponentProps } from 'react'

/** Props of {@link ColorPickerWandIcon}: an SVG's, minus what the icon fixes. */
export type ColorPickerWandIconProps = Omit<
  ComponentProps<'svg'>,
  'viewBox' | 'children'
>

/**
 * The magic wand of the "automatic" swatch: something else picks the colour, as if by magic. Drawn on a
 * 20px grid, solid, like the Heroicons the DS ships; it paints with `currentColor`, so forced
 * colours and themes reach it. A short wand with a large star at its tip: it must not read as the
 * diagonal stroke of "no colour". Lives here until the icons package exists (DESIGN-144).
 *
 * @param props - {@link ColorPickerWandIconProps}.
 * @returns The rendered icon, hidden from assistive technology (the swatch carries the name).
 */
export function ColorPickerWandIcon(props: Readonly<ColorPickerWandIconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {/* The wand: a rounded bar from the bottom-right corner to the star. */}
      <path d="M17.53 16.47 9.03 7.97a1.06 1.06 0 0 0-1.5 1.5l8.5 8.5a1.06 1.06 0 0 0 1.5-1.5Z" />
      {/* The star at its tip. */}
      <path d="M5.5 1.5 4.44 4.44 1.5 5.5l2.94 1.06L5.5 9.5l1.06-2.94L9.5 5.5 6.56 4.44 5.5 1.5Z" />
      {/* Two small sparkles. */}
      <path d="m14 2.5-.53 1.47L12 4.5l1.47.53L14 6.5l.53-1.47L16 4.5l-1.47-.53L14 2.5Z" />
      <path d="m3.5 11.5-.53 1.47-1.47.53 1.47.53.53 1.47.53-1.47 1.47-.53-1.47-.53-.53-1.47Z" />
    </svg>
  )
}

export default ColorPickerWandIcon
