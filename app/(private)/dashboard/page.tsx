"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../lib/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  return (
    <>
      <h2>Доброго ранку {user?.displayName}</h2>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}
