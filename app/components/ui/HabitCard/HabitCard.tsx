"use client";
import { motion } from "framer-motion";
import { Trash, Flame, Check } from "lucide-react";
import dayjs from "dayjs";
import { useDeleteHabit } from "@/app/hooks/habits/useDeleteHabit";
import { useToggleHabit } from "@/app/hooks/habits/useToggleHabit";
import { frequencyLabel } from "@/app/shared/habits";
import type { HabitWithStats } from "@/app/types/habit";
import styles from "./HabitCard.module.css";
import toast from "react-hot-toast";

interface HabitCardProps {
    habit: HabitWithStats;
}

export const HabitCard = ({ habit }: HabitCardProps) => {
    const { mutate: deleteHabit } = useDeleteHabit();
    const { mutate: toggleHabit } = useToggleHabit();

    const onDelete = async () => {
        await deleteHabit(habit.id);
        toast.success("Habit deleted");
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.emojiWrapper}>
                    <span className={styles.emoji}>{habit.emoji}</span>
                </div>
                <div className={styles.headerRight}>
                    {habit.currentStreak > 0 && (
                        <div className={styles.badge}>
                            <Flame size={12} />
                            {habit.currentStreak}
                        </div>
                    )}
                    <button
                        onClick={onDelete}
                        className={styles.deleteBtn}
                        aria-label="Delete habit"
                    >
                        <Trash size={12} />
                    </button>
                </div>
            </div>

            <div className={styles.info}>
                <h2 className={styles.cardName}>{habit.name}</h2>
                <p className={styles.subtext}>
                    {frequencyLabel(habit.frequency)}
                    {habit.currentStreak > 0
                        ? ` · ${habit.currentStreak} day streak`
                        : ""}
                </p>
            </div>

            <div className={styles.week}>
                {habit.last7Days.map((day) => (
                    <div
                        key={day.date}
                        className={`${styles.dayDot} ${day.done ? styles.dayDone : ""} ${!day.scheduled ? styles.dayOff : ""}`}
                        title={`${dayjs(day.date).format("ddd, D MMM")}${day.scheduled ? "" : " · not scheduled"}`}
                    >
                        <span className={styles.dayLetter}>
                            {dayjs(day.date).format("dd")[0]}
                        </span>
                    </div>
                ))}
            </div>

            <motion.button
                type="button"
                className={`${styles.toggleBtn} ${habit.completedToday ? styles.toggleDone : ""}`}
                onClick={() =>
                    toggleHabit({
                        habitId: habit.id,
                        done: habit.completedToday,
                    })
                }
                whileTap={{ scale: 0.96 }}
            >
                {habit.completedToday ? (
                    <>
                        <Check size={16} /> Completed today
                    </>
                ) : (
                    "Mark done today"
                )}
            </motion.button>
        </div>
    );
};
