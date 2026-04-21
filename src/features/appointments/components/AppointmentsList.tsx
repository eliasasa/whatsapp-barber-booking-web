"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { cancelAppointment } from "@/features/appointments/api/cancelAppointment";
import { listAppointments } from "@/features/appointments/api/listAppointments";
import type { Appointment } from "@/types/appointment";

export function AppointmentsList() {
  const router = useRouter();
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAppointments() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await listAppointments();

        if (mounted) {
          setAppointments(data);
        }
      } catch {
        if (mounted) {
          setError("Não foi possível carregar os agendamentos.");
          addToast({
            title: "Falha ao carregar agenda",
            description: "Verifique a conexão e tente novamente.",
            type: "error",
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAppointments();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleCancel(id: string) {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) {
      return;
    }

    try {
      setCancelingId(id);
      setActionError(null);

      await cancelAppointment(id);

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id
            ? {
                ...appointment,
                status: "CANCELED",
              }
            : appointment,
        ),
      );

      addToast({
        title: "Agendamento cancelado",
        description: "O atendimento foi marcado como cancelado.",
        type: "success",
      });
    } catch {
      setActionError("Não foi possível cancelar o agendamento.");
      addToast({
        title: "Cancelamento não concluído",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setCancelingId(null);
    }
  }

  function handleEdit(appointment: Appointment) {
    router.push(`/agendamentos/editar?id=${encodeURIComponent(appointment.id)}`);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: "#2a2a2a", borderTopColor: "#d4af37" }}
          />
          <p className="text-xs" style={{ color: "#b0b0b0" }}>
            Carregando agendamentos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border-2" style={{ borderColor: "#e63946", background: "rgba(230, 57, 70, 0.1)" }}>
        <p className="text-xs" style={{ color: "#e63946" }}>
          {error}
        </p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm" style={{ color: "#b0b0b0" }}>
          Nenhum agendamento encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="p-4 rounded-lg border-2" style={{ borderColor: "#e63946", background: "rgba(230, 57, 70, 0.1)" }}>
          <p className="text-xs" style={{ color: "#e63946" }}>
            {actionError}
          </p>
        </div>
      )}

      <div className="space-y-3 max-h-150 overflow-y-auto pr-2">
        {appointments.map((appointment) => {
          const isCanceled = appointment.status === "CANCELED";
          const appointmentTime = new Date(appointment.startAt);
          const formattedTime = appointmentTime.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const formattedDate = appointmentTime.toLocaleDateString("pt-BR");

          const statusColor = isCanceled ? "#808080" : "#2ecc71";
          const cardBg = isCanceled ? "rgba(212, 175, 55, 0.05)" : "#1e1e1e";
          const cardBorder = isCanceled ? "#2a2a2a" : "#d4af37";

          return (
            <article
              key={appointment.id}
              className="rounded-lg border-2 p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                borderColor: cardBorder,
                background: cardBg,
                opacity: isCanceled ? 0.6 : 1,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-4" style={{ borderBottomColor: "#2a2a2a", borderBottomWidth: "1px" }}>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1" style={{ color: "#eaeaea" }}>
                    {appointment.client?.name ?? "Cliente não informado"}
                  </h3>
                  <p className="text-xs" style={{ color: "#b0b0b0" }}>
                    {appointment.service?.name ?? "Serviço não informado"}
                  </p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: statusColor,
                    color: "#121212",
                    letterSpacing: "0.5px",
                  }}
                >
                  {isCanceled ? "CANCELADO" : "CONFIRMADO"}
                </div>
              </div>

              {/* Time */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: "#d4af37", fontVariantNumeric: "tabular-nums" }}>
                  {formattedTime}
                </span>
                <span style={{ color: "#2a2a2a" }}>•</span>
                <span className="text-xs" style={{ color: "#b0b0b0" }}>
                  {formattedDate}
                </span>
              </div>

              {/* Ações do atendimento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={isCanceled ? "subtle" : "danger"}
                  size="sm"
                  fullWidth
                  isLoading={cancelingId === appointment.id}
                  onClick={() => handleCancel(appointment.id)}
                  disabled={isCanceled}
                >
                  {isCanceled ? "Cancelado" : "Cancelar Agendamento"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => handleEdit(appointment)}
                >
                  Editar
                </Button>
              </div>

            </article>
          );
        })}
      </div>
    </div>
  );
}
