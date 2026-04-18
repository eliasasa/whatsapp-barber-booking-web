export default function ServicosPage() {
  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Catálogo</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">Serviços</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Organize duração, preço e posicionamento dos serviços oferecidos pela barbearia.
        </p>
      </div>

      <div className="surface-card mt-6 reveal-up p-5 sm:p-6" style={{ animationDelay: "80ms" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Visão geral</p>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Adicione cards de serviço, regras de duração e precificação nesta área.</p>
      </div>
    </section>
  );
}
