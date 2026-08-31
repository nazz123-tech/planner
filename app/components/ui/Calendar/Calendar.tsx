"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type PanInfo,
} from "framer-motion";
import styles from "./Calendar.module.css";
import type { Task } from "@/app/types/task";
import type { Note } from "@/app/types/note";
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
    notes?: Note[];
    onClick?: (day: number, month: number, year: number) => void;
    onAddClick?: (day: number, month: number, year: number) => void;
    onTaskMove?: (taskId: string, date: string) => void;
}

function toDateKey(day: number, month: number, year: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const ContinuousCalendar: React.FC<ContinuousCalendarProps> = ({
    tasks,
    categories,
    notes = [],
    onClick,
    onAddClick,
    onTaskMove,
}) => {
    const today = new Date();
    const reduceMotion = useReducedMotion();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
    // dir: -1 = moved to a previous year, 1 = next year, 0 = jump (month / today)
    const [{ year, dir: yearDir }, setYearState] = useState<{
        year: number;
        dir: number;
    }>(() => ({ year: new Date().getFullYear(), dir: 0 }));
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [dragTaskId, setDragTaskId] = useState<string | null>(null);
    const [dragOverKey, setDragOverKey] = useState<string | null>(null);

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

    const noteCountByDate = useMemo(() => {
        const map = new Map<string, number>();
        for (const note of notes) {
            if (!note.date) continue;
            map.set(note.date, (map.get(note.date) ?? 0) + 1);
        }
        return map;
    }, [notes]);

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

    const goToYear = (updater: (prevYear: number) => number, dir: number) => {
        setYearState((prev) => ({ year: updater(prev.year), dir }));
    };

    const handlePrevYear = () => goToYear((prevYear) => prevYear - 1, -1);
    const handleNextYear = () => goToYear((prevYear) => prevYear + 1, 1);

    const handleMonthChange = (value: string) => {
        const monthIndex = parseInt(value, 10);
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
            goToYear(
                () => today.getFullYear(),
                today.getFullYear() > year ? 1 : -1,
            );
        } else {
            scrollToDay(targetMonth, targetDay);
        }
    };

    const handleGridPanEnd = (_event: PointerEvent, info: PanInfo) => {
        const { offset } = info;
        const horizontalIntent =
            Math.abs(offset.x) > 90 &&
            Math.abs(offset.x) > Math.abs(offset.y) * 1.5;

        if (!horizontalIntent) return;

        if (offset.x < 0) handleNextYear();
        else handlePrevYear();
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

    const handleTaskDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        taskId: string,
    ) => {
        e.dataTransfer.setData("text/plain", taskId);
        e.dataTransfer.effectAllowed = "move";
        setDragTaskId(taskId);
    };

    const handleTaskDragEnd = () => {
        setDragTaskId(null);
        setDragOverKey(null);
    };

    const handleDayDragOver = (
        e: React.DragEvent<HTMLDivElement>,
        dateKey: string,
    ) => {
        if (!dragTaskId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverKey !== dateKey) setDragOverKey(dateKey);
    };

    const handleDayDrop = (
        e: React.DragEvent<HTMLDivElement>,
        dateKey: string,
    ) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain") || dragTaskId;
        setDragTaskId(null);
        setDragOverKey(null);
        if (taskId) onTaskMove?.(taskId, dateKey);
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
                    const noteCount = dateKey
                        ? (noteCountByDate.get(dateKey) ?? 0)
                        : 0;

                    const isDropTarget =
                        !!dragTaskId &&
                        !isOutsideMonth &&
                        dragOverKey === dateKey;

                    return (
                        <div
                            key={`${month}-${day}`}
                            ref={(el) => {
                                dayRefs.current[index] = el;
                            }}
                            data-month={month}
                            data-day={day}
                            onClick={() => handleDayClick(day, month, year)}
                            onDragOver={
                                onTaskMove && !isOutsideMonth && dateKey
                                    ? (e) => handleDayDragOver(e, dateKey)
                                    : undefined
                            }
                            onDrop={
                                onTaskMove && !isOutsideMonth && dateKey
                                    ? (e) => handleDayDrop(e, dateKey)
                                    : undefined
                            }
                            className={`${styles.dayCell} ${isDropTarget ? styles.dropTarget : ""}`}
                        >
                            <div className={styles.dayHeader}>
                                <span
                                    className={`${styles.dayNumber} ${isToday ? styles.today : ""} ${isOutsideMonth ? styles.outsideMonth : ""}`}
                                >
                                    {day}
                                </span>
                                <div className={styles.dayHeaderRight}>
                                    {noteCount > 0 && (
                                        <span
                                            className={styles.noteBadge}
                                            title={`${noteCount} note${noteCount > 1 ? "s" : ""}`}
                                            aria-label={`${noteCount} note${noteCount > 1 ? "s" : ""}`}
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                width="18"
                                                height="18"
                                                fill="none"
                                            >
                                                <path
                                                    d="M4 4h16v10l-6 6H4z"
                                                    fill="currentColor"
                                                    opacity="0.2"
                                                />
                                                <path
                                                    d="M4 4h16v10l-6 6H4z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M14 20v-6h6"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            {noteCount > 1 && (
                                                <span
                                                    className={
                                                        styles.noteBadgeCount
                                                    }
                                                >
                                                    {noteCount}
                                                </span>
                                            )}
                                        </span>
                                    )}
                                    {onAddClick && !isOutsideMonth && (
                                        <button
                                            type="button"
                                            className={styles.addButton}
                                            onClick={(e) =>
                                                handleAddClick(
                                                    e,
                                                    day,
                                                    month,
                                                    year,
                                                )
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

                                        const draggable =
                                            !!onTaskMove && !isOutsideMonth;

                                        return (
                                            <div
                                                key={task.id}
                                                draggable={draggable}
                                                onDragStart={
                                                    draggable
                                                        ? (e) =>
                                                              handleTaskDragStart(
                                                                  e,
                                                                  task.id,
                                                              )
                                                        : undefined
                                                }
                                                onDragEnd={
                                                    draggable
                                                        ? handleTaskDragEnd
                                                        : undefined
                                                }
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className={`${styles.eventPill} ${
                                                    dragTaskId === task.id
                                                        ? styles.dragging
                                                        : ""
                                                } ${draggable ? styles.draggablePill : ""}`}
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
    }, [
        year,
        tasksByDate,
        categoryColorById,
        onAddClick,
        onTaskMove,
        dragTaskId,
        dragOverKey,
        noteCountByDate,
    ]);

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
                            value={`${selectedMonth}`}
                            options={monthOptions}
                            onChange={handleMonthChange}
                        />
                        <button
                            onClick={handleTodayClick}
                            type="button"
                            className={styles.todayButton}
                        >
                            Today
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
            <div className={styles.gridWrap}>
                <AnimatePresence
                    mode="popLayout"
                    initial={false}
                    custom={yearDir}
                >
                    <motion.div
                        key={year}
                        className={styles.grid}
                        custom={yearDir}
                        variants={gridVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            duration: reduceMotion ? 0 : 0.28,
                            ease: "easeInOut",
                        }}
                        onPanEnd={handleGridPanEnd}
                    >
                        {generateCalendar}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const gridVariants = {
    enter: (dir: number) => ({
        opacity: 0,
        x: dir === 0 ? 0 : dir > 0 ? 48 : -48,
    }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({
        opacity: 0,
        x: dir === 0 ? 0 : dir > 0 ? -48 : 48,
    }),
};

interface SelectProps {
    value: string;
    options: { name: string; value: string }[];
    onChange: (value: string) => void;
}

const Select = ({ value, options, onChange }: SelectProps) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const selected = options.find((option) => option.value === value);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return (
        <div ref={wrapperRef} className={styles.selectWrapper}>
            <button
                type="button"
                className={styles.select}
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span>{selected?.name ?? ""}</span>
                <span
                    className={`${styles.selectChevron} ${open ? styles.selectChevronOpen : ""}`}
                />
            </button>

            {open && (
                <ul className={styles.selectMenu} role="listbox">
                    {options.map((option) => {
                        const isActive = option.value === value;
                        return (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    className={`${styles.selectOption} ${isActive ? styles.selectOptionActive : ""}`}
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    {option.name}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

