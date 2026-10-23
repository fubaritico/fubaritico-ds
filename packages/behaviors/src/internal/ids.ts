/**
 * Makes a string safe inside an HTML id.
 *
 * @param value - Any string (a framework-generated id…).
 * @returns The string with every character outside `[A-Za-z0-9_-]` replaced by `-`.
 */
export const slug = (value: string): string => value.replace(/[^\w-]/g, '-')
