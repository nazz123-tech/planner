"use client";
import { signInWithGoogle } from "@/app/lib/auth";
import { useRouter } from "next/navigation";

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
    <button type="button" onClick={handleClick}>
      Google
    </button>
  );
};
