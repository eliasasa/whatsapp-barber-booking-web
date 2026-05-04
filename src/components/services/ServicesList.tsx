"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { deleteService, listServices, pauseService } from "@/features/services";
import type { Service } from "@/types/service";

function formatCurrency(value: number | null) {
  if (value === null) return "Sob consulta";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ServicesList() {
  const router = useRouter();
  const { addToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutatingId, setIsMutatingId] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await listServices();
      setServices(data || []);
    } catch {
      setServices([]);
      addToast({
        title: "Falha ao carregar serviços",
        description: "Não foi possível consultar a lista agora.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      services.filter((service) => {
        if (!q) return true;

        return (
          service.name.toLowerCase().includes(q) ||
          String(service.duration).includes(q) ||
          formatCurrency(service.price).toLowerCase().includes(q)
        );
      }),
    [services, q],
  );

  async function handlePause(service: Service) {
    try {
      setIsMutatingId(service.id);
      const updated = await pauseService(service.id, !Boolean(service.paused));

      setServices((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );

      addToast({
        title: updated.paused ? "Serviço pausado" : "Serviço reativado",
        description: `${updated.name} foi atualizado com sucesso.`,
        type: "success",
      });
    } catch (caughtError) {
      addToast({
        title: "Não foi possível atualizar",
        description: caughtError instanceof Error ? caughtError.message : "Tente novamente.",
        type: "error",
      });
    } finally {
      setIsMutatingId(null);
    }
  }

  async function handleDelete(service: Service) {
    const confirmed = window.confirm(`Apagar o serviço "${service.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setIsMutatingId(service.id);
      await deleteService(service.id);
      setServices((current) => current.filter((item) => item.id !== service.id));
      addToast({
        title: "Serviço apagado",
        description: `${service.name} foi removido da lista.`,
        type: "success",
      });
    } catch (caughtError) {
      addToast({
        title: "Falha ao apagar",
        description: caughtError instanceof Error ? caughtError.message : "Tente novamente.",
        type: "error",
      });
    } finally {
      setIsMutatingId(null);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-(--color-border-soft) bg-(--color-bg-card)/80 p-4 shadow-[0_18px_40px_rgba(7,9,14,0.18)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full sm:max-w-xl">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, duração ou preço"
            className="w-full rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark) py-3 pl-10 pr-4 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent)"
          />
        </div>

        <Button
          onClick={() => router.push("/servicos/novo")}
          rightIcon={<span>{">"}</span>}
        >
          Adicionar serviço
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-3xl border border-(--color-border-soft) bg-(--color-bg-card) p-6 text-(--color-text-secondary)">
          Carregando serviços...
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filtered.map((service) => (
            <article
              key={service.id}
              className="surface-card rounded-3xl border border-(--color-border-soft) p-5 shadow-[0_18px_40px_rgba(7,9,14,0.18)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                    Serviço
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-(--color-text-primary)">
                    {service.name}
                  </h2>
                </div>

                <span
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    service.paused
                      ? "bg-[rgba(216,81,81,0.14)] text-(--color-status-busy)"
                      : "bg-[rgba(49,197,119,0.14)] text-(--color-status-available)",
                  ].join(" ")}
                >
                  {service.paused ? "Pausado" : "Ativo"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark)/50 px-4 py-3">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                    Duração
                  </p>
                  <p className="mt-1 text-base font-medium text-(--color-text-primary)">
                    {service.duration} min
                  </p>
                </div>

                <div className="rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark)/50 px-4 py-3">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                    Preço
                  </p>
                  <p className="mt-1 text-base font-medium text-(--color-text-primary)">
                    {formatCurrency(service.price)}
                  </p>
                </div>

                <div className="rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark)/50 px-4 py-3">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                    ID
                  </p>
                  <p className="mt-1 truncate text-base font-medium text-(--color-text-primary)">
                    {service.id}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/servicos/${service.id}/editar`)}
                >
                  Editar
                </Button>

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => void handlePause(service)}
                  disabled={isMutatingId === service.id}
                >
                  {service.paused ? "Reativar" : "Pausar"}
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => void handleDelete(service)}
                  disabled={isMutatingId === service.id}
                >
                  Apagar
                </Button>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-(--color-border-soft) bg-(--color-bg-card) p-8 text-center text-(--color-text-secondary)">
              Nenhum serviço encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
