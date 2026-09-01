"use client";
import { motion } from "framer-motion";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
    icon: string;
    title: string;
    hint: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState = ({
    icon,
    title,
    hint,
    actionLabel,
    onAction,
}: EmptyStateProps) => {
    return (
        <motion.div
            className={styles.empty}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
        >
            <span className={styles.icon}>{icon}</span>
            <p className={styles.title}>{title}</p>
            <p className={styles.hint}>{hint}</p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    className={styles.action}
                    onClick={onAction}
                >
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
};
