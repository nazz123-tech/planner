"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import type { Task } from "@/app/types/task";
import {
    createFormSchema,
    type CreateFormData,
} from "@/app/components/forms/schemas";
import { useCategories } from "@/app/hooks/categories/useCategories";
import { useUpdateTask } from "@/app/hooks/tasks/useUpdateTask";
import { useDeleteTask } from "@/app/hooks/tasks/useDeleteTask";
import { useToggleTaskDone } from "@/app/hooks/tasks/useToggleDone";
import { CategoryPicker } from "@/app/components/ui/pickers/CategoryPicker/CategoryPicker";
import { getFormattedDate } from "@/app/shared/constants";
import styles from "./TaskDetails.module.css";

interface TaskDetailsProps {
    task: Task;
}

export const TaskDetails = ({ task }: TaskDetailsProps) => {
    const [editing, setEditing] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const router = useRouter();

    const { data: categories } = useCategories();
    const { mutateAsync: updateTask, isPending } = useUpdateTask();
    const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask();
    const { mutate: toggleDone } = useToggleTaskDone();

    const handleDelete = async () => {
        try {
            await deleteTask(task.id);
            toast.success("Task deleted");
            router.push("/calendar");
        } catch {
            toast.error("Could not delete task");
            setConfirmingDelete(false);
        }
    };

    const category = task.categoryId
        ? categories?.find((c) => c.id === task.categoryId)
        : undefined;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreateFormData>({
        resolver: yupResolver(createFormSchema),
        values: {
            title: task.title,
            description: task.description ?? "",
            categoryId: task.categoryId ?? "",
            date: task.date || getFormattedDate(),
            time: task.time ?? "",
        },
    });

    const onSubmit = async (data: CreateFormData) => {
        try {
            await updateTask({
                taskId: task.id,
                data: {
                    title: data.title,
                    description: data.description ?? "",
                    categoryId: data.categoryId ?? "",
                    date: data.date || getFormattedDate(),
                    time: data.time ?? "",
                },
            });
            toast.success("Task updated");
            setEditing(false);
        } catch {
            toast.error("Could not update task");
        }
    };

    if (editing) {
        return (
            <form className={styles.card} onSubmit={handleSubmit(onSubmit)}>
                <span className={styles.kicker}>Edit task</span>

                <div className={styles.field}>
                    <label className={styles.label}>TITLE</label>
                    <input
                        className={styles.input}
                        {...register("title")}
                        placeholder="Task title..."
                    />
                    {errors.title && (
                        <p className={styles.error}>{errors.title.message}</p>
                    )}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>CATEGORY</label>
                    <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                            <CategoryPicker
                                categories={categories ?? []}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>DESCRIPTION</label>
                    <textarea
                        className={styles.textarea}
                        {...register("description")}
                        placeholder="Description..."
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label}>DATE</label>
                        <input
                            className={styles.input}
                            {...register("date")}
                            type="date"
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>TIME</label>
                        <input
                            className={styles.input}
                            {...register("time")}
                            type="time"
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        type="submit"
                        className={styles.primaryBtn}
                        disabled={isPending}
                    >
                        {isPending ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className={styles.card}>
            <span className={styles.kicker}>Task details</span>
            <h1 className={styles.title}>{task.title}</h1>

            <div className={styles.badges}>
                {category && (
                    <span className={styles.badge}>
                        {category.emoji} {category.name}
                    </span>
                )}
                <span
                    className={`${styles.status} ${
                        task.isDone ? styles.statusDone : styles.statusTodo
                    }`}
                >
                    {task.isDone ? "Done" : "To do"}
                </span>
            </div>

            <dl className={styles.meta}>
                <div className={styles.metaItem}>
                    <dt className={styles.metaLabel}>Date</dt>
                    <dd className={styles.metaValue}>
                        {dayjs(task.date).format("dddd, D MMMM YYYY")}
                    </dd>
                </div>
                {task.time && (
                    <div className={styles.metaItem}>
                        <dt className={styles.metaLabel}>Time</dt>
                        <dd className={styles.metaValue}>{task.time}</dd>
                    </div>
                )}
            </dl>

            <div className={styles.description}>
                {task.description ? (
                    task.description
                ) : (
                    <span className={styles.muted}>No description.</span>
                )}
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={() =>
                        toggleDone({ taskId: task.id, isDone: task.isDone })
                    }
                >
                    {task.isDone ? "Mark as to do" : "Mark as done"}
                </button>
                <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => setEditing(true)}
                >
                    Edit task
                </button>
            </div>

            {confirmingDelete ? (
                <div className={styles.deleteConfirm}>
                    <span className={styles.deleteText}>
                        Delete this task permanently?
                    </span>
                    <div className={styles.deleteActions}>
                        <button
                            type="button"
                            className={styles.ghostBtn}
                            onClick={() => setConfirmingDelete(false)}
                            disabled={isDeleting}
                        >
                            Keep
                        </button>
                        <button
                            type="button"
                            className={styles.dangerBtn}
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete task"}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    className={styles.deleteLink}
                    onClick={() => setConfirmingDelete(true)}
                >
                    Delete task
                </button>
            )}
        </div>
    );
};
