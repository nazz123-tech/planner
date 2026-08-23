"use client";
import { useState } from "react";
import styles from "./EmojiPicker.module.css";

const EMOJI_OPTIONS = [
    "📝",
    "💼",
    "🏠",
    "🛒",
    "💪",
    "📚",
    "🎨",
    "🍳",
    "🚗",
    "💰",
    "🎯",
    "🌱",
    "❤️",
    "🎮",
    "✈️",
    "🎵",
    "📷",
    "🧹",
    "☕",
    "🐶",
    "🎬",
    "💻",
    "🏃",
    "🛠️",
];

interface EmojiPickerProps {
    value: string;
    onChange: (emoji: string) => void;
}

export const EmojiPicker = ({ value, onChange }: EmojiPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span className={styles.selected}>{value || "🙂"}</span>
            </button>

            {isOpen && (
                <div className={styles.grid}>
                    {EMOJI_OPTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            className={`${styles.option} ${value === emoji ? styles.active : ""}`}
                            onClick={() => {
                                onChange(emoji);
                                setIsOpen(false);
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
