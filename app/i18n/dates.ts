/**
 * Month and weekday names come from Intl rather than the dictionaries: it has
 * correct data for all three languages and saves 36 hand-translated strings.
 *
 * Asking for `month` on its own yields the standalone nominative form, which
 * is what a dropdown wants — Ukrainian would otherwise give the genitive
 * ("січня" instead of "січень") that belongs in a full date.
 */

/** Any year works; 2021 starts on a Friday, which is irrelevant here. */
const SAMPLE_YEAR = 2021;

export function monthNames(intlLocale: string): string[] {
    const format = new Intl.DateTimeFormat(intlLocale, { month: "long" });
    return Array.from({ length: 12 }, (_, month) =>
        format.format(new Date(SAMPLE_YEAR, month, 1)),
    );
}

/**
 * Indexed by JS weekday (0 = Sunday), matching the `WeekDay` type used by
 * habits. 2021-08-01 was a Sunday, so adding the index lands on each day.
 */
function weekdayNames(intlLocale: string, weekday: "long" | "short"): string[] {
    const format = new Intl.DateTimeFormat(intlLocale, { weekday });
    return Array.from({ length: 7 }, (_, day) =>
        format.format(new Date(2021, 7, 1 + day)),
    );
}

export function weekdayShortNames(intlLocale: string): string[] {
    return weekdayNames(intlLocale, "short");
}

export function weekdayLongNames(intlLocale: string): string[] {
    return weekdayNames(intlLocale, "long");
}

/** Monday-first column headers for the calendar grid. */
export function calendarWeekdays(intlLocale: string): string[] {
    const short = weekdayShortNames(intlLocale);
    return [...short.slice(1), short[0]];
}

/** e.g. "Fri 5 Sep" in the dashboard hero. */
export function formatHeroDate(intlLocale: string, date: Date): string {
    return new Intl.DateTimeFormat(intlLocale, {
        weekday: "short",
        day: "numeric",
        month: "short",
    }).format(date);
}

/** Long form for day sheets and task details, e.g. "5 September 2026". */
export function formatLongDate(intlLocale: string, date: Date): string {
    return new Intl.DateTimeFormat(intlLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}
