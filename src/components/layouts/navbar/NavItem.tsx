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
                    "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]",
                    mobile ? "w-full" : "whitespace-nowrap",
                    isActive
                        ? "bg-[#d4af37]/15 text-[#d4af37] ring-1 ring-[#d4af37]/30"
                        : "text-[#b0b0b0] hover:bg-[#2a2a2a] hover:text-[#eaeaea]",
                ].join(" ")}
            >
                {label}
            </Link>
        </li>
    );
}