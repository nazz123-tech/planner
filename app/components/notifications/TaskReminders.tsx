"use client";

import { useTaskReminders } from "@/app/hooks/notifications/useTaskReminders";

/**
 * Renders nothing — it exists so the private layout, which is a server
 * component, can start the reminder sweep.
 */
export function TaskReminders() {
    useTaskReminders();
    return null;
}
