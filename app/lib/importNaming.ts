import { CATEGORY_COLORS } from "@/app/shared/constants";
import type { IcsParseResult } from "./ics";

/**
 * Derives a sensible board name + emoji for a batch of imported calendar
 * events, using (in order of trust): the calendar's own name (X-WR-CALNAME),
 * a keyword that recurs across the event titles, then the file name. The
 * emoji is matched from the same text against a small keyword table.
 */

export interface SuggestedCategory {
    name: string;
    emoji: string;
    color: string;
}

const MAX_NAME = 30;
const DEFAULT_NAME = "Imported events";
const DEFAULT_EMOJI = "📅";

/** Names too generic to be worth using verbatim. */
const GENERIC_NAME =
    /^(calendar|cal|basic|default|export|exported|events?|ical|ics|schedule|untitled|my calendar|imported.*)$/i;

/** Words to ignore when looking for a recurring keyword in titles. */
const STOP_WORDS = new Set([
    "the", "and", "for", "with", "from", "that", "this", "your", "you",
    "have", "will", "into", "out", "off", "new", "day", "week", "month",
    "meeting", "event", "events", "appointment", "appt", "reminder", "call",
    "session", "time", "am", "pm", "at", "on", "to", "of", "a", "an",
    "mon", "tue", "wed", "thu", "fri", "sat", "sun",
    "2023", "2024", "2025", "2026", "2027",
]);

/** Ordered — the first table row whose keyword appears in the text wins. */
const EMOJI_RULES: ReadonlyArray<{ emoji: string; keywords: string[] }> = [
    { emoji: "🎂", keywords: ["birthday", "bday", "anniversary"] },
    {
        emoji: "✈️",
        keywords: [
            "holiday", "vacation", "pto", "trip", "travel", "flight",
            "hotel", "getaway", "itinerary",
        ],
    },
    {
        emoji: "💼",
        keywords: [
            "work", "office", "standup", "stand-up", "sprint", "scrum",
            "1:1", "one-on-one", "retro", "review", "client", "project",
            "deadline", "deploy", "release", "board meeting", "sync",
        ],
    },
    {
        emoji: "🎓",
        keywords: [
            "school", "class", "lecture", "lesson", "exam", "midterm",
            "course", "semester", "university", "college", "study",
            "seminar", "tutorial", "homework",
        ],
    },
    {
        emoji: "🏋️",
        keywords: [
            "gym", "workout", "fitness", "training", "yoga", "pilates",
            "crossfit", "run", "running", "cycling", "swim", "spin",
        ],
    },
    {
        emoji: "⚽",
        keywords: [
            "football", "soccer", "match", "league", "fixture", "kickoff",
            "tournament", "practice", "scrimmage", "derby",
        ],
    },
    {
        emoji: "🩺",
        keywords: [
            "doctor", "dentist", "medical", "clinic", "therapy", "hospital",
            "checkup", "check-up", "physio", "appointment with dr",
        ],
    },
    {
        emoji: "💳",
        keywords: [
            "bill", "payment", "invoice", "rent", "mortgage", "subscription",
            "renewal", "renew", "salary", "payday", "due",
        ],
    },
    {
        emoji: "🎵",
        keywords: [
            "concert", "gig", "festival", "band", "tour", "rehearsal",
            "choir", "recital", "open mic",
        ],
    },
    {
        emoji: "🍽️",
        keywords: [
            "dinner", "lunch", "brunch", "restaurant", "reservation",
            "coffee", "drinks", "date night",
        ],
    },
    {
        emoji: "🎉",
        keywords: ["party", "celebration", "wedding", "reception", "shower"],
    },
    {
        emoji: "🎬",
        keywords: ["movie", "cinema", "film", "screening", "premiere"],
    },
    { emoji: "⛪", keywords: ["church", "mass", "prayer", "worship", "service"] },
    {
        emoji: "🏠",
        keywords: [
            "cleaning", "chores", "laundry", "maintenance", "repair",
            "delivery", "viewing", "inspection",
        ],
    },
    {
        emoji: "👨‍👩‍👧",
        keywords: ["family", "kids", "parents", "playdate", "school run"],
    },
];

function titleCase(value: string): string {
    return value.replace(
        /\S+/g,
        (word) => word[0].toUpperCase() + word.slice(1).toLowerCase(),
    );
}

function cleanName(raw: string): string {
    return raw
        .replace(/\.[a-z0-9]{2,4}$/i, "") // stray file extension
        .replace(/[_\-]+/g, " ")
        .replace(/\bcalendar\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}

function hashIndex(value: string, mod: number): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash % mod;
}

/**
 * Pick a palette colour for a new imported board. Prefers a colour that no
 * existing category is using yet (stable per name among the free ones); once
 * every palette colour is taken it falls back to the least-used one.
 */
export function pickCategoryColor(
    name: string,
    usedColors: readonly string[] = [],
): string {
    const normalized = usedColors
        .map((color) => color.trim().toLowerCase())
        .filter(Boolean);
    const usedSet = new Set(normalized);

    const free = CATEGORY_COLORS.filter(
        (color) => !usedSet.has(color.toLowerCase()),
    );

    const start = hashIndex(name.toLowerCase(), CATEGORY_COLORS.length);

    if (free.length > 0) {
        return free[hashIndex(name.toLowerCase(), free.length)] ?? free[0];
    }

    const counts = new Map<string, number>();
    for (const color of normalized) {
        counts.set(color, (counts.get(color) ?? 0) + 1);
    }

    let best = CATEGORY_COLORS[start];
    let bestCount = Number.POSITIVE_INFINITY;
    for (let i = 0; i < CATEGORY_COLORS.length; i += 1) {
        const color = CATEGORY_COLORS[(start + i) % CATEGORY_COLORS.length];
        const count = counts.get(color.toLowerCase()) ?? 0;
        if (count < bestCount) {
            best = color;
            bestCount = count;
        }
    }
    return best;
}

function matchEmoji(text: string): string | null {
    const haystack = text.toLowerCase();
    for (const rule of EMOJI_RULES) {
        if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
            return rule.emoji;
        }
    }
    return null;
}

/** Most frequent meaningful word across the titles, if one clearly recurs. */
function recurringKeyword(titles: string[]): string | null {
    const counts = new Map<string, number>();

    for (const title of titles) {
        const seen = new Set<string>();
        for (const raw of title.toLowerCase().split(/[^a-z0-9']+/)) {
            const word = raw.replace(/'s$/, "").trim();
            if (word.length < 4 || STOP_WORDS.has(word)) continue;
            if (seen.has(word)) continue; // count each title once per word
            seen.add(word);
            counts.set(word, (counts.get(word) ?? 0) + 1);
        }
    }

    let best: string | null = null;
    let bestCount = 0;

    for (const [word, count] of counts) {
        if (count > bestCount) {
            best = word;
            bestCount = count;
        }
    }

    // Only trust it if it shows up in a meaningful share of the titles.
    const threshold = Math.max(2, Math.ceil(titles.length * 0.25));
    return bestCount >= threshold ? best : null;
}

export function deriveImportCategory(
    result: IcsParseResult,
    fileName: string,
    usedColors: readonly string[] = [],
): SuggestedCategory {
    const titles = result.events.map((event) => event.title);

    let name = "";

    const calendarName = result.calendar.name
        ? cleanName(result.calendar.name)
        : "";
    if (calendarName.length >= 2 && !GENERIC_NAME.test(calendarName)) {
        name = calendarName;
    }

    if (!name) {
        const keyword = recurringKeyword(titles);
        if (keyword) name = titleCase(keyword);
    }

    if (!name) {
        const fromFile = cleanName(fileName);
        if (fromFile.length >= 2 && !GENERIC_NAME.test(fromFile)) {
            name = titleCase(fromFile);
        }
    }

    if (!name) name = DEFAULT_NAME;
    if (name.length > MAX_NAME) name = name.slice(0, MAX_NAME).trim();

    // The name is the strongest signal; fall back to the wider text only when
    // the name alone doesn't match a rule.
    const wideText = [
        result.calendar.name ?? "",
        result.calendar.description ?? "",
        result.calendar.prodId ?? "",
        titles.slice(0, 40).join(" "),
    ].join(" ");

    const emoji = matchEmoji(name) ?? matchEmoji(wideText) ?? DEFAULT_EMOJI;
    const color = pickCategoryColor(name, usedColors);

    return { name, emoji, color };
}
