"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createFormSchema, type CreateFormData } from "../schemas";
import { useCreateTask } from "@/app/hooks/tasks/useCreateTask";
import { useCreateNote } from "@/app/hooks/notes/useCreateNote";
import styles from "./CreateForm.module.css";
import { useCategories } from "@/app/hooks/categories/useCategories";
import { CategoryPicker } from "../../ui/pickers/CategoryPicker/CategoryPicker";
import Modal from "../../ui/Modal/Modal";
import { BoardForm } from "../BoardForm/BoardForm";
import { getFormattedDate, getFormattedTime } from "@/app/shared/constants";
import toast from "react-hot-toast";

type FormType = "task" | "note";

interface CreateFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    defaultDate?: string;
    lockDate?: boolean;
    defaultType?: FormType;
}

export const CreateForm = ({
    onSuccess,
    onCancel,
    defaultDate,
    lockDate = false,
    defaultType = "task",
}: CreateFormProps) => {
    const [formType, setFormType] = useState<FormType>(defaultType);

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const { mutateAsync: createTask } = useCreateTask();
    const { mutateAsync: createNote } = useCreateNote();
    const { data: categories } = useCategories();

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm<CreateFormData>({
        resolver: yupResolver(createFormSchema),
        shouldUnregister: true,
        defaultValues: {
            title: "",
            description: "",
            categoryId: "",
            date: defaultDate ?? getFormattedDate(),
            time: "12:30",
        },
    });

    const handleTypeChange = (type: FormType) => {
        setFormType(type);
        reset(
            {
                title: "",
                description: "",
                categoryId: "",
                date: defaultDate ?? getFormattedDate(),
                time: getFormattedTime(),
            },
            { keepErrors: false },
        );
    };

    const onSubmit = async (data: CreateFormData) => {
        try {
            if (formType === "task") {
                await createTask({
                    title: data.title,
                    description: data.description,
                    date: data.date ?? defaultDate ?? getFormattedDate(),
                    time: data.time ?? undefined,
                    categoryId: data.categoryId || undefined,
                    isDone: false,
                });
                toast.success("Task created succesfully");
            } else {
                await createNote({
                    title: data.title,
                    description: data.description,
                    categoryId: data.categoryId || undefined,
                    date: defaultDate ?? getFormattedDate(),
                });
                toast.success("Note created succesfully");
            }
            reset();
            onSuccess();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>
                {formType === "task" ? "New Task" : "New Note"}
            </h2>
            {!lockDate && (
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
            )}

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
                    <Controller
                        defaultValue=""
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                            <>
                                <CategoryPicker
                                    categories={categories ?? []}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                                <button
                                    type="button"
                                    className={styles.newCategoryToggle}
                                    onClick={() => setCategoryModalOpen(true)}
                                >
                                    + Create category
                                </button>

                                <Modal
                                    open={categoryModalOpen}
                                    onClose={() =>
                                        setCategoryModalOpen(false)
                                    }
                                >
                                    <BoardForm
                                        onCreated={(id) =>
                                            field.onChange(id)
                                        }
                                        onSuccess={() =>
                                            setCategoryModalOpen(false)
                                        }
                                        onCancel={() =>
                                            setCategoryModalOpen(false)
                                        }
                                    />
                                </Modal>
                            </>
                        )}
                    />
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
                        style={{
                            height: formType === "note" ? "240px" : "",
                        }}
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
                                disabled={lockDate}
                            />
                            {lockDate && (
                                <span className={styles.hint}>
                                    Fixed to the selected day
                                </span>
                            )}
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

                <div className={styles.groupBtn}>
                    <button
                        className={styles.cancelBtn}
                        onClick={() => {
                            onCancel();
                            reset();
                        }}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.submitBtn}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {formType === "task" ? "Create Task" : "Create Note"}
                    </button>
                </div>
            </form>
        </div>
    );
};

