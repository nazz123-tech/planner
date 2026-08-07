"use client";
import styles from "./page.module.css";
import { useAuth } from "../../hooks/useAuth";

export default function Home() {
    const { user } = useAuth();

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Good day, {user?.displayName}</h2>
        </div>
    );
}
