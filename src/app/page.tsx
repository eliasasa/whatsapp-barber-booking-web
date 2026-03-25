import { AppointmentsList } from "@/features/appointments";

export default function Home() {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        className="px-6 py-12 text-center border-b"
        style={{
          borderColor: "#2a2a2a",
          background: "linear-gradient(180deg, #1e1e1e 0%, #121212 100%)",
        }}
      >
        <h2 className="text-4xl font-bold mb-2" style={{ color: "#d4af37" }}>
          Agendamentos
        </h2>
        <p className="text-sm" style={{ color: "#b0b0b0" }}>
          {today.charAt(0).toUpperCase() + today.slice(1)}
        </p>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid - Premium Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Main Stat - Large */}
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

          {/* Side Stats */}
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

        {/* Appointments Section */}
        <div className="mb-8">
          <h3
            className="text-lg font-bold mb-6"
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
              className="px-8 py-6 border-b"
              style={{
                borderColor: "#2a2a2a",
                background: "#121212",
              }}
            >
              <p className="text-xs font-semibold" style={{ color: "#b0b0b0", letterSpacing: "1px" }}>
                HORÁRIOS AGENDADOS
              </p>
            </div>
            <div className="p-8">
              <AppointmentsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}