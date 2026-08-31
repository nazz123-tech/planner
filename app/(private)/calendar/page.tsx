"use client";
import { useState } from "react";
import { ContinuousCalendar } from "@/app/components/ui/Calendar/Calendar";
import { useTasks } from "@/app/hooks/tasks/useTasks";
import { useNotes } from "@/app/hooks/notes/useNotes";
import { useCategories } from "@/app/hooks/categories/useCategories";
import { useUpdateTask } from "@/app/hooks/tasks/useUpdateTask";
import Modal from "@/app/components/ui/Modal/Modal";
import { CreateForm } from "@/app/components/forms/CreateForm/CreateForm";
import { DayDetails } from "@/app/components/ui/DayDetails/DayDetails";
import styles from "./page.module.css";

function toDateKey(day: number, month: number, year: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarPage() {
    const { data: tasks } = useTasks();
    const { data: notes } = useNotes();
    const { data: categories } = useCategories();
    const { mutate: updateTask } = useUpdateTask();

    const [detailsDate, setDetailsDate] = useState<string | null>(null);
    const [createModal, setCreateModal] = useState<{
        date: string;
        type: "task" | "note";
    } | null>(null);

    return (
        <div className={styles.container}>
            <ContinuousCalendar
                tasks={tasks ?? []}
                categories={categories ?? []}
                notes={notes ?? []}
                onClick={(day, month, year) =>
                    setDetailsDate(toDateKey(day, month, year))
                }
                onAddClick={(day, month, year) =>
                    setCreateModal({
                        date: toDateKey(day, month, year),
                        type: "task",
                    })
                }
                onTaskMove={(taskId, date) => {
                    const task = tasks?.find((item) => item.id === taskId);
                    if (!task || task.date === date) return;
                    updateTask({ taskId, data: { date } });
                }}
            />

            {detailsDate && (
                <Modal onClose={() => setDetailsDate(null)}>
                    <DayDetails
                        date={detailsDate}
                        tasks={tasks ?? []}
                        notes={notes ?? []}
                        categories={categories ?? []}
                        onAdd={() => {
                            setCreateModal({ date: detailsDate, type: "task" });
                            setDetailsDate(null);
                        }}
                        onAddNote={() => {
                            setCreateModal({ date: detailsDate, type: "note" });
                            setDetailsDate(null);
                        }}
                    />
                </Modal>
            )}

            {createModal && (
                <Modal onClose={() => setCreateModal(null)}>
                    <CreateForm
                        defaultDate={createModal.date}
                        defaultType={createModal.type}
                        lockDate
                        onSuccess={() => setCreateModal(null)}
                        onCancel={() => setCreateModal(null)}
                    />
                </Modal>
            )}
        </div>
    );
}
