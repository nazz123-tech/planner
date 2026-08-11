import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { Note } from "@/app/types/note";

export function useNotes() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(
            collection(db, `users/${user.uid}/notes`),
            (snapshot) => {
                const notes = snapshot.docs.map(
                    (d) => ({ id: d.id, ...d.data() }) as Note,
                );
                queryClient.setQueryData(["notes", user.uid], notes);
            },
        );

        return () => unsubscribe();
    }, [user, queryClient]);

    return useQuery({
        queryKey: ["notes", user?.uid],
        queryFn: () => [] as Note[],
        enabled: !!user,
        staleTime: Infinity,
    });
}
