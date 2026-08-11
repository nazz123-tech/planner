"use client";
import { useTodayTasks } from "@/app/hooks/tasks/useTodayTasks";
interface TasksProgressProps {
    totalTasks: number;
    done: number;
    isLoading: boolean;
}
export const TasksProgress = ({
    totalTasks,
    done,
    isLoading,
}: TasksProgressProps) => {
    return (
        <div>
            <p>
                {done}/{totalTasks}
            </p>
        </div>
    );
};

