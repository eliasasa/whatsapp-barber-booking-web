"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAppointments, cancelAppointment } from "@/features/appointments";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import type { Appointment } from "@/types/appointment";

const BRAZIL_TIME_ZONE = "America/Cuiaba";

function getAppointmentLabel(appointment: Appointment) {
  return appointment.client?.name?.trim() || appointment.service?.name?.trim() || "Atendimento";
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

function formatTodayLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function matchesQuery(appointment: Appointment, query: string) {
  if (!query) return true;

  const appointmentDate = new Date(appointment.startAt);
  const searchable = [
    getAppointmentLabel(appointment),
    formatAppointmentTime(appointmentDate),
    formatAppointmentDate(appointmentDate),
    appointment.startAt,
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(query);
}

function SectionSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-(--color-border-soft) bg-(--color-bg-dark) py-3 pl-10 pr-4 text-sm text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent)"
      />
    </div>
  );
}

function AppointmentCard({
  appointment,
  variant,
  onCancelRequest,
}: {
  appointment: Appointment;
  variant: "upcoming" | "past";
  onCancelRequest?: (appointment: Appointment) => void;
}) {
  const appointmentDate = new Date(appointment.startAt);
  const isPast = variant === "past";

  return (
    <article
      className="rounded-2xl border border-(--color-border-soft) bg-(--color-bg-card) p-4 shadow-[0_12px_28px_rgba(7,9,14,0.16)] transition-transform duration-200 hover:-translate-y-0.5"
      style={{ opacity: isPast ? 0.82 : 1 }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-(--color-text-primary) truncate">
            {getAppointmentLabel(appointment)}
          </p>
          <p className="mt-1 text-sm text-(--color-text-secondary) truncate">
            {appointment.service?.name?.trim() || "Serviço não informado"}
          </p>
        </div>

        <span
          className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
            isPast
              ? "bg-[rgba(216,81,81,0.12)] text-(--color-status-busy)"
              : "bg-[rgba(49,197,119,0.12)] text-(--color-status-available)"
          }`}
        >
          {formatAppointmentTime(appointmentDate)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-(--color-text-secondary)">
        <span>{formatAppointmentDate(appointmentDate)}</span>
        {appointment.address && (
          <>
            <span className="text-(--color-text-disabled)">·</span>
            <span>📍 {appointment.address}</span>
          </>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/agendamentos/editar?id=${appointment.id}`} className="flex-1">
          <Button type="button" variant="outline" size="sm" fullWidth>
            Editar
          </Button>
        </Link>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => onCancelRequest?.(appointment)}
        >
          Cancelar
        </Button>
      </div>
    </article>
  );
}

function AppointmentSection({
  title,
  appointments,
  query,
  onQueryChange,
  emptyText,
  variant,
  onCancelRequest,
}: {
  title: string;
  appointments: Appointment[];
  query: string;
  onQueryChange: (value: string) => void;
  emptyText: string;
  variant: "upcoming" | "past";
  onCancelRequest?: (appointment: Appointment) => void;
}) {
  const LIMIT = 25;
  const displayedAppointments = appointments.slice(0, LIMIT);
  const hasMore = appointments.length > LIMIT;

  return (
    <section className="surface-panel reveal-up overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {variant === "upcoming" && (
            <p className="section-title">Próximos</p>
          )}
          {variant === "past" && (
            <p className="section-title">Histórico</p>
          )}
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
        </div>
        <span className="inline-flex self-start rounded-full border border-(--color-border-soft) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
          {appointments.length} itens
        </span>
      </div>

      <div className="mt-5">
        <SectionSearch
          value={query}
          onChange={onQueryChange}
          placeholder="Buscar por nome ou data"
        />
      </div>

      <div className="mt-5 space-y-3">
        {displayedAppointments.length > 0 ? (
          displayedAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} variant={variant} onCancelRequest={onCancelRequest} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-(--color-border-soft) bg-(--color-bg-dark)/50 px-5 py-8 text-center">
            <p className="text-sm text-(--color-text-secondary)">{emptyText}</p>
          </div>
        )}
      </div>

      {hasMore && displayedAppointments.length > 0 && (
        <div className="mt-5 text-center">
          <Link
            href="/agendamentos"
            className="inline-flex items-center gap-2 rounded-lg bg-(--color-accent)/10 px-4 py-2.5 text-sm font-medium text-(--color-accent) transition-colors hover:bg-(--color-accent)/20"
          >
            Ver todos os {appointments.length} agendamentos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}

export function HomeDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingQuery, setUpcomingQuery] = useState("");
  const [pastQuery, setPastQuery] = useState("");
  const [pendingCancelAppointment, setPendingCancelAppointment] = useState<Appointment | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const { addToast } = useToast();

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
          setError("Não foi possível carregar os agendamentos da home.");
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

  const handleCancelRequest = (appointment: Appointment) => {
    setPendingCancelAppointment(appointment);
  };

  const confirmCancelAppointment = async () => {
    if (!pendingCancelAppointment) return;

    try {
      setCancelingId(pendingCancelAppointment.id);
      await cancelAppointment(pendingCancelAppointment.id);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === pendingCancelAppointment.id
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
  };

  const now = new Date();
  const todayLabel = formatTodayLabel(now);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStartTime = todayStart.getTime();

  const confirmedAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status !== "CANCELED"),
    [appointments],
  );

  const upcoming = useMemo(
    () =>
      confirmedAppointments
        .filter((appointment) => new Date(appointment.startAt).getTime() >= todayStartTime)
        .sort((first, second) => new Date(first.startAt).getTime() - new Date(second.startAt).getTime()),
    [confirmedAppointments, todayStartTime],
  );

  const past = useMemo(
    () =>
      confirmedAppointments
        .filter((appointment) => new Date(appointment.startAt).getTime() < todayStartTime)
        .sort((first, second) => new Date(second.startAt).getTime() - new Date(first.startAt).getTime()),
    [confirmedAppointments, todayStartTime],
  );

  const nextAppointment = upcoming[0] ?? null;

  const filteredUpcoming = useMemo(
    () => upcoming.filter((appointment) => matchesQuery(appointment, normalizeQuery(upcomingQuery))),
    [upcoming, upcomingQuery],
  );

  const filteredPast = useMemo(
    () => past.filter((appointment) => matchesQuery(appointment, normalizeQuery(pastQuery))),
    [past, pastQuery],
  );

  return (
    <div className="container-shell pt-6 sm:pt-8">
      <ConfirmDialog
        open={pendingCancelAppointment !== null}
        title="Cancelar agendamento?"
        description={`Tem certeza que deseja cancelar ${pendingCancelAppointment ? getAppointmentLabel(pendingCancelAppointment) : "este agendamento"}? O atendimento deixará de aparecer como ativo.`}
        confirmText="Sim, cancelar"
        cancelText="Não, manter"
        confirmVariant="danger"
        isLoading={cancelingId !== null}
        onConfirm={() => void confirmCancelAppointment()}
        onCancel={() => setPendingCancelAppointment(null)}
      />
      <section className="surface-panel accent-outline reveal-up overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
        <p className="section-title">Painel de operação</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-(--color-text-primary) sm:text-4xl">
              Agenda da barbearia
            </h1>
          </div>

          <div className="surface-card inline-flex items-center gap-3 self-start px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-(--color-accent) shadow-[0_0_12px_rgba(205,163,79,0.65)]" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-(--color-text-secondary)">
              Hoje
            </span>
            <span className="h-3 w-px bg-(--color-border-soft)" />
            <span className="text-sm font-medium text-(--color-text-primary)">{todayLabel}</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-card accent-outline reveal-up p-6 sm:p-8 lg:col-span-2" style={{ animationDelay: "140ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
            Próximo agendamento
          </p>
          {nextAppointment ? (
            <>
              <p className="mt-3 text-5xl font-semibold text-(--color-accent) [font-variant-numeric:tabular-nums]">
                {formatAppointmentTime(new Date(nextAppointment.startAt))}
              </p>
              <p className="mt-3 text-sm text-(--color-text-secondary)">
                {getAppointmentLabel(nextAppointment)} · {formatAppointmentDate(new Date(nextAppointment.startAt))}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-3xl font-semibold text-(--color-text-primary)">
                Nenhum agendamento pendente
              </p>
              <p className="mt-3 text-sm text-(--color-text-disabled)">
                Quando surgirem novos agendamentos, eles vão aparecer aqui ordenados por data.
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="surface-card reveal-up p-5" style={{ animationDelay: "190ms" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Próximos
            </p>
            <p className="mt-2 text-3xl font-semibold text-(--color-text-primary)">{upcoming.length}</p>
            <p className="mt-2 text-xs text-(--color-text-disabled)">agendamentos pendentes</p>
          </div>
          <div className="surface-card reveal-up p-5" style={{ animationDelay: "230ms" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Passados
            </p>
            <p className="mt-2 text-3xl font-semibold text-(--color-text-primary)">{past.length}</p>
            <p className="mt-2 text-xs text-(--color-text-disabled)">agendamentos finalizados</p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="surface-panel reveal-up animate-pulse p-6 sm:p-8">
            <div className="h-4 w-28 rounded bg-(--color-bg-soft)" />
            <div className="mt-4 h-8 w-56 rounded bg-(--color-bg-soft)" />
            <div className="mt-5 h-12 rounded-2xl bg-(--color-bg-soft)" />
            <div className="mt-5 space-y-3">
              <div className="h-24 rounded-2xl bg-(--color-bg-soft)" />
              <div className="h-24 rounded-2xl bg-(--color-bg-soft)" />
            </div>
          </div>
          <div className="surface-panel reveal-up animate-pulse p-6 sm:p-8">
            <div className="h-4 w-28 rounded bg-(--color-bg-soft)" />
            <div className="mt-4 h-8 w-56 rounded bg-(--color-bg-soft)" />
            <div className="mt-5 h-12 rounded-2xl bg-(--color-bg-soft)" />
            <div className="mt-5 space-y-3">
              <div className="h-24 rounded-2xl bg-(--color-bg-soft)" />
              <div className="h-24 rounded-2xl bg-(--color-bg-soft)" />
            </div>
          </div>
        </section>
      ) : error ? (
        <section className="mt-8 rounded-2xl border border-[rgba(216,81,81,0.35)] bg-[rgba(216,81,81,0.08)] p-5 text-sm text-(--color-status-busy)">
          {error}
        </section>
      ) : (
        <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AppointmentSection
            title="Próximos"
            appointments={filteredUpcoming}
            query={upcomingQuery}
            onQueryChange={setUpcomingQuery}
            emptyText="Nenhum agendamento pendente encontrado."
            variant="upcoming"
            onCancelRequest={handleCancelRequest}
          />

          <AppointmentSection
            title="Passados"
            appointments={filteredPast}
            query={pastQuery}
            onQueryChange={setPastQuery}
            emptyText="Nenhum agendamento passado encontrado."
            variant="past"
            onCancelRequest={handleCancelRequest}
          />
        </section>
      )}
    </div>
  );
}
