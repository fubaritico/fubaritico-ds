import type { ToastAnnouncement, ToastLive } from './types.js'
import type { TimerHandle, TimerScheduler } from '../common/types.js'

/**
 * How long an announcement stays in its live region, in ms — long enough for a screen reader to
 * pick it up, short enough not to be re-read (Radix Toast's value).
 */
export const TOAST_ANNOUNCEMENT_LIFETIME = 1000

/** Both live regions empty. */
const SILENT: ToastLive = Object.freeze({ polite: '', assertive: '' })

/** A text that already ends a sentence: no full stop is added after it. */
const SENTENCE_END = /[.!?…]$/

/**
 * Appends a toast's text to what a region is still reading, one sentence each — never
 * « Upload failed.. Saved », never « Saved Synced » run together.
 *
 * @param current - What the region holds.
 * @param next - The toast's text.
 * @returns Both, as sentences.
 */
function joinSpoken(current: string, next: string): string {
  if (current === '') return next
  return SENTENCE_END.test(current)
    ? `${current} ${next}`
    : `${current}. ${next}`
}

/** What a queued toast needs to be announced: who it is, where its text is, how loud. */
interface Announceable {
  /** The toast's id. */
  id: string
  /** Its DOM id — where the adapter reads the text from. */
  domId: string
  /** Read assertively. */
  urgent: boolean
}

/**
 * The announcement rules of the toast stack (WCAG 4.1.3), framework-agnostic — the machine owns
 * them, an adapter only reads text out of its DOM:
 * - a toast that appears, or whose content is replaced, is QUEUED (`pending`);
 * - the adapter reads its text once rendered and hands it back (`fulfil`) — never in the same frame
 *   as the insertion, which NVDA misses;
 * - the text is ADDED to its live region (polite, or assertive for an urgent toast), never put in
 *   place of what is still being read: two toasts in a row are both heard;
 * - the regions are emptied {@link TOAST_ANNOUNCEMENT_LIFETIME} after the last write;
 * - a remounted region (the stack moved into a dialog) starts empty, and what was being read is
 *   queued again (`replay`) — a region inserted already filled is not reliably read.
 *
 * Internal to the machine, which commits after each change it reports.
 */
export class ToastAnnouncer {
  /** Source of the announcements' numbers. */
  private sequence = 0
  /** Waiting for their text. */
  private pending: ToastAnnouncement[] = []
  /** Written since the regions were last emptied — what a replay queues again. */
  private heard: ToastAnnouncement[] = []
  /** What each region reads out. */
  private live: ToastLive = SILENT
  /** The pending emptying of the regions (boxed: any handle value). */
  private clearTimer: { handle: TimerHandle } | null = null

  /**
   * @param scheduler - The machine's timers.
   * @param onChange - Called when the regions are emptied by the timer, for the machine to commit.
   */
  constructor(
    private readonly scheduler: TimerScheduler,
    private readonly onChange: () => void
  ) {}

  /**
   * The announcements waiting for their text, oldest first.
   *
   * @returns A copy, for the snapshot.
   */
  pendingAnnouncements(): readonly ToastAnnouncement[] {
    return [...this.pending]
  }

  /**
   * What each live region reads out now.
   *
   * @returns The regions' text, for the snapshot.
   */
  liveText(): ToastLive {
    return this.live
  }

  /**
   * Queues a toast that appeared or changed; a toast already waiting is queued once.
   *
   * @param toast - {@link Announceable}.
   */
  queue(toast: Announceable): void {
    this.forget(toast.id)
    this.pending.push({
      seq: ++this.sequence,
      toastId: toast.id,
      domId: toast.domId,
      politeness: toast.urgent ? 'assertive' : 'polite',
    })
  }

  /**
   * Drops what waits for, or was read of, a toast that left the stack — its text is no longer on
   * the page, a replay must not queue it.
   *
   * @param toastId - The toast's id.
   */
  forget(toastId: string): void {
    this.pending = this.pending.filter((a) => a.toastId !== toastId)
    this.heard = this.heard.filter((a) => a.toastId !== toastId)
  }

  /**
   * Writes the text of a queued announcement into its region, after what is still being read, and
   * restarts the emptying.
   *
   * @param seq - The announcement's number.
   * @param text - The toast's text as rendered; an empty one is dropped.
   * @returns Whether a queued announcement was fulfilled — `false` for one already done or unknown
   *   (an adapter run twice, a toast gone in between).
   */
  fulfil(seq: number, text: string): boolean {
    const announcement = this.pending.find((a) => a.seq === seq)
    if (announcement === undefined) return false
    this.pending = this.pending.filter((a) => a !== announcement)
    const spoken = text.trim()
    if (spoken === '') return true
    const { politeness } = announcement
    this.live = {
      ...this.live,
      [politeness]: joinSpoken(this.live[politeness], spoken),
    }
    this.heard.push(announcement)
    this.restartClear()
    return true
  }

  /**
   * A live region was remounted: empty the regions and queue again what was being read.
   *
   * @returns Whether anything changed.
   */
  replay(): boolean {
    if (this.heard.length === 0) return false
    // The latest read of each toast, once — and not one already waiting (replaced in between).
    const latest = new Map(this.heard.map((a) => [a.toastId, a]))
    this.heard = []
    this.live = SILENT
    this.cancelClear()
    for (const announcement of latest.values())
      if (!this.pending.some((a) => a.toastId === announcement.toastId))
        this.pending.push({ ...announcement, seq: ++this.sequence })
    return true
  }

  /** Empties everything and cancels the timer. */
  reset(): void {
    this.cancelClear()
    this.pending = []
    this.heard = []
    this.live = SILENT
  }

  /** Empties the regions {@link TOAST_ANNOUNCEMENT_LIFETIME} from now, replacing a pending emptying. */
  private restartClear(): void {
    this.cancelClear()
    this.clearTimer = {
      handle: this.scheduler.set(() => {
        this.clearTimer = null
        this.live = SILENT
        this.heard = []
        this.onChange()
      }, TOAST_ANNOUNCEMENT_LIFETIME),
    }
  }

  /** Cancels the pending emptying, if any. */
  private cancelClear(): void {
    if (this.clearTimer !== null) this.scheduler.clear(this.clearTimer.handle)
    this.clearTimer = null
  }
}
