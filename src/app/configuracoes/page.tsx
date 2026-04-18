export default function ConfiguracoesPage() {
  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Preferências</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">Configurações</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Defina parâmetros operacionais, integrações e comportamento do painel.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="surface-card reveal-up p-5" style={{ animationDelay: "80ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Sistema</p>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Timezone, idioma e dados da barbearia.</p>
        </article>
        <article className="surface-card reveal-up p-5" style={{ animationDelay: "120ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Comunicação</p>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Mensagens automáticas e confirmação por WhatsApp.</p>
        </article>
      </div>
    </section>
  );
}
