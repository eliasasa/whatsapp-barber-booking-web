"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getAppointment } from "@/features/appointments/api/getAppointment";
import { rescheduleAppointment } from "@/features/appointments/api/rescheduleAppointment";
import type { Appointment } from "@/types/appointment";

export default function EditarAgendamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [startAtInput, setStartAtInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleEditClient(clientId: string) {
    router.push(`/clientes/editar?id=${encodeURIComponent(clientId)}`);
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
          setError("ID do agendamento nao informado na URL.");
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await getAppointment(id);

        if (mounted) {
          setAppointment(data);
          setStartAtInput(toDatetimeLocalValue(data.startAt));
        }
      } catch {
        if (mounted) {
          setError("Nao foi possivel carregar os dados do agendamento.");
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
  }, [id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id) {
      setError("ID do agendamento nao informado na URL.");
      return;
    }

    if (!startAtInput) {
      setError("Informe a nova data e horario para reagendar.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const isoStartAt = new Date(startAtInput).toISOString();
      const updated = await rescheduleAppointment(id, { startAt: isoStartAt });

      setAppointment(updated);
      setStartAtInput(toDatetimeLocalValue(updated.startAt));
      setSuccessMessage("Agendamento reagendado com sucesso.");
    } catch {
      setError("Nao foi possivel reagendar o atendimento.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-12">
        <p style={{ color: "#b0b0b0" }}>Carregando agendamento...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-12">
        <p style={{ color: "#e63946" }}>{error}</p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "#d4af37" }}>
        Editar agendamento
      </h1>
      <p className="mb-6" style={{ color: "#b0b0b0" }}>
        Atualize o horario e salve para chamar o endpoint de reagendamento.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border p-4" style={{ borderColor: "#e63946", background: "rgba(230, 57, 70, 0.12)", color: "#e63946" }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border p-4" style={{ borderColor: "#2ecc71", background: "rgba(46, 204, 113, 0.12)", color: "#2ecc71" }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg border p-6 space-y-6" style={{ borderColor: "#2a2a2a", background: "#1e1e1e" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs mb-1" style={{ color: "#b0b0b0" }}>ID</p>
            <p style={{ color: "#eaeaea" }}>{appointment?.id ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "#b0b0b0" }}>Status</p>
            <p style={{ color: "#eaeaea" }}>{appointment?.status ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "#b0b0b0" }}>Cliente</p>
            <div className="flex items-center gap-2">
              <p style={{ color: "#eaeaea" }}>{appointment?.client?.name ?? "-"}</p>
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
            <p className="text-xs mb-1" style={{ color: "#b0b0b0" }}>Servico</p>
            <p style={{ color: "#eaeaea" }}>{appointment?.service?.name ?? "-"}</p>
          </div>
        </div>

        <div>
          <label htmlFor="startAt" className="block text-xs font-semibold mb-2" style={{ color: "#b0b0b0", letterSpacing: "1px" }}>
            NOVO HORARIO
          </label>
          <input
            id="startAt"
            type="datetime-local"
            value={startAtInput}
            onChange={(event) => setStartAtInput(event.target.value)}
            className="w-full rounded-lg border px-4 py-3 outline-none"
            style={{
              borderColor: "#2a2a2a",
              background: "#121212",
              color: "#eaeaea",
            }}
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
