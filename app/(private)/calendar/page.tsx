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

    // Keep the last opened values around so modal content stays rendered
    // while the modal plays its exit animation after being closed.
    const [detailsView, setDetailsView] = useState<string | null>(null);
    if (detailsDate && detailsDate !== detailsView) setDetailsView(detailsDate);

    const [createView, setCreateView] = useState<typeof createModal>(null);
    if (createModal && createModal !== createView) setCreateView(createModal);

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

            <Modal
                open={!!detailsDate}
                onClose={() => setDetailsDate(null)}
            >
                {detailsView && (
                    <DayDetails
                        date={detailsView}
                        tasks={tasks ?? []}
                        notes={notes ?? []}
                        categories={categories ?? []}
                        onAdd={() => {
                            setCreateModal({ date: detailsView, type: "task" });
                            setDetailsDate(null);
                        }}
                        onAddNote={() => {
                            setCreateModal({ date: detailsView, type: "note" });
                            setDetailsDate(null);
                        }}
                    />
                )}
            </Modal>

            <Modal open={!!createModal} onClose={() => setCreateModal(null)}>
                {createView && (
                    <CreateForm
                        defaultDate={createView.date}
                        defaultType={createView.type}
                        lockDate
                        onSuccess={() => setCreateModal(null)}
                        onCancel={() => setCreateModal(null)}
                    />
                )}
            </Modal>
        </div>
    );
}
