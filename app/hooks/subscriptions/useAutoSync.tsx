"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../useAuth";
import { useSubscriptions } from "./useSubscriptions";
import { useSyncSubscription } from "./useSubscriptionActions";

/**
 * How stale a subscription may be before opening the app re-reads it. Short
 * enough that a timetable change shows up the same day, long enough that
 * moving between pages doesn't hammer the source.
 */
const STALE_MS = 30 * 60 * 1000;

/**
 * Re-reads subscriptions that have gone stale, once per session.
 *
 * The ref guard matters: every sync writes back to the subscription document,
 * which the snapshot listener turns into a new array, which would re-enter
 * this effect. Recording what has already run breaks that loop.
 */
export function useAutoSyncSubscriptions() {
    const { user } = useAuth();
    const { data: subscriptions } = useSubscriptions();
    const { mutateAsync: syncOne } = useSyncSubscription();
    const attempted = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!user || !subscriptions?.length) return;

        for (const sub of subscriptions) {
            if (attempted.current.has(sub.id)) continue;
            if (Date.now() - (sub.lastSyncedAt ?? 0) < STALE_MS) continue;

            attempted.current.add(sub.id);
            // Failures are already recorded on the document as lastError and
            // surfaced in the list, so nothing is swallowed silently here.
            void syncOne(sub).catch(() => {});
        }
    }, [user, subscriptions, syncOne]);
}
