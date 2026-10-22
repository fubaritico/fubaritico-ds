import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { tickets } from './ticket.mjs'

const { scopes } = JSON.parse(readFileSync(new URL('../board.json', import.meta.url), 'utf8'))
const { parse, format, isRef, nextNumber } = tickets(scopes)

describe('tickets', () => {
  describe('happy path', () => {
    it('reads a numbered title', () => {
      assert.deepEqual(parse('[STYLES-12] Tooltip : flèche claire'), {
        scope: 'STYLES', number: 12, second: undefined, bare: 'Tooltip : flèche claire',
      })
    })
    it('writes it back unchanged', () => {
      const title = '[STYLES-12 · REACT] Tooltip : flèche claire'
      assert.equal(format(parse(title)), title)
    })
  })

  describe('variants', () => {
    it('reads a title before numbering, with a second scope', () => {
      assert.deepEqual(parse('[react · sb] Menu'), { scope: 'REACT', number: undefined, second: 'SB', bare: 'Menu' })
    })
    it('reads a reference in any case', () => {
      assert.equal(isRef('behaviors-7'), 7)
      assert.equal(isRef('REPO-1'), 1)
    })
  })

  describe('managed errors', () => {
    it('refuses a scope the board does not have', () => {
      assert.equal(parse('[CARTO-12] Atlas'), null)
      assert.equal(isRef('CARTO-12'), null)
    })
    it('refuses a template or a bare Trello number as a ticket', () => {
      assert.equal(parse('Modèle — Idée'), null)
      assert.equal(isRef('12'), null)
    })
  })

  // L4: N/A — pure functions over strings, no I/O to fail

  describe('edge cases', () => {
    it('starts at 1 on an empty board', () => {
      assert.equal(nextNumber([]), 1)
    })
    it('counts past the highest number, gaps and templates ignored', () => {
      assert.equal(nextNumber(['Modèle — Idée', '[REACT-3] a', '[SB-40] b', '[REPO] c']), 41)
    })
    it('keeps a bracket inside the bare title', () => {
      assert.equal(parse('[REACT-2] [Save] bouton').bare, '[Save] bouton')
    })
  })
})
