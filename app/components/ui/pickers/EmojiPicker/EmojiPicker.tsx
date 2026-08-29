"use client";
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

interface EmojiPreviewProps {
    value?: string;
}

export const EmojiPreview = ({ value }: EmojiPreviewProps) => {
    return (
        <div className={styles.previewTrigger}>
            <span className={styles.previewEmoji}>{value || ""}</span>
        </div>
    );
};

interface EmojiGridProps {
    value?: string;
    onChange: (emoji: string) => void;
}

export const EmojiGrid = ({ value, onChange }: EmojiGridProps) => {
    return (
        <div className={styles.grid}>
            {EMOJI_OPTIONS.map((emoji) => (
                <button
                    key={emoji}
                    type="button"
                    className={`${styles.option} ${value === emoji ? styles.active : ""}`}
                    onClick={() => {
                        onChange(emoji);
                    }}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

