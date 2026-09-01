"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "@/app/components/ui/Modal/Modal";
import { HabitCard } from "@/app/components/ui/HabitCard/HabitCard";
import { HabitForm } from "@/app/components/forms/HabitForm/HabitForm";
import { useHabits } from "@/app/hooks/habits/useHabits";
import styles from "./page.module.css";

export default function HabitsPageClient() {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { habits } = useHabits();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h3 className={styles.title}>Habits</h3>
                    <p className={styles.subtext}>
                        Build routines and keep your streaks alive
                    </p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className={styles.createHabitBtn}
                >
                    <Plus /> <span className={styles.btnText}>New habit</span>
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
