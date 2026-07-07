import BroadcastPanel from "@/components/broadcast/BroadcastPanel";

export default function BroadcastPage() {
  return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-(--color-text-primary)">Broadcast</h1>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Envie mensagens para grupos de clientes via WhatsApp.
          </p>
        </div>

        <BroadcastPanel />
      </main>
  );
}