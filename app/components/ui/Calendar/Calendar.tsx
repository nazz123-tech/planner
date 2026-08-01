"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Calendar.module.css";

// ---------- Types ----------

export interface CalendarProps {
  /** Дедлайни/помітки: ключ "рік-місяць(0-indexed)" -> масив днів. Напр. { "2026-2": [2,6,11] } */
  markedDays?: Record<string, number[]>;
  /** Яку дату вважати "сьогодні". За замовчуванням — реальне "сьогодні". */
  today?: Date;
  /** Скільки місяців підвантажити одразу назад/вперед від today. */
  initialRangeBack?: number;
  initialRangeForward?: number;
  /** Виклик при кліку на день. */
  onDayClick?: (date: Date) => void;
  /** Назви місяців (порядок: Січень..Грудень). Можна передати іншою мовою. */
  monthNames?: string[];
  /** Назви днів тижня, починаючи з понеділка. */
  weekdayNames?: string[];
}

interface MonthKey {
  year: number;
  month: number; // 0-indexed
}

// ---------- Defaults ----------

const DEFAULT_MONTH_NAMES = [
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

const DEFAULT_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function monthKeyId(y: number, m: number) {
  return `${y}-${m}`;
}

function addMonths(date: Date, delta: number): MonthKey {
  const d = new Date(date.getFullYear(), date.getMonth() + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function mondayFirstOffset(year: number, month: number) {
  const jsDay = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
  return jsDay === 0 ? 6 : jsDay - 1;
}

// ---------- Component ----------

export default function Calendar({
  markedDays = {},
  today,
  initialRangeBack = 3,
  initialRangeForward = 9,
  onDayClick,
  monthNames = DEFAULT_MONTH_NAMES,
  weekdayNames = DEFAULT_WEEKDAYS,
}: CalendarProps) {
  const resolvedToday = today ?? new Date();
  const baseYear = resolvedToday.getFullYear();
  const baseMonth = resolvedToday.getMonth();
  const todayDateNum = resolvedToday.getDate();

  const [months, setMonths] = useState<MonthKey[]>(() => {
    const arr: MonthKey[] = [];
    for (
      let offset = -initialRangeBack;
      offset <= initialRangeForward;
      offset++
    ) {
      arr.push(addMonths(resolvedToday, offset));
    }
    return arr;
  });

  const [label, setLabel] = useState(`${monthNames[baseMonth]} ${baseYear}`);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const earliestOffset = useRef(-initialRangeBack);
  const latestOffset = useRef(initialRangeForward);

  // --- IntersectionObserver: updates sticky month label ---
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const y = entry.target.getAttribute("data-year");
            const m = entry.target.getAttribute("data-month");
            if (y != null && m != null) {
              setLabel(`${monthNames[parseInt(m, 10)]} ${y}`);
            }
          }
        });
      },
      { root, rootMargin: "-10% 0px -85% 0px", threshold: 0 },
    );

    blockRefs.current.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months.length === 0]); // observer set up once on mount

  // observe newly added month blocks
  const registerBlockRef = useCallback(
    (key: string, el: HTMLDivElement | null) => {
      if (el) {
        blockRefs.current.set(key, el);
        observerRef.current?.observe(el);
      } else {
        const existing = blockRefs.current.get(key);
        if (existing) observerRef.current?.unobserve(existing);
        blockRefs.current.delete(key);
      }
    },
    [],
  );

  // --- infinite scroll: load more months near edges ---
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;

    if (scrollTop < 120) {
      earliestOffset.current -= 1;
      const next = addMonths(resolvedToday, earliestOffset.current);
      const prevHeight = el.scrollHeight;
      setMonths((prev) => [next, ...prev]);
      // compensate scroll jump after DOM paints
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop +=
            scrollRef.current.scrollHeight - prevHeight;
        }
      });
    }

    if (scrollHeight - (scrollTop + clientHeight) < 300) {
      latestOffset.current += 1;
      const next = addMonths(resolvedToday, latestOffset.current);
      setMonths((prev) => [...prev, next]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jumpToToday = useCallback(() => {
    const key = monthKeyId(baseYear, baseMonth);
    const el = blockRefs.current.get(key);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [baseYear, baseMonth]);

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.topRow}>
          <h1>{label}</h1>
          <button
            className={styles.todayJump}
            onClick={jumpToToday}
            type="button"
          >
            Сьогодні
          </button>
        </div>
        <div className={styles.weekdays}>
          {weekdayNames.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
      </div>

      <div className={styles.scroll} ref={scrollRef} onScroll={handleScroll}>
        {months.map(({ year, month }) => (
          <MonthBlock
            key={monthKeyId(year, month)}
            year={year}
            month={month}
            monthLabel={monthNames[month]}
            markedDays={markedDays[monthKeyId(year, month)] ?? []}
            isTodayMonth={year === baseYear && month === baseMonth}
            todayDateNum={todayDateNum}
            onDayClick={onDayClick}
            registerRef={registerBlockRef}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Sub-component: one month grid ----------

interface MonthBlockProps {
  year: number;
  month: number;
  monthLabel: string;
  markedDays: number[];
  isTodayMonth: boolean;
  todayDateNum: number;
  onDayClick?: (date: Date) => void;
  registerRef: (key: string, el: HTMLDivElement | null) => void;
}

function MonthBlock({
  year,
  month,
  monthLabel,
  markedDays,
  isTodayMonth,
  todayDateNum,
  onDayClick,
  registerRef,
}: MonthBlockProps) {
  const total = daysInMonth(year, month);
  const offset = mondayFirstOffset(year, month);
  const key = monthKeyId(year, month);

  return (
    <div
      className={styles.monthBlock}
      data-year={year}
      data-month={month}
      ref={(el) => registerRef(key, el)}
    >
      <div className={styles.monthLabel}>
        {monthLabel} {year}
      </div>
      <div className={styles.grid}>
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`pad-${i}`} className={cx(styles.day, styles.pad)} />
        ))}
        {Array.from({ length: total }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = isTodayMonth && dayNum === todayDateNum;
          const isMarked = !isToday && markedDays.includes(dayNum);
          return (
            <div
              key={dayNum}
              className={cx(
                styles.day,
                isToday && styles.today,
                isMarked && styles.marked,
              )}
              onClick={() => onDayClick?.(new Date(year, month, dayNum))}
            >
              <div className={styles.dotInner}>{dayNum}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
