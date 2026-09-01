"use client";

import { useRef, useState, type DragEvent } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { parseIcs, type IcsParseResult } from "@/app/lib/ics";
import { useImportTasks } from "@/app/hooks/tasks/useImportTasks";
import { useCategories } from "@/app/hooks/categories/useCategories";
import { CategoryPicker } from "../../ui/pickers/CategoryPicker/CategoryPicker";
import type { Task } from "@/app/types/task";
import styles from "./ImportCalendarForm.module.css";

interface ImportCalendarFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const PREVIEW_LIMIT = 8;

export const ImportCalendarForm = ({
    onSuccess,
    onCancel,
}: ImportCalendarFormProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [fileName, setFileName] = useState<string | null>(null);
    const [result, setResult] = useState<IcsParseResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

    const { data: categories } = useCategories();
    const { mutateAsync: importTasks, isPending } = useImportTasks();

    const readFile = async (file: File) => {
        setErrorMsg(null);

        const looksLikeIcs =
            file.name.toLowerCase().endsWith(".ics") ||
            file.type === "text/calendar";

        try {
            const text = await file.text();
            const parsed = parseIcs(text);

            if (parsed.total === 0) {
                setResult(null);
                setFileName(null);
                setErrorMsg(
                    looksLikeIcs
                        ? "That .ics file has no calendar events."
                        : "That doesn't look like a calendar file — pick an .ics export.",
                );
                return;
            }

            if (parsed.events.length === 0) {
                setResult(null);
                setFileName(null);
                setErrorMsg(
                    "Couldn't read any usable events (missing titles or start dates).",
                );
                return;
            }

            setResult(parsed);
            setFileName(file.name);
        } catch {
            setResult(null);
            setFileName(null);
            setErrorMsg("Couldn't read that file. Try a different export.");
        }
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (file) void readFile(file);
    };

    const reset = () => {
        setResult(null);
        setFileName(null);
        setErrorMsg(null);
        setCategoryId(undefined);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleImport = async () => {
        if (!result) return;

        const tasks: Omit<Task, "id">[] = result.events.map((event) => {
            const task: Omit<Task, "id"> = {
                title: event.title,
                date: event.date,
                isDone: false,
            };
            if (event.time) task.time = event.time;
            if (event.description) task.description = event.description;
            if (categoryId) task.categoryId = categoryId;
            return task;
        });

        try {
            const { imported } = await importTasks(tasks);
            toast.success(
                `Imported ${imported} event${imported === 1 ? "" : "s"}`,
            );
            onSuccess();
        } catch {
            toast.error("Import failed. Please try again.");
        }
    };

    const preview = result?.events.slice(0, PREVIEW_LIMIT) ?? [];
    const hiddenCount = (result?.events.length ?? 0) - preview.length;
    const recurringCount =
        result?.events.filter((event) => event.recurring).length ?? 0;

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Import calendar</h2>
            <p className={styles.sub}>
                Bring events in from an <code>.ics</code> export (Google
                Calendar, Apple Calendar, Outlook…). Each event becomes a task.
            </p>

            {!result ? (
                <>
                    <div
                        className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ""}`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                inputRef.current?.click();
                            }
                        }}
                    >
                        <svg
                            className={styles.dropIcon}
                            viewBox="0 0 24 24"
                            width="28"
                            height="28"
                            fill="none"
                        >
                            <path
                                d="M12 16V4m0 0 4 4m-4-4L8 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={styles.dropText}>
                            Drop an .ics file here, or click to choose
                        </span>
                        <span className={styles.dropHint}>
                            Only the file you pick is read — nothing is uploaded
                            until you confirm.
                        </span>
                    </div>

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".ics,text/calendar"
                        className={styles.hiddenInput}
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void readFile(file);
                        }}
                    />

                    {errorMsg && <p className={styles.error}>{errorMsg}</p>}
                </>
            ) : (
                <>
                    <div className={styles.summary}>
                        <span className={styles.summaryCount}>
                            {result.events.length} event
                            {result.events.length === 1 ? "" : "s"} ready
                        </span>
                        <span className={styles.fileName}>{fileName}</span>
                        {result.skipped > 0 && (
                            <span className={styles.skip}>
                                {result.skipped} skipped (no title or date)
                            </span>
                        )}
                        {recurringCount > 0 && (
                            <span className={styles.skip}>
                                {recurringCount} recurring — first date only
                            </span>
                        )}
                    </div>

                    {categories && categories.length > 0 && (
                        <div className={styles.field}>
                            <label className={styles.label}>
                                ADD TO BOARD (OPTIONAL)
                            </label>
                            <CategoryPicker
                                categories={categories}
                                value={categoryId}
                                onChange={setCategoryId}
                            />
                        </div>
                    )}

                    <ul className={styles.previewList}>
                        {preview.map((event, index) => (
                            <li
                                key={`${event.uid ?? event.title}-${index}`}
                                className={styles.previewItem}
                            >
                                <span className={styles.previewTitle}>
                                    {event.title}
                                </span>
                                <span className={styles.previewMeta}>
                                    {dayjs(event.date).format("ddd D MMM YYYY")}
                                    {event.time
                                        ? ` · ${event.time}`
                                        : " · all day"}
                                </span>
                            </li>
                        ))}
                        {hiddenCount > 0 && (
                            <li className={styles.more}>
                                +{hiddenCount} more
                            </li>
                        )}
                    </ul>

                    <button
                        type="button"
                        className={styles.reset}
                        onClick={reset}
                        disabled={isPending}
                    >
                        Choose a different file
                    </button>
                </>
            )}

            <div className={styles.groupBtn}>
                <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={onCancel}
                    disabled={isPending}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={handleImport}
                    disabled={!result || isPending}
                >
                    {isPending
                        ? "Importing…"
                        : result
                          ? `Import ${result.events.length} event${result.events.length === 1 ? "" : "s"}`
                          : "Import"}
                </button>
            </div>
        </div>
    );
};

export default ImportCalendarForm;
