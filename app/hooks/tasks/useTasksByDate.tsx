import { useTasks } from "./useTasks";

export function useTasksByDate(date: string) {
  const { data: tasks, isLoading } = useTasks();
  const tasksByDate = tasks?.filter((task) => task.date === date);
  return { data: tasksByDate, isLoading };
}
