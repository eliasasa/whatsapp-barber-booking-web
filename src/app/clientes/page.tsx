"use client";

import { useCallback, useEffect, useState } from "react";
import ClientsList from "../../components/clients/ClientsList";
import { listClients } from "../../features/clients/api/listClients";
import type { Client } from "../../types/client";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await listClients();
      setClients(data);
    } catch {
      setErrorMessage("Não foi possível carregar os clientes agora.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Cadastro</p>
        <h1 className="mt-3 text-3xl font-semibold text-(--color-text-primary) sm:text-4xl">Clientes</h1>
        <p className="mt-2 text-sm text-(--color-text-secondary) sm:text-base">
          Cadastre, atualize e consulte o histórico de relacionamento de cada cliente.
        </p>
      </div>

      {errorMessage ? (
        <div className="mt-6 rounded-2xl border border-[rgba(216,81,81,0.35)] bg-[rgba(216,81,81,0.08)] p-5 text-sm text-(--color-status-busy)">
          {errorMessage}
        </div>
      ) : isLoading ? (
        <div className="mt-6 rounded-2xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 text-sm text-(--color-text-secondary)">
          Carregando clientes...
        </div>
      ) : (
        <ClientsList initialClients={clients} />
      )}
    </section>
  );
}
