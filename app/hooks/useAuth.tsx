"use client";
import { useContext } from "react";
import { AuthContext } from "../components/context/AuthContext";
import { useRouter } from "next/navigation";
export function useAuth() {
  const context = useContext(AuthContext);
  const router = useRouter();
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
