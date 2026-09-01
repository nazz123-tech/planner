import Link from "next/link";
import dayjs from "dayjs";
import type { Task } from "@/app/types/task";
import type { Note } from "@/app/types/note";
import type { Category } from "@/app/types/category";
import styles from "./DayDetails.module.css";

interface DayDetailsProps {
    date: string;
    tasks: Task[];
    notes: Note[];
    categories: Category[];
    onAdd: () => void;
}

export const DayDetails = ({
    date,
    tasks,
    notes,
    categories,
    onAdd,
}: DayDetailsProps) => {
    const categoryById = new Map(categories.map((c) => [c.id, c]));

    const dayTasks = tasks
        .filter((task) => task.date === date)
        .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

    const dayTaskCategoryIds = new Set(
        dayTasks
            .map((task) => task.categoryId)
            .filter((id): id is string => Boolean(id)),
    );

    const dayNotes = notes
        .filter(
            (note) =>
                note.date === date ||
                (!!note.categoryId &&
                    dayTaskCategoryIds.has(note.categoryId)),
        )
        .sort((a, b) => {
            if (a.date !== b.date) return (a.date ?? "").localeCompare(b.date ?? "");
            return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
        });

    const formattedDate = dayjs(date).format("dddd, D MMMM YYYY");

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <span className={styles.kicker}>Day overview</span>
                <h2 className={styles.title}>{formattedDate}</h2>
            </header>

            <section className={styles.section}>
                <div className={styles.sectionHead}>
                    <h3 className={styles.sectionTitle}>Tasks</h3>
                    <span className={styles.count}>{dayTasks.length}</span>
                </div>

                {dayTasks.length > 0 ? (
                    <ul className={styles.list}>
                        {dayTasks.map((task) => {
                            const category = task.categoryId
                                ? categoryById.get(task.categoryId)
                                : undefined;

                            return (
                                <li key={task.id}>
                                    <Link
                                        href={`/calendar/${task.id}`}
                                        className={styles.task}
                                        data-done={task.isDone}
                                    >
                                        <span
                                            className={styles.dot}
                                            style={{
                                                backgroundColor:
                                                    category?.color ??
                                                    "var(--accent)",
                                            }}
                                        />
                                        <div className={styles.body}>
                                            <p className={styles.itemTitle}>
                                                {task.title}
                                            </p>
                                            {task.description && (
                                                <p className={styles.itemDesc}>
                                                    {task.description}
                                                </p>
                                            )}
                                            <div className={styles.meta}>
                                                {category && (
                                                    <span className={styles.tag}>
                                                        {category.emoji}{" "}
                                                        {category.name}
                                                    </span>
                                                )}
                                                {task.isDone && (
                                                    <span className={styles.done}>
                                                        Done
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {task.time && (
                                            <span className={styles.time}>
                                                {task.time}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className={styles.empty}>No tasks for this day.</p>
                )}
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHead}>
                    <h3 className={styles.sectionTitle}>Notes</h3>
                    <span className={styles.count}>{dayNotes.length}</span>
                </div>

                {dayNotes.length > 0 ? (
                    <ul className={styles.list}>
                        {dayNotes.map((note) => {
                            const category = note.categoryId
                                ? categoryById.get(note.categoryId)
                                : undefined;

                            return (
                                <li key={note.id} className={styles.note}>
                                    <p className={styles.itemTitle}>
                                        {note.title}
                                    </p>
                                    {note.description && (
                                        <p className={styles.itemDesc}>
                                            {note.description}
                                        </p>
                                    )}
                                    {category && (
                                        <span
                                            className={`${styles.tag} ${styles.tagNote}`}
                                        >
                                            {category.emoji} {category.name}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className={styles.empty}>No notes for this day.</p>
                )}
            </section>

            <div className={styles.addRow}>
                <button
                    type="button"
                    className={styles.addBtn}
                    onClick={onAdd}
                >
                    + Add task
                </button>
            </div>
        </div>
    );
};
