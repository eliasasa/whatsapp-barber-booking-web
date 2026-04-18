"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItemProps {
    label: string;
    url: string;
    mobile?: boolean;
    onNavigate?: () => void;
}

export default function NavItem({ label, url, mobile = false, onNavigate }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === url;

    return (
        <li>
            <Link
                href={url}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={[
                    "inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium tracking-[0.01em] transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)]",
                    mobile ? "w-full" : "whitespace-nowrap",
                    isActive
                        ? "bg-[var(--color-accent)]/16 text-[var(--color-accent-hover)] ring-1 ring-[var(--color-accent)]/30"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text-primary)]",
                ].join(" ")}
            >
                {label}
            </Link>
        </li>
    );
}