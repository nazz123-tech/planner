import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createTaskSchema } from "../schemas";
import { useCreateTask } from "@/app/hooks/useCreateTask";

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
};
