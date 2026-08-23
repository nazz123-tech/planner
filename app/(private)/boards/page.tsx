"use client";
import { BoardCard } from "@/app/components/ui/BoardCard/BoardCard";
import { useBoards } from "@/app/hooks/boards/useBoards";
import styles from "./page.module.css";

export default function Boards() {
    const { boards } = useBoards();
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h3 className={styles.title}>Boards</h3>
                    <p className={styles.subtext}>
                        Tasks and notes are grouped by categories
                    </p>
                </div>
                <button className={styles.createBoardBtn}>New board</button>
            </div>
            <div className={styles.grid}>
                {boards.map((board) => (
                    <BoardCard key={board.id} {...board} />
                ))}
            </div>
        </div>
    );
}
