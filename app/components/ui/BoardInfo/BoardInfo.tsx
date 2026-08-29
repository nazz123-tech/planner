"use client";
import { useBoards } from "@/app/hooks/boards/useBoards";
import styles from "./BoardInfo.module.css";
import { style } from "framer-motion/client";

export const BoardInfo = () => {
    const { boards } = useBoards();
    return (
        <div className={styles.boards}>
            <div className={styles.card}>
                <ul className={styles.list}>
                    {boards.length > 0 && (
                        <span className={styles.sectionLabel}>02 / Boards</span>
                    )}
                    {boards.length > 0 ? (
                        boards.map((board) => (
                            <li className={styles.item} key={board.id}>
                                <div className={styles.emojiBg}>
                                    <span className={styles.emoji}>
                                        {board.emoji}
                                    </span>
                                </div>
                                <div className={styles.itemInfo}>
                                    <p className={styles.label}>{board.name}</p>
                                    <progress
                                        className={styles.progress}
                                        value={board.progress}
                                    />
                                </div>
                                <div className={styles.count}>
                                    <span>
                                        {board.taskDoneCount}/{board.taskCount}
                                    </span>
                                </div>
                            </li>
                        ))
                    ) : (
                        <></>
                    )}
                </ul>
            </div>
        </div>
    );
};

