"use client";
import { ContinuousCalendar } from "@/app/components/ui/Calendar/Calendar";
import { useTasks } from "@/app/hooks/tasks/useTasks";
import { useCategories } from "@/app/hooks/categories/useCategories";
import styles from "./page.module.css";
import Modal from "@/app/components/ui/Modal/Modal";

export default function CalendarPage() {
    const { data: tasks } = useTasks();
    const { data: categories } = useCategories();
    return (
        <div className={styles.container}>
            <ContinuousCalendar
                tasks={tasks ?? []}
                categories={categories ?? []}
                onClick={(day, month, year) => {
                    // відкрити DayDetailsModal
                }}
                onAddClick={(day, month, year) => {
                    // відкрити CreateTaskForm з передзаповненою датою
                }}
            />
        </div>
    );
}

