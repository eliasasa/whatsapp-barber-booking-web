"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Client } from "../../types/client";
import { Button } from "../ui/Button";
import { useToast } from "../ui/toast";
import { blockClient, unblockClient, deleteClient } from "@/features/clients";

type ClientsListProps = {
  initialClients: Client[];
};

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

export default function ClientsList({ initialClients }: ClientsListProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleToggleBlock(client: Client) {
    const isBlocked = client.botDisabled ?? false;
    const clientLabel = client.name?.trim() || client.phone?.trim() || "este cliente";

    try {
      setBlockingId(client.id);
      if (isBlocked) {
        await unblockClient(client.id);
      } else {
        await blockClient(client.id);
      }

      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, botDisabled: !isBlocked } : c
        )
      );

      addToast({
        title: isBlocked ? "Cliente desbloqueado" : "Cliente bloqueado",
        description: isBlocked
          ? `${clientLabel} pode receber mensagens novamente.`
          : `${clientLabel} não receberá mais mensagens do bot.`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Erro ao atualizar bloqueio",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setBlockingId(null);
    }
  }

  async function handleDelete(client: Client) {
    const ok = window.confirm(`Excluir ${client.name || client.phone || 'este cliente'}? Esta ação é irreversível.`);
    if (!ok) return;

    try {
      setDeletingId(client.id);
      await deleteClient(client.id);
      setClients((prev) => prev.filter((c) => c.id !== client.id));
      addToast({ title: "Cliente excluído", description: `${client.name || client.phone || 'Cliente'} removido.`, type: "success" });
    } catch {
      addToast({ title: "Erro ao excluir", description: "Tente novamente em instantes.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-(--color-border-soft) bg-(--color-bg-card)/80 p-4 shadow-[0_18px_40px_rgba(7,9,14,0.18)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full sm:max-w-xl">
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary)" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone"
            className="w-full rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark) py-3 pl-10 pr-4 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent)"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        <Button rightIcon={<span>{">"}</span>} onClick={() => router.push('/clientes/novo')}>Novo cliente </Button>
      </div>

      <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((client) => {
          const isBlocked = client.botDisabled ?? false;
          return (
            <div key={client.id} className="surface-card p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Initials name={client.name} />
                <div className="flex-1">
                  <div className="font-semibold">{client.name}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{client.phone || '—'}</div>
                </div>
                {isBlocked && (
                  <span className="inline-flex items-center rounded-full bg-[var(--color-status-busy)]/15 px-2 py-1 text-xs font-semibold text-[var(--color-status-busy)]">
                    Bloqueado
                  </span>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/clientes/${client.id}/editar`)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  variant={isBlocked ? "outline" : "subtle"}
                  size="sm"
                  onClick={() => handleToggleBlock(client)}
                  disabled={blockingId !== null}
                  isLoading={blockingId === client.id}
                  className="flex-1"
                >
                  {isBlocked ? "Desbloquear" : "Bloquear"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(client)}
                  disabled={deletingId !== null || blockingId !== null}
                  isLoading={deletingId === client.id}
                  className="flex-1"
                >
                  Excluir
                </Button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-6 rounded-xl border border-dashed border-[var(--color-border-soft)] text-center text-[var(--color-text-secondary)]">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
