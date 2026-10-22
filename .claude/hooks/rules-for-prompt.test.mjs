// Run: node --test .claude/hooks/rules-for-prompt.test.mjs — ported from europe-map, cases rewritten for the DS.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { matchTopics, normalise, renderReminder } from './rules-for-prompt.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const script = join(here, 'rules-for-prompt.mjs')
const { topics } = JSON.parse(readFileSync(join(here, '../skills/rules/topics.json'), 'utf8'))

/** Runs the hook as Claude Code does: JSON on stdin, extra arguments after the script. */
const run = (input, args = []) =>
  execFileSync('node', [script, ...args], { input: JSON.stringify(input), encoding: 'utf8' })

describe('rules-for-prompt', () => {
  describe('happy path', () => {
    it('names the components for a message about a component', () => {
      assert.deepEqual(matchTopics('La Tooltip ne s’affiche plus dans la Modal', topics), ['components'])
    })

    it('injects the files of a matched topic as additionalContext', () => {
      const out = JSON.parse(run({ session_id: `t-${Date.now()}-a`, prompt: 'on regarde le Slider' }))
      assert.equal(out.hookSpecificOutput.hookEventName, 'UserPromptSubmit')
      assert.match(out.hookSpecificOutput.additionalContext, /\.claude\/rules\/known-issues\/components\.md/)
    })
  })

  describe('variants', () => {
    it('ignores accents and case', () => {
      assert.deepEqual(matchTopics('LE THÈME', topics), ['styles'])
    })

    it('accepts a plural in s or x', () => {
      assert.deepEqual(matchTopics('les tokens', topics), ['styles'])
    })

    it('matches a ticket by its prefix', () => {
      assert.deepEqual(matchTopics('STENCIL-130', topics), ['stencil'])
      assert.deepEqual(matchTopics('REACT-142', topics), ['components'])
    })

    it('matches a phrase', () => {
      assert.deepEqual(matchTopics('ouvert dans le top layer', topics), ['components'])
    })

    it('names the Claude configuration rule for a talk about Claude practices', () => {
      assert.deepEqual(matchTopics('les bonnes pratiques de Claude', topics), ['claude'])
    })

    it('names several topics in one message, a shared file once', () => {
      const keys = matchTopics('le skin du composant', topics)
      assert.deepEqual(keys, ['components', 'styles'])
      assert.equal(renderReminder(keys, topics).split('.claude/rules/patterns-ui.md').length - 1, 1)
    })
  })

  describe('managed errors', () => {
    it('fails loudly, without blocking, when the input has no session_id', () => {
      assert.throws(() => run({ prompt: 'skin' }), (error) => error.status === 1 && /no session_id/.test(error.stderr))
    })

    it('fails loudly when the input has no prompt', () => {
      assert.throws(() => run({ session_id: 'x' }), (error) => error.status === 1 && /no prompt/.test(error.stderr))
    })
  })

  describe('unmanaged errors', () => {
    it('fails loudly on input that is not JSON', () => {
      assert.throws(
        () => execFileSync('node', [script], { input: 'not json', encoding: 'utf8', stdio: 'pipe' }),
        (error) => error.status === 1 && /\[rules hook\]/.test(error.stderr),
      )
    })
  })

  describe('edge cases', () => {
    it('names nothing for a message with no subject word', () => {
      assert.deepEqual(matchTopics('Oui, vas-y.', topics), [])
      assert.equal(run({ session_id: `t-${Date.now()}-b`, prompt: 'Oui, vas-y.' }), '')
    })

    it('does not take the Trello board, a map, a corner or celui-ci for a subject', () => {
      assert.deepEqual(matchTopics('sur le tableau, la carte dans un coin, celui-ci', topics), [])
    })

    it('takes test and tests for the tests topic, not the verb tester', () => {
      assert.deepEqual(matchTopics('un test', topics), ['tests'])
      assert.deepEqual(matchTopics('on va tester si ça se déclenche', topics), [])
    })

    it("names nothing for a subagent's report or a task event, and does not mark their topics", () => {
      const session = `t-${Date.now()}-d`
      const report = 'Another Claude session sent a message:\n<agent-message from="x">the skin</agent-message>'
      assert.equal(run({ session_id: session, prompt: report }), '')
      assert.equal(run({ session_id: session, prompt: '<task-notification>skin</task-notification>' }), '')
      assert.notEqual(run({ session_id: session, prompt: 'le skin' }), '')
      run({ session_id: session, prompt: 'x' }, ['--reset'])
    })

    it('asks for a topic once per session, again after a reset', () => {
      const session = `t-${Date.now()}-c`
      assert.notEqual(run({ session_id: session, prompt: 'stencil' }), '')
      assert.equal(run({ session_id: session, prompt: 'stencil encore' }), '')
      assert.equal(run({ session_id: session, prompt: 'x' }, ['--reset']), '')
      assert.notEqual(run({ session_id: session, prompt: 'stencil' }), '')
      run({ session_id: session, prompt: 'x' }, ['--reset'])
    })

    it('points only at files that exist', () => {
      const root = join(here, '../..')
      for (const topic of Object.values(topics)) for (const file of topic.files) readFileSync(join(root, file.path))
    })

    it('normalises a decomposed accent', () => {
      assert.equal(normalise('thème'), 'theme')
    })
  })
})
