"use client";
import { BellRing, BellOff } from "lucide-react";
import toast from "react-hot-toast";
import { useReminderSetting } from "@/app/hooks/settings/useReminderSetting";
import styles from "./ReminderToggle.module.css";
import { useT } from "@/app/i18n/LanguageProvider";

export const ReminderToggle = () => {
    const { enabled, setEnabled, isSaving } = useReminderSetting();
    const t = useT();

    const toggle = () => {
        const next = !enabled;
        setEnabled(next, {
            onSuccess: () =>
                toast.success(
                    next ? t("nav.remindersOn") : t("nav.remindersOff"),
                ),
            onError: () => toast.error(t("nav.settingSaveFailed")),
        });
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={
                enabled ? t("nav.remindersOn") : t("nav.remindersOff")
            }
            title={
                enabled ? t("nav.remindersHint") : t("nav.remindersOff")
            }
            disabled={isSaving}
            onClick={toggle}
            className={`${styles.toggle} ${enabled ? styles.on : ""}`}
        >
            {enabled ? <BellRing size={20} /> : <BellOff size={20} />}
        </button>
    );
};
