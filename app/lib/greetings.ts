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

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getGreeting(hour: number, name: string): string {
  const period = periodByHour(hour);
  return pickRandom(GREETINGS_BY_PERIOD[period](name));
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