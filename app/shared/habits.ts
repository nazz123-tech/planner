import type { HabitFrequency, WeekDay } from "@/app/types/habit";
import type { Translate } from "@/app/lib/greetings";
import { weekdayLongNames, weekdayShortNames } from "@/app/i18n/dates";

/**
 * Monday-first for display, but the stored `value` stays the JS weekday
 * (0 = Sunday) that habit documents already use — reordering the picker must
 * not change what is written to Firestore.
 */
const PICKER_ORDER: WeekDay[] = [1, 2, 3, 4, 5, 6, 0];

export interface WeekdayOption {
    value: WeekDay;
    label: string;
    short: string;
}

/** Weekday names for the active language, in picker order. */
export function weekdayOptions(intlLocale: string): WeekdayOption[] {
    const long = weekdayLongNames(intlLocale);
    const short = weekdayShortNames(intlLocale);
    return PICKER_ORDER.map((value) => ({
        value,
        label: long[value],
        short: short[value],
    }));
}

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

export function frequencyLabel(
    freq: HabitFrequency | undefined,
    t: Translate,
    intlLocale: string,
): string {
    const normalized = normalizeFrequency(freq);
    if (normalized.type === "daily" || normalized.days.length === 7) {
        return t("habits.everyDay");
    }
    if (normalized.days.length === 0) {
        return t("habits.noDays");
    }
    const short = weekdayShortNames(intlLocale);
    // Listed Monday-first to match the picker, not 0-6 from Sunday.
    return PICKER_ORDER.filter((day) => normalized.days.includes(day))
        .map((day) => short[day])
        .join(", ");
}
