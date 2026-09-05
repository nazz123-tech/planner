"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import css from "./Modal.module.css";

interface ModalProps {
    open: boolean;
    children: React.ReactNode;
    onClose: () => void;
}

/** Mobile tier (see globals.css): modal is presented as a bottom sheet. */
const SHEET_QUERY = "(max-width: 800px)";

export default function Modal({ open, children, onClose }: ModalProps) {
    const reduceMotion = useReducedMotion();
    const [isSheet, setIsSheet] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(SHEET_QUERY);
        const sync = () => setIsSheet(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className={css.backdrop}
                    role="dialog"
                    aria-modal="true"
                    onClick={handleBackdropClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    <motion.div
                        className={css.modal}
                        // A sheet slides up from the edge it's anchored to;
                        // scaling is a centred-dialog gesture and reads wrong.
                        initial={
                            reduceMotion
                                ? { opacity: 0 }
                                : isSheet
                                  ? { opacity: 1, y: "100%" }
                                  : { opacity: 0, scale: 0.92, y: 16 }
                        }
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={
                            reduceMotion
                                ? { opacity: 0 }
                                : isSheet
                                  ? { opacity: 1, y: "100%" }
                                  : { opacity: 0, scale: 0.96, y: 8 }
                        }
                        transition={
                            isSheet
                                ? { type: "spring", stiffness: 400, damping: 40 }
                                : { type: "spring", stiffness: 320, damping: 28 }
                        }
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
