export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  isDone: boolean;
  categoryId?: string;
  /** Epoch ms of the task's start; null when the task has no time. */
  dueAt?: number | null;
  /** Epoch ms two hours before dueAt — the reminder sweep matches on this. */
  remindAt?: number | null;
  /** Epoch ms the reminder was sent. Null means "still owed". */
  reminderSentAt?: number | null;
}
