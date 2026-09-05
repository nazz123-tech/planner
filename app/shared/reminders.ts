/** How far ahead of a task we send the reminder. */
export const REMINDER_LEAD_MS = 2 * 60 * 60 * 1000;

export interface ReminderFields {
    /** Epoch ms of the task's start. Null when the task has no time. */
    dueAt: number | null;
    /** Epoch ms REMINDER_LEAD_MS before dueAt — what the cron matches on. */
    remindAt: number | null;
}

/**
 * Turn a task's local wall-clock `date` + `time` into absolute timestamps.
 *
 * This runs on the client on purpose: only the browser knows the user's
 * timezone, and the stored strings ("2026-09-04", "14:30") carry none.
 */
export function computeReminderFields(
    date?: string | null,
    time?: string | null,
): ReminderFields {
    if (!date || !time) return { dueAt: null, remindAt: null };

    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    if (
        [year, month, day, hour, minute].some(
            (part) => part === undefined || Number.isNaN(part),
        )
    ) {
        return { dueAt: null, remindAt: null };
    }

    const dueAt = new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
    return { dueAt, remindAt: dueAt - REMINDER_LEAD_MS };
}
