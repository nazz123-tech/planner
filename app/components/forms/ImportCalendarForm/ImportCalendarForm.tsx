"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { parseIcs, type IcsParseResult } from "@/app/lib/ics";
import { deriveImportCategory, pickCategoryColor } from "@/app/lib/importNaming";
import { useImportTasks } from "@/app/hooks/tasks/useImportTasks";
import { useCategories } from "@/app/hooks/categories/useCategories";
import { useCreateCategory } from "@/app/hooks/categories/useCreateCategory";
import { CategoryPicker } from "../../ui/pickers/CategoryPicker/CategoryPicker";
import type { Task } from "@/app/types/task";
import styles from "./ImportCalendarForm.module.css";

interface ImportCalendarFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

type GroupMode = "new" | "existing" | "none";

const PREVIEW_LIMIT = 8;
const FALLBACK_EMOJI = "📅";
const FALLBACK_NAME = "Imported events";

export const ImportCalendarForm = ({
    onSuccess,
    onCancel,
}: ImportCalendarFormProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [fileName, setFileName] = useState<string | null>(null);
    const [result, setResult] = useState<IcsParseResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const [groupMode, setGroupMode] = useState<GroupMode>("new");
    const [newName, setNewName] = useState("");
    const [newEmoji, setNewEmoji] = useState(FALLBACK_EMOJI);
    const [existingId, setExistingId] = useState<string | undefined>(undefined);

    const { data: categories } = useCategories();

    // Colours already taken by existing boards — a new imported board avoids
    // them so every category stays visually distinct.
    const usedColors = useMemo(
        () =>
            (categories ?? [])
                .map((category) => category.color)
                .filter((color): color is string => Boolean(color)),
        [categories],
    );
    const { mutateAsync: importTasks, isPending: importing } = useImportTasks();
    const { mutateAsync: createCategory, isPending: creating } =
        useCreateCategory();

    const busy = importing || creating;

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

            const suggestion = deriveImportCategory(
                parsed,
                file.name,
                usedColors,
            );
            setNewName(suggestion.name);
            setNewEmoji(suggestion.emoji);
            setGroupMode("new");
            setExistingId(undefined);

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
        setGroupMode("new");
        setNewName("");
        setNewEmoji(FALLBACK_EMOJI);
        setExistingId(undefined);
        if (inputRef.current) inputRef.current.value = "";
    };

    const resolveCategory = async (): Promise<{
        id?: string;
        label?: string;
    }> => {
        if (groupMode === "existing") {
            const picked = categories?.find((c) => c.id === existingId);
            return { id: picked?.id, label: picked?.name };
        }

        if (groupMode === "new") {
            const name = newName.trim() || FALLBACK_NAME;
            // Recompute against the latest boards so a colour that got taken
            // between opening the form and importing is still avoided.
            const ref = await createCategory({
                name,
                emoji: newEmoji.trim() || FALLBACK_EMOJI,
                color: pickCategoryColor(name, usedColors),
            });
            return { id: ref.id, label: name };
        }

        return {};
    };

    const handleImport = async () => {
        if (!result) return;

        let category: { id?: string; label?: string };
        try {
            category = await resolveCategory();
        } catch {
            toast.error("Couldn't create the board. Please try again.");
            return;
        }

        const tasks: Omit<Task, "id">[] = result.events.map((event) => {
            const task: Omit<Task, "id"> = {
                title: event.title,
                date: event.date,
                isDone: false,
            };
            if (event.time) task.time = event.time;
            if (event.description) task.description = event.description;
            if (category.id) task.categoryId = category.id;
            return task;
        });

        try {
            const { imported } = await importTasks(tasks);
            const suffix = imported === 1 ? "" : "s";
            toast.success(
                category.label
                    ? `Imported ${imported} event${suffix} into “${category.label}”`
                    : `Imported ${imported} event${suffix}`,
            );
            onSuccess();
        } catch {
            toast.error("Import failed. Please try again.");
        }
    };

    const preview = result?.events.slice(0, PREVIEW_LIMIT) ?? [];
    const hiddenCount = (result?.events.length ?? 0) - preview.length;
    // Recurring series arrive as one VEVENT and are expanded into an event
    // per occurrence, so report the occurrences, not the series.
    const recurringCount =
        result?.events.filter((event) => event.recurring).length ?? 0;
    const hasExisting = (categories?.length ?? 0) > 0;

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
                                {recurringCount} from repeating events
                            </span>
                        )}
                    </div>

                    <div className={styles.grouping}>
                        <span className={styles.label}>GROUP INTO A BOARD</span>

                        <div className={styles.modeRow}>
                            <button
                                type="button"
                                className={`${styles.modeBtn} ${groupMode === "new" ? styles.modeBtnActive : ""}`}
                                onClick={() => setGroupMode("new")}
                            >
                                New board
                            </button>
                            {hasExisting && (
                                <button
                                    type="button"
                                    className={`${styles.modeBtn} ${groupMode === "existing" ? styles.modeBtnActive : ""}`}
                                    onClick={() => setGroupMode("existing")}
                                >
                                    Existing
                                </button>
                            )}
                            <button
                                type="button"
                                className={`${styles.modeBtn} ${groupMode === "none" ? styles.modeBtnActive : ""}`}
                                onClick={() => setGroupMode("none")}
                            >
                                Don&apos;t group
                            </button>
                        </div>

                        {groupMode === "new" && (
                            <div className={styles.newBoard}>
                                <input
                                    className={styles.emojiInput}
                                    value={newEmoji}
                                    onChange={(event) =>
                                        setNewEmoji(event.target.value.slice(0, 2))
                                    }
                                    aria-label="Board emoji"
                                    maxLength={2}
                                />
                                <input
                                    className={styles.nameInput}
                                    value={newName}
                                    onChange={(event) =>
                                        setNewName(event.target.value)
                                    }
                                    maxLength={30}
                                    placeholder="Board name"
                                    aria-label="Board name"
                                />
                            </div>
                        )}

                        {groupMode === "new" && (
                            <span className={styles.suggestHint}>
                                Suggested from the calendar you imported — edit
                                as you like.
                            </span>
                        )}

                        {groupMode === "existing" && hasExisting && (
                            <CategoryPicker
                                categories={categories ?? []}
                                value={existingId}
                                onChange={setExistingId}
                            />
                        )}
                    </div>

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
                        disabled={busy}
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
                    disabled={busy}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={handleImport}
                    disabled={
                        !result ||
                        busy ||
                        (groupMode === "existing" && !existingId)
                    }
                >
                    {busy
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
