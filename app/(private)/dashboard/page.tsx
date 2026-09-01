import type { Metadata } from "next";
import DashboardPageClient from "./DashboardPageClient";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Your day at a glance — today's tasks, boards and habits.",
};

export default function DashboardPage() {
    return <DashboardPageClient />;
}
