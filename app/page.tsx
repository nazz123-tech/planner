"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useAuth } from "./hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <h2>Доброго ранку {user?.displayName}</h2>
    </>
  );
}
