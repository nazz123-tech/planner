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
    }, [tasks, today]);

    const done = useMemo(() => {
        return todayTasks.filter((task) => task.isDone).length;
    }, [todayTasks]);

    const totalTasks = todayTasks.length;

    return { tasks: todayTasks, done, totalTasks, isLoading };
}
