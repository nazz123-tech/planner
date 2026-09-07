import { useMutation } from "@tanstack/react-query";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { Category } from "@/app/types/category";

export function useCreateCategory() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: (category: Omit<Category, "id">) =>
            addDoc(collection(db, `users/${user!.uid}/categories`), {
                ...category,
                createdAt: serverTimestamp(),
            }),
    });
}

