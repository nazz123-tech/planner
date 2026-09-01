"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface DragTaskValue {
    /** Id of the task currently being dragged, or null. */
    draggingTaskId: string | null;
    setDraggingTaskId: (id: string | null) => void;
}

const DragTaskContext = createContext<DragTaskValue>({
    draggingTaskId: null,
    setDraggingTaskId: () => {},
});

export function DragTaskProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

    const value = useMemo(
        () => ({ draggingTaskId, setDraggingTaskId }),
        [draggingTaskId],
    );

    return (
        <DragTaskContext.Provider value={value}>
            {children}
        </DragTaskContext.Provider>
    );
}

/** Shared "a task is being dragged" signal. Safe to call without a provider. */
export function useDragTask() {
    return useContext(DragTaskContext);
}
