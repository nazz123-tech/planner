"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "../Icon/Icon";
import { Logo } from "../Logo/Logo";
import { logout } from "@/app/lib/auth";
import styles from "./Navigation.module.css";

export const Navigation = () => {
    const pathname = usePathname();
    const router = useRouter();

    const NAV_ITEMS = [
        { href: "/dashboard", icon: "home", label: "Home" },
        { href: "/calendar", icon: "calendar", label: "Calendar" },
        { href: "/boards", icon: "note", label: "Boards" },
        { href: "/habits", icon: "user", label: "Habits" },
    ];

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    const W = 1170;
    const H = 76;
    const R = H / 2;
    const fabD = 80;
    const fabR = fabD / 2;
    const fabCx = W / 2;

    const overlapRatio = 0.3;
    const h = overlapRatio * fabD;
    const cy = H - fabR + h;

    const dy = Math.abs(H - cy);
    const dx = Math.sqrt(Math.max(fabR * fabR - dy * dy, 0));

    const leftX = fabCx - dx;
    const rightX = fabCx + dx;
    const largeArc = overlapRatio > 0.5 ? 1 : 0;

    const svgPath = `
        M ${R} 0
        H ${W - R}
        A ${R} ${R} 0 0 1 ${W} ${R}
        V ${H - R}
        A ${R} ${R} 0 0 1 ${W - R} ${H}
        H ${rightX}
        A ${fabR} ${fabR} 0 ${largeArc} 0 ${leftX} ${H}
        H ${R}
        A ${R} ${R} 0 0 1 0 ${H - R}
        V ${R}
        A ${R} ${R} 0 0 1 ${R} 0
        Z
    `;

    return (
        <div className={styles.container}>
            <svg
                className={styles.svgBackground}
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
            >
                <path
                    d={svgPath}
                    fill="var(--card-background)"
                    stroke="var(--border)"
                    strokeWidth="1"
                />
            </svg>
            <Logo />
            <nav className={styles.navbar}>
                {NAV_ITEMS.map((item, index) => {
                    const isActive = pathname === item.href;

                    return (
                        <div
                            key={item.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                            }}
                        >
                            {index === 2 && (
                                <div className={styles.fabSpacer} />
                            )}

                            <Link
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
                        </div>
                    );
                })}
            </nav>
            <button className={styles.fab} aria-label="Add item">
                <Icon name="add" size={24} />
            </button>
            <button className={styles.button} onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

