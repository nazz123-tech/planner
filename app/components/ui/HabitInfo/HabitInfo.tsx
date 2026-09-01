"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Flame } from "lucide-react";
import dayjs from "dayjs";
import { useHabits } from "@/app/hooks/habits/useHabits";
import { useToggleHabit } from "@/app/hooks/habits/useToggleHabit";
import { frequencyLabel, isScheduledOn } from "@/app/shared/habits";
import styles from "./HabitInfo.module.css";
import { EmptyState } from "../EmptyState/EmptyState";
import { CheckToggle } from "../CheckToggle/CheckToggle";

export const HabitInfo = () => {
    const { habits } = useHabits();
    const { mutate: toggleHabit } = useToggleHabit();

    const todayWeekday = dayjs().day();
    const todayHabits = habits.filter((habit) =>
        isScheduledOn(habit.frequency, todayWeekday),
    );

    return (
        <div className={styles.habits}>
            <div className={styles.card}>
                <ul className={styles.list}>
                    <span className={styles.sectionLabel}>03 / Habits</span>

                    {todayHabits.length === 0 && (
                        <li>
                            <EmptyState
                                icon="🌿"
                                title={
                                    habits.length === 0
                                        ? "No habits yet"
                                        : "Nothing due today"
                                }
                                hint={
                                    habits.length === 0
                                        ? "Create a habit to start a streak."
                                        : "None of your habits are scheduled for today."
                                }
                            />
                        </li>
                    )}

                    <AnimatePresence initial={false}>
                        {todayHabits.map((habit) => (
                            <motion.li
                                className={styles.item}
                                key={habit.id}
                                layout
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                            >
                                <div className={styles.emojiBg}>
                                    <span className={styles.emoji}>
                                        {habit.emoji}
                                    </span>
                                </div>

                                <div className={styles.itemInfo}>
                                    <p className={styles.label}>{habit.name}</p>
                                    <span className={styles.streak}>
                                        <Flame size={12} />
                                        {habit.currentStreak} day
                                        {habit.currentStreak === 1
                                            ? ""
                                            : "s"}{" "}
                                        · {frequencyLabel(habit.frequency)}
                                    </span>
                                </div>

                                <CheckToggle
                                    checked={habit.completedToday}
                                    onChange={() =>
                                        toggleHabit({
                                            habitId: habit.id,
                                            done: habit.completedToday,
                                        })
                                    }
                                    label={
                                        habit.completedToday
                                            ? "Mark not done"
                                            : "Mark done today"
                                    }
                                />
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </div>
        </div>
    );
};
