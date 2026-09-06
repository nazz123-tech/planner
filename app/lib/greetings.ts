import type { TranslationKey } from "@/app/i18n/dictionaries/en";

export type Period = "morning" | "day" | "evening" | "night";

export type TaskSummary = {
  total: number;
  done: number;
};

export type Translate = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

/**
 * Keys rather than sentences: the wording lives in the dictionaries, so the
 * seeded pick below still resolves to the same line in every language.
 */
const GREETING_KEYS: Record<Period, TranslationKey[]> = {
  morning: ["greeting.morning.1", "greeting.morning.2", "greeting.morning.3"],
  day: ["greeting.day.1", "greeting.day.2", "greeting.day.3"],
  evening: ["greeting.evening.1", "greeting.evening.2", "greeting.evening.3"],
  night: ["greeting.night.1", "greeting.night.2", "greeting.night.3"],
};

export function periodByHour(hour: number): Period {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "day";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
}

/** Tiny string hash so a given seed always resolves to the same option. */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Seeded rather than random: Math.random() during render produced a different
 * greeting on the server than on the client, which is a hydration mismatch.
 * Callers vary `seed` when they want a fresh line.
 */
export function pickBySeed<T>(arr: T[], seed: string): T {
  return arr[hashSeed(seed) % arr.length];
}

export function getGreeting(
  t: Translate,
  hour: number,
  name: string,
  seed = "",
): string {
  const period = periodByHour(hour);
  // Seed on the period and name only, so switching language re-renders the
  // same greeting translated rather than jumping to a different one.
  const key = pickBySeed(GREETING_KEYS[period], `${period}|${name}|${seed}`);
  return t(key, { name });
}

export function getSubtext(t: Translate, { total, done }: TaskSummary): string {
  if (total === 0) {
    return t("greeting.subtext.none");
  }
  if (done === total) {
    return t("greeting.subtext.allDone");
  }
  const remaining = total - done;
  if (remaining <= 2) {
    return t("greeting.subtext.light", { count: remaining });
  }
  return t("greeting.subtext.busy", { count: remaining });
}
