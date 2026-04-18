export default function ClientesPage() {
  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Cadastro</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">Clientes</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Cadastre, atualize e consulte o histórico de relacionamento de cada cliente.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="surface-card reveal-up p-5" style={{ animationDelay: "80ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Base ativa</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">0</p>
        </article>
        <article className="surface-card reveal-up p-5" style={{ animationDelay: "120ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Retenção</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">0%</p>
        </article>
      </div>
    </section>
  );
}
