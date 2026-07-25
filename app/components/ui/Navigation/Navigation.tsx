"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
export const Navigation = () => {
  const pathname = usePathname();
  const NAV_ITEMS = [
    { href: "/", icon: "home", label: "Home" },
    { href: "/calendar", icon: "calendar", label: "Home" },
    { href: "/notes", icon: "notes", label: "Home" },
  ];
  return (
    <nav>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            href={item.href}
            // className={`${styles.item} ${isActive ? styles.active : ""}`}
          >
            {item.icon}
          </Link>
        );
      })}
    </nav>
  );
};
