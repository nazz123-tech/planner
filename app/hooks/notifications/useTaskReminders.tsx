"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "../tasks/useTasks";
import { useReminderSetting } from "../settings/useReminderSetting";
import { useAuth } from "../useAuth";
import { useT } from "@/app/i18n/LanguageProvider";
import { notificationSupport, showNotification } from "@/app/lib/notifications";
import { computeReminderFields } from "@/app/shared/reminders";

/**
 * Polled rather than scheduled with one timer per task. setTimeout caps out
 * at ~24.8 days and browsers throttle timers in background tabs to roughly
 * once a minute, so a long timer is both capped and imprecise. A cheap sweep
 * every SWEEP_MS sidesteps both, and half a minute of slop on a reminder that
 * fires two hours ahead is immaterial.
 */
const SWEEP_MS = 30 * 1000;

/** Remembers what has already been announced, so a reload doesn't repeat it. */
const STORAGE_KEY = "planly.notifiedReminders";

type NotifiedMap = Record<string, number>;

function readNotified(): NotifiedMap {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as NotifiedMap) : {};
    } catch {
        return {};
    }
}

function writeNotified(map: NotifiedMap) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // Private browsing: we lose dedupe across reloads, not correctness
        // within a session.
    }
}

/**
 * Shows a desktop notification as each task enters its reminder window.
 *
 * Mounted once, in the private layout. Only fires while a Planly tab is
 * open — that is the trade for needing no server, no cron and no push
 * subscription.
 */
export function useTaskReminders() {
    const { user } = useAuth();
    const { data: tasks } = useTasks();
    const { enabled } = useReminderSetting();
    const router = useRouter();
    const t = useT();

    // Held in a ref so the sweep always sees current values without being
    // torn down and rebuilt on every render. Written in an effect rather than
    // during render — a render-phase mutation is unsafe under concurrent
    // rendering, where a render can be discarded or replayed.
    const stateRef = useRef({ tasks, enabled, t, router });
    useEffect(() => {
        stateRef.current = { tasks, enabled, t, router };
    });

    useEffect(() => {
        if (!user) return;

        const sweep = () => {
            const {
                tasks: currentTasks,
                enabled: remindersOn,
                t: translate,
                router: nav,
            } = stateRef.current;

            if (!remindersOn) return;
            if (notificationSupport() !== "granted") return;
            if (!currentTasks?.length) return;

            const now = Date.now();
            const notified = readNotified();
            const seen = new Set<string>();
            let changed = false;

            for (const task of currentTasks) {
                if (task.isDone) continue;

                // Computed here rather than read from task.remindAt: only the
                // browser knows the timezone, and tasks imported before that
                // field existed have never had it written.
                const { dueAt, remindAt } = computeReminderFields(
                    task.date,
                    task.time,
                );
                if (dueAt === null || remindAt === null) continue;

                seen.add(task.id);

                // Inside the lead window only. Announcing a task that has
                // already started isn't a reminder, it's noise — which is
                // what happens after the laptop has been shut for a while.
                if (now < remindAt || now >= dueAt) continue;

                // Re-announce if the task was moved to a new time.
                if (notified[task.id] === remindAt) continue;

                showNotification({
                    title: task.title,
                    body: translate("notify.startsAt", { time: task.time! }),
                    tag: `task-${task.id}`,
                    onClick: () => nav.push(`/calendar/${task.id}`),
                });

                notified[task.id] = remindAt;
                changed = true;
            }

            // Drop entries for tasks that are gone, so the map can't grow
            // without bound.
            for (const id of Object.keys(notified)) {
                if (!seen.has(id)) {
                    delete notified[id];
                    changed = true;
                }
            }

            if (changed) writeNotified(notified);
        };

        sweep();
        const interval = window.setInterval(sweep, SWEEP_MS);

        // A tab that was backgrounded for hours gets its timers throttled,
        // so catch up the moment it comes back to the foreground.
        const onVisible = () => {
            if (document.visibilityState === "visible") sweep();
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [user]);
}
