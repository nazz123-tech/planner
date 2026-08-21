"use client";
import Hero from "@/app/components/ui/Hero/Hero";
import styles from "./page.module.css";
import { useTodayTasks } from "@/app/hooks/tasks/useTodayTasks";
import { useAuth } from "@/app/hooks/useAuth";
import { TodayTasks } from "@/app/components/ui/TodayTasks/TodayTasks";
import { useToggleTaskDone } from "@/app/hooks/tasks/useToggleDone";
import Modal from "@/app/components/ui/Modal/Modal";
import { useState } from "react";
import { CreateForm } from "@/app/components/forms/CreateForm/CreateForm";

export default function Dashboard() {
    const { tasks, totalTasks, done, isLoading } = useTodayTasks();

    const { user } = useAuth();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    return (
        <div className={styles.dashboard}>
            <Hero
                user={user}
                totalTasks={totalTasks}
                done={done}
                isLoading={isLoading}
            />
            <TodayTasks
                onCreate={() => {
                    setModalOpen(true);
                }}
                tasks={tasks}
                onDone={() => <></>}
            />
            {modalOpen && (
                <Modal onClose={() => setModalOpen(false)}>
                    <CreateForm onSuccess={() => setModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
}
