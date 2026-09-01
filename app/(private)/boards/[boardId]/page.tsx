import type { Metadata } from "next";
import BoardDetailPageClient from "./BoardDetailPageClient";

export const metadata: Metadata = {
    title: "Board",
    description: "Tasks and notes for a single board.",
};

interface BoardPageProps {
    params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
    const { boardId } = await params;
    return <BoardDetailPageClient boardId={boardId} />;
}
