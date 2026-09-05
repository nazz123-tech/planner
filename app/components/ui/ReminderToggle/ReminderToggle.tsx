"use client";
import { BellRing, BellOff } from "lucide-react";
import toast from "react-hot-toast";
import { useReminderSetting } from "@/app/hooks/settings/useReminderSetting";
import styles from "./ReminderToggle.module.css";

export const ReminderToggle = () => {
    const { enabled, setEnabled, isSaving } = useReminderSetting();

    const toggle = () => {
        const next = !enabled;
        setEnabled(next, {
            onSuccess: () =>
                toast.success(
                    next ? "Task reminders on" : "Task reminders off",
                ),
            onError: () => toast.error("Couldn’t save that setting"),
        });
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={
                enabled ? "Turn task reminders off" : "Turn task reminders on"
            }
            title={
                enabled
                    ? "Task reminders on — emailed 2 hours before a task"
                    : "Task reminders off"
            }
            disabled={isSaving}
            onClick={toggle}
            className={`${styles.toggle} ${enabled ? styles.on : ""}`}
        >
            {enabled ? <BellRing size={20} /> : <BellOff size={20} />}
        </button>
    );
};
