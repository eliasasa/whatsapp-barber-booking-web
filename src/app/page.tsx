import { AppointmentsList } from "@/features/appointments";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

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
              Controle os atendimentos do dia com uma interface mais clara, elegante e pronta para alta rotação.
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

      <section className="mt-8 reveal-up" style={{ animationDelay: "80ms" }}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="section-title">Ações rápidas</h2>
        </div>
        <div className="surface-card flex flex-wrap items-center gap-3 p-4 sm:p-5">
          <Button variant="solid" rightIcon={<span>→</span>}>
            Confirmar
          </Button>
          <Button variant="outline">Reagendar</Button>
          <Button variant="ghost">Mais detalhes</Button>
          <Button variant="subtle">Ver histórico</Button>
          <Button variant="danger">Cancelar</Button>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="surface-card accent-outline reveal-up p-6 sm:p-8 lg:col-span-2" style={{ animationDelay: "140ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
            Próximo horário
          </p>
          <p className="mt-3 text-5xl font-semibold text-[var(--color-accent)] [font-variant-numeric:tabular-nums]">
            --:--
          </p>
          <p className="mt-3 text-sm text-[var(--color-text-disabled)]">
            Sem agendamentos pendentes no momento.
          </p>
        </div>

        <div className="space-y-4">
          <div className="surface-card reveal-up p-5" style={{ animationDelay: "190ms" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Hoje</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">0</p>
          </div>
          <div className="surface-card reveal-up p-5" style={{ animationDelay: "230ms" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Capacidade</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">0%</p>
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