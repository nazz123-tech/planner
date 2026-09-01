"use client";
import { signInWithGoogle } from "@/app/lib/auth";
import styles from "./GoogleAuth.module.css";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

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
            <FcGoogle width={20} height={30} /> Sign in using Google
        </button>
    );
};

