"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Check } from "lucide-react";
import { useCategories } from "@/app/hooks/categories/useCategories";
import { useBoardDetail } from "@/app/hooks/boards/useBoards";
import { useToggleTaskDone } from "@/app/hooks/tasks/useToggleDone";
import styles from "./page.module.css";

interface BoardDetailPageClientProps {
    boardId: string;
}

export default function BoardDetailPageClient({
    boardId,
}: BoardDetailPageClientProps) {
    const { data: categories } = useCategories();
    const { tasks, notes } = useBoardDetail(boardId);
    const { mutate: toggleDone } = useToggleTaskDone();

    const board = categories?.find((category) => category.id === boardId);

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
        return (a.date ?? "").localeCompare(b.date ?? "");
    });

    const sortedNotes = [...notes].sort((a, b) => {
        if ((a.date ?? "") !== (b.date ?? "")) {
            return (a.date ?? "").localeCompare(b.date ?? "");
        }
        return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
    });

    const doneCount = tasks.filter((task) => task.isDone).length;

    return (
        <div className={styles.container}>
            <Link className={styles.back} href="/boards">
                ← Back to boards
            </Link>

            {board ? (
                <div className={styles.card}>
                    <header className={styles.header}>
                        <div
                            className={styles.emojiWrapper}
                            style={{
                                backgroundColor:
                                    board.color ?? "var(--background)",
                            }}
                        >
                            <span className={styles.emoji}>{board.emoji}</span>
                        </div>
                        <div className={styles.headerText}>
                            <span className={styles.kicker}>Board</span>
                            <h1 className={styles.title}>{board.name}</h1>
                            <p className={styles.metaLine}>
                                {doneCount}/{tasks.length} tasks done ·{" "}
                                {notes.length} note
                                {notes.length === 1 ? "" : "s"}
                            </p>
                        </div>
                    </header>

                    <section className={styles.section}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Tasks</h2>
                            <span className={styles.count}>{tasks.length}</span>
                        </div>

                        {sortedTasks.length > 0 ? (
                            <ul className={styles.list}>
                                {sortedTasks.map((task) => (
                                    <li
                                        key={task.id}
                                        className={styles.taskRow}
                                        data-done={task.isDone}
                                    >
                                        <button
                                            type="button"
                                            className={`${styles.check} ${task.isDone ? styles.checkDone : ""}`}
                                            onClick={() =>
                                                toggleDone({
                                                    taskId: task.id,
                                                    isDone: task.isDone,
                                                })
                                            }
                                            aria-label={
                                                task.isDone
                                                    ? "Mark not done"
                                                    : "Mark done"
                                            }
                                        >
                                            {task.isDone && <Check size={14} />}
                                        </button>
                                        <Link
                                            href={`/calendar/${task.id}`}
                                            className={styles.taskBody}
                                        >
                                            <span className={styles.itemTitle}>
                                                {task.title}
                                            </span>
                                            <span className={styles.itemMeta}>
                                                {task.date
                                                    ? dayjs(task.date).format(
                                                          "D MMM",
                                                      )
                                                    : ""}
                                                {task.time
                                                    ? ` · ${task.time}`
                                                    : ""}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.empty}>
                                No tasks in this board.
                            </p>
                        )}
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Notes</h2>
                            <span className={styles.count}>{notes.length}</span>
                        </div>

                        {sortedNotes.length > 0 ? (
                            <ul className={styles.list}>
                                {sortedNotes.map((note) => (
                                    <li
                                        key={note.id}
                                        className={styles.noteRow}
                                    >
                                        <p className={styles.itemTitle}>
                                            {note.title}
                                        </p>
                                        {note.description && (
                                            <p className={styles.itemDesc}>
                                                {note.description}
                                            </p>
                                        )}
                                        {note.date && (
                                            <span className={styles.itemMeta}>
                                                {dayjs(note.date).format(
                                                    "D MMM YYYY",
                                                )}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.empty}>
                                No notes in this board.
                            </p>
                        )}
                    </section>
                </div>
            ) : (
                <p className={styles.fallback}>
                    {categories ? "Board not found." : "Loading board…"}
                </p>
            )}
        </div>
    );
}
