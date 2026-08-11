"use client";
import Hero from "@/app/components/ui/Hero/Hero";
import styles from "./page.module.css";
import { useTodayTasks } from "@/app/hooks/tasks/useTodayTasks";
import { useAuth } from "@/app/hooks/useAuth";
import { TodayTasks } from "@/app/components/ui/TodayTasks/TodayTasks";
export default function Dashboard() {
    const { tasks, totalTasks, done, isLoading } = useTodayTasks();
    const { user } = useAuth();
    return (
        <div className={styles.dashboard}>
            <Hero
                user={user}
                totalTasks={totalTasks}
                done={done}
                isLoading={isLoading}
            />
            <TodayTasks tasks={tasks} onDone={() => <></>} />
        </div>
    );
}

