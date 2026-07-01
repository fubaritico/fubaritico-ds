/**
 * Normalises a numeric epoch timestamp to **milliseconds**.
 *
 * The data source mixes units: a **10-digit** value is epoch SECONDS (multiplied by 1000), a
 * **13-digit** value is already epoch MILLISECONDS. Any value with more than 10 digits is treated as
 * milliseconds (and fewer than 10 — sub-2001 seconds — is still treated as seconds).
 *
 * @param timestamp - Epoch timestamp in seconds (≤ 10 digits) or milliseconds (≥ 11 digits).
 * @returns The timestamp expressed in milliseconds.
 */
export const toEpochMs = (timestamp: number): number =>
  Math.abs(Math.trunc(timestamp)).toString().length <= 10
    ? timestamp * 1000
    : timestamp
