"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createFormSchema } from "../schemas";
import { useCreateTask } from "@/app/hooks/tasks/useCreateTask";
import { useCreateNote } from "@/app/hooks/notes/useCreateNote";
import styles from "./CreateForm.module.css";

type FormType = "task" | "note";

interface CreateFormData {
    title: string;
    description?: string;
    date?: string;
    time?: string;
    categoryId?: string;
}

interface CreateFormProps {
    onSuccess: () => void;
}

export const CreateForm = ({ onSuccess }: CreateFormProps) => {
    const [formType, setFormType] = useState<FormType>("task");

    const { mutateAsync: createTask } = useCreateTask();
    const { mutateAsync: createNote } = useCreateNote();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateFormData>({
        resolver: yupResolver(createFormSchema),
    });

    const handleTypeChange = (type: FormType) => {
        setFormType(type);
        reset();
    };

    const onSubmit = async (data: CreateFormData) => {
        try {
            if (formType === "task") {
                await createTask({
                    title: data.title,
                    description: data.description,
                    date: data.date!,
                    time: data.time,
                    categoryId: data.categoryId,
                    isDone: false,
                });
            } else {
                await createNote({
                    title: data.title,
                    description: data.description,
                    categoryId: data.categoryId,
                });
            }
            reset();
            onSuccess();
        } catch (error) {
            console.error("Failed to create:", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.switcher}>
                <button
                    className={`${styles.switchBtn} ${formType === "task" ? styles.active : ""}`}
                    type="button"
                    onClick={() => handleTypeChange("task")}
                >
                    Task
                </button>
                <button
                    className={`${styles.switchBtn} ${formType === "note" ? styles.active : ""}`}
                    type="button"
                    onClick={() => handleTypeChange("note")}
                >
                    Note
                </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.field}>
                    <label className={styles.label}>TITLE</label>
                    <input
                        className={styles.input}
                        {...register("title")}
                        placeholder={
                            formType === "task"
                                ? "Task title..."
                                : "Note title..."
                        }
                    />
                    {errors.title && (
                        <p className={styles.error}>{errors.title.message}</p>
                    )}
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>CATEGORY</label>
                    <select {...register("categoryId")}>
                        <option value="">Select Category</option>
                        <option value="1">Work</option>
                        <option value="2">Personal</option>
                    </select>
                    {errors.categoryId && (
                        <p className={styles.error}>
                            {errors.categoryId.message}
                        </p>
                    )}
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>DESCRIPTION</label>
                    <textarea
                        className={styles.text}
                        {...register("description")}
                        placeholder="Description..."
                    />
                    {errors.description && (
                        <p className={styles.error}>
                            {errors.description.message}
                        </p>
                    )}
                </div>

                {formType === "task" && (
                    <div className={styles.timeBlock}>
                        <div className={styles.field}>
                            <label className={styles.label}>DATE</label>
                            <input
                                className={styles.input}
                                {...register("date")}
                                type="date"
                            />
                            {errors.date && (
                                <p className={styles.error}>
                                    {errors.date.message}
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>TIME</label>
                            <input
                                className={styles.input}
                                {...register("time")}
                                type="time"
                            />
                            {errors.time && (
                                <p className={styles.error}>
                                    {errors.time.message}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <button
                    className={styles.subBtn}
                    type="submit"
                    disabled={isSubmitting}
                >
                    {formType === "task" ? "Create Task" : "Create Note"}
                </button>
            </form>
        </div>
    );
};
