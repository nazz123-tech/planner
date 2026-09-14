import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { parseIcs, type ImportedEvent } from "./ics";
import { computeReminderFields } from "@/app/shared/reminders";

/** Firestore caps a batch at 500 writes; stay comfortably under. */
const BATCH_LIMIT = 450;

export interface SyncOutcome {
    added: number;
    updated: number;
    removed: number;
    total: number;
    /** The feed's own name, when it publishes one. */
    calendarName?: string;
}

/**
 * Identity of an event across re-reads.
 *
 * The VEVENT UID is the right key and parseIcs already makes it unique per
 * occurrence of a recurring event. Some feeds omit it, so fall back to the
 * fields that make an occurrence distinct — a weaker key, but stable enough
 * that the same event isn't added twice on every sync.
 */
function eventKey(event: ImportedEvent): string {
    if (event.uid) return event.uid;
    return `nouid:${event.title}|${event.date}|${event.time ?? ""}`;
}

/** Fields a re-read is allowed to overwrite. */
function eventFields(event: ImportedEvent, categoryId?: string) {
    return {
        title: event.title,
        date: event.date,
        time: event.time ?? null,
        description: event.description ?? null,
        categoryId: categoryId ?? null,
        ...computeReminderFields(event.date, event.time),
    };
}

function hasChanged(
    existing: Record<string, unknown>,
    next: ReturnType<typeof eventFields>,
): boolean {
    return (
        existing.title !== next.title ||
        existing.date !== next.date ||
        (existing.time ?? null) !== next.time ||
        (existing.description ?? null) !== next.description ||
        (existing.categoryId ?? null) !== next.categoryId
    );
}

export async function fetchCalendar(url: string): Promise<string> {
    const response = await fetch(
        `/api/calendar?url=${encodeURIComponent(url)}`,
    );
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${response.status})`);
    }
    return response.text();
}

/**
 * Brings the tasks belonging to one subscription in line with its feed:
 * adds what's new, updates what moved, removes what the feed dropped.
 *
 * `isDone` is deliberately never overwritten — ticking off a lecture is the
 * user's state, not the calendar's, and a re-read must not undo it.
 */
export async function syncSubscription(args: {
    uid: string;
    subId: string;
    url: string;
    categoryId?: string;
}): Promise<SyncOutcome> {
    const { uid, subId, url, categoryId } = args;

    const raw = await fetchCalendar(url);
    const parsed = parseIcs(raw);

    // Last one wins if a feed repeats a UID, rather than creating duplicates.
    const desired = new Map<string, ImportedEvent>();
    for (const event of parsed.events) desired.set(eventKey(event), event);

    const tasksCol = collection(db, `users/${uid}/tasks`);
    // Equality on a single field in one collection — served by Firestore's
    // automatic index, so this needs no index to be created by hand.
    const existingSnap = await getDocs(
        query(tasksCol, where("sourceSubId", "==", subId)),
    );

    const existingByKey = new Map<
        string,
        { id: string; data: Record<string, unknown> }
    >();
    const orphans: string[] = [];
    for (const docSnap of existingSnap.docs) {
        const data = docSnap.data() as Record<string, unknown>;
        const key = typeof data.sourceUid === "string" ? data.sourceUid : null;
        // A row with no key can't be matched to the feed, so it can only be
        // dropped — leaving it would duplicate on the next read.
        if (!key || existingByKey.has(key)) orphans.push(docSnap.id);
        else existingByKey.set(key, { id: docSnap.id, data });
    }

    let added = 0;
    let updated = 0;

    const batchQueue: {
        run: (batch: ReturnType<typeof writeBatch>) => void;
    }[] = [];

    for (const [key, event] of desired) {
        const fields = eventFields(event, categoryId);
        const existing = existingByKey.get(key);

        if (!existing) {
            batchQueue.push({
                run: (batch) =>
                    batch.set(doc(tasksCol), {
                        ...fields,
                        isDone: false,
                        reminderSentAt: null,
                        sourceSubId: subId,
                        sourceUid: key,
                        createdAt: serverTimestamp(),
                    }),
            });
            added++;
        } else if (hasChanged(existing.data, fields)) {
            batchQueue.push({
                run: (batch) => batch.update(doc(tasksCol, existing.id), fields),
            });
            updated++;
        }
    }

    // Anything the feed no longer lists.
    const removedIds = [
        ...orphans,
        ...[...existingByKey.entries()]
            .filter(([key]) => !desired.has(key))
            .map(([, value]) => value.id),
    ];
    for (const id of removedIds) {
        batchQueue.push({ run: (batch) => batch.delete(doc(tasksCol, id)) });
    }

    for (let i = 0; i < batchQueue.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        for (const item of batchQueue.slice(i, i + BATCH_LIMIT)) {
            item.run(batch);
        }
        await batch.commit();
    }

    return {
        added,
        updated,
        removed: removedIds.length,
        total: desired.size,
        calendarName: parsed.calendar.name,
    };
}

/** Removes a subscription along with every task it created. */
export async function deleteSubscription(uid: string, subId: string) {
    const tasksCol = collection(db, `users/${uid}/tasks`);
    const owned = await getDocs(
        query(tasksCol, where("sourceSubId", "==", subId)),
    );

    const ids = owned.docs.map((d) => d.id);
    for (let i = 0; i < ids.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        for (const id of ids.slice(i, i + BATCH_LIMIT)) {
            batch.delete(doc(tasksCol, id));
        }
        await batch.commit();
    }

    await deleteDoc(doc(db, `users/${uid}/calendarSubscriptions/${subId}`));
    return { removed: ids.length };
}
