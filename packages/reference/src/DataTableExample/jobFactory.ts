/**
 * Synthetic data factory for the DataTable perf story/tests.
 *
 * Recreates the original (external) `JobItem` shape and generates an arbitrary number of records —
 * deterministically (index-driven, no `Math.random`) so stories and snapshots stay reproducible.
 * Built to feed 10k / 100k / 150k rows into the virtualized table without any backend.
 */

/** Lifecycle status of a backup/restore job. */
export type JobStatus =
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'Queued'
  | 'Cancelled'

/** A single row of the jobs DataTable (recreated from the original data source shape). */
export interface JobItem {
  /** Stable unique id (e.g. `"Job-42"`). */
  id: string
  /** Human-readable job name. */
  customName: string
  /** Last system-modification instant, epoch milliseconds. */
  systemModStamp: number
  /** Last user-modification instant, epoch milliseconds. */
  lastModifiedDate: number
  /** Creation instant, epoch milliseconds. */
  createdDate: number
  /** Job kind (e.g. `"Backup"`). */
  type: string
  /** Current lifecycle status. */
  status: JobStatus
  /** Owning organisation id. */
  orgId: string
  /** Salesforce organisation id. */
  salesforceOrgId: string
}

/** Status pool, cycled by index. */
const STATUSES: readonly JobStatus[] = [
  'Running',
  'Completed',
  'Failed',
  'Queued',
  'Cancelled',
]

/** Job-type pool, cycled by index. */
const TYPES: readonly string[] = ['Backup', 'Restore', 'Archive', 'Sync']

/** Name pool, cycled by index (suffixed with the row number to stay unique). */
const NAME_POOL: readonly string[] = [
  'Deleted records daily incremental',
  'Full org backup',
  'Weekly metadata snapshot',
  'Sandbox refresh',
  'Attachment archive',
  'Nightly delta sync',
]

/** Fixed reference instant (epoch ms) so generated timestamps are reproducible across runs. */
const BASE_MS = 1_719_835_358_000

/** One second in milliseconds — the per-row timestamp decrement. */
const ONE_SECOND_MS = 1_000

/**
 * Builds a single deterministic {@link JobItem} for a given row index.
 *
 * @param index - Zero-based row index; drives every field's variation.
 * @returns The generated job record (timestamps in epoch milliseconds).
 */
export function makeJob(index: number): JobItem {
  const created = BASE_MS - index * ONE_SECOND_MS
  return {
    id: `Job-${String(index)}`,
    customName: `${NAME_POOL[index % NAME_POOL.length]} #${String(index)}`,
    createdDate: created,
    lastModifiedDate: created + ONE_SECOND_MS,
    systemModStamp: created + 2 * ONE_SECOND_MS,
    type: TYPES[index % TYPES.length],
    status: STATUSES[index % STATUSES.length],
    orgId: `Org-${String(10000 + (index % 5000))}`,
    salesforceOrgId: `00D${String(index % 1000).padStart(13, '0')}`,
  }
}

/**
 * Generates `count` deterministic {@link JobItem} records.
 *
 * @param count - Number of rows to generate (e.g. `150_000` for the perf story).
 * @returns A freshly-built array of job records.
 */
export function makeJobs(count: number): JobItem[] {
  return Array.from({ length: count }, (_, index) => makeJob(index))
}
