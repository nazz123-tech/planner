import { useMemo } from "react";
import { useTasks } from "./useTasks";

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function useTodayTasks() {
  const { data: tasks, isLoading } = useTasks();

  const todayTasks = useMemo(() => {
    if (!tasks) return [];
    const today = getTodayISO();
    return tasks.filter((task) => task.date === today);
  }, [tasks]);

  return { tasks: todayTasks, isLoading };
}
