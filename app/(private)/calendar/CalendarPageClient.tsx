"use client";
import { useState } from "react";
import { ContinuousCalendar } from "@/app/components/ui/Calendar/Calendar";
import { useTasks } from "@/app/hooks/tasks/useTasks";
import { useNotes } from "@/app/hooks/notes/useNotes";
import { useCategories } from "@/app/hooks/categories/useCategories";
import { useUpdateTask } from "@/app/hooks/tasks/useUpdateTask";
import Modal from "@/app/components/ui/Modal/Modal";
import { CreateForm } from "@/app/components/forms/CreateForm/CreateForm";
import { ImportCalendarForm } from "@/app/components/forms/ImportCalendarForm/ImportCalendarForm";
import { DayDetails } from "@/app/components/ui/DayDetails/DayDetails";
import styles from "./page.module.css";

function toDateKey(day: number, month: number, year: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarPageClient() {
    const { data: tasks } = useTasks();
    const { data: notes } = useNotes();
    const { data: categories } = useCategories();
    const { mutate: updateTask } = useUpdateTask();

    const [detailsDate, setDetailsDate] = useState<string | null>(null);
    const [createModal, setCreateModal] = useState<{
        date: string;
    } | null>(null);
    const [importOpen, setImportOpen] = useState(false);

    const [detailsView, setDetailsView] = useState<string | null>(null);
    if (detailsDate && detailsDate !== detailsView) setDetailsView(detailsDate);

    const [createView, setCreateView] = useState<typeof createModal>(null);
    if (createModal && createModal !== createView) setCreateView(createModal);

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <ContinuousCalendar
                    tasks={tasks ?? []}
                    categories={categories ?? []}
                    notes={notes ?? []}
                    onClick={(day, month, year) =>
                        setDetailsDate(toDateKey(day, month, year))
                    }
                    onAddClick={(day, month, year) =>
                        setCreateModal({ date: toDateKey(day, month, year) })
                    }
                    onTaskMove={(taskId, date) => {
                        const task = tasks?.find((item) => item.id === taskId);
                        if (!task || task.date === date) return;
                        updateTask({ taskId, data: { date } });
                    }}
                    onImportClick={() => setImportOpen(true)}
                />
            </div>

            <Modal open={!!detailsDate} onClose={() => setDetailsDate(null)}>
                {detailsView && (
                    <DayDetails
                        date={detailsView}
                        tasks={tasks ?? []}
                        notes={notes ?? []}
                        categories={categories ?? []}
                        onAdd={() => {
                            setCreateModal({ date: detailsView });
                            setDetailsDate(null);
                        }}
                    />
                )}
            </Modal>

            <Modal open={!!createModal} onClose={() => setCreateModal(null)}>
                {createView && (
                    <CreateForm
                        defaultDate={createView.date}
                        lockDate
                        onSuccess={() => setCreateModal(null)}
                        onCancel={() => setCreateModal(null)}
                    />
                )}
            </Modal>

            <Modal open={importOpen} onClose={() => setImportOpen(false)}>
                <ImportCalendarForm
                    onSuccess={() => setImportOpen(false)}
                    onCancel={() => setImportOpen(false)}
                />
            </Modal>
        </div>
    );
}

