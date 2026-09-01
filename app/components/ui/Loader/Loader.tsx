"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./Loader.module.css";

interface LoaderProps {
    /** Cover the whole viewport with a centered spinner. */
    fullscreen?: boolean;
    /** Optional text shown under the spinner. */
    label?: string;
}

export const Loader = ({ fullscreen = false, label }: LoaderProps) => {
    const reduceMotion = useReducedMotion();

    return (
        <div
            className={fullscreen ? styles.fullscreen : styles.inline}
            role="status"
            aria-live="polite"
        >
            <motion.span
                className={styles.spinner}
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 0.9,
                }}
            />
            {label && <span className={styles.label}>{label}</span>}
            <span className={styles.srOnly}>Loading…</span>
        </div>
    );
};

export default Loader;
