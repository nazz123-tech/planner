import type { HabitFrequency, WeekDay } from "@/app/types/habit";

export const WEEKDAYS: { value: WeekDay; label: string; short: string }[] = [
    { value: 0, label: "Sunday", short: "Sun" },
    { value: 1, label: "Monday", short: "Mon" },
    { value: 2, label: "Tuesday", short: "Tue" },
    { value: 3, label: "Wednesday", short: "Wed" },
    { value: 4, label: "Thursday", short: "Thu" },
    { value: 5, label: "Friday", short: "Fri" },
    { value: 6, label: "Saturday", short: "Sat" },
];

export function normalizeFrequency(freq?: HabitFrequency): HabitFrequency {
    if (freq && freq.type === "weekdays" && Array.isArray(freq.days)) {
        return freq;
    }
    return { type: "daily" };
}

export function isScheduledOn(
    freq: HabitFrequency | undefined,
    weekday: number,
): boolean {
    const normalized = normalizeFrequency(freq);
    return (
        normalized.type === "daily" ||
        normalized.days.includes(weekday as WeekDay)
    );
}

export function frequencyLabel(freq?: HabitFrequency): string {
    const normalized = normalizeFrequency(freq);
    if (normalized.type === "daily" || normalized.days.length === 7) {
        return "Every day";
    }
    if (normalized.days.length === 0) {
        return "No days set";
    }
    return [...normalized.days]
        .sort((a, b) => a - b)
        .map((day) => WEEKDAYS[day].short)
        .join(", ");
}
