import { useMutation } from "@tanstack/react-query";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";

// Firestore allows 500 writes per batch; stay comfortably under.
const BATCH_LIMIT = 450;

/** Delete every doc in `path` whose categoryId matches, in batches. */
async function deleteByCategory(
    path: string,
    categoryId: string,
): Promise<number> {
    const snapshot = await getDocs(
        query(collection(db, path), where("categoryId", "==", categoryId)),
    );

    for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        for (const docSnap of snapshot.docs.slice(i, i + BATCH_LIMIT)) {
            batch.delete(docSnap.ref);
        }
        await batch.commit();
    }

    return snapshot.size;
}

/**
 * Deleting a board also deletes every task and note filed under it (cascade).
 * Returns how many of each were removed so the caller can report it.
 */
export function useDeleteCategory() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (categoryId: string) => {
            if (!user) throw new Error("Not authenticated");
            const base = `users/${user.uid}`;

            const [tasksRemoved, notesRemoved] = await Promise.all([
                deleteByCategory(`${base}/tasks`, categoryId),
                deleteByCategory(`${base}/notes`, categoryId),
            ]);

            await deleteDoc(doc(db, `${base}/categories/${categoryId}`));

            return { tasksRemoved, notesRemoved };
        },
    });
}

