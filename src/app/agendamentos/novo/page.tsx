"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { createAppointment } from "@/features/appointments";
import { listClients } from "@/features/clients";
import { listServices } from "@/features/services";
import type { Client } from "@/types/client";
import type { Service } from "@/types/service";

function getMinDateTime(): string {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load clients and services on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [clientsData, servicesData] = await Promise.all([
          listClients(),
          listServices(),
        ]);

        setClients(clientsData);
        setServices(servicesData);
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Falha ao carregar dados.";
        addToast({
          title: "Erro ao carregar",
          description: message,
          type: "error",
        });
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [addToast]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clientId.trim()) {
      addToast({
        title: "Campo obrigatório",
        description: "Selecione um cliente.",
        type: "error",
      });
      return;
    }

    if (!serviceId.trim()) {
      addToast({
        title: "Campo obrigatório",
        description: "Selecione um serviço.",
        type: "error",
      });
      return;
    }

    if (!startAt.trim()) {
      addToast({
        title: "Campo obrigatório",
        description: "Selecione a data e hora.",
        type: "error",
      });
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Convert local datetime to ISO string in UTC
      const localDate = new Date(startAt);
      const isoString = localDate.toISOString();

      await createAppointment({
        clientId: clientId.trim(),
        serviceId: serviceId.trim(),
        startAt: isoString,
        notes: notes.trim() || undefined,
      });

      addToast({
        title: "Agendamento criado",
        description: "O novo agendamento foi salvo com sucesso.",
        type: "success",
      });

      router.push("/agendamentos");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível criar o agendamento.";
      setError(message);
      addToast({
        title: "Falha ao criar",
        description: message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="container-shell pt-6 sm:pt-8 pb-12">
      <div className="surface-panel reveal-up px-6 py-8 sm:px-8 sm:py-10">
        <div>
          <p className="section-title text-(--color-accent)">Novo</p>
          <h1 className="text-2xl font-semibold text-(--color-text-primary) sm:text-3xl">Agendamento</h1>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-(--color-text-secondary) sm:text-base">
          Preencha os dados do cliente, serviço e horário para criar um novo agendamento.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-(--color-status-busy) bg-[rgba(216,81,81,0.12)] p-4">
          <p className="text-sm font-medium text-(--color-status-busy)">Erro ao agendar:</p>
          <p className="mt-1.5 text-sm text-(--color-status-busy)/80">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Dados principais */}
        <div className="surface-panel space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1.5 rounded-full bg-(--color-accent)" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-accent)">Informações principais</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col">
              <label
                htmlFor="client"
                className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)"
              >
                <span>Cliente</span>
                <span className="text-(--color-status-busy)">*</span>
              </label>
              <select
                id="client"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                disabled={isLoadingData || clients.length === 0}
                className="flex-1 rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) transition-all duration-200 focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20 disabled:opacity-50"
              >
                <option value="">
                  {isLoadingData
                    ? "Carregando..."
                    : clients.length === 0
                      ? "Nenhum cliente disponível"
                      : "Selecionar cliente"}
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                    {client.phone ? ` (${client.phone})` : ""}
                  </option>
                ))}
              </select>
              {clientId && clients.find((c) => c.id === clientId) && (
                <p className="mt-2 text-xs text-(--color-accent)">✓ {clients.find((c) => c.id === clientId)?.name}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="service"
                className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)"
              >
                <span>Serviço</span>
                <span className="text-(--color-status-busy)">*</span>
              </label>
              <select
                id="service"
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                disabled={isLoadingData || services.length === 0}
                className="flex-1 rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) transition-all duration-200 focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20 disabled:opacity-50"
              >
                <option value="">
                  {isLoadingData
                    ? "Carregando..."
                    : services.length === 0
                      ? "Nenhum serviço disponível"
                      : "Selecionar serviço"}
                </option>
                {services
                  .filter((s) => !s.paused)
                  .map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration}min)
                      {service.price ? ` - R$ ${service.price.toFixed(2)}` : ""}
                    </option>
                  ))}
              </select>
              {serviceId && services.find((s) => s.id === serviceId) && (
                <p className="mt-2 text-xs text-(--color-accent)">
                  ✓ {services.find((s) => s.id === serviceId)?.duration}min
                  {services.find((s) => s.id === serviceId)?.price && (
                    <span className="ml-2">· R$ {services.find((s) => s.id === serviceId)?.price?.toFixed(2)}</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="startAt"
              className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)"
            >
              <span>Data e hora</span>
              <span className="text-(--color-status-busy)">*</span>
            </label>
            <input
              id="startAt"
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              min={getMinDateTime()}
              className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) transition-all duration-200 focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
            />
            {startAt && (
              <p className="mt-2 text-xs text-(--color-accent)">✓ Selecionado</p>
            )}
          </div>
        </div>

        {/* Observações */}
        <div className="surface-panel space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1.5 rounded-full bg-(--color-accent)" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-accent)">Detalhes adicionais</p>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="notes"
              className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)"
            >
              <span>Observações</span>
              <span className="text-xs font-normal text-(--color-text-secondary)/60">(opcional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ex: Cliente quer corte com desvanecimento, preferências especiais..."
              rows={4}
              className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) transition-all duration-200 resize-none placeholder:text-(--color-text-secondary)/50 focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            isLoading={isSaving}
            disabled={isLoadingData || !clientId || !serviceId || !startAt}
            rightIcon={<span>{">"}</span>}
            className="flex-1"
          >
            {isSaving ? "Criando agendamento..." : "Agendar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/agendamentos")}
          >
            Cancelar
          </Button>
        </div>

        <p className="text-center text-xs text-(--color-text-secondary)">
          Você poderá editar ou cancelar o agendamento após criação.
        </p>
      </form>
    </section>
  );
}
