// Ticket titles, pure: `[STYLES-12 · REACT] Tooltip : flèche claire`. No network, no file — tested alone
// (`node --test .claude/skills/trello/scripts/ticket.test.mjs`).

/**
 * Builds the parser of a board's ticket titles.
 *
 * @param {string[]} scopes - The board's scopes, in capitals (`REACT`, `STYLES`…).
 * @returns {{ parse: (title: string) => Ticket | null, format: (ticket: Ticket) => string, isRef: (ref: string) => number | null, nextNumber: (titles: string[]) => number }}
 */
export function tickets (scopes) {
  const alternatives = scopes.join('|')
  // `[SCOPE(-N)?( · SCOPE)?] bare title` — the number is absent before the script gives it
  const TITLE = new RegExp(`^\\[(${alternatives})(?:-(\\d+))?(?: · (${alternatives}))?\\]\\s*(.*)$`, 'is')
  const REF = new RegExp(`^(?:${alternatives})-(\\d+)$`, 'i')

  /**
   * @typedef {{ scope: string, number?: number, second?: string, bare: string }} Ticket
   */

  /**
   * Reads a card title.
   *
   * @param {string} title - The card's name.
   * @returns {Ticket | null} The ticket, or `null` when the title has no scope prefix (a template).
   */
  function parse (title) {
    const m = title.match(TITLE)
    if (!m) return null
    return {
      scope: m[1].toUpperCase(),
      number: m[2] ? Number(m[2]) : undefined,
      second: m[3]?.toUpperCase(),
      bare: m[4],
    }
  }

  /**
   * Writes a ticket back as a title, the number on the first scope.
   *
   * @param {Ticket} ticket - The ticket; `number` required.
   * @returns {string} `[SCOPE-N · SECOND] bare`.
   */
  function format ({ scope, number, second, bare }) {
    return `[${scope}-${number}${second ? ` · ${second}` : ''}] ${bare}`
  }

  /**
   * Reads a ticket reference typed by the dev or me (`styles-12`, `STYLES-12`); the scope is not checked
   * against the card — the number alone is unique on the board.
   *
   * @param {string} ref - The reference.
   * @returns {number | null} The ticket number, or `null` when `ref` is not a ticket reference.
   */
  function isRef (ref) {
    const m = (ref ?? '').match(REF)
    return m ? Number(m[1]) : null
  }

  /**
   * The next number: one counter for the whole board, never reused — archived cards count.
   *
   * @param {string[]} titles - Every card title of the board, archived ones included.
   * @returns {number} The highest number given so far, plus one.
   */
  function nextNumber (titles) {
    return Math.max(0, ...titles.map((t) => parse(t)?.number ?? 0)) + 1
  }

  return { parse, format, isRef, nextNumber }
}
