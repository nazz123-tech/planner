import type { Metadata } from "next";
import TaskPageClient from "./TaskPageClient";

export const metadata: Metadata = {
    title: "Task",
    description: "View and edit a single task.",
};

interface TaskPageProps {
    params: Promise<{ taskId: string }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
    const { taskId } = await params;
    return <TaskPageClient taskId={taskId} />;
}
