"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NavItem, { NavItemProps } from "./NavItem";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const items: NavItemProps[] = [
        { url: "/servicos", label: "Serviços" },
        { url: "/agendamentos", label: "Agenda" },
        { url: "/clientes", label: "Clientes" },
        { url: "/configuracoes", label: "Configurações" },
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-[#2a2a2a] bg-[#1e1e1e]/85 backdrop-blur-md">
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                <Link
                    href="/"
                    className="rounded-lg p-1 transition-colors duration-300 hover:bg-[#2a2a2a]/60"
                    onClick={() => setIsOpen(false)}
                >
                    <Image
                        src="/assets/icons/Logo.svg"
                        width={150}
                        height={50}
                        alt="Logo"
                        className="h-full w-32 object-cover md:w-36"
                    />
                </Link>

                <ul className="hidden list-none items-center gap-1 rounded-xl border border-[#2a2a2a] bg-[#121212]/35 p-1 md:flex">
                    {items.map((item) => (
                        <NavItem key={item.url} url={item.url} label={item.label} />
                    ))}
                </ul>

                <div className="hidden md:block">
                    <Button size="sm" rightIcon={<span>{">"}</span>}>
                        Novo agendamento
                    </Button>
                </div>

                <button
                    type="button"
                    aria-label="Abrir menu"
                    aria-expanded={isOpen}
                    aria-controls="navbar-mobile-menu"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#121212] text-[#eaeaea] transition-colors hover:border-[#d4af37]/60 hover:text-[#d4af37] md:hidden"
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    <span className="sr-only">Menu</span>
                    <span className="relative block h-4 w-5">
                        <span
                            className={[
                                "absolute left-0 top-0 h-0.5 w-5 bg-current transition-all duration-300",
                                isOpen ? "translate-y-1.5 rotate-45" : "",
                            ].join(" ")}
                        />
                        <span
                            className={[
                                "absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-all duration-300",
                                isOpen ? "opacity-0" : "",
                            ].join(" ")}
                        />
                        <span
                            className={[
                                "absolute left-0 top-3 h-0.5 w-5 bg-current transition-all duration-300",
                                isOpen ? "-translate-y-1.5 -rotate-45" : "",
                            ].join(" ")}
                        />
                    </span>
                </button>
            </nav>

            <div
                id="navbar-mobile-menu"
                className={[
                    "overflow-hidden border-t border-[#2a2a2a] bg-[#1e1e1e] transition-all duration-300 md:hidden",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                ].join(" ")}
            >
                <div className="px-4 py-3">
                    <ul className="list-none space-y-2">
                        {items.map((item) => (
                            <NavItem
                                key={`mobile-${item.url}`}
                                url={item.url}
                                label={item.label}
                                mobile
                                onNavigate={() => setIsOpen(false)}
                            />
                        ))}
                    </ul>

                    <div className="mt-3">
                        <Button fullWidth rightIcon={<span>{">"}</span>} onClick={() => setIsOpen(false)}>
                            Novo agendamento
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
