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
    <div className="w-full">
      {/* Contexto inicial do dashboard */}
      <section className="px-4 pt-6 sm:px-6 sm:pt-8">
        <div
          className="mx-auto max-w-7xl rounded-2xl border px-6 py-10 text-center sm:px-8"
          style={{
            borderColor: "#2a2a2a",
            background:
              "linear-gradient(140deg, rgba(30, 30, 30, 0.85) 0%, rgba(20, 20, 20, 0.78) 65%, rgba(18, 18, 18, 0.72) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
          }}
        >
          <h2 className="text-4xl font-bold" style={{ color: "#d4af37" }}>
            Agendamentos
          </h2>

          <div className="mt-5 flex justify-center">
            <div
              className="inline-flex items-center gap-3 rounded-xl border px-4 py-2"
              style={{
                borderColor: "rgba(212, 175, 55, 0.2)",
                background: "linear-gradient(180deg, rgba(30, 30, 30, 0.65) 0%, rgba(24, 24, 24, 0.48) 100%)",
                backdropFilter: "blur(2px)",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "#d4af37", boxShadow: "0 0 8px rgba(212, 175, 55, 0.4)" }}
              />
              <span className="text-[10px] font-semibold" style={{ color: "#b0b0b0", letterSpacing: "1.2px" }}>
                HOJE
              </span>
              <span className="h-3 w-px" style={{ background: "#2a2a2a" }} />
              <span className="text-sm font-medium" style={{ color: "#eaeaea" }}>
                {todayLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Blocos operacionais do dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Referencia visual dos botoes do sistema */}
        <section className="mb-12">
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: "#d4af37", letterSpacing: "1px" }}
          >
            BOTOES DO SISTEMA
          </h3>

          <div
            className="p-6 rounded-lg border"
            style={{ borderColor: "#2a2a2a", background: "#1e1e1e" }}
          >
            <p className="text-sm mb-4" style={{ color: "#b0b0b0" }}>
              Variantes para a hierarquia visual: principal, secundaria e apoio.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="solid" rightIcon={<span>→</span>}>
                Confirmar
              </Button>

              <Button variant="outline">Reagendar</Button>

              <Button variant="ghost">Mais detalhes</Button>

              <Button variant="subtle">Ver historico</Button>

              <Button variant="solid" isLoading>
                Salvando
              </Button>

              <Button variant="danger">Ver historico</Button>

            </div>
          </div>
        </section>

        {/* Visao rapida com indicadores principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card principal de destaque */}
          <div
            className="md:col-span-2 p-8 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
            style={{
              borderColor: "#d4af37",
              background: "#1e1e1e",
              boxShadow: "inset 0 0 20px rgba(212, 175, 55, 0.1)",
            }}
          >
            <p className="text-xs font-semibold mb-4" style={{ color: "#b0b0b0", letterSpacing: "1px" }}>
              PRÓXIMO HORÁRIO
            </p>
            <p
              className="text-5xl font-bold"
              style={{ color: "#d4af37", fontVariantNumeric: "tabular-nums" }}
            >
              --:--
            </p>
            <p className="text-xs mt-4" style={{ color: "#808080" }}>
              Sem agendamentos pendentes
            </p>
          </div>

          {/* Cards secundarios com dados de apoio */}
          <div className="space-y-4">
            <div
              className="p-6 rounded-lg border"
              style={{ borderColor: "#2a2a2a", background: "#1e1e1e" }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: "#b0b0b0", letterSpacing: "1px" }}>
                HOJE
              </p>
              <p className="text-3xl font-bold" style={{ color: "#eaeaea" }}>
                0
              </p>
            </div>
            <div
              className="p-6 rounded-lg border"
              style={{ borderColor: "#2a2a2a", background: "#1e1e1e" }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: "#b0b0b0", letterSpacing: "1px" }}>
                CAPACIDADE
              </p>
              <p className="text-3xl font-bold" style={{ color: "#eaeaea" }}>
                0%
              </p>
            </div>
          </div>
        </div>

        {/* Lista principal da agenda do dia */}
        <div className="mb-6 sm:mb-8">
          <h3
            className="text-base sm:text-lg font-bold mb-3 sm:mb-6"
            style={{ color: "#d4af37", letterSpacing: "1px" }}
          >
            AGENDA DO DIA
          </h3>

          <div
            className="rounded-lg border-2 overflow-hidden"
            style={{
              borderColor: "#2a2a2a",
              background: "#1e1e1e",
            }}
          >
            <div
              className="px-4 py-4 sm:px-8 sm:py-6 border-b"
              style={{
                borderColor: "#2a2a2a",
                background: "#121212",
              }}
            >
              <p className="text-xs font-semibold" style={{ color: "#b0b0b0", letterSpacing: "1px" }}>
                HORÁRIOS AGENDADOS
              </p>
            </div>
            <div className="p-4 sm:p-8">
              <AppointmentsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}