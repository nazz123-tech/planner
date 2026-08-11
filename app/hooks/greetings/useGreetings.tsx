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
    return useMemo(() => {
        const hour = dayjs().hour();
        return {
            greeting: getGreeting(hour, name),
            subtext: getSubtext(tasks),
        };
    }, [name, tasks.total, tasks.done, refreshKey]);
}

