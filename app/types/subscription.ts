/** A calendar the user subscribed to by link, re-read to stay in step. */
export interface CalendarSubscription {
    id: string;
    /** The feed URL, stored normalised to http(s). */
    url: string;
    /** X-WR-CALNAME from the feed, or whatever the user typed. */
    name: string;
    /** Board the events are filed under, if any. */
    categoryId?: string;
    /** Epoch ms of the last successful read. */
    lastSyncedAt?: number | null;
    /** Message from the last failed read; null once one succeeds. */
    lastError?: string | null;
    /** Events present at the last successful read. */
    eventCount?: number;
}
