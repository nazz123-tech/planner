"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import {
    DEFAULT_LOCALE,
    INTL_LOCALE,
    LOCALE_STORAGE_KEY,
    detectLocale,
    isLocale,
    type Locale,
} from "./config";
import { en, type Dictionary, type TranslationKey } from "./dictionaries/en";
import { uk } from "./dictionaries/uk";
import { no } from "./dictionaries/no";

const DICTIONARIES: Record<Locale, Dictionary> = { en, uk, no };

export type TranslateParams = Record<string, string | number>;

interface LanguageContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey, params?: TranslateParams) => string;
    /** BCP 47 tag for Intl — dates, month and weekday names. */
    intlLocale: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Runs before paint on the client, and is a no-op during SSR. The stored
 * language is applied in the same commit as hydration, so a Ukrainian or
 * Norwegian user never sees a frame of English.
 */
const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

function interpolate(template: string, params?: TranslateParams): string {
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Server and first client render agree on the default; the effect below
    // corrects it before the browser paints.
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

    useIsomorphicLayoutEffect(() => {
        let next: Locale | null = null;
        try {
            const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
            if (isLocale(stored)) next = stored;
        } catch {
            // Private browsing can throw on access; fall through to detection.
        }
        if (!next) next = detectLocale(navigator.languages ?? [navigator.language]);
        setLocaleState(next);
    }, []);

    // Keep <html lang> honest for screen readers, hyphenation and spellcheck.
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const setLocale = useCallback((next: Locale) => {
        setLocaleState(next);
        try {
            window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
        } catch {
            // Not being able to remember the choice shouldn't break switching.
        }
    }, []);

    const value = useMemo<LanguageContextValue>(() => {
        const dictionary = DICTIONARIES[locale];
        return {
            locale,
            setLocale,
            intlLocale: INTL_LOCALE[locale],
            t: (key, params) => interpolate(dictionary[key] ?? en[key], params),
        };
    }, [locale, setLocale]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextValue {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used inside <LanguageProvider>");
    }
    return context;
}

/** Shorthand for the common case of only needing the translate function. */
export function useT() {
    return useLanguage().t;
}
