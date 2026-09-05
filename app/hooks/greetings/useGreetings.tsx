"use client";

import { useMemo } from "react";
import { getGreeting, getSubtext, type TaskSummary } from "../../lib/greetings";
import dayjs from "dayjs";

export interface UseGreetingResult {
    greeting: string;
    subtext: string;
}

export function useGreeting(
    name: string,
    tasks: TaskSummary,
    refreshKey: string | number = "static",
): UseGreetingResult {
    // Depend on the counts, not the object identity — callers rebuild the
    // summary object every render, which would re-roll the greeting text.
    const { total, done } = tasks;

    return useMemo(() => {
        const hour = dayjs().hour();
        return {
            greeting: getGreeting(hour, name, String(refreshKey)),
            subtext: getSubtext({ total, done }),
        };
    }, [name, total, done, refreshKey]);
}

