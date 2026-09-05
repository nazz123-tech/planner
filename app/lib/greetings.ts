export type Period = "morning" | "day" | "evening" | "night";

export type TaskSummary = {
  total: number;
  done: number;
};

const GREETINGS_BY_PERIOD: Record<Period, (name: string) => string[]> = {
  morning: (name) => [
    `Good morning, ${name}.`,
    `Have a great day, ${name}.`,
    `Up before your tasks, ${name}.`,
  ],
  day: (name) => [
    `Good day, ${name}.`,
    `Let's keep going, ${name}.`,
    `Halfway through the day, ${name}.`,
  ],
  evening: (name) => [
    `Good evening, ${name}.`,
    `Have a nice evening, ${name}.`,
    `The day's almost done, ${name}.`,
  ],
  night: (name) => [
    `Can't sleep, ${name}?`,
    `It's late, ${name}.`,
    `Quiet out there tonight, ${name}.`,
  ],
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

export function getGreeting(hour: number, name: string, seed = ""): string {
  const period = periodByHour(hour);
  return pickBySeed(GREETINGS_BY_PERIOD[period](name), `${period}|${name}|${seed}`);
}

export function getSubtext({ total, done }: TaskSummary): string {
  if (total === 0) {
    return "Nothing planned for today — take a breather.";
  }
  if (done === total) {
    return "All done. Nice work.";
  }
  const remaining = total - done;
  if (remaining <= 2) {
    return `Light day — just ${remaining} tasks left.`;
  }
  return `Busy day — ${remaining} tasks ahead.`;
}