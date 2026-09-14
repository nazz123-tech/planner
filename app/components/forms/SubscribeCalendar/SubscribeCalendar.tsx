"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Link2, RefreshCw, Trash2 } from "lucide-react";
import { useSubscriptions } from "@/app/hooks/subscriptions/useSubscriptions";
import {
    useAddSubscription,
    useDeleteSubscription,
    useSyncSubscription,
} from "@/app/hooks/subscriptions/useSubscriptionActions";
import { ConfirmDialog } from "../../ui/ConfirmDialog/ConfirmDialog";
import { useLanguage } from "@/app/i18n/LanguageProvider";
import type { CalendarSubscription } from "@/app/types/subscription";
import styles from "./SubscribeCalendar.module.css";

function relativeTime(
    intlLocale: string,
    timestamp?: number | null,
): string | null {
    if (!timestamp) return null;
    const diffMinutes = Math.round((timestamp - Date.now()) / 60000);
    const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" });
    const abs = Math.abs(diffMinutes);
    if (abs < 60) return rtf.format(diffMinutes, "minute");
    if (abs < 60 * 24) return rtf.format(Math.round(diffMinutes / 60), "hour");
    return rtf.format(Math.round(diffMinutes / (60 * 24)), "day");
}

export const SubscribeCalendar = () => {
    const { t, intlLocale } = useLanguage();
    const { data: subscriptions } = useSubscriptions();
    const { mutateAsync: addSubscription, isPending: adding } =
        useAddSubscription();
    const { mutateAsync: syncOne } = useSyncSubscription();
    const { mutateAsync: removeOne, isPending: removing } =
        useDeleteSubscription();

    const [url, setUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [pendingRemove, setPendingRemove] =
        useState<CalendarSubscription | null>(null);

    const submit = async () => {
        const trimmed = url.trim();
        if (!trimmed) return;
        setError(null);
        try {
            const result = await addSubscription({ url: trimmed });
            setUrl("");
            toast.success(
                t("subscribe.added", {
                    name: result.name,
                    count: result.total,
                }),
            );
        } catch (caught) {
            // Shown inline as well as in a toast: the message says which part
            // of the link is wrong, and a toast disappears before it's read.
            setError(
                caught instanceof Error
                    ? caught.message
                    : t("subscribe.failed"),
            );
        }
    };

    const refresh = async (sub: CalendarSubscription) => {
        setSyncingId(sub.id);
        try {
            const outcome = await syncOne(sub);
            toast.success(
                t("subscribe.synced", {
                    added: outcome.added,
                    updated: outcome.updated,
                    removed: outcome.removed,
                }),
            );
        } catch (caught) {
            toast.error(
                caught instanceof Error
                    ? caught.message
                    : t("subscribe.failed"),
            );
        } finally {
            setSyncingId(null);
        }
    };

    const confirmRemove = async () => {
        if (!pendingRemove) return;
        try {
            const { removed } = await removeOne(pendingRemove.id);
            toast.success(t("subscribe.removed", { count: removed }));
        } catch {
            toast.error(t("subscribe.failed"));
        } finally {
            setPendingRemove(null);
        }
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.heading}>{t("subscribe.heading")}</h2>
            <p className={styles.sub}>{t("subscribe.hint")}</p>

            <div className={styles.row}>
                <div className={styles.inputWrap}>
                    <Link2 className={styles.inputIcon} size={16} />
                    <input
                        className={styles.input}
                        type="url"
                        inputMode="url"
                        value={url}
                        placeholder={t("subscribe.placeholder")}
                        aria-label={t("subscribe.heading")}
                        onChange={(event) => {
                            setUrl(event.target.value);
                            if (error) setError(null);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                void submit();
                            }
                        }}
                    />
                </div>
                <button
                    type="button"
                    className={styles.submit}
                    onClick={submit}
                    disabled={adding || !url.trim()}
                >
                    {adding ? t("subscribe.adding") : t("subscribe.submit")}
                </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            {!!subscriptions?.length && (
                <ul className={styles.list}>
                    {subscriptions.map((sub) => {
                        const synced = relativeTime(
                            intlLocale,
                            sub.lastSyncedAt,
                        );
                        return (
                            <li key={sub.id} className={styles.item}>
                                <div className={styles.itemText}>
                                    <p className={styles.itemName}>
                                        {sub.name}
                                    </p>
                                    <p className={styles.itemMeta}>
                                        {sub.lastError
                                            ? sub.lastError
                                            : t("subscribe.meta", {
                                                  count: sub.eventCount ?? 0,
                                                  when:
                                                      synced ??
                                                      t("subscribe.never"),
                                              })}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={styles.iconBtn}
                                    onClick={() => refresh(sub)}
                                    disabled={syncingId === sub.id}
                                    aria-label={t("subscribe.refresh")}
                                    title={t("subscribe.refresh")}
                                >
                                    <RefreshCw
                                        size={16}
                                        className={
                                            syncingId === sub.id
                                                ? styles.spinning
                                                : undefined
                                        }
                                    />
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.iconBtn} ${styles.danger}`}
                                    onClick={() => setPendingRemove(sub)}
                                    aria-label={t("subscribe.remove")}
                                    title={t("subscribe.remove")}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            <ConfirmDialog
                open={!!pendingRemove}
                title={t("subscribe.removeTitle")}
                message={t("subscribe.removeMessage", {
                    name: pendingRemove?.name ?? "",
                })}
                confirmLabel={t("common.delete")}
                cancelLabel={t("common.cancel")}
                busy={removing}
                onConfirm={confirmRemove}
                onCancel={() => setPendingRemove(null)}
            />
        </section>
    );
};

export default SubscribeCalendar;
