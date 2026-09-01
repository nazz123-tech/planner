"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import styles from "./CheckToggle.module.css";

interface CheckToggleProps {
    checked: boolean;
    onChange: () => void;
    label?: string;
}

export const CheckToggle = ({ checked, onChange, label }: CheckToggleProps) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        className={`${styles.box} ${checked ? styles.checked : ""}`}
        onClick={onChange}
    >
        <AnimatePresence initial={false}>
            {checked && (
                <motion.span
                    key="tick"
                    className={styles.tick}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                >
                    <Check size={14} strokeWidth={3} />
                </motion.span>
            )}
        </AnimatePresence>
    </button>
);
