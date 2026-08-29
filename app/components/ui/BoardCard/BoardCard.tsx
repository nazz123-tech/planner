import { Bowlby_One } from "next/font/google";
import styles from "./BoardCard.module.css";
interface BoardCardProps {
    id: string;
    name: string;
    emoji: string;
    taskDoneCount: number;
    taskCount: number;
    noteCount: number;
    progress: number;
}
export const BoardCard = (board: BoardCardProps) => {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.emojiWrapper}>
                    <span className={styles.emoji}>{board.emoji}</span>
                </div>
                <div className={styles.headerRight}>
                    {board.taskCount > 0 && (
                        <div className={styles.badge}>{board.taskCount}</div>
                    )}

                    {board.noteCount > 0 && (
                        <div className={styles.badge}>{board.noteCount}</div>
                    )}
                </div>
            </div>

            <div className={styles.info}>
                <h2 className={styles.cardName}>{board.name}</h2>
                <div className={styles.textBlock}>
                    <p className={styles.subtext}>
                        {board.taskDoneCount} of {board.taskCount} tasks
                    </p>
                    {board.noteCount > 0 && (
                        <p className={styles.subtext}>
                            ● {board.noteCount}{" "}
                            {board.noteCount > 1 ? "notes" : "note"}
                        </p>
                    )}
                </div>
            </div>
            <progress className={styles.progress} value={board.progress} />
        </div>
    );
};

