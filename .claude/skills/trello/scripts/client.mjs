// The Trello REST client, bound to ONE board. Credentials and board are injected, so a batch script or a
// test can plug its own; nothing here reads a file or the environment. The token reaches every board of
// the account (Atlas's included): every path below is built from `config.board`, never from an argument.

import { tickets } from './ticket.mjs'

/**
 * Raised on any Trello refusal — no retry, no fallback.
 */
export class TrelloError extends Error {}

/**
 * Builds the client of one board.
 *
 * @param {object} deps - Injected collaborators.
 * @param {object} deps.config - The parsed `board.json`.
 * @param {{ key: string, token: string }} deps.credentials - Trello API key and token.
 * @param {typeof fetch} [deps.fetchImpl] - The fetch to use; the global one by default.
 * @returns {object} The board's operations, one per gesture.
 */
export function createClient ({ config, credentials, fetchImpl = fetch }) {
  const BOARD = config.board
  const LAST = config.columns.at(-1)
  const t = tickets(config.scopes)

  /**
   * One call to the Trello REST API; params go in the query, the URL is never printed.
   *
   * @param {string} method - HTTP verb.
   * @param {string} path - API path after `/1`.
   * @param {Record<string, string>} [params] - Query parameters.
   * @param {object} [body] - JSON body.
   * @returns {Promise<any>} The parsed response.
   */
  async function api (method, path, params = {}, body = undefined) {
    const query = new URLSearchParams({ ...params, key: credentials.key, token: credentials.token })
    const init = body === undefined
      ? { method }
      : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    const response = await fetchImpl(`https://api.trello.com/1${path}?${query}`, init)
    if (!response.ok) throw new TrelloError(`${method} ${path} → ${response.status} ${await response.text()}`)
    return response.json()
  }

  /** @returns {Promise<{ id: string, name: string }[]>} The open columns, in board order. */
  const lists = () => api('GET', `/boards/${BOARD}/lists`, { fields: 'name' })

  /**
   * @param {string} name - A column name from `config.columns`.
   * @returns {Promise<{ id: string, name: string }>} That column.
   */
  async function listNamed (name) {
    const found = (await lists()).find((l) => l.name === name)
    if (!found) throw new TrelloError(`no column "${name}" — columns: ${config.columns.join(' / ')} (run setup)`)
    return found
  }

  /** @returns {Promise<{ id: string, name: string }[]>} Every card, archived included (`find`, numbering). */
  const allCards = () => api('GET', `/boards/${BOARD}/cards/all`, { fields: 'name,idList,idShort,closed,url' })

  /**
   * A card of THIS board, by ticket (`STYLES-12`) or by Trello's number (`12`).
   *
   * @param {string} ref - The reference.
   * @returns {Promise<any>} The card.
   */
  async function card (ref) {
    const fields = 'name,desc,idList,idShort,url,idLabels'
    const number = t.isRef(ref)
    if (number !== null) {
      const found = (await api('GET', `/boards/${BOARD}/cards`, { fields })).find((c) => t.parse(c.name)?.number === number)
      if (!found) throw new TrelloError(`no open card has ticket ${ref}`)
      // the number alone is unique, but a mistyped scope must not land on another ticket silently
      const { scope, second } = t.parse(found.name)
      if (![scope, second].includes(ref.split('-')[0].toUpperCase()))
        throw new TrelloError(`${ref} is ${ticketRef(found)} — the scope differs, check the reference`)
      return found
    }
    if (!/^\d+$/.test(ref ?? '')) throw new TrelloError(`a card is named by its ticket (STYLES-12) or its Trello number, got "${ref}"`)
    return api('GET', `/boards/${BOARD}/cards/${ref}`, { fields })
  }

  /**
   * How a card is named in a comment: its ticket, or Trello's number for a card without one.
   *
   * @param {{ name: string, idShort: number }} c - The card.
   * @returns {string} `STYLES-12` or `#12`.
   */
  function ticketRef (c) {
    const ticket = t.parse(c.name)
    return ticket?.number ? `${ticket.scope}-${ticket.number}` : `#${c.idShort}`
  }

  /**
   * The board's label of that name, created with its colour the first time it is asked for.
   *
   * @param {string} name - A label from `config.labels`.
   * @returns {Promise<{ id: string, name: string }>} The label.
   */
  async function label (name) {
    const wanted = config.labels.find((l) => l.name === name)
    if (!wanted) throw new TrelloError(`unknown label "${name}" — labels: ${config.labels.map((l) => l.name).join(', ')}`)
    const found = (await api('GET', `/boards/${BOARD}/labels`, { fields: 'name' })).find((l) => l.name === name)
    if (found) return found
    return api('POST', '/labels', { idBoard: BOARD, name, color: wanted.color })
  }

  /**
   * Refuses unknown labels BEFORE anything is written, so a typo never leaves half a gesture on the board.
   *
   * @param {string[]} names - Label names.
   * @returns {void}
   */
  function checkLabels (names) {
    const unknown = names.filter((n) => !config.labels.some((l) => l.name === n))
    if (unknown.length) throw new TrelloError(`unknown label(s): ${unknown.join(', ')}`)
  }

  /**
   * Creates a ticket; the script gives the number.
   *
   * @param {object} spec - The card.
   * @param {string} spec.column - Target column.
   * @param {string} spec.title - `[SCOPE] title` — a number written by hand is refused.
   * @param {string} [spec.desc] - The filled template.
   * @param {string[]} [spec.labels] - Label names.
   * @param {'top' | 'bottom'} [spec.pos] - Position; bottom by default, top in the last column.
   * @returns {Promise<any>} The created card.
   */
  async function add ({ column, title, desc = '', labels = [], pos }) {
    const ticket = t.parse(title)
    if (!ticket) throw new TrelloError(`a title starts with its scope: "[REACT] …", "[STYLES · REACT] …" — got "${title}"`)
    if (ticket.number) throw new TrelloError(`the script gives the number — write "[${ticket.scope}] …"`)
    checkLabels(labels)
    const list = await listNamed(column)
    const name = t.format({ ...ticket, number: t.nextNumber((await allCards()).map((c) => c.name)) })
    const ids = []
    for (const n of labels) ids.push((await label(n)).id)
    return api('POST', '/cards', {
      idList: list.id, name, desc, pos: pos ?? (column === LAST ? 'top' : 'bottom'), idLabels: ids.join(','),
    })
  }

  /**
   * Does a ticket reach a published package? Yes when one of its scopes is not in `config.unpublished`
   * (REPO, STENCIL, SB are private): `[REPO · REACT]` ships, `[REPO]` does not.
   *
   * @param {string} title - The card title.
   * @returns {boolean} Whether its delivery waits for a release.
   */
  function ships (title) {
    const ticket = t.parse(title)
    if (!ticket) return false
    return [ticket.scope, ticket.second].filter(Boolean).some((s) => !config.unpublished.includes(s))
  }

  return { api, lists, listNamed, allCards, card, ticketRef, label, checkLabels, add, ships, tickets: t }
}
