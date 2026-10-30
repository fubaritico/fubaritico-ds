import type { MultiSelectMatch } from './types.js'

/** Combining diacritical marks, left over by the NFD decomposition of an accented letter. */
const DIACRITICS = /[\u0300-\u036f]/g

/**
 * Folds a text for a search: lower case, accents removed — « Pèlerinage » and « pele » meet.
 *
 * @param text - Any text.
 * @returns The folded text.
 */
export function fold(text: string): string {
  return text.normalize('NFD').replace(DIACRITICS, '').toLowerCase()
}

/**
 * Finds a query in a label, ignoring case and accents, and returns where it sits **in the label's
 * own indices** — so the highlight wraps the original characters, accents included. Folding a whole
 * string shifts its indices (« é » decomposes into two code units), hence the per-character map.
 *
 * @param label - The text searched.
 * @param query - The text sought; surrounding spaces are ignored.
 * @returns The match, or `null` when the query is empty or absent from the label.
 */
export function findMatch(
  label: string,
  query: string
): MultiSelectMatch | null {
  const needle = fold(query.trim())
  if (needle === '') return null

  let folded = ''
  // origin[i] = index in `label` of the character that produced folded[i].
  const origin: number[] = []
  for (let index = 0; index < label.length; index++) {
    const piece = fold(label[index])
    folded += piece
    // One entry per code unit of the piece (a fold may yield 0, 1 or 2 of them).
    origin.push(...new Array<number>(piece.length).fill(index))
  }

  const at = folded.indexOf(needle)
  if (at === -1) return null
  return { start: origin[at], end: origin[at + needle.length - 1] + 1 }
}
