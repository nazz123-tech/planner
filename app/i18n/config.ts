export const LOCALES = ["en", "uk", "no"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Shown in the language switcher, each in its own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
    en: "English",
    uk: "Українська",
    no: "Norsk",
};

/** Short label for the collapsed switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
    en: "EN",
    uk: "УК",
    no: "NO",
};

/**
 * BCP 47 tags for Intl (month names, weekday names, dates). "no" maps to
 * Norwegian Bokmål, which is what browsers actually carry data for — plain
 * "no" falls back inconsistently.
 */
export const INTL_LOCALE: Record<Locale, string> = {
    en: "en-GB",
    uk: "uk-UA",
    no: "nb-NO",
};

export const LOCALE_STORAGE_KEY = "planly.locale";

export function isLocale(value: unknown): value is Locale {
    return (
        typeof value === "string" && LOCALES.includes(value as Locale)
    );
}

/**
 * Best match for the browser's language list, so a first-time Ukrainian or
 * Norwegian visitor doesn't have to find the switcher. Matches on the primary
 * subtag, so "nb-NO" and "nn" both resolve to Norwegian.
 */
export function detectLocale(languages: readonly string[]): Locale {
    for (const tag of languages) {
        const primary = tag.toLowerCase().split("-")[0];
        if (primary === "uk") return "uk";
        if (primary === "no" || primary === "nb" || primary === "nn") {
            return "no";
        }
        if (primary === "en") return "en";
    }
    return DEFAULT_LOCALE;
}
