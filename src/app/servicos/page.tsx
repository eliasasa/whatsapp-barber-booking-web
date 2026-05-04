import ServicesList from "../../components/services/ServicesList";

export default function ServicosPage() {
  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Catálogo</p>
        <h1 className="mt-3 text-3xl font-semibold text-(--color-text-primary) sm:text-4xl">Serviços</h1>
        <p className="mt-2 max-w-2xl text-sm text-(--color-text-secondary) sm:text-base">
          Consulte, pause, remova ou edite os serviços cadastrados na barbearia.
        </p>
      </div>

      <ServicesList />
    </section>
  );
}
