import type { Metadata } from "next";
import HabitsPageClient from "./HabitsPageClient";

export const metadata: Metadata = {
    title: "Habits",
    description: "Build routines and keep your streaks alive.",
};

export default function HabitsPage() {
    return <HabitsPageClient />;
}
