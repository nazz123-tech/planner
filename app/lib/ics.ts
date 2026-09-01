import dayjs from "dayjs";

/**
 * Minimal iCalendar (RFC 5545) reader. Extracts VEVENT blocks and maps each
 * one onto the shape the planner needs: a wall-clock date, an optional time,
 * a title and a description. Recurrence rules are not expanded — only the
 * DTSTART occurrence of a recurring event is imported (and flagged).
 *
 * Kept dependency-free on purpose: the app already ships dayjs, and a hand
 * rolled reader avoids pulling a full calendar library into the client bundle.
 */

export interface ImportedEvent {
    uid?: string;
    title: string;
    /** YYYY-MM-DD, local wall-clock of the event start. */
    date: string;
    /** HH:mm, omitted for all-day events. */
    time?: string;
    description?: string;
    allDay: boolean;
    recurring: boolean;
}

export interface IcsParseResult {
    events: ImportedEvent[];
    /** VEVENT blocks that could not be mapped (missing title or start). */
    skipped: number;
    /** Total VEVENT blocks seen. */
    total: number;
}

const MAX_DESCRIPTION = 2000;

/** Undo RFC 5545 line folding: a CRLF followed by a space or tab is a join. */
function unfoldLines(raw: string): string[] {
    const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const rawLines = normalized.split("\n");
    const lines: string[] = [];

    for (const line of rawLines) {
        if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length) {
            lines[lines.length - 1] += line.slice(1);
        } else {
            lines.push(line);
        }
    }

    return lines;
}

/** Unescape TEXT values: \\n \\, \\; \\\\ (case-insensitive for \\N). */
function unescapeText(value: string): string {
    return value
        .replace(/\\n/gi, "\n")
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .replace(/\\\\/g, "\\");
}

interface ParsedLine {
    name: string;
    params: Record<string, string>;
    value: string;
}

/** Split "DTSTART;TZID=Europe/London:20240115T090000" into its parts. */
function parseContentLine(line: string): ParsedLine | null {
    const colon = line.indexOf(":");
    if (colon === -1) return null;

    const head = line.slice(0, colon);
    const value = line.slice(colon + 1);

    const segments = head.split(";");
    const name = segments[0].toUpperCase();
    const params: Record<string, string> = {};

    for (const segment of segments.slice(1)) {
        const eq = segment.indexOf("=");
        if (eq === -1) continue;
        params[segment.slice(0, eq).toUpperCase()] = segment.slice(eq + 1);
    }

    return { name, params, value };
}

interface StartValue {
    date: string;
    time?: string;
    allDay: boolean;
}

/** Parse a DTSTART value into a local wall-clock date (+ time). */
function parseStart(value: string, params: Record<string, string>): StartValue | null {
    const isDateOnly = params.VALUE === "DATE" || /^\d{8}$/.test(value);

    if (isDateOnly) {
        const match = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
        if (!match) return null;
        return { date: `${match[1]}-${match[2]}-${match[3]}`, allDay: true };
    }

    const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/.exec(value);
    if (!match) return null;

    const [, y, mo, d, h, mi, , zulu] = match;

    if (zulu) {
        // UTC instant — convert to the viewer's local wall clock.
        const local = dayjs(`${y}-${mo}-${d}T${h}:${mi}:00Z`);
        if (!local.isValid()) return null;
        return {
            date: local.format("YYYY-MM-DD"),
            time: local.format("HH:mm"),
            allDay: false,
        };
    }

    // Floating time or a TZID we don't resolve — take the wall clock as written.
    return { date: `${y}-${mo}-${d}`, time: `${h}:${mi}`, allDay: false };
}

interface EventDraft {
    uid?: string;
    summary?: string;
    description?: string;
    start?: StartValue;
    recurring: boolean;
}

function finalizeEvent(draft: EventDraft): ImportedEvent | null {
    const title = draft.summary?.trim();
    if (!title || !draft.start) return null;

    const event: ImportedEvent = {
        title,
        date: draft.start.date,
        allDay: draft.start.allDay,
        recurring: draft.recurring,
    };

    if (draft.start.time) event.time = draft.start.time;
    if (draft.uid) event.uid = draft.uid;

    const description = draft.description?.trim();
    if (description) {
        event.description = description.slice(0, MAX_DESCRIPTION);
    }

    return event;
}

export function parseIcs(raw: string): IcsParseResult {
    const lines = unfoldLines(raw);

    const events: ImportedEvent[] = [];
    let total = 0;
    let skipped = 0;

    let draft: EventDraft | null = null;

    for (const line of lines) {
        const upper = line.toUpperCase();

        if (upper === "BEGIN:VEVENT") {
            draft = { recurring: false };
            total += 1;
            continue;
        }

        if (upper === "END:VEVENT") {
            if (draft) {
                const event = finalizeEvent(draft);
                if (event) events.push(event);
                else skipped += 1;
            }
            draft = null;
            continue;
        }

        if (!draft) continue;

        const parsed = parseContentLine(line);
        if (!parsed) continue;

        switch (parsed.name) {
            case "SUMMARY":
                draft.summary = unescapeText(parsed.value);
                break;
            case "DESCRIPTION":
                draft.description = unescapeText(parsed.value);
                break;
            case "UID":
                draft.uid = parsed.value.trim();
                break;
            case "DTSTART":
                draft.start = parseStart(parsed.value.trim(), parsed.params) ?? undefined;
                break;
            case "RRULE":
                draft.recurring = true;
                break;
            default:
                break;
        }
    }

    return { events, skipped, total };
}
