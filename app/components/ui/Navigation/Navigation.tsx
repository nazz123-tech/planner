"use client";

import {
    LayoutDashboard,
    Calendar,
    Kanban,
    CheckSquare,
    Plus,
    Trash2,
    LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Logo } from "../Logo/Logo";
import { logout } from "@/app/lib/auth";
import { useDragTask } from "@/app/components/context/DragTaskContext";
import { useDeleteTask } from "@/app/hooks/tasks/useDeleteTask";
import styles from "./Navigation.module.css";
import { useLayoutEffect, useRef, useState } from "react";
import Modal from "../Modal/Modal";
import { CreateForm } from "../../forms/CreateForm/CreateForm";
import { ReminderToggle } from "../ReminderToggle/ReminderToggle";

export const Navigation = () => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [dropHover, setDropHover] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { draggingTaskId, setDraggingTaskId } = useDragTask();
    const { mutate: deleteTask } = useDeleteTask();
    const isDeleteMode = draggingTaskId !== null;

    const handleTaskDrop = (event: React.DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const taskId =
            event.dataTransfer.getData("text/plain") || draggingTaskId;
        setDropHover(false);
        setDraggingTaskId(null);
        if (!taskId) return;
        deleteTask(taskId, {
            onSuccess: () => toast.success("Task deleted"),
            onError: () => toast.error("Couldn’t delete the task"),
        });
    };

    const NAV_ITEMS = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/calendar", icon: Calendar, label: "Calendar" },
        { href: "/boards", icon: Kanban, label: "Boards" },
        { href: "/habits", icon: CheckSquare, label: "Habits" },
    ];

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const fabSlotRef = useRef<HTMLDivElement>(null);

    // Design width of the pill, and the fallback before the first measure.
    const DESIGN_W = 1170;
    const H = 70;
    const R = H / 2;
    const fabD = 80;
    const fabR = fabD / 2;

    /* The pill is drawn with preserveAspectRatio="none", so a fixed viewBox
       width gets squashed horizontally as the nav narrows. That squashed the
       FAB's notch into an ellipse — and below roughly 890px the notch came
       out narrower than the 56px button, so the pill's border cut across it.
       Tracking the measured width keeps one viewBox unit at one CSS pixel
       across, so the notch keeps the button's shape at every size. */
    const [navW, setNavW] = useState(DESIGN_W);
    const [fabCx, setFabCx] = useState(DESIGN_W / 2);

    useLayoutEffect(() => {
        const measure = () => {
            const container = containerRef.current;
            const slot = fabSlotRef.current;
            if (!container || !slot) return;

            const containerRect = container.getBoundingClientRect();
            const slotRect = slot.getBoundingClientRect();
            if (!containerRect.width) return;

            // Both in CSS pixels; the viewBox now uses the same scale.
            setNavW(containerRect.width);
            setFabCx(slotRect.left + slotRect.width / 2 - containerRect.left);
        };

        measure();

        const observer = new ResizeObserver(measure);
        if (containerRef.current) observer.observe(containerRef.current);
        window.addEventListener("resize", measure);
        document.fonts?.ready.then(measure).catch(() => {});

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, []);

    const overlapRatio = 0.3;
    const h = overlapRatio * fabD;
    const cy = H - fabR + h;

    const dy = Math.abs(H - cy);
    const dx = Math.sqrt(Math.max(fabR * fabR - dy * dy, 0));

    const clampedCx = Math.min(Math.max(fabCx, R + dx), navW - R - dx);
    const leftX = clampedCx - dx;
    const rightX = clampedCx + dx;
    const largeArc = overlapRatio > 0.5 ? 1 : 0;

    const svgPath = `
        M ${R} 0
        H ${navW - R}
        A ${R} ${R} 0 0 1 ${navW} ${R}
        V ${H - R}
        A ${R} ${R} 0 0 1 ${navW - R} ${H}
        H ${rightX}
        A ${fabR} ${fabR} 0 ${largeArc} 0 ${leftX} ${H}
        H ${R}
        A ${R} ${R} 0 0 1 0 ${H - R}
        V ${R}
        A ${R} ${R} 0 0 1 ${R} 0
        Z
    `;

    return (
        <div className={styles.container} ref={containerRef}>
            <svg
                className={styles.svgBackground}
                viewBox={`0 0 ${navW} ${H}`}
                preserveAspectRatio="none"
            >
                <path
                    d={svgPath}
                    fill="var(--card-background)"
                    stroke="var(--border)"
                    strokeWidth="1"
                />
            </svg>
            <div className={styles.brand}>
                <Logo />
            </div>
            <nav className={styles.navbar}>
                {NAV_ITEMS.map((item, index) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.label}
                            className={styles.navItemWrap}
                        >
                            {index === 2 && (
                                <div
                                    className={styles.fabSlot}
                                    ref={fabSlotRef}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isDeleteMode) {
                                                setModalOpen(true);
                                            }
                                        }}
                                        className={`${styles.fab} ${
                                            isDeleteMode ? styles.fabDelete : ""
                                        } ${
                                            dropHover ? styles.fabDeleteOver : ""
                                        }`}
                                        aria-label={
                                            isDeleteMode
                                                ? "Drop a task here to delete it"
                                                : "Add item"
                                        }
                                        onDragOver={(event) => {
                                            if (!isDeleteMode) return;
                                            event.preventDefault();
                                            event.dataTransfer.dropEffect =
                                                "move";
                                        }}
                                        onDragEnter={(event) => {
                                            if (!isDeleteMode) return;
                                            event.preventDefault();
                                            setDropHover(true);
                                        }}
                                        onDragLeave={() => setDropHover(false)}
                                        onDrop={handleTaskDrop}
                                    >
                                        {isDeleteMode ? (
                                            <Trash2 size={24} />
                                        ) : (
                                            <Plus size={24} />
                                        )}
                                    </button>
                                </div>
                            )}

                            <Link
                                href={item.href}
                                className={`${styles.item} ${isActive ? styles.active : ""}`}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="navHighlight"
                                        className={styles.highlight}
                                        transition={{
                                            type: "spring",
                                            stiffness: 420,
                                            damping: 34,
                                        }}
                                    />
                                )}
                                <Icon size={18} className={styles.icon} />
                                <span className={styles.itemLabel}>
                                    {item.label}
                                </span>
                            </Link>
                        </div>
                    );
                })}
            </nav>
            {/* Grouped so .container keeps three flex children — the FAB
                position is measured from this layout. */}
            <div className={styles.rightGroup}>
                <ReminderToggle />
                <button className={styles.button} onClick={handleLogout}>
                    <LogOut />
                    Logout
                </button>
            </div>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <CreateForm
                    onSuccess={() => setModalOpen(false)}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

