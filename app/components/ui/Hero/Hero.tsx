"use client";
import styles from "./Hero.module.css";

import dayjs from "dayjs";
import { useGreeting } from "@/app/hooks/greetings/useGreetings";
import { useTodayTasks } from "@/app/hooks/tasks/useTodayTasks";
import { User } from "firebase/auth";
import { useEffect } from "react";

interface HeroProps {
    user: User | null;
    totalTasks: number;
    done?: number;
    isLoading: boolean;
}
export default function Hero({ user, totalTasks, done, isLoading }: HeroProps) {
    const today = dayjs().format("ddd D MMM");
    const { greeting, subtext } = useGreeting(user?.displayName ?? "Buddy", {
        total: totalTasks ?? 0,
        done: done ?? 0,
    });
    return (
        <div className={styles.hero}>
            <div className={styles.textBlock}>
                <h2 className={styles.title}>{greeting}</h2>
                {!isLoading && <p className={styles.subtext}>{subtext}</p>}
            </div>
            <div className={styles.date}>{today}</div>
        </div>
    );
}

