export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;          
  time?: string;
  isDone: boolean;
  categoryId?: string;
}