"use client";

import { useMemo } from "react";
import { useCategories } from "../categories/useCategories";
import { useNotes } from "../notes/useNotes";
import { useTasks } from "../tasks/useTasks";
import type { Note } from "@/app/types/note";
import type { Task } from "@/app/types/task";

export interface BoardSummary {
    id: string;
    name: string;
    emoji: string;
    taskCount: number;
    taskDoneCount: number;
    noteCount: number;
    progress: number;
}

function useTasksByCategory(tasks: Task[]) {
    return useMemo(() => {
        const map = new Map<string, Task[]>();
        for (const task of tasks) {
            if (!task.categoryId) continue;
            const existing = map.get(task.categoryId) ?? [];
            map.set(task.categoryId, [...existing, task]);
        }
        return map;
    }, [tasks]);
}

function useNotesByCategory(notes: Note[]) {
    return useMemo(() => {
        const map = new Map<string, Note[]>();
        for (const note of notes) {
            if (!note.categoryId) continue;
            const existing = map.get(note.categoryId) ?? [];
            map.set(note.categoryId, [...existing, note]);
        }
        return map;
    }, [notes]);
}

export function useBoards(): { boards: BoardSummary[]; isLoading: boolean } {
    const { data: categories = [], isLoading: catLoading } = useCategories();
    const { data: tasks = [], isLoading: taskLoading } = useTasks();
    const { data: notes = [], isLoading: noteLoading } = useNotes();

    const tasksByCategory = useTasksByCategory(tasks);
    const notesByCategory = useNotesByCategory(notes);

    const boards = useMemo(() => {
        return categories.map((category): BoardSummary => {
            const categoryTasks = tasksByCategory.get(category.id) ?? [];
            const categoryNotes = notesByCategory.get(category.id) ?? [];
            const doneCount = categoryTasks.filter((t) => t.isDone).length;

            return {
                id: category.id,
                name: category.name,
                emoji: category.emoji,
                taskCount: categoryTasks.length,
                taskDoneCount: doneCount,
                noteCount: categoryNotes.length,
                progress:
                    categoryTasks.length > 0
                        ? doneCount / categoryTasks.length
                        : 0,
            };
        });
    }, [categories, tasksByCategory, notesByCategory]);

    return {
        boards,
        isLoading: catLoading || taskLoading || noteLoading,
    };
}

export function useBoardDetail(categoryId: string) {
    const { data: tasks = [] } = useTasks();
    const { data: notes = [] } = useNotes();

    const tasksByCategory = useTasksByCategory(tasks);
    const notesByCategory = useNotesByCategory(notes);

    return useMemo(
        () => ({
            tasks: tasksByCategory.get(categoryId) ?? [],
            notes: notesByCategory.get(categoryId) ?? [],
        }),
        [tasksByCategory, notesByCategory, categoryId],
    );
}

