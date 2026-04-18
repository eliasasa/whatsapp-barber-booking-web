import { AppointmentsList } from "@/features/appointments";

export default function AgendamentosPage() {
  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Agenda</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">Agendamentos</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Gerencie horários, status e operações do dia com foco em velocidade.
        </p>
      </div>

      <div className="surface-panel mt-6 reveal-up p-4 sm:p-6" style={{ animationDelay: "80ms" }}>
        <AppointmentsList />
      </div>
    </section>
  );
}
