import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { createClient, TrelloError } from './client.mjs'

const config = JSON.parse(readFileSync(new URL('../board.json', import.meta.url), 'utf8'))

/**
 * A fake Trello answering from an in-memory board; records every call.
 *
 * @param {{ cards?: { name: string }[], open?: { name: string }[], status?: number }} [board] - Every
 *   card (archived included), the open ones, or a refusal status.
 * @returns {{ fetchImpl: typeof fetch, calls: { method: string, url: URL }[] }} The fake and its log.
 */
function fakeTrello ({ cards = [], open = [], status = 200 } = {}) {
  const calls = []
  const fetchImpl = async (href, init = {}) => {
    const url = new URL(href)
    const method = init.method ?? 'GET'
    calls.push({ method, url })
    const reply = (body) => ({ ok: status < 400, status, json: async () => body, text: async () => 'refused' })
    if (url.pathname.endsWith('/lists')) return reply(config.columns.map((name, i) => ({ id: `l${i}`, name })))
    if (url.pathname.endsWith('/cards/all')) return reply(cards)
    if (method === 'GET' && url.pathname.endsWith('/cards')) return reply(open)
    if (url.pathname.endsWith('/labels')) return reply(config.labels.map((l, i) => ({ id: `lb${i}`, name: l.name })))
    if (method === 'POST' && url.pathname === '/1/cards') return reply({ idShort: 1, name: url.searchParams.get('name') })
    return reply({})
  }
  return { fetchImpl, calls }
}

const client = (board) => {
  const fake = fakeTrello(board)
  return { ...createClient({ config, credentials: { key: 'k', token: 't' }, fetchImpl: fake.fetchImpl }), calls: fake.calls }
}

describe('createClient', () => {
  describe('happy path', () => {
    it('numbers a new ticket after the highest one, archived cards included', async () => {
      const c = client({ cards: [{ name: '[REACT-41] a' }, { name: 'Modèle — Idée' }] })
      const created = await c.add({ column: 'Idées', title: '[STYLES] Tooltip : flèche' })
      assert.equal(created.name, '[STYLES-42] Tooltip : flèche')
    })
  })

  describe('variants', () => {
    it('ships a ticket when one of its scopes is published', () => {
      const c = client()
      assert.equal(c.ships('[REACT-1] a'), true)
      assert.equal(c.ships('[REPO-1 · REACT] a'), true)
    })
    it('does not ship tooling, Stencil or Storybook alone', () => {
      const c = client()
      for (const title of ['[REPO-1] a', '[STENCIL-2] b', '[SB-3] c', '[SB-4 · REPO] d', 'Modèle — Idée']) {
        assert.equal(c.ships(title), false, title)
      }
    })
  })

  describe('managed errors', () => {
    it('refuses a number written by hand, before any write', async () => {
      const c = client()
      await assert.rejects(c.add({ column: 'Idées', title: '[REACT-9] a' }), TrelloError)
      assert.equal(c.calls.filter((x) => x.method !== 'GET').length, 0)
    })
    it('refuses an unknown label before any write', async () => {
      const c = client()
      await assert.rejects(c.add({ column: 'Idées', title: '[REACT] a', labels: ['inconnu'] }), TrelloError)
      assert.equal(c.calls.length, 0)
    })
  })

  describe('ticket references', () => {
    it('finds a ticket by either of its scopes', async () => {
      const c = client({ open: [{ name: '[REPO-79 · REACT] a' }] })
      assert.equal((await c.card('react-79')).name, '[REPO-79 · REACT] a')
      assert.equal((await c.card('REPO-79')).name, '[REPO-79 · REACT] a')
    })
    it('refuses a reference whose scope is not the ticket\'s, before any write', async () => {
      const c = client({ open: [{ name: '[REACT-142] DatePicker' }] })
      await assert.rejects(c.card('REPO-142'), /REACT-142 — the scope differs/)
      assert.equal(c.calls.filter((x) => x.method !== 'GET').length, 0)
    })
  })

  describe('unmanaged errors', () => {
    it('surfaces a Trello refusal with its status, no retry', async () => {
      const c = client({ status: 401 })
      await assert.rejects(c.lists(), /401/)
      assert.equal(c.calls.length, 1)
    })
  })

  describe('edge cases', () => {
    it('only ever addresses the configured board', async () => {
      const c = client()
      await c.add({ column: 'Idées', title: '[REACT] a' })
      const boardPaths = c.calls.map((x) => x.url.pathname).filter((p) => p.startsWith('/1/boards/'))
      assert.ok(boardPaths.every((p) => p.startsWith(`/1/boards/${config.board}/`)), boardPaths.join(' '))
    })
  })
})

describe('renameList and renameLabel', () => {
  describe('happy path', () => {
    it('renames a column in place', async () => {
      const c = client()
      await c.renameList(config.columns[0], 'Renamed')
      const put = c.calls.find((call) => call.method === 'PUT')
      assert.equal(put?.url.pathname, '/1/lists/l0')
      assert.equal(put?.url.searchParams.get('name'), 'Renamed')
    })

    it('renames a label in place', async () => {
      const c = client()
      await c.renameLabel(config.labels[0].name, 'renamed')
      const put = c.calls.find((call) => call.method === 'PUT')
      assert.equal(put?.url.pathname, '/1/labels/lb0')
      assert.equal(put?.url.searchParams.get('name'), 'renamed')
    })
  })

  describe('variants', () => {
    it('writes nothing on a dry run', async () => {
      const c = client()
      await c.renameList(config.columns[0], 'Renamed', { dryRun: true })
      await c.renameLabel(config.labels[0].name, 'renamed', { dryRun: true })
      assert.equal(c.calls.filter((call) => call.method !== 'GET').length, 0)
    })
  })

  describe('managed errors', () => {
    it('refuses a column that does not exist', async () => {
      await assert.rejects(client().renameList('Nope', 'Renamed'), TrelloError)
    })

    it('refuses to rename a column onto one that exists', async () => {
      const c = client()
      await assert.rejects(c.renameList(config.columns[0], config.columns[1]), /already exists/)
      assert.equal(c.calls.filter((call) => call.method === 'PUT').length, 0)
    })

    it('refuses to rename a label onto one that exists', async () => {
      const c = client()
      await assert.rejects(c.renameLabel(config.labels[0].name, config.labels[1].name), /already exists/)
      assert.equal(c.calls.filter((call) => call.method === 'PUT').length, 0)
    })
  })

  // L4: N/A — a Trello refusal is surfaced by api(), covered above for the other verbs.

  describe('edge cases', () => {
    it('refuses a label that does not exist', async () => {
      await assert.rejects(client().renameLabel('nope', 'renamed'), /no label "nope"/)
    })
  })
})

/**
 * A fake Trello holding one Epic (label `epic · x`), its « Tickets enfants » checklist and the board
 * labels; records every call.
 *
 * @param {{ items?: { id: string, name: string, state: string }[], noChecklist?: boolean }} [state] -
 *   The checklist's items, or no checklist yet.
 * @returns {{ fetchImpl: typeof fetch, calls: { method: string, url: URL }[] }} The fake and its log.
 */
function fakeEpicTrello ({ items = [], noChecklist = false } = {}) {
  const calls = []
  const labels = [...config.labels.map((l, i) => ({ id: `lb${i}`, name: l.name })), { id: 'lbEpic', name: `${config.epics.labelPrefix}x` }]
  const fetchImpl = async (href, init = {}) => {
    const url = new URL(href)
    const method = init.method ?? 'GET'
    calls.push({ method, url })
    const reply = (body) => ({ ok: true, status: 200, json: async () => body, text: async () => '' })
    if (url.pathname.endsWith('/labels') && method === 'GET') return reply(labels)
    if (url.pathname.endsWith('/lists') && method === 'GET') return reply(config.columns.map((name, i) => ({ id: `l${i}`, name })))
    if (/\/lists\/l\d+\/cards$/.test(url.pathname)) return reply([{ id: 'epic', name: 'The Epic', idLabels: ['lbEpic'], url: 'https://trello.com/c/EPIC/1-epic' }])
    if (url.pathname.endsWith('/cards/epic/checklists') && method === 'GET')
      return reply(noChecklist ? [] : [{ id: 'cl', name: config.epics.children, checkItems: items }])
    if (url.pathname.endsWith('/cards/epic/checklists') && method === 'POST') return reply({ id: 'cl-new', name: config.epics.children })
    return reply({})
  }
  return { fetchImpl, calls }
}

const epicClient = (state) => {
  const fake = fakeEpicTrello(state)
  return { ...createClient({ config, credentials: { key: 'k', token: 't' }, fetchImpl: fake.fetchImpl }), calls: fake.calls }
}

const EPIC = { id: 'epic', idLabels: ['lbEpic'], url: 'https://trello.com/c/EPIC/1-epic' }
const TICKET = { id: 't1', idLabels: [], url: 'https://trello.com/c/T1LINK/2-ticket' }

describe('addChild and tickChild', () => {
  describe('happy path', () => {
    it('labels the ticket and adds its link to the Epic', async () => {
      const c = epicClient()
      assert.equal(await c.addChild(EPIC, TICKET, false), true)
      const label = c.calls.find((call) => call.method === 'POST' && call.url.pathname === '/1/cards/t1/idLabels')
      assert.equal(label?.url.searchParams.get('value'), 'lbEpic')
      const item = c.calls.find((call) => call.method === 'POST' && call.url.pathname === '/1/checklists/cl/checkItems')
      assert.equal(item?.url.searchParams.get('name'), TICKET.url)
      assert.equal(item?.url.searchParams.get('checked'), 'false')
    })

    it('ticks a done ticket in its Epic', async () => {
      const c = epicClient({ items: [{ id: 'i1', name: TICKET.url, state: 'incomplete' }] })
      assert.equal(await c.tickChild({ ...TICKET, idLabels: ['lbEpic'] }), 'The Epic')
      const put = c.calls.find((call) => call.method === 'PUT')
      assert.equal(put?.url.pathname, '/1/cards/epic/checkItem/i1')
      assert.equal(put?.url.searchParams.get('state'), 'complete')
    })
  })

  describe('variants', () => {
    it('creates the checklist the first time', async () => {
      const c = epicClient({ noChecklist: true })
      await c.addChild(EPIC, TICKET, true)
      assert.ok(c.calls.some((call) => call.method === 'POST' && call.url.pathname === '/1/cards/epic/checklists'))
      const item = c.calls.find((call) => call.url.pathname === '/1/checklists/cl-new/checkItems')
      assert.equal(item?.url.searchParams.get('checked'), 'true')
    })
  })

  describe('managed errors', () => {
    it('refuses a card that is not an Epic', async () => {
      await assert.rejects(epicClient().addChild({ ...EPIC, idLabels: [] }, TICKET, false), /not an Epic/)
    })
  })

  // L4: N/A — a Trello refusal is surfaced by api(), as for every verb.

  describe('edge cases', () => {
    it('adds a ticket already listed only once', async () => {
      const c = epicClient({ items: [{ id: 'i1', name: TICKET.url, state: 'incomplete' }] })
      assert.equal(await c.addChild(EPIC, TICKET, false), false)
      assert.equal(c.calls.filter((call) => call.url.pathname.includes('/checkItems')).length, 0)
    })

    it('ticks nothing for a ticket without an Epic', async () => {
      const c = epicClient()
      assert.equal(await c.tickChild(TICKET), undefined)
      assert.equal(c.calls.filter((call) => call.method === 'PUT').length, 0)
    })
  })
})
