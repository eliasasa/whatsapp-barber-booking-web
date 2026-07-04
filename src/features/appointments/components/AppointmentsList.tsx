"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { cancelAppointment } from "@/features/appointments/api/cancelAppointment";
import { listAppointments } from "@/features/appointments/api/listAppointments";
import type { Appointment } from "@/types/appointment";

type FilterType = "all" | "upcoming" | "past" | "canceled";

const BRAZIL_TIME_ZONE = "America/Cuiaba";

function getNowBrazil() {
  return new Date();
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatAppointmentTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAppointmentDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getAppointmentLabel(appointment: Appointment) {
  return appointment.client?.name?.trim() || appointment.service?.name?.trim() || "Atendimento";
}

export function AppointmentsList() {
  const router = useRouter();
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [pendingCancelAppointment, setPendingCancelAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAppointments() {
      try {
        setIsLoading(true);
        const data = await listAppointments();

        if (mounted) {
          setAppointments(data);
        }
      } catch {
        if (mounted) {
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
  }, [addToast]);

  const now = getNowBrazil();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStartTime = todayStart.getTime();

  const filtered = useMemo(() => {
    let result = [...appointments];

    // Aplicar filtro
    if (filterType !== "all") {
      result = result.filter((apt) => {
        if (filterType === "canceled") return apt.status === "CANCELED";
        if (apt.status === "CANCELED") return false;

        const appointmentTime = new Date(apt.startAt).getTime();
        if (filterType === "upcoming") return appointmentTime >= todayStartTime;
        if (filterType === "past") return appointmentTime < todayStartTime;

        return true;
      });
    }

    // Aplicar search
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((apt) => {
        const searchable = [
          getAppointmentLabel(apt),
          apt.service?.name ?? "",
          formatAppointmentTime(new Date(apt.startAt)),
          formatAppointmentDate(new Date(apt.startAt)),
        ]
          .join(" ")
          .toLowerCase();
        return searchable.includes(query);
      });
    }

    // Ordenar: não cancelados primeiro, depois cancelados; dentro disso, próximos antes dos passados
    result.sort((a, b) => {
      const aTime = new Date(a.startAt).getTime();
      const bTime = new Date(b.startAt).getTime();
      const aIsCanceled = a.status === "CANCELED";
      const bIsCanceled = b.status === "CANCELED";

      if (aIsCanceled !== bIsCanceled) {
        return aIsCanceled ? 1 : -1;
      }

      const aIsPast = aTime < todayStartTime;
      const bIsPast = bTime < todayStartTime;

      if (aIsPast === bIsPast) {
        return aIsPast ? bTime - aTime : aTime - bTime;
      }

      return aIsPast ? 1 : -1;
    });

    return result;
  }, [appointments, filterType, searchQuery, todayStartTime]);

  async function handleCancel(id: string) {
    const appointment = appointments.find((item) => item.id === id) ?? null;
    setPendingCancelAppointment(appointment);
  }

  async function confirmCancelAppointment() {
    if (!pendingCancelAppointment) return;

    const id = pendingCancelAppointment.id;

    try {
      setCancelingId(id);

      await cancelAppointment(id);

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: "CANCELED" }
            : appointment,
        ),
      );

      addToast({
        title: "Agendamento cancelado",
        description: "O atendimento foi marcado como cancelado.",
        type: "success",
      });
    } catch {
      addToast({
        title: "Cancelamento não concluído",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setCancelingId(null);
      setPendingCancelAppointment(null);
    }
  }

  function handleEdit(appointment: Appointment) {
    router.push(`/agendamentos/editar?id=${encodeURIComponent(appointment.id)}`);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--color-text-disabled) border-r-transparent" />
          <p className="text-xs text-(--color-text-secondary)">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {pendingCancelAppointment && (
        <ConfirmDialog
          open
          title="Cancelar agendamento?"
          description={`Tem certeza que deseja cancelar ${getAppointmentLabel(pendingCancelAppointment)}? Você poderá recriar depois, se necessário.`}
          confirmText="Sim, cancelar"
          cancelText="Não, manter"
          confirmVariant="danger"
          isLoading={cancelingId !== null}
          onConfirm={() => void confirmCancelAppointment()}
          onCancel={() => setPendingCancelAppointment(null)}
        />
      )}
      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 21L16.65 16.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 19a8 8 0 100-16 8 8 0 000 16z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome, serviço, hora ou data..."
          className="w-full rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark) py-3 pl-10 pr-4 text-sm text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent)"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["all", "upcoming", "past", "canceled"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterType(filter)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              filterType === filter
                ? "bg-(--color-accent) text-[#161412]"
                : "border border-(--color-border-soft) bg-(--color-bg-soft) text-(--color-text-secondary) hover:border-(--color-accent)"
            }`}
          >
            {filter === "all" && "Todos"}
            {filter === "upcoming" && "Próximos"}
            {filter === "past" && "Passados"}
            {filter === "canceled" && "Cancelados"}
          </button>
        ))}
      </div>

      {/* Resultado */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--color-border-soft) bg-(--color-bg-dark)/50 px-5 py-12 text-center">
          <p className="text-sm text-(--color-text-secondary)">
            {appointments.length === 0
              ? "Nenhum agendamento encontrado"
              : "Nenhum resultado para esta busca"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appointment) => {
            const isCanceled = appointment.status === "CANCELED";
            const appointmentDate = new Date(appointment.startAt);
            const appointmentTime = appointmentDate.getTime();
            const isPast = appointmentTime < todayStartTime && !isCanceled;
            const isToday = isSameDay(appointmentDate, now);

            return (
              <article
                key={appointment.id}
                className="rounded-2xl border border-(--color-border-soft) bg-(--color-bg-card) p-4 shadow-[0_12px_28px_rgba(7,9,14,0.16)] transition-all duration-200 hover:-translate-y-1"
                style={{
                  opacity: isPast || isCanceled ? 0.7 : 1,
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-(--color-text-primary) truncate">
                        {getAppointmentLabel(appointment)}
                      </p>
                      {isCanceled && (
                        <span className="inline-flex rounded-full bg-[rgba(128,128,128,0.2)] px-2 py-1 text-xs font-semibold text-[rgba(180,180,180,1)]">
                          Cancelado
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-(--color-text-secondary) truncate">
                      {appointment.service?.name?.trim() || "Serviço não informado"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                        isPast || isCanceled
                          ? "bg-[rgba(128,128,128,0.12)] text-[rgba(180,180,180,1)]"
                          : "bg-[rgba(49,197,119,0.12)] text-(--color-status-available)"
                      }`}
                    >
                      {formatAppointmentTime(appointmentDate)}
                    </span>
                    <span className="text-xs text-(--color-text-secondary)">
                      {isToday ? "Hoje" : formatAppointmentDate(appointmentDate)}
                    </span>

                    {appointment.address && (
                      <div className="mt-2 text-xs text-(--color-text-secondary)">
                        📍 {appointment.address}
                      </div>
                    )}
                    
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleEdit(appointment)}
                    disabled={isCanceled}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant={isCanceled ? "subtle" : "danger"}
                    size="sm"
                    fullWidth
                    isLoading={cancelingId === appointment.id}
                    onClick={() => handleCancel(appointment.id)}
                    disabled={isCanceled}
                  >
                    {isCanceled ? "Cancelado" : "Cancelar"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Contagem */}
      {filtered.length > 0 && (
        <div className="text-center text-xs text-(--color-text-secondary)">
          Mostrando {filtered.length} de {appointments.length} agendamentos
        </div>
      )}
    </div>
  );
}
