import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";

export function useDeleteCategory() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryId: string) =>
            deleteDoc(doc(db, `users/${user!.uid}/categories/${categoryId}`)),
    });
}

