"use client";
import styles from "./Hero.module.css";

import { AnimatePresence, motion } from "framer-motion";
import { useGreeting } from "@/app/hooks/greetings/useGreetings";
import { User } from "firebase/auth";
import { useLanguage } from "@/app/i18n/LanguageProvider";
import { formatHeroDate } from "@/app/i18n/dates";

interface HeroProps {
    user: User | null;
    totalTasks: number;
    done?: number;
    isLoading: boolean;
}
export default function Hero({ user, totalTasks, done, isLoading }: HeroProps) {
    const { t, intlLocale } = useLanguage();
    const today = formatHeroDate(intlLocale, new Date());
    const { greeting, subtext } = useGreeting(
        user?.displayName ?? t("greeting.fallbackName"),
        {
            total: totalTasks ?? 0,
            done: done ?? 0,
        },
    );
    return (
        <div className={styles.hero}>
            <div className={styles.textBlock}>
                <AnimatePresence mode="wait">
                    <motion.h2
                        key={greeting}
                        className={styles.title}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        {greeting}
                    </motion.h2>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                    {!isLoading && (
                        <motion.p
                            key={subtext}
                            className={styles.subtext}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {subtext}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
            <div className={styles.date}>{today}</div>
        </div>
    );
}
