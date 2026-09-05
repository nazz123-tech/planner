"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type PanInfo,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { TextAlignStart } from "lucide-react";
import { readableTextColor } from "@/app/lib/color";
import { useDragTask } from "@/app/components/context/DragTaskContext";
import styles from "./Calendar.module.css";
import type { Task } from "@/app/types/task";
import type { Note } from "@/app/types/note";
import type { Category } from "@/app/types/category";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Column index for a JS weekday (0=Sun..6=Sat) in a Monday-first grid. */
function mondayFirstIndex(jsWeekday: number): number {
    return (jsWeekday + 6) % 7;
}
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
    onImportClick?: () => void;
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
    onImportClick,
}) => {
    const today = new Date();
    const router = useRouter();
    const reduceMotion = useReducedMotion();
    const { setDraggingTaskId } = useDragTask();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [{ year, dir: yearDir }, setYearState] = useState<{
        year: number;
        dir: number;
    }>(() => ({ year: new Date().getFullYear(), dir: 0 }));
    const [selectedMonth, setSelectedMonth] = useState<number>(() =>
        new Date().getMonth(),
    );
    const [dragTaskId, setDragTaskId] = useState<string | null>(null);
    // Only on a phone (<=800px) does the container stop being a scroll box and
    // the document scroll instead, so scrolling and the month observer have to
    // target the viewport there. Tablet keeps an inner scroll box like desktop
    // so the nav stays visible, hence this is no longer the <=1280px signal.
    const [pageScrolls, setPageScrolls] = useState(false);
    // Separate signal: tablet and phone both drop drag-and-drop.
    const [touchTier, setTouchTier] = useState(false);
    const [dragOverKey, setDragOverKey] = useState<string | null>(null);

    const pendingScrollTargetRef = useRef<{
        month: number;
        day: number;
    } | null>(null);

    useEffect(() => {
        const scrollMq = window.matchMedia("(max-width: 800px)");
        const touchMq = window.matchMedia("(max-width: 1280px)");
        const sync = () => {
            setPageScrolls(scrollMq.matches);
            setTouchTier(touchMq.matches);
        };
        sync();
        scrollMq.addEventListener("change", sync);
        touchMq.addEventListener("change", sync);
        return () => {
            scrollMq.removeEventListener("change", sync);
            touchMq.removeEventListener("change", sync);
        };
    }, []);

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
        for (const list of map.values()) {
            // Timed tasks in chronological order, undated ones last.
            list.sort((a, b) =>
                (a.time || "~").localeCompare(b.time || "~"),
            );
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

    const scrollToDay = useCallback(
        (
            monthIndex: number,
            dayIndex: number,
            behavior: ScrollBehavior = "smooth",
        ) => {
            const targetDayIndex = dayRefs.current.findIndex(
                (ref) =>
                    ref &&
                    ref.isConnected &&
                    ref.getAttribute("data-month") === `${monthIndex}` &&
                    ref.getAttribute("data-day") === `${dayIndex}`,
            );

            const targetElement = dayRefs.current[targetDayIndex];

            if (targetDayIndex === -1 || !targetElement) return false;

            const container = pageScrolls ? null : containerRef.current;
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
                    behavior,
                });
            } else {
                const offset =
                    window.scrollY +
                    elementRect.top -
                    window.innerHeight / offsetFactor +
                    elementRect.height / 2;
                window.scrollTo({ top: offset, behavior });
            }

            return true;
        },
        [pageScrolls],
    );

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

    // Land on today when the calendar first opens, instead of on 1 January.
    // Retries across a few frames because the grid needs a layout pass first.
    const didInitialScrollRef = useRef(false);
    useEffect(() => {
        if (didInitialScrollRef.current) return;

        const target = new Date();
        if (year !== target.getFullYear()) return;

        let frame = 0;
        let attempts = 0;

        const tryScroll = () => {
            if (didInitialScrollRef.current) return;
            const ok = scrollToDay(
                target.getMonth(),
                target.getDate(),
                "auto",
            );
            if (ok) {
                didInitialScrollRef.current = true;
                setSelectedMonth(target.getMonth());
            } else if (attempts++ < 10) {
                frame = requestAnimationFrame(tryScroll);
            }
        };

        frame = requestAnimationFrame(tryScroll);
        return () => cancelAnimationFrame(frame);
    }, [year, scrollToDay]);

    const handleDayClick = useCallback(
        (day: number, month: number, year: number) => {
            if (!onClick) return;
            if (month < 0) {
                onClick(day, 11, year - 1);
            } else {
                onClick(day, month, year);
            }
        },
        [onClick],
    );

    const handleAddClick = useCallback(
        (e: React.MouseEvent, day: number, month: number, year: number) => {
            e.stopPropagation();
            onAddClick?.(day, month, year);
        },
        [onAddClick],
    );

    const handleTaskDragStart = useCallback(
        (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
            e.dataTransfer.setData("text/plain", taskId);
            e.dataTransfer.effectAllowed = "move";
            setDragTaskId(taskId);
            setDraggingTaskId(taskId);
        },
        [setDraggingTaskId],
    );

    const handleTaskDragEnd = useCallback(() => {
        setDragTaskId(null);
        setDragOverKey(null);
        setDraggingTaskId(null);
    }, [setDraggingTaskId]);

    const handleDayDragOver = useCallback(
        (e: React.DragEvent<HTMLDivElement>, dateKey: string) => {
            if (!dragTaskId) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            // Functional update keeps this callback off dragOverKey, so the
            // grid memo isn't rebuilt on every cell the pointer crosses.
            setDragOverKey((prev) => (prev === dateKey ? prev : dateKey));
        },
        [dragTaskId],
    );

    const handleDayDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>, dateKey: string) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData("text/plain") || dragTaskId;
            setDragTaskId(null);
            setDragOverKey(null);
            setDraggingTaskId(null);
            if (taskId) onTaskMove?.(taskId, dateKey);
        },
        [dragTaskId, onTaskMove, setDraggingTaskId],
    );

    // HTML5 drag-and-drop has no touch equivalent, and on a phone or tablet a
    // long-press drag just fights the scroll.
    const dragEnabled = !!onTaskMove && !touchTier;

    const generateCalendar = useMemo(() => {
        const today = new Date();

        const daysInYear = (): { month: number; day: number }[] => {
            const daysInYear = [];
            const startDayOfWeek = mondayFirstIndex(
                new Date(year, 0, 1).getDay(),
            );

            // Pad the first week with the trailing days of the previous
            // December so Jan 1 lands in its real weekday column.
            if (startDayOfWeek > 0) {
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
                                // Guard against the exiting year-grid clone
                                // nulling live refs during the AnimatePresence
                                // transition (kept the month Select in sync).
                                if (el) dayRefs.current[index] = el;
                            }}
                            data-month={month}
                            data-day={day}
                            onClick={() => handleDayClick(day, month, year)}
                            onDragOver={
                                dragEnabled && !isOutsideMonth && dateKey
                                    ? (e) => handleDayDragOver(e, dateKey)
                                    : undefined
                            }
                            onDrop={
                                dragEnabled && !isOutsideMonth && dateKey
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
                                            <TextAlignStart size={12} />
                                            {noteCount}
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
                                            (task.categoryId &&
                                                categoryColorById.get(
                                                    task.categoryId,
                                                )) ||
                                            undefined;

                                        const textColor = color
                                            ? readableTextColor(color)
                                            : undefined;

                                        const draggable =
                                            dragEnabled && !isOutsideMonth;

                                        return (
                                            <div
                                                key={task.id}
                                                role="button"
                                                tabIndex={0}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(
                                                        `/calendar/${task.id}`,
                                                    );
                                                }}
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" ||
                                                        e.key === " "
                                                    ) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        router.push(
                                                            `/calendar/${task.id}`,
                                                        );
                                                    }
                                                }}
                                                className={`${styles.eventPill} ${
                                                    dragTaskId === task.id
                                                        ? styles.dragging
                                                        : ""
                                                } ${draggable ? styles.draggablePill : ""}`}
                                                style={{
                                                    backgroundColor: color,
                                                    color: textColor ?? undefined,
                                                }}
                                            >
                                                {task.time && (
                                                    <span
                                                        className={
                                                            styles.eventTime
                                                        }
                                                    >
                                                        {task.time}
                                                    </span>
                                                )}
                                                <span
                                                    className={styles.eventTitle}
                                                >
                                                    {task.title}
                                                </span>
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
        dragTaskId,
        dragOverKey,
        noteCountByDate,
        dragEnabled,
        router,
        handleDayClick,
        handleAddClick,
        handleDayDragOver,
        handleDayDrop,
        handleTaskDragStart,
        handleTaskDragEnd,
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
                root: pageScrolls ? null : calendarContainer,
                // -75%/-25% insets sum to 100%, collapsing the detection
                // band to zero height so crossings were missed and the month
                // picker went stale. A 10% band in the upper-middle is stable.
                rootMargin: "-40% 0px -50% 0px",
                threshold: 0,
            },
        );

        const anchors = calendarContainer
            ? calendarContainer.querySelectorAll<HTMLElement>(
                  '[data-day="15"]',
              )
            : [];
        anchors.forEach((anchor) => observer.observe(anchor));

        return () => observer.disconnect();
    }, [year, pageScrolls]);

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
                        {onImportClick && (
                            <button
                                onClick={onImportClick}
                                type="button"
                                className={styles.importButton}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="15"
                                    height="15"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M12 15V3m0 0 4 4m-4-4L8 7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                Import .ics
                            </button>
                        )}
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

