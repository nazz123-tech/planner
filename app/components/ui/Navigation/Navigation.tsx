"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import Icon from "../Icon/Icon";
import styles from "./Navigation.module.css";
import { useRouter } from "next/navigation";
import { logout } from "@/app/lib/auth";

export const Navigation = () => {
    const pathname = usePathname();
    const router = useRouter();

    const NAV_ITEMS = [
        { href: "/dashboard", icon: "home", label: "Home" },
        { href: "/calendar", icon: "calendar", label: "Calendar" },
        { href: "/notes", icon: "note", label: "Notes" },
        { href: "/profile", icon: "user", label: "Profile" },
    ];

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <div className={`${styles.container}`}>
            <span>Planly</span>
            <nav className={styles.navbar}>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`${styles.item} ${isActive ? styles.active : ""}`}
                        >
                            <Icon
                                name={item.icon}
                                className={styles.icon}
                                size={30}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <button className={styles.button} onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};
