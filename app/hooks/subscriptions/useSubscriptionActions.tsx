"use client";

import { useMutation } from "@tanstack/react-query";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import {
    deleteSubscription,
    fetchCalendar,
    syncSubscription,
    type SyncOutcome,
} from "@/app/lib/calendarSync";
import { parseIcs } from "@/app/lib/ics";
import type { CalendarSubscription } from "@/app/types/subscription";

/** webcal:// is the same feed over https; store the form that can be fetched. */
function normaliseUrl(input: string): string {
    return input.trim().replace(/^webcal:\/\//i, "https://");
}

/**
 * Subscribes to a calendar and pulls it in for the first time.
 *
 * The feed is fetched before anything is written, so a bad link fails without
 * leaving a broken subscription behind.
 */
export function useAddSubscription() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (args: { url: string; categoryId?: string }) => {
            if (!user) throw new Error("Not authenticated");

            const url = normaliseUrl(args.url);
            // Validates the link and gives us the calendar's own name.
            const raw = await fetchCalendar(url);
            const parsed = parseIcs(raw);

            const ref = doc(
                collection(db, `users/${user.uid}/calendarSubscriptions`),
            );
            const name =
                parsed.calendar.name?.trim() ||
                new URL(url).hostname.replace(/^www\./, "");

            await setDoc(ref, {
                url,
                name,
                categoryId: args.categoryId ?? null,
                lastSyncedAt: null,
                lastError: null,
                eventCount: 0,
                createdAt: serverTimestamp(),
            });

            const outcome = await syncSubscription({
                uid: user.uid,
                subId: ref.id,
                url,
                categoryId: args.categoryId,
            });

            await setDoc(
                ref,
                {
                    lastSyncedAt: Date.now(),
                    lastError: null,
                    eventCount: outcome.total,
                },
                { merge: true },
            );

            return { id: ref.id, name, ...outcome };
        },
    });
}

/** Re-reads one subscription and records the outcome on its document. */
export function useSyncSubscription() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (sub: CalendarSubscription): Promise<SyncOutcome> => {
            if (!user) throw new Error("Not authenticated");

            const ref = doc(
                db,
                `users/${user.uid}/calendarSubscriptions/${sub.id}`,
            );

            try {
                const outcome = await syncSubscription({
                    uid: user.uid,
                    subId: sub.id,
                    url: sub.url,
                    categoryId: sub.categoryId,
                });
                await setDoc(
                    ref,
                    {
                        lastSyncedAt: Date.now(),
                        lastError: null,
                        eventCount: outcome.total,
                    },
                    { merge: true },
                );
                return outcome;
            } catch (error) {
                // Recorded rather than thrown away, so a feed that has gone
                // bad shows why instead of just never updating.
                await setDoc(
                    ref,
                    {
                        lastError:
                            error instanceof Error
                                ? error.message
                                : "Sync failed",
                    },
                    { merge: true },
                );
                throw error;
            }
        },
    });
}

/** Unsubscribes and removes every task the feed created. */
export function useDeleteSubscription() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (subId: string) => {
            if (!user) throw new Error("Not authenticated");
            return deleteSubscription(user.uid, subId);
        },
    });
}
