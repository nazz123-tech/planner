import { useMemo } from "react";
import { useTasks } from "./useTasks";
import dayjs from "dayjs";

function getTodayISO(): string {
    return dayjs().format("YYYY-MM-DD");
}

export function useTodayTasks() {
    const { data: tasks, isLoading } = useTasks();
    const today = getTodayISO();
    const todayTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter((task) => task.date === today);
    }, [tasks]);
    const tasksIsDone = useMemo(() => {
        return tasks?.filter((task) => task.isDone === true);
    }, [tasks]);
    const done = tasksIsDone?.length;
    const totalTasks = todayTasks.length;

    return { tasks: todayTasks, done, totalTasks, isLoading };
}

