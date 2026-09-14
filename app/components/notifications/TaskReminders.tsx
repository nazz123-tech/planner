"use client";

import { useTaskReminders } from "@/app/hooks/notifications/useTaskReminders";
import { useAutoSyncSubscriptions } from "@/app/hooks/subscriptions/useAutoSync";

/**
 * Renders nothing — it exists so the private layout, which is a server
 * component, can start the reminder sweep.
 */
export function TaskReminders() {
    useTaskReminders();
    useAutoSyncSubscriptions();
    return null;
}
