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
        <header className="sticky top-0 z-40 px-2 pt-2 sm:px-4 sm:pt-3">
            <nav className="container-shell surface-panel flex items-center justify-between px-3 py-3 md:px-5">
                <Link
                    href="/"
                    className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-1 transition-all duration-300 hover:border-[var(--color-border-soft)] hover:bg-[var(--color-bg-soft)]/40"
                    onClick={() => setIsOpen(false)}
                >
                    <Image
                        src="/assets/icons/Logo.svg"
                        width={150}
                        height={50}
                        alt="Logo"
                        className="h-full w-28 object-contain md:w-32"
                    />

                    <div className="hidden sm:block">
                        <p className="text-[0.68rem] font-bold tracking-[0.2em] text-[var(--color-accent)]">PAINEL</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Operação da barbearia</p>
                    </div>
                </Link>

                <ul className="hidden list-none items-center gap-1 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-dark)]/60 p-1 md:flex">
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
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-dark)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent)]/60 hover:text-[var(--color-accent)] md:hidden"
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
                    "container-shell overflow-hidden rounded-b-[var(--radius-xl)] border-x border-b border-[var(--color-border-soft)] bg-[var(--color-bg-card)] transition-all duration-300 md:hidden",
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
