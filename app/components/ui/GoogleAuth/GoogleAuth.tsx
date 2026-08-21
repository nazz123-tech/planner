"use client";
import { signInWithGoogle } from "@/app/lib/auth";
import styles from "./GoogleAuth.module.css";
import { useRouter } from "next/navigation";
import Icon from "../Icon/Icon";

export const GoogleAuth = () => {
    const router = useRouter();

    const handleClick = async () => {
        try {
            await signInWithGoogle();
            router.push("/");
        } catch (error) {
            console.error("Google sign-in failed:", error);
        }
    };

    return (
        <button className={styles.button} type="button" onClick={handleClick}>
            <Icon name="google" className={styles.icon} size={24} />
            Sign in using Google
        </button>
    );
};

