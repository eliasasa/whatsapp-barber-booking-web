"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { createAppointment } from "@/features/appointments";
import { listAvailability, listAvailabilityBlocks } from "@/features/availability";
import { listClients } from "@/features/clients";
import { listServices } from "@/features/services";
import type { AvailabilityBlock, AvailabilityItem } from "@/features/availability/types";
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

function getFriendlyApiError(
  caughtError: unknown,
  fallbackMessage: string,
): string {
  if (!(caughtError instanceof Error)) {
    return fallbackMessage;
  }

  const rawMessage = caughtError.message?.trim();
  if (!rawMessage) {
    return fallbackMessage;
  }

  const jsonStartIndex = rawMessage.indexOf("{");
  if (jsonStartIndex >= 0) {
    const maybeJson = rawMessage.slice(jsonStartIndex);

    try {
      const parsed = JSON.parse(maybeJson) as {
        error?: string;
        message?: string;
      };

      const candidate = parsed.error ?? parsed.message;
      if (candidate && candidate.trim()) {
        return candidate.trim();
      }
    } catch {
      // Keep fallback flow for non-JSON payloads.
    }
  }

  const normalized = rawMessage.replace(/^API error \(\d+\):\s*/i, "").trim();
  return normalized || fallbackMessage;
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
}

function toWeekdayFromDate(date: Date): number {
  const weekday = date.getDay();
  return weekday === 0 ? 7 : weekday;
}

function doesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && endA > startB;
}

function validateAgainstAvailability(
  startAtDate: Date,
  durationMinutes: number,
  availability: AvailabilityItem[],
  blocks: AvailabilityBlock[],
): { valid: boolean; message?: string } {
  if (durationMinutes <= 0) {
    return { valid: false, message: "Duração do serviço inválida." };
  }

  const appointmentStart = startAtDate;
  const appointmentEnd = new Date(
    appointmentStart.getTime() + durationMinutes * 60 * 1000,
  );

  if (appointmentEnd.toDateString() !== appointmentStart.toDateString()) {
    return {
      valid: false,
      message: "O agendamento precisa começar e terminar no mesmo dia.",
    };
  }

  const weekday = toWeekdayFromDate(appointmentStart);
  const dayAvailability = availability.filter((item) => item.weekday === weekday);

  if (dayAvailability.length === 0) {
    return {
      valid: false,
      message: "Não há expediente configurado para esse dia da semana.",
    };
  }

  const startMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
  const endMinutes = appointmentEnd.getHours() * 60 + appointmentEnd.getMinutes();

  const fitsAnyWindow = dayAvailability.some((item) => {
    const windowStart = timeToMinutes(item.startTime);
    const windowEnd = timeToMinutes(item.endTime);
    return startMinutes >= windowStart && endMinutes <= windowEnd;
  });

  if (!fitsAnyWindow) {
    return {
      valid: false,
      message: "Horário fora do expediente configurado.",
    };
  }

  const conflictingBlock = blocks.find((block) =>
    doesOverlap(
      appointmentStart,
      appointmentEnd,
      new Date(block.startAt),
      new Date(block.endAt),
    ),
  );

  if (conflictingBlock) {
    const reason = conflictingBlock.reason?.trim();
    return {
      valid: false,
      message: reason
        ? `Horário indisponível por bloqueio: ${reason}.`
        : "Horário indisponível por bloqueio configurado.",
    };
  }

  return { valid: true };
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<AvailabilityBlock[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load clients and services on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [clientsData, servicesData, availabilityData, blocksData] = await Promise.all([
          listClients(),
          listServices(),
          listAvailability(),
          listAvailabilityBlocks(),
        ]);

        setClients(clientsData);
        setServices(servicesData);
        setAvailability(availabilityData);
        setAvailabilityBlocks(blocksData);
      } catch (caughtError) {
        const message = getFriendlyApiError(
          caughtError,
          "Falha ao carregar dados.",
        );
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

    if (!address.trim()) {
      addToast({
        title: "Campo obrigatório",
        description: "Informe o endereço do atendimento.",
        type: "error",
      });
      return;
    }

    try {
      setIsSaving(true);

      const selectedService = services.find((service) => service.id === serviceId);
      if (!selectedService) {
        addToast({
          title: "Serviço inválido",
          description: "Selecione um serviço válido para continuar.",
          type: "error",
        });
        return;
      }

      // Convert local datetime to ISO string in UTC
      const localDate = new Date(startAt);
      const validation = validateAgainstAvailability(
        localDate,
        selectedService.duration,
        availability,
        availabilityBlocks,
      );

      if (!validation.valid) {
        addToast({
          title: "Horário indisponível",
          description: validation.message ?? "Escolha outro horário.",
          type: "error",
        });
        return;
      }

      const isoString = localDate.toISOString();

      await createAppointment({
        clientId: clientId.trim(),
        serviceId: serviceId.trim(),
        startAt: isoString,
        address: address.trim(),
        notes: notes.trim() || undefined,
      });

      addToast({
        title: "Agendamento criado",
        description: "O novo agendamento foi salvo com sucesso.",
        type: "success",
      });

      router.push("/agendamentos");
    } catch (caughtError) {
      const message = getFriendlyApiError(
        caughtError,
        "Não foi possível criar o agendamento.",
      );
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

          <div className="flex flex-col">
            <label
              htmlFor="address"
              className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)"
            >
              <span>Endereço</span>
              <span className="text-(--color-status-busy)">*</span>
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Av. Exemplo, 123, Apt 45"
              className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) transition-all duration-200 focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20"
            />
            {address.trim() && (
              <p className="mt-2 text-xs text-(--color-accent)">✓ Preenchido</p>
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
            disabled={isLoadingData || !clientId || !serviceId || !startAt || !address.trim()}
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
