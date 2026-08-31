"use client";

import { use } from "react";
import Link from "next/link";
import { useTasks } from "@/app/hooks/tasks/useTasks";
import { TaskDetails } from "@/app/components/ui/TaskDetails/TaskDetails";
import styles from "./page.module.css";

interface TaskPageProps {
    params: Promise<{ taskId: string }>;
}

export default function TaskPage({ params }: TaskPageProps) {
    const { taskId } = use(params);
    const { data: tasks } = useTasks();

    const task = tasks?.find((item) => item.id === taskId);

    return (
        <div className={styles.container}>
            <Link className={styles.back} href="/calendar">
                ← Back to calendar
            </Link>

            {task ? (
                <TaskDetails task={task} />
            ) : (
                <p className={styles.fallback}>
                    {tasks ? "Task not found." : "Loading task…"}
                </p>
            )}
        </div>
    );
}
