"use client";
import { BoardCard } from "@/app/components/ui/BoardCard/BoardCard";
import { useBoards } from "@/app/hooks/boards/useBoards";
import styles from "./page.module.css";

export default function Boards() {
    const { boards } = useBoards();
    return (
        <div className={styles.container}>
            <div>
                <div>
                    <h3>Boards</h3>
                    <p>Tasks and notes are grouped by categories</p>
                </div>
                <button>New board</button>
            </div>
            <div>
                {boards.map((board) => (
                    <BoardCard key={board.id} {...board} />
                ))}
            </div>
        </div>
    );
}

