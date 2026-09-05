"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { habitFormSchema, type HabitFormData } from "../schemas";
import styles from "./HabitForm.module.css";
import {
    EmojiPreview,
    EmojiGrid,
} from "../../ui/pickers/EmojiPicker/EmojiPicker";
import { useCreateHabit } from "@/app/hooks/habits/useCreateHabit";
import { WEEKDAYS } from "@/app/shared/habits";
import type { HabitFrequency, WeekDay } from "@/app/types/habit";
import toast from "react-hot-toast";

interface HabitFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const HabitForm = ({ onSuccess, onCancel }: HabitFormProps) => {
    const { mutateAsync: createHabit } = useCreateHabit();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<HabitFormData>({
        resolver: yupResolver(habitFormSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            emoji: "🎯",
            frequencyType: "daily",
            days: [],
        },
    });

    // useWatch (not watch) so React Compiler can still memoize this component.
    const frequencyType = useWatch({ control, name: "frequencyType" });

    const onSubmit = async (data: HabitFormData) => {
        try {
            const frequency: HabitFrequency =
                data.frequencyType === "weekdays"
                    ? {
                          type: "weekdays",
                          days: [...data.days].sort(
                              (a, b) => a - b,
                          ) as WeekDay[],
                      }
                    : { type: "daily" };

            await createHabit({
                name: data.name.trim(),
                emoji: data.emoji,
                frequency,
            });
            reset();
            onSuccess();
            toast.success("New habit created");
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>New habit</h2>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="emoji"
                    control={control}
                    render={({ field }) => <EmojiPreview value={field.value} />}
                />

                <div className={styles.field}>
                    <label className={styles.label}>NAME</label>
                    <input
                        className={styles.input}
                        {...register("name")}
                        placeholder="Habit name..."
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
                    <label className={styles.label}>REPEAT</label>
                    <Controller
                        name="frequencyType"
                        control={control}
                        render={({ field }) => (
                            <div className={styles.switcher}>
                                {(
                                    [
                                        ["daily", "Every day"],
                                        ["weekdays", "Specific days"],
                                    ] as const
                                ).map(([value, text]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={`${styles.switchBtn} ${field.value === value ? styles.switchActive : ""}`}
                                        onClick={() => field.onChange(value)}
                                    >
                                        {field.value === value && (
                                            <motion.span
                                                layoutId="habitFreqPill"
                                                className={styles.switchPill}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 420,
                                                    damping: 34,
                                                }}
                                            />
                                        )}
                                        <span className={styles.switchLabel}>
                                            {text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    />
                </div>

                <AnimatePresence initial={false}>
                    {frequencyType === "weekdays" && (
                    <motion.div
                        className={styles.field}
                        key="days"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        <label className={styles.label}>DAYS</label>
                        <Controller
                            name="days"
                            control={control}
                            render={({ field }) => {
                                const selected = field.value ?? [];
                                return (
                                    <div className={styles.days}>
                                        {WEEKDAYS.map((day) => {
                                            const active = selected.includes(
                                                day.value,
                                            );
                                            return (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    aria-pressed={active}
                                                    aria-label={day.label}
                                                    className={`${styles.dayChip} ${active ? styles.dayChipActive : ""}`}
                                                    onClick={() =>
                                                        field.onChange(
                                                            active
                                                                ? selected.filter(
                                                                      (d) =>
                                                                          d !==
                                                                          day.value,
                                                                  )
                                                                : [
                                                                      ...selected,
                                                                      day.value,
                                                                  ],
                                                        )
                                                    }
                                                >
                                                    {day.short[0]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            }}
                        />
                        {errors.days && (
                            <p className={styles.error}>
                                {errors.days.message}
                            </p>
                        )}
                    </motion.div>
                    )}
                </AnimatePresence>

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
                        Create Habit
                    </button>
                </div>
            </form>
        </div>
    );
};
