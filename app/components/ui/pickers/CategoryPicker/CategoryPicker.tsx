"use client";
import styles from "./CategoryPicker.module.css";
import type { Category } from "@/app/types/category";

interface CategoryPickerProps {
    categories: Category[];
    value: string | undefined;
    onChange: (categoryId: string | undefined) => void;
}

export const CategoryPicker = ({
    categories,
    value,
    onChange,
}: CategoryPickerProps) => {
    return (
        <div className={styles.grid}>
            {categories.map((category) => {
                const isActive = value === category.id;
                return (
                    <button
                        key={category.id}
                        type="button"
                        className={`${styles.chip} ${isActive ? styles.active : ""}`}
                        onClick={() =>
                            onChange(isActive ? undefined : category.id)
                        }
                    >
                        <span>{category.emoji}</span>
                        {category.name}
                    </button>
                );
            })}
        </div>
    );
};

