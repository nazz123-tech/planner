"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash, ListChecks, TextAlignStart } from "lucide-react";
import { useDeleteCategory } from "@/app/hooks/categories/useDeleteCategory";
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog";
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
    const router = useRouter();
    const { mutateAsync: deleteCategory, isPending } = useDeleteCategory();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const href = `/boards/${board.id}`;

    const parts = [
        board.taskCount > 0 &&
            `${board.taskCount} task${board.taskCount === 1 ? "" : "s"}`,
        board.noteCount > 0 &&
            `${board.noteCount} note${board.noteCount === 1 ? "" : "s"}`,
    ].filter(Boolean);

    const confirmMessage = parts.length
        ? `This also deletes its ${parts.join(" and ")}. This can’t be undone.`
        : "This can’t be undone.";

    const onCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).closest("a, button")) return;
        router.push(href);
    };

    const onDelete = async () => {
        try {
            const { tasksRemoved, notesRemoved } = await deleteCategory(
                board.id,
            );
            const removed = tasksRemoved + notesRemoved;
            setConfirmOpen(false);
            toast.success(
                removed > 0
                    ? `Deleted “${board.name}” and ${removed} item${removed === 1 ? "" : "s"}`
                    : `Deleted “${board.name}”`,
            );
        } catch (error) {
            // Surface the cause — a swallowed failure here looks identical to
            // "nothing happened", which is what made this hard to diagnose.
            console.error("Failed to delete board", error);
            setConfirmOpen(false);
            toast.error("Couldn’t delete the board");
        }
    };
    return (
        <>
            <div className={styles.card} onClick={onCardClick}>
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
                            onClick={(event) => {
                                event.stopPropagation();
                                setConfirmOpen(true);
                            }}
                            disabled={isPending}
                            aria-label={`Delete ${board.name}`}
                            className={styles.deleteBtn}
                        >
                            <Trash size={12} />
                        </button>
                    </div>
                </div>

                <Link href={href} className={styles.info}>
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
                        transition={{
                            type: "spring",
                            stiffness: 180,
                            damping: 24,
                        }}
                    />
                </div>
            </div>

            {/* Sibling of the card, not a child: a portalled modal still bubbles
            its clicks up the React tree, which would trigger onCardClick. */}
            <ConfirmDialog
                open={confirmOpen}
                title={`Delete “${board.name}”?`}
                message={confirmMessage}
                busy={isPending}
                onConfirm={onDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
};
