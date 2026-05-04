import ClientsList from "../../components/clients/ClientsList";
import { listClients } from "../../features/clients/api/listClients";

export default async function ClientesPage() {
  const clients = await listClients().catch(() => []);

  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Cadastro</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">Clientes</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Cadastre, atualize e consulte o histórico de relacionamento de cada cliente.
        </p>
      </div>

      <ClientsList initialClients={clients} />
    </section>
  );
}
