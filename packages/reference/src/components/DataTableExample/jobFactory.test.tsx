import { describe, expect, it } from 'vitest'

import { makeJob, makeJobs } from './jobFactory'

import type { JobItem } from './jobFactory'

/** Every required key of a JobItem record. */
const REQUIRED_KEYS: (keyof JobItem)[] = [
  'id',
  'customName',
  'systemModStamp',
  'lastModifiedDate',
  'createdDate',
  'type',
  'status',
  'orgId',
  'salesforceOrgId',
]

describe('jobFactory', () => {
  describe('happy path', () => {
    it('generates the requested number of records', () => {
      expect(makeJobs(100)).toHaveLength(100)
    })

    it('produces a record with every required field', () => {
      const job = makeJob(0)
      for (const key of REQUIRED_KEYS) {
        expect(job[key]).toBeDefined()
      }
    })
  })

  describe('variants', () => {
    it('is deterministic — same index yields identical records', () => {
      expect(makeJob(42)).toEqual(makeJob(42))
    })

    it('cycles the status pool by index', () => {
      expect(makeJob(0).status).toBe('Running')
      expect(makeJob(1).status).toBe('Completed')
      // 5 statuses → index 5 wraps back to the first
      expect(makeJob(5).status).toBe('Running')
    })

    it('gives every row a unique id', () => {
      const jobs = makeJobs(1000)
      expect(new Set(jobs.map((j) => j.id)).size).toBe(1000)
    })

    it('emits timestamps in epoch milliseconds (13 digits)', () => {
      expect(String(makeJob(0).createdDate)).toHaveLength(13)
    })
  })

  // L3: managed errors — N/A (pure data factory, no error path)

  describe('unmanaged errors', () => {
    it('returns an empty array for a count of 0', () => {
      expect(makeJobs(0)).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('handles a single record', () => {
      expect(makeJobs(1)).toHaveLength(1)
    })

    it('scales to 100k records with unique ids', () => {
      const jobs = makeJobs(100_000)
      expect(jobs).toHaveLength(100_000)
      expect(jobs[99_999].id).toBe('Job-99999')
    })
  })
})
