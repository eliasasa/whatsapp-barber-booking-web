import { AppointmentsList, listAppointments } from "@/features/appointments";
import type { Appointment } from "@/types/appointment";

const BRAZIL_TIME_ZONE = "America/Sao_Paulo";

function getBrazilDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

function getAppointmentLabel(appointment: Appointment) {
  return appointment.client?.name?.trim() || appointment.service?.name?.trim() || "Atendimento";
}

function getFormattedTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function Home() {
  const today = new Date();
  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    timeZone: BRAZIL_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);

  let appointments: Appointment[] = [];

  try {
    appointments = await listAppointments();
  } catch {
    appointments = [];
  }

  const nowTime = today.getTime();
  const todayKey = getBrazilDateKey(today);

  const confirmedAppointments = appointments.filter((appointment) => appointment.status !== "CANCELED");
  const upcomingAppointments = confirmedAppointments
    .map((appointment) => ({ appointment, startTime: new Date(appointment.startAt).getTime() }))
    .filter(({ startTime }) => Number.isFinite(startTime) && startTime >= nowTime)
    .sort((a, b) => a.startTime - b.startTime);

  const nextAppointment = upcomingAppointments[0]?.appointment ?? null;
  const todayAppointments = confirmedAppointments.filter(
    (appointment) => getBrazilDateKey(new Date(appointment.startAt)) === todayKey,
  );
  const nextSevenDays = confirmedAppointments.filter((appointment) => {
    const startTime = new Date(appointment.startAt).getTime();
    const diff = startTime - nowTime;
    return Number.isFinite(startTime) && diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  });

  const nextAppointmentTime = nextAppointment ? getFormattedTime(new Date(nextAppointment.startAt)) : null;
  const nextAppointmentDate = nextAppointment
    ? new Intl.DateTimeFormat("pt-BR", {
        timeZone: BRAZIL_TIME_ZONE,
        day: "2-digit",
        month: "short",
      }).format(new Date(nextAppointment.startAt))
    : null;

  return (
    <div className="container-shell pt-6 sm:pt-8">
      <section className="surface-panel accent-outline reveal-up overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
        <p className="section-title">Painel de operação</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">
              Agenda da barbearia
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[var(--color-text-secondary)] sm:text-base">
              Hoje a operação está concentrada nos horários já confirmados, com o próximo atendimento e os próximos dias visíveis em um só lugar.
            </p>
          </div>

          <div className="surface-card inline-flex items-center gap-3 self-start px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_rgba(205,163,79,0.65)]" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Hoje
            </span>
            <span className="h-3 w-px bg-[var(--color-border-soft)]" />
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{todayLabel}</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="surface-card accent-outline reveal-up p-6 sm:p-8 lg:col-span-2" style={{ animationDelay: "140ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Próximo horário
          </p>
          {nextAppointment ? (
            <>
              <p className="mt-3 text-5xl font-semibold text-[var(--color-accent)] [font-variant-numeric:tabular-nums]">
                {nextAppointmentTime}
              </p>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                {getAppointmentLabel(nextAppointment)} · {nextAppointmentDate}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)]">
                Nenhum horário próximo
              </p>
              <p className="mt-3 text-sm text-[var(--color-text-disabled)]">
                Assim que houver novos agendamentos confirmados, eles vão aparecer aqui.
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="surface-card reveal-up p-5" style={{ animationDelay: "190ms" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Hoje</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">{todayAppointments.length}</p>
            <p className="mt-2 text-xs text-[var(--color-text-disabled)]">agendamentos confirmados</p>
          </div>
          <div className="surface-card reveal-up p-5" style={{ animationDelay: "230ms" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Próximos 7 dias</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">{nextSevenDays.length}</p>
            <p className="mt-2 text-xs text-[var(--color-text-disabled)]">agendamentos futuros confirmados</p>
          </div>
        </div>
      </section>

      <section className="mt-8 pb-2 sm:mt-10">
        <h2 className="section-title mb-4">Agenda do dia</h2>
        <div className="surface-panel reveal-up overflow-hidden" style={{ animationDelay: "260ms" }}>
          <div className="border-b border-[var(--color-border-soft)] bg-[var(--color-bg-dark)]/55 px-4 py-4 sm:px-8 sm:py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
              Horários agendados
            </p>
          </div>
          <div className="p-4 sm:p-8">
            <AppointmentsList />
          </div>
        </div>
      </section>
    </div>
  );
}