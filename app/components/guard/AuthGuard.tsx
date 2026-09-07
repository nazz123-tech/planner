"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Loader } from "@/app/components/ui/Loader/Loader";
import { useT } from "@/app/i18n/LanguageProvider";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const t = useT();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push("/login");
    }, [user, loading, router]);

    if (loading) {
        return <Loader fullscreen label={t("loader.loadingPlanner")} />;
    }

    if (!user) {
        return <Loader fullscreen label={t("loader.redirecting")} />;
    }

    return <>{children}</>;
};
