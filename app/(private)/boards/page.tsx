import type { Metadata } from "next";
import BoardsPageClient from "./BoardsPageClient";

export const metadata: Metadata = {
    title: "Boards",
    description: "Your tasks and notes grouped into boards.",
};

export default function BoardsPage() {
    return <BoardsPageClient />;
}
