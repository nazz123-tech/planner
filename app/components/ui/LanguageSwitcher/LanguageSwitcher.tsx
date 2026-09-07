"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/app/i18n/LanguageProvider";
import {
    LOCALES,
    LOCALE_NAMES,
    LOCALE_SHORT,
    type Locale,
} from "@/app/i18n/config";
import styles from "./LanguageSwitcher.module.css";

export const LanguageSwitcher = () => {
    const { locale, setLocale, t } = useLanguage();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    // Close on an outside click or Escape, the same as the month picker.
    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            if (!wrapRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const choose = (next: Locale) => {
        setLocale(next);
        setOpen(false);
    };

    return (
        <div className={styles.wrap} ref={wrapRef}>
            <button
                type="button"
                className={styles.trigger}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={t("nav.language")}
                title={t("nav.language")}
                onClick={() => setOpen((prev) => !prev)}
            >
                <Languages size={18} aria-hidden="true" />
                <span className={styles.code}>{LOCALE_SHORT[locale]}</span>
            </button>

            {open && (
                <ul className={styles.menu} role="listbox">
                    {LOCALES.map((option) => (
                        <li key={option}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={option === locale}
                                className={`${styles.option} ${
                                    option === locale ? styles.current : ""
                                }`}
                                onClick={() => choose(option)}
                            >
                                {LOCALE_NAMES[option]}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
