import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import type { Task } from "../types/task";

export const createTask = async (
  userId: string,
  task: Omit<Task, "id">,
): Promise<void> => {
  await addDoc(collection(db, `users/${userId}/tasks`), task);
};

export const deleteTask = async (
  userId: string,
  taskId: string,
): Promise<void> => {
  await deleteDoc(doc(db, `users/${userId}/tasks/${taskId}`));
};
