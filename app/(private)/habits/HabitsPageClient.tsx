"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "@/app/components/ui/Modal/Modal";
import { HabitCard } from "@/app/components/ui/HabitCard/HabitCard";
import { HabitForm } from "@/app/components/forms/HabitForm/HabitForm";
import { useHabits } from "@/app/hooks/habits/useHabits";
import styles from "./page.module.css";
import { useT } from "@/app/i18n/LanguageProvider";

export default function HabitsPageClient() {
    const t = useT();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { habits } = useHabits();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h3 className={styles.title}>{t("habits.title")}</h3>
                    <p className={styles.subtext}>
                        {t("habits.subtitle")}
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className={styles.createHabitBtn}
                >
                    <Plus /> <span className={styles.btnText}>{t("habits.new")}</span>
                </button>
            </div>

            {habits.length > 0 ? (
                <div className={styles.grid}>
                    {habits.map((habit) => (
                        <HabitCard key={habit.id} habit={habit} />
                    ))}
                </div>
            ) : (
                <p className={styles.empty}>
                    No habits yet. Create one to start tracking.
                </p>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <HabitForm
                    onCancel={() => setModalOpen(false)}
                    onSuccess={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
