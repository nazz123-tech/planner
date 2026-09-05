"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Task } from "@/app/types/task";
import styles from "./TodayTasks.module.css";
import { EmptyState } from "../EmptyState/EmptyState";
import { CheckToggle } from "../CheckToggle/CheckToggle";

import { useToggleTaskDone } from "@/app/hooks/tasks/useToggleDone";
interface TodayTasksProps {
    tasks: Task[];
    onCreate: () => void;
}
export const TodayTasks = ({ tasks, onCreate }: TodayTasksProps) => {
    const { mutate: toggleDone } = useToggleTaskDone();
    return (
        <div className={styles.tasks}>
            <div className={styles.card}>
                <ul className={styles.list}>
                    <span className={styles.sectionLabel}>
                        01 / Today tasks
                    </span>

                    {tasks.length === 0 && (
                        <li>
                            <EmptyState
                                icon="🗒️"
                                title="Nothing planned today"
                                hint="Add a task and it will show up right here."
                                actionLabel="New task"
                                onAction={onCreate}
                            />
                        </li>
                    )}

                    <AnimatePresence initial={false}>
                        {tasks.map((task) => (
                            <motion.li
                                className={styles.item}
                                key={task.id}
                                layout
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                            >
                                <div className={styles.field}>
                                    <CheckToggle
                                        checked={task.isDone}
                                        onChange={() =>
                                            toggleDone({
                                                taskId: task.id,
                                                isDone: task.isDone,
                                            })
                                        }
                                        label={task.title}
                                    />
                                    <motion.span
                                        className={`${styles.title} ${
                                            task.isDone ? styles.titleDone : ""
                                        }`}
                                        animate={{
                                            opacity: task.isDone ? 0.45 : 1,
                                        }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {task.title}
                                    </motion.span>
                                </div>

                                <p className={styles.time}>{task.time}</p>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </div>
        </div>
    );
};
