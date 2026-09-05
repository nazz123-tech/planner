import dayjs from "dayjs";


export interface ImportedEvent {
    uid?: string;
    title: string;
    /** YYYY-MM-DD, local wall-clock of the event start. */
    date: string;
   
    time?: string;
    description?: string;
    allDay: boolean;
    recurring: boolean;
}

export interface IcsCalendarMeta {
    /** X-WR-CALNAME — the calendar's display name in the source app. */
    name?: string;
    /** X-WR-CALDESC — the calendar's description. */
    description?: string;
    /** PRODID — the app that produced the file. */
    prodId?: string;
}

export interface IcsParseResult {
    events: ImportedEvent[];
    /** VEVENT blocks that could not be mapped (missing title or start). */
    skipped: number;
    /** Total VEVENT blocks seen. */
    total: number;
    /** Calendar-level metadata (properties outside any VEVENT). */
    calendar: IcsCalendarMeta;
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
    rrule?: string;
    exdates: Set<string>;
}

const MAX_OCCURRENCES = 400;
/** Cap open-ended rules (no UNTIL/COUNT) so an import can't run away. */
const DEFAULT_HORIZON_MONTHS = 24;

const WEEKDAY_INDEX: Record<string, number> = {
    SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

interface RecurrenceRule {
    freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    interval: number;
    count?: number;
    /** YYYY-MM-DD */
    until?: string;
    /** Weekday indices; empty means "same weekday as DTSTART". */
    byDay: number[];
}

function parseRRule(value: string): RecurrenceRule | null {
    const parts: Record<string, string> = {};
    for (const chunk of value.split(";")) {
        const eq = chunk.indexOf("=");
        if (eq > 0) parts[chunk.slice(0, eq).toUpperCase()] = chunk.slice(eq + 1);
    }

    const freq = parts.FREQ?.toUpperCase();
    if (
        freq !== "DAILY" &&
        freq !== "WEEKLY" &&
        freq !== "MONTHLY" &&
        freq !== "YEARLY"
    ) {
        return null;
    }

    const interval = Math.max(1, Number.parseInt(parts.INTERVAL ?? "1", 10) || 1);
    const parsedCount = Number.parseInt(parts.COUNT ?? "", 10);
    const count = Number.isFinite(parsedCount) ? parsedCount : undefined;

    let until: string | undefined;
    const untilMatch = /^(\d{4})(\d{2})(\d{2})/.exec(parts.UNTIL ?? "");
    if (untilMatch) {
        until = `${untilMatch[1]}-${untilMatch[2]}-${untilMatch[3]}`;
    }

    // BYDAY entries may carry an ordinal prefix (e.g. "-1SU"); the last two
    // characters are always the weekday.
    const byDay = (parts.BYDAY ?? "")
        .split(",")
        .map((token) => WEEKDAY_INDEX[token.trim().slice(-2).toUpperCase()])
        .filter((index): index is number => index !== undefined);

    return { freq, interval, count, until, byDay };
}

/** Every date a rule produces, as YYYY-MM-DD, EXDATEs removed. */
function expandRecurrence(
    startDate: string,
    rule: RecurrenceRule,
    exdates: Set<string>,
): string[] {
    const start = dayjs(startDate);
    if (!start.isValid()) return [startDate];

    const horizon = rule.until
        ? dayjs(rule.until)
        : start.add(DEFAULT_HORIZON_MONTHS, "month");
    const limit = Math.min(rule.count ?? MAX_OCCURRENCES, MAX_OCCURRENCES);
    const dates: string[] = [];

    if (rule.freq === "WEEKLY") {
        const days = rule.byDay.length
            ? [...new Set(rule.byDay)].sort((a, b) => a - b)
            : [start.day()];
        let weekStart = start.subtract(start.day(), "day");
        // COUNT limits occurrences the rule generates; an EXDATE still
        // consumes one (RFC 5545), so count generated, not emitted.
        let generated = 0;

        outer: for (let guard = 0; guard < 520; guard += 1) {
            for (const day of days) {
                const occurrence = weekStart.add(day, "day");
                if (occurrence.isBefore(start, "day")) continue;
                if (occurrence.isAfter(horizon, "day")) break outer;
                generated += 1;
                const key = occurrence.format("YYYY-MM-DD");
                if (!exdates.has(key)) dates.push(key);
                if (generated >= limit) break outer;
            }
            weekStart = weekStart.add(rule.interval, "week");
        }
        return dates;
    }

    const unit =
        rule.freq === "DAILY" ? "day" : rule.freq === "MONTHLY" ? "month" : "year";
    let cursor = start;
    let generated = 0;
    while (generated < limit) {
        if (cursor.isAfter(horizon, "day")) break;
        generated += 1;
        const key = cursor.format("YYYY-MM-DD");
        if (!exdates.has(key)) dates.push(key);
        cursor = cursor.add(rule.interval, unit);
    }
    return dates;
}

function finalizeEvents(draft: EventDraft): ImportedEvent[] {
    const title = draft.summary?.trim();
    if (!title || !draft.start) return [];

    const base: ImportedEvent = {
        title,
        date: draft.start.date,
        allDay: draft.start.allDay,
        recurring: !!draft.rrule,
    };

    if (draft.start.time) base.time = draft.start.time;
    if (draft.uid) base.uid = draft.uid;

    const description = draft.description?.trim();
    if (description) {
        base.description = description.slice(0, MAX_DESCRIPTION);
    }

    // A recurring series is stored as ONE VEVENT plus an RRULE; calendar apps
    // expand it for display. Without expanding it here a 12-week series would
    // import as a single task.
    const rule = draft.rrule ? parseRRule(draft.rrule) : null;
    if (!rule) return [base];

    const dates = expandRecurrence(draft.start.date, rule, draft.exdates);
    if (dates.length <= 1) return [base];

    return dates.map((date, index) =>
        base.uid
            ? { ...base, date, uid: `${base.uid}-${index}` }
            : { ...base, date },
    );
}

export function parseIcs(raw: string): IcsParseResult {
    const lines = unfoldLines(raw);

    const events: ImportedEvent[] = [];
    const calendar: IcsCalendarMeta = {};
    let total = 0;
    let skipped = 0;

    let draft: EventDraft | null = null;

    for (const line of lines) {
        const upper = line.toUpperCase();

        if (upper === "BEGIN:VEVENT") {
            draft = { exdates: new Set<string>() };
            total += 1;
            continue;
        }

        if (upper === "END:VEVENT") {
            if (draft) {
                const expanded = finalizeEvents(draft);
                if (expanded.length) events.push(...expanded);
                else skipped += 1;
            }
            draft = null;
            continue;
        }

        if (!draft) {
    
            const meta = parseContentLine(line);
            if (meta) {
                if (meta.name === "X-WR-CALNAME") {
                    calendar.name = unescapeText(meta.value).trim();
                } else if (meta.name === "X-WR-CALDESC") {
                    calendar.description = unescapeText(meta.value).trim();
                } else if (meta.name === "PRODID" && !calendar.prodId) {
                    calendar.prodId = meta.value.trim();
                }
            }
            continue;
        }

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
                draft.rrule = parsed.value.trim();
                break;
            case "EXDATE":
                // Occurrences the user deleted from the series.
                for (const item of parsed.value.split(",")) {
                    const match = /^(\d{4})(\d{2})(\d{2})/.exec(item.trim());
                    if (match) {
                        draft.exdates.add(
                            `${match[1]}-${match[2]}-${match[3]}`,
                        );
                    }
                }
                break;
            default:
                break;
        }
    }

    return { events, skipped, total, calendar };
}
