"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { CalendarSubscription } from "@/app/types/subscription";

/** Live list of the calendars this user subscribed to. */
export function useSubscriptions() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(
            collection(db, `users/${user.uid}/calendarSubscriptions`),
            (snapshot) => {
                const subs = snapshot.docs.map(
                    (d) =>
                        ({ id: d.id, ...d.data() }) as CalendarSubscription,
                );
                queryClient.setQueryData(
                    ["calendarSubscriptions", user.uid],
                    subs,
                );
            },
        );

        return () => unsubscribe();
    }, [user, queryClient]);

    return useQuery({
        queryKey: ["calendarSubscriptions", user?.uid],
        queryFn: () => [] as CalendarSubscription[],
        enabled: !!user,
        staleTime: Infinity,
    });
}
