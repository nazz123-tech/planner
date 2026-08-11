import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { Note } from "@/app/types/note";

export function useCreateNote() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (note: Omit<Note, "id">) =>
            addDoc(collection(db, `users/${user!.uid}/notes`), {
                ...note,
                createdAt: serverTimestamp(),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes", user?.uid] });
        },
    });
}

