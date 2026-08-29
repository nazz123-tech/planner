"use client";
import styles from "./ColorPicker.module.css";
import { CATEGORY_COLORS } from "@/app/shared/constants";

interface ColorPickerProps {
    value?: string;
    onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
    return (
        <div className={styles.grid}>
            {CATEGORY_COLORS.map((color) => (
                <button
                    key={color}
                    type="button"
                    className={`${styles.swatch} ${value === color ? styles.active : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onChange(color)}
                    aria-label={color}
                />
            ))}
        </div>
    );
};

