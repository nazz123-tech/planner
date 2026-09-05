"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useBoards } from "@/app/hooks/boards/useBoards";
import styles from "./BoardInfo.module.css";
import { EmptyState } from "../EmptyState/EmptyState";

export const BoardInfo = () => {
    const { boards } = useBoards();
    const reduceMotion = useReducedMotion();
    return (
        <div className={styles.boards}>
            <div className={styles.card}>
                <ul className={styles.list}>
                    <span className={styles.sectionLabel}>02 / Boards</span>

                    {boards.length === 0 && (
                        <li>
                            <EmptyState
                                icon="🗂️"
                                title="No boards yet"
                                hint="Group tasks and notes by creating a board."
                            />
                        </li>
                    )}

                    <AnimatePresence initial={false}>
                        {boards.map((board) => {
                            const percent = Math.round(
                                (board.progress ?? 0) * 100,
                            );
                            return (
                                <motion.li
                                    className={styles.item}
                                    key={board.id}
                                    layout
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    transition={{
                                        duration: 0.25,
                                        ease: "easeOut",
                                    }}
                                >
                                    <div className={styles.emojiBg}>
                                        <span className={styles.emoji}>
                                            {board.emoji}
                                        </span>
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <p className={styles.label}>
                                            {board.name}
                                        </p>
                                        <div className={styles.progressTrack}>
                                            {/* scaleX rather than width: a
                                                transform is composited, so
                                                the bar glides instead of
                                                forcing a layout pass on
                                                every frame of the spring. */}
                                            <motion.div
                                                className={styles.progressFill}
                                                initial={false}
                                                animate={{
                                                    scaleX: percent / 100,
                                                }}
                                                transition={
                                                    reduceMotion
                                                        ? { duration: 0 }
                                                        : {
                                                              type: "spring",
                                                              stiffness: 180,
                                                              damping: 24,
                                                          }
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.count}>
                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={`${board.taskDoneCount}/${board.taskCount}`}
                                                initial={{
                                                    opacity: 0,
                                                    y: -6,
                                                }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 6 }}
                                                transition={{ duration: 0.18 }}
                                            >
                                                {board.taskDoneCount}/
                                                {board.taskCount}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>
            </div>
        </div>
    );
};
