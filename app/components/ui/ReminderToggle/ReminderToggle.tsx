"use client";
import { BellRing, BellOff } from "lucide-react";
import toast from "react-hot-toast";
import { useReminderSetting } from "@/app/hooks/settings/useReminderSetting";
import styles from "./ReminderToggle.module.css";
import { useT } from "@/app/i18n/LanguageProvider";
import {
    notificationSupport,
    requestNotificationPermission,
} from "@/app/lib/notifications";

export const ReminderToggle = () => {
    const { enabled, setEnabled, isSaving } = useReminderSetting();
    const t = useT();

    const toggle = async () => {
        const next = !enabled;

        // Asked here rather than on page load: Safari ignores a permission
        // prompt that isn't tied to a user gesture, and an unprompted one is
        // rude anyway. Turning reminders off needs no permission.
        if (next) {
            const permission = await requestNotificationPermission();
            if (permission === "unsupported") {
                toast.error(t("notify.unsupported"));
                return;
            }
            if (permission === "denied") {
                // The browser won't prompt twice; only the user can undo this.
                toast.error(t("notify.blocked"));
                return;
            }
        }

        setEnabled(next, {
            onSuccess: () =>
                toast.success(
                    next ? t("nav.remindersOn") : t("nav.remindersOff"),
                ),
            onError: () => toast.error(t("nav.settingSaveFailed")),
        });
    };

    // On is only truthful when the browser will actually let a banner through.
    const active = enabled && notificationSupport() === "granted";

    return (
        <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={active ? t("nav.remindersOn") : t("nav.remindersOff")}
            title={active ? t("nav.remindersHint") : t("nav.remindersOff")}
            disabled={isSaving}
            onClick={toggle}
            className={`${styles.toggle} ${active ? styles.on : ""}`}
        >
            {active ? <BellRing size={20} /> : <BellOff size={20} />}
        </button>
    );
};
