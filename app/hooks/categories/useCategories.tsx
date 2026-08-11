import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { Category } from "@/app/types/category";

export function useCategories() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(
            collection(db, `users/${user.uid}/categories`),
            (snapshot) => {
                const categories = snapshot.docs.map(
                    (d) => ({ id: d.id, ...d.data() }) as Category,
                );
                queryClient.setQueryData(["categories", user.uid], categories);
            },
        );

        return () => unsubscribe();
    }, [user, queryClient]);

    return useQuery({
        queryKey: ["categories", user?.uid],
        queryFn: () => [] as Category[],
        enabled: !!user,
        staleTime: Infinity,
    });
}

