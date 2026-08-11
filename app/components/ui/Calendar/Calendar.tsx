"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Calendar.module.css";
import type { Task } from "@/app/types/task";
import type { Category } from "@/app/types/category";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

interface ContinuousCalendarProps {
    tasks: Task[];
    categories: Category[];
    onClick?: (day: number, month: number, year: number) => void;
    onAddClick?: (day: number, month: number, year: number) => void;
}

function toDateKey(day: number, month: number, year: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const ContinuousCalendar: React.FC<ContinuousCalendarProps> = ({
    tasks,
    categories,
    onClick,
    onAddClick,
}) => {
    const today = new Date();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(0);

    const pendingScrollTargetRef = useRef<{
        month: number;
        day: number;
    } | null>(null);

    const monthOptions = monthNames.map((month, index) => ({
        name: month,
        value: `${index}`,
    }));

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        for (const task of tasks) {
            const existing = map.get(task.date) ?? [];
            map.set(task.date, [...existing, task]);
        }
        return map;
    }, [tasks]);

    const categoryColorById = useMemo(() => {
        const map = new Map<string, string>();
        for (const category of categories) {
            map.set(category.id, category.color ?? "#8a8a8a");
        }
        return map;
    }, [categories]);

    const scrollToDay = (monthIndex: number, dayIndex: number) => {
        const targetDayIndex = dayRefs.current.findIndex(
            (ref) =>
                ref &&
                ref.getAttribute("data-month") === `${monthIndex}` &&
                ref.getAttribute("data-day") === `${dayIndex}`,
        );

        const targetElement = dayRefs.current[targetDayIndex];

        if (targetDayIndex === -1 || !targetElement) return;

        const container = containerRef.current;
        const elementRect = targetElement.getBoundingClientRect();
        const is2xl = window.matchMedia("(min-width: 1536px)").matches;
        const offsetFactor = is2xl ? 3 : 2.5;

        if (container) {
            const containerRect = container.getBoundingClientRect();
            const offset =
                elementRect.top -
                containerRect.top -
                containerRect.height / offsetFactor +
                elementRect.height / 2;
            container.scrollTo({
                top: container.scrollTop + offset,
                behavior: "smooth",
            });
        } else {
            const offset =
                window.scrollY +
                elementRect.top -
                window.innerHeight / offsetFactor +
                elementRect.height / 2;
            window.scrollTo({ top: offset, behavior: "smooth" });
        }
    };

    const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
    const handleNextYear = () => setYear((prevYear) => prevYear + 1);

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const monthIndex = parseInt(event.target.value, 10);
        setSelectedMonth(monthIndex);

        pendingScrollTargetRef.current = { month: monthIndex, day: 1 };
    };

    const handleTodayClick = () => {
        const targetMonth = today.getMonth();
        const targetDay = today.getDate();

        if (year !== today.getFullYear()) {
            pendingScrollTargetRef.current = {
                month: targetMonth,
                day: targetDay,
            };
            setYear(today.getFullYear());
        } else {
            scrollToDay(targetMonth, targetDay);
        }
    };

    useEffect(() => {
        if (pendingScrollTargetRef.current) {
            const { month, day } = pendingScrollTargetRef.current;
            pendingScrollTargetRef.current = null;
            scrollToDay(month, day);
        }
    });

    const handleDayClick = (day: number, month: number, year: number) => {
        if (!onClick) return;
        if (month < 0) {
            onClick(day, 11, year - 1);
        } else {
            onClick(day, month, year);
        }
    };

    const handleAddClick = (
        e: React.MouseEvent,
        day: number,
        month: number,
        year: number,
    ) => {
        e.stopPropagation();
        onAddClick?.(day, month, year);
    };

    const generateCalendar = useMemo(() => {
        const today = new Date();

        const daysInYear = (): { month: number; day: number }[] => {
            const daysInYear = [];
            const startDayOfWeek = new Date(year, 0, 1).getDay();

            if (startDayOfWeek < 6) {
                for (let i = 0; i < startDayOfWeek; i++) {
                    daysInYear.push({
                        month: -1,
                        day: 32 - startDayOfWeek + i,
                    });
                }
            }

            for (let month = 0; month < 12; month++) {
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    daysInYear.push({ month, day });
                }
            }

            const lastWeekDayCount = daysInYear.length % 7;
            if (lastWeekDayCount > 0) {
                const extraDaysNeeded = 7 - lastWeekDayCount;
                for (let day = 1; day <= extraDaysNeeded; day++) {
                    daysInYear.push({ month: 0, day });
                }
            }

            return daysInYear;
        };

        const calendarDays = daysInYear();
        const calendarWeeks = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            calendarWeeks.push(calendarDays.slice(i, i + 7));
        }

        return calendarWeeks.map((week, weekIndex) => (
            <div className={styles.week} key={`week-${weekIndex}`}>
                {week.map(({ month, day }, dayIndex) => {
                    const index = weekIndex * 7 + dayIndex;
                    const isNewMonth =
                        index === 0 || calendarDays[index - 1].month !== month;
                    const isToday =
                        today.getMonth() === month &&
                        today.getDate() === day &&
                        today.getFullYear() === year;
                    const isOutsideMonth = month < 0;

                    const dateKey = !isOutsideMonth
                        ? toDateKey(day, month, year)
                        : null;
                    const dayTasks = dateKey
                        ? (tasksByDate.get(dateKey) ?? [])
                        : [];
                    const visibleTasks = dayTasks.slice(0, 3);
                    const hiddenCount = dayTasks.length - visibleTasks.length;

                    return (
                        <div
                            key={`${month}-${day}`}
                            ref={(el) => {
                                dayRefs.current[index] = el;
                            }}
                            data-month={month}
                            data-day={day}
                            onClick={() => handleDayClick(day, month, year)}
                            className={styles.dayCell}
                        >
                            <div className={styles.dayHeader}>
                                <span
                                    className={`${styles.dayNumber} ${isToday ? styles.today : ""} ${isOutsideMonth ? styles.outsideMonth : ""}`}
                                >
                                    {day}
                                </span>
                                {onAddClick && !isOutsideMonth && (
                                    <button
                                        type="button"
                                        className={styles.addButton}
                                        onClick={(e) =>
                                            handleAddClick(e, day, month, year)
                                        }
                                        aria-label="Додати задачу"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            width="16"
                                            height="16"
                                        >
                                            <path
                                                d="M12 5v14M5 12h14"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {isNewMonth && !isOutsideMonth && (
                                <span className={styles.monthLabel}>
                                    {monthNames[month]}
                                </span>
                            )}

                            {visibleTasks.length > 0 && (
                                <div className={styles.eventsList}>
                                    {visibleTasks.map((task) => {
                                        const color =
                                            task.categoryId &&
                                            categoryColorById.get(
                                                task.categoryId,
                                            );

                                        return (
                                            <div
                                                key={task.id}
                                                className={styles.eventPill}
                                                style={{
                                                    backgroundColor: `${color}`,
                                                }}
                                            >
                                                {task.title}
                                            </div>
                                        );
                                    })}
                                    {hiddenCount > 0 && (
                                        <span className={styles.moreLabel}>
                                            +{hiddenCount} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        ));
    }, [year, tasksByDate, categoryColorById, onAddClick]);

    useEffect(() => {
        const calendarContainer = containerRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const month = parseInt(
                            entry.target.getAttribute("data-month")!,
                            10,
                        );
                        setSelectedMonth(month);
                    }
                });
            },
            {
                root: calendarContainer,
                rootMargin: "-75% 0px -25% 0px",
                threshold: 0,
            },
        );

        dayRefs.current.forEach((ref) => {
            if (ref && ref.getAttribute("data-day") === "15") {
                observer.observe(ref);
            }
        });

        return () => observer.disconnect();
    }, [year]);

    return (
        <div ref={containerRef} className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <div className={styles.controls}>
                        <Select
                            name="month"
                            value={`${selectedMonth}`}
                            options={monthOptions}
                            onChange={handleMonthChange}
                        />
                        <button
                            onClick={handleTodayClick}
                            type="button"
                            className={styles.todayButton}
                        >
                            Сьогодні
                        </button>
                    </div>
                    <div className={styles.yearControls}>
                        <button
                            onClick={handlePrevYear}
                            className={styles.yearButton}
                            aria-label="Попередній рік"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                width="20"
                                height="20"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m15 19-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <h1 className={styles.yearLabel}>{year}</h1>
                        <button
                            onClick={handleNextYear}
                            className={styles.yearButton}
                            aria-label="Наступний рік"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                width="20"
                                height="20"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m9 5 7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className={styles.weekdaysRow}>
                    {daysOfWeek.map((day) => (
                        <div key={day} className={styles.weekdayLabel}>
                            {day}
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.grid}>{generateCalendar}</div>
        </div>
    );
};

interface SelectProps {
    name: string;
    value: string;
    options: { name: string; value: string }[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select = ({ name, value, options, onChange }: SelectProps) => (
    <div className={styles.selectWrapper}>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={styles.select}
            required
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.name}
                </option>
            ))}
        </select>
    </div>
);

