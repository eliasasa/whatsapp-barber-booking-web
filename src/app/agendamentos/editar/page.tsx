"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { getAppointment } from "@/features/appointments/api/getAppointment";
import { rescheduleAppointment } from "@/features/appointments/api/rescheduleAppointment";
import type { Appointment } from "@/types/appointment";

function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    const match = message.match(/API error \(\d+\): (.+)$/);
    
    if (match) {
      const body = match[1];
      try {
        const parsed = JSON.parse(body);
        return parsed.error || parsed.message || body;
      } catch {
        return body;
      }
    }
    
    return message;
  }
  
  return "Erro ao processar a solicitação.";
}

function EditarAgendamentoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const id = searchParams.get("id");

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [startAtInput, setStartAtInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  function handleEditClient(clientId: string) {
    router.push(`/clientes/${encodeURIComponent(clientId)}/editar`);
  }

  function toDatetimeLocalValue(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  useEffect(() => {
    let mounted = true;

    async function loadAppointment() {
      if (!id) {
        if (mounted) {
          addToast({
            title: "ID não informado",
            description: "ID do agendamento não encontrado na URL.",
            type: "error",
          });
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);

        const data = await getAppointment(id);

        if (mounted) {
          setAppointment(data);
          setStartAtInput(toDatetimeLocalValue(data.startAt));
        }
      } catch {
        if (mounted) {
          addToast({
            title: "Erro ao carregar",
            description: "Não foi possível carregar os dados do agendamento.",
            type: "error",
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAppointment();

    return () => {
      mounted = false;
    };
  }, [id, addToast]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id) {
      addToast({
        title: "ID não informado",
        description: "ID do agendamento não encontrado na URL.",
        type: "error",
      });
      return;
    }

    if (!startAtInput) {
      addToast({
        title: "Data e horário obrigatórios",
        description: "Informe a nova data e horário para reagendar.",
        type: "warning",
      });
      return;
    }

    try {
      setIsSaving(true);

      const isoStartAt = new Date(startAtInput).toISOString();
      const updated = await rescheduleAppointment(id, { newStartAt: isoStartAt });

      setAppointment(updated);
      setStartAtInput(toDatetimeLocalValue(updated.startAt));
      
      addToast({
        title: "Agendamento reagendado",
        description: "O horário foi atualizado com sucesso.",
        type: "success",
      });
    } catch (caughtError) {
      addToast({
        title: "Erro ao reagendar",
        description: parseApiError(caughtError),
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="container-shell pt-6 sm:pt-8">
        <div className="surface-panel p-6 sm:p-8">
          <p className="text-[var(--color-text-secondary)]">Carregando agendamento...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Atualização</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">Editar agendamento</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Atualize o horário e confirme para reagendar no sistema.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="surface-panel mt-6 space-y-6 p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">ID</p>
            <p className="text-[var(--color-text-primary)]">{appointment?.id ?? "-"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Status</p>
            <p className="text-[var(--color-text-primary)]">{appointment?.status ?? "-"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Cliente</p>
            <div className="flex items-center gap-2">
              <p className="text-[var(--color-text-primary)]">{appointment?.client?.name ?? "-"}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => appointment?.client?.id && handleEditClient(appointment.client.id)}
                disabled={!appointment?.client?.id}
              >
                Editar cliente
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Serviço</p>
            <p className="text-[var(--color-text-primary)]">{appointment?.service?.name ?? "-"}</p>
          </div>
        </div>

        <div>
          <label htmlFor="startAt" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            NOVO HORÁRIO
          </label>
          <input
            id="startAt"
            type="datetime-local"
            value={startAtInput}
            onChange={(event) => setStartAtInput(event.target.value)}
            className="w-full rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-dark)] px-4 py-3 text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="submit" isLoading={isSaving} rightIcon={<span>{">"}</span>}>
            Salvar reagendamento
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/agendamentos")}>
            Voltar
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function EditarAgendamentoPage() {
  return (
    <Suspense
      fallback={(
        <section className="container-shell pt-6 sm:pt-8">
          <div className="surface-panel p-6 sm:p-8">
            <p className="text-[var(--color-text-secondary)]">Carregando agendamento...</p>
          </div>
        </section>
      )}
    >
      <EditarAgendamentoPageContent />
    </Suspense>
  );
}
