// Generic (TruncatedText uses it too): it lives in `src/hooks`, re-exported for the table's cells.
export { useIsTextTruncated } from '../../../hooks'
export { useVirtualizedTable } from './useVirtualizedTable'

/* Types */
export type {
  UseVirtualizedTableOptions,
  UseVirtualizedTableResult,
} from './useVirtualizedTable'
