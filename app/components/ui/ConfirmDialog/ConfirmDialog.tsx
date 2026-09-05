"use client";
import Modal from "../Modal/Modal";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * In-app replacement for window.confirm, which browsers throttle and can
 * suppress entirely — once suppressed it just returns false, so destructive
 * actions silently did nothing.
 */
export const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    busy = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => (
    <Modal open={open} onClose={onCancel}>
        <div className={styles.dialog}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.message}>{message}</p>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={onCancel}
                    disabled={busy}
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={onConfirm}
                    disabled={busy}
                >
                    {busy ? "Deleting…" : confirmLabel}
                </button>
            </div>
        </div>
    </Modal>
);
