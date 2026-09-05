"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";

/**
 * Whether task reminder emails are on for the signed-in user.
 * Stored on `users/{uid}.remindersEnabled`; a missing doc or field means on,
 * so existing accounts keep working without a migration.
 */
export function useReminderSetting() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(
            doc(db, `users/${user.uid}`),
            (snapshot) => {
                queryClient.setQueryData(
                    ["reminderSetting", user.uid],
                    snapshot.data()?.remindersEnabled !== false,
                );
            },
        );

        return () => unsubscribe();
    }, [user, queryClient]);

    const query = useQuery({
        queryKey: ["reminderSetting", user?.uid],
        queryFn: () => true,
        enabled: !!user,
        staleTime: Infinity,
    });

    const mutation = useMutation({
        mutationFn: (enabled: boolean) =>
            setDoc(
                doc(db, `users/${user!.uid}`),
                { remindersEnabled: enabled },
                { merge: true },
            ),

        onMutate: async (enabled: boolean) => {
            const queryKey = ["reminderSetting", user?.uid];
            await queryClient.cancelQueries({ queryKey });
            const previous = queryClient.getQueryData<boolean>(queryKey);
            queryClient.setQueryData(queryKey, enabled);
            return { previous, queryKey };
        },

        onError: (_error, _enabled, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(context.queryKey, context.previous);
            }
        },
    });

    return {
        enabled: query.data ?? true,
        setEnabled: mutation.mutate,
        isSaving: mutation.isPending,
    };
}
