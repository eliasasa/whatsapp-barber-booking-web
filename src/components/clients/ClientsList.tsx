"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listClients } from "../../features/clients/api/listClients";
import { Client } from "../../types/client";
import { Button } from "../ui/Button";

function Initials({ name }: { name?: string }) {
  const initials = (name || "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-[var(--color-accent)] font-semibold">
      {initials || "?"}
    </div>
  );
}

export default function ClientsList() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    listClients()
      .then((data) => {
        if (mounted) setClients(data || []);
      })
      .catch(() => {
        if (mounted) setClients([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      clients.filter((c) => {
        if (!q) return true;
        return (
          (c.name || "").toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q)
        );
      }),
    [clients, q]
  );

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-6 max-w-2xl">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone"
            className="w-full pl-10 pr-12 py-3 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>
        <Button variant="outline" onClick={() => router.push('/clientes/novo')}>Novo cliente</Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((client) => (
          <div key={client.id} className="surface-card p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Initials name={client.name} />
              <div>
                <div className="font-semibold">{client.name}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">{client.phone || '—'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push(`/clientes/${client.id}/editar`)}>
                Editar
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-6 rounded-xl border border-dashed border-[var(--color-border-soft)] text-center text-[var(--color-text-secondary)]">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
