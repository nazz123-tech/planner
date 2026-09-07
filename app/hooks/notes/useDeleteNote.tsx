import { useMutation } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";

export function useDeleteNote() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: (noteId: string) =>
            deleteDoc(doc(db, `users/${user!.uid}/notes/${noteId}`)),
    });
}
