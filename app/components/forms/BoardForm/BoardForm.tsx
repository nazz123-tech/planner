"use client";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { boardFormSchema } from "../schemas";
import styles from "./BoardForm.module.css";
import { CATEGORY_COLORS } from "@/app/shared/constants";
import {
    EmojiPreview,
    EmojiGrid,
} from "../../ui/pickers/EmojiPicker/EmojiPicker";
import { ColorPicker } from "../../ui/pickers/ColorPicker/ColorPicker";
import { useCreateCategory } from "@/app/hooks/categories/useCreateCategory";
import toast from "react-hot-toast";

interface BoardFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

interface BoardFormData {
    name: string;
    emoji: string;
    color?: string;
}

export const BoardForm = ({ onSuccess, onCancel }: BoardFormProps) => {
    const { mutate: createCategory } = useCreateCategory();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<BoardFormData>({
        resolver: yupResolver(boardFormSchema),
    });

    const onSubmit = async (data: BoardFormData) => {
        createCategory(data);
        reset();
        onSuccess();
        toast.success("New category created");
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>New board</h2>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="emoji"
                    control={control}
                    defaultValue="🎯"
                    render={({ field }) => <EmojiPreview value={field.value} />}
                />

                <div className={styles.field}>
                    <label className={styles.label}>NAME</label>
                    <input
                        className={styles.input}
                        {...register("name")}
                        placeholder="Board name..."
                    />
                    {errors.name && (
                        <p className={styles.error}>{errors.name.message}</p>
                    )}
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>EMOJI</label>
                    <Controller
                        name="emoji"
                        control={control}
                        defaultValue="🎯"
                        render={({ field }) => (
                            <EmojiGrid
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {errors.emoji && (
                        <p className={styles.error}>{errors.emoji.message}</p>
                    )}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>COLOR</label>
                    <Controller
                        name="color"
                        control={control}
                        defaultValue={CATEGORY_COLORS[0]}
                        render={({ field }) => (
                            <ColorPicker
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {errors && (
                        <p className={styles.error}>{errors.color?.message}</p>
                    )}
                </div>

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
                    <button className={styles.submitBtn} type="submit">
                        Create Board
                    </button>
                </div>
            </form>
        </div>
    );
};

