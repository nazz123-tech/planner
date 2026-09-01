"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trash, ListChecks, TextAlignStart } from "lucide-react";
import { useDeleteCategory } from "@/app/hooks/categories/useDeleteCategory";
import styles from "./BoardCard.module.css";
import toast from "react-hot-toast";
interface BoardCardProps {
    id: string;
    name: string;
    emoji: string;
    taskDoneCount: number;
    taskCount: number;
    noteCount: number;
    progress: number;
}
export const BoardCard = (board: BoardCardProps) => {
    const { mutateAsync: deleteCategory, isPending } = useDeleteCategory();

    const onDelete = async () => {
        const parts = [
            board.taskCount > 0 &&
                `${board.taskCount} task${board.taskCount === 1 ? "" : "s"}`,
            board.noteCount > 0 &&
                `${board.noteCount} note${board.noteCount === 1 ? "" : "s"}`,
        ].filter(Boolean);

        const message = parts.length
            ? `Delete “${board.name}” and its ${parts.join(" and ")}? This can’t be undone.`
            : `Delete “${board.name}”?`;

        if (!window.confirm(message)) return;

        try {
            const { tasksRemoved, notesRemoved } = await deleteCategory(
                board.id,
            );
            const removed = tasksRemoved + notesRemoved;
            toast.success(
                removed > 0
                    ? `Deleted “${board.name}” and ${removed} item${removed === 1 ? "" : "s"}`
                    : `Deleted “${board.name}”`,
            );
        } catch {
            toast.error("Couldn’t delete the board");
        }
    };
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.emojiWrapper}>
                    <span className={styles.emoji}>{board.emoji}</span>
                </div>
                <div className={styles.headerRight}>
                    {board.taskCount > 0 && (
                        <div className={styles.badge}>
                            <ListChecks size={12} />

                            {board.taskCount}
                        </div>
                    )}

                    {board.noteCount > 0 && (
                        <div className={styles.badge}>
                            <TextAlignStart size={12} />
                            {board.noteCount}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isPending}
                        aria-label={`Delete ${board.name}`}
                        className={styles.deleteBtn}
                    >
                        <Trash size={12} />
                    </button>
                </div>
            </div>

            <Link href={`/boards/${board.id}`} className={styles.info}>
                <h2 className={styles.cardName}>{board.name}</h2>
                <div className={styles.textBlock}>
                    <p className={styles.subtext}>
                        {board.taskDoneCount} of {board.taskCount} tasks
                    </p>
                    {board.noteCount > 0 && (
                        <p className={styles.subtext}>
                            ● {board.noteCount}{" "}
                            {board.noteCount > 1 ? "notes" : "note"}
                        </p>
                    )}
                </div>
            </Link>
            <div className={styles.progressTrack}>
                <motion.div
                    className={styles.progressFill}
                    initial={{ width: "0%" }}
                    animate={{
                        width: `${Math.max(
                            0,
                            Math.min(
                                100,
                                Math.round((board.progress ?? 0) * 100),
                            ),
                        )}%`,
                    }}
                    transition={{ type: "spring", stiffness: 180, damping: 24 }}
                />
            </div>
        </div>
    );
};

