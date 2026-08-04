import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createTaskSchema } from "../schemas";
import { useCreateTask } from "@/app/hooks/tasks/useCreateTask";

interface CreateTaskFormData {
    title: string;
    description?: string;
    date: string;
    time?: string;

    categoryId?: string;
}
interface CreateTaskFormProps {
    onSuccess: () => void;
}

export const CreateTaskForm = ({ onSuccess }: CreateTaskFormProps) => {
    const { mutate: createTask } = useCreateTask();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateTaskFormData>({
        resolver: yupResolver(createTaskSchema),
    });
    const onSubmit = async (data: CreateTaskFormData) => {
        await createTask({
            ...data,
            isDone: false,
            createdAt: new Date().toISOString(),
        });
        reset();
        onSuccess();
    };
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("title")} placeholder="Title" />
                <textarea
                    {...register("description")}
                    placeholder="Description"
                />
                <input {...register("date")} type="date" />
                <input {...register("time")} type="time" />
                <select {...register("categoryId")}>
                    <option value="">Select Category</option>
                    <option value="1">Work</option>
                    <option value="2">Personal</option>
                </select>
                {errors.title && <p>{errors.title.message}</p>}
                {errors.description && <p>{errors.description.message}</p>}
                {errors.date && <p>{errors.date.message}</p>}
                {errors.time && <p>{errors.time.message}</p>}
                {errors.categoryId && <p>{errors.categoryId.message}</p>}
                <button type="submit" disabled={isSubmitting}>
                    Create Task
                </button>
            </form>
        </div>
    );
};
