import type { Metadata } from "next";
import CalendarPageClient from "./CalendarPageClient";

export const metadata: Metadata = {
    title: "Calendar",
    description: "Plan tasks and notes across a continuous calendar.",
};

export default function CalendarPage() {
    return <CalendarPageClient />;
}
