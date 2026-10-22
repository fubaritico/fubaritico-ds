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
