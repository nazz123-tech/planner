"use client";
import { BoardCard } from "@/app/components/ui/BoardCard/BoardCard";
import { useState } from "react";
import { useBoards } from "@/app/hooks/boards/useBoards";
import { Plus } from "lucide-react";
import Modal from "@/app/components/ui/Modal/Modal";
import styles from "./page.module.css";
import { BoardForm } from "@/app/components/forms/BoardForm/BoardForm";

export default function Boards() {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
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
                <button
                    onClick={() => setModalOpen(true)}
                    className={styles.createBoardBtn}
                >
                    <Plus /> <span className={styles.btnText}>New board</span>
                </button>
            </div>
            <div className={styles.grid}>
                {boards.map((board) => (
                    <BoardCard key={board.id} {...board} />
                ))}
            </div>
            {modalOpen && (
                <Modal onClose={() => setModalOpen(false)}>
                    <BoardForm
                        onCancel={() => setModalOpen(false)}
                        onSuccess={() => setModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}

