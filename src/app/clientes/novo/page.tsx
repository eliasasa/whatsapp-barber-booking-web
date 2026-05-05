"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/features/clients";

export default function NovoClientePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await createClient({
        name: name.trim(),
        phone: phone.trim() || null,
        notes: notes.trim() || null,
      });

      addToast({
        title: "Cliente criado",
        description: "O novo cliente foi salvo com sucesso.",
        type: "success",
      });

      router.push("/clientes");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Não foi possível criar o cliente.";
      setError(message);
      addToast({
        title: "Falha ao criar",
        description: message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Cadastro</p>
        <h1 className="mt-3 text-3xl font-semibold text-(--color-text-primary) sm:text-4xl">Novo cliente</h1>
        <p className="mt-2 max-w-2xl text-sm text-(--color-text-secondary) sm:text-base">
          Cadastre um cliente com nome, telefone e observações opcionais.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-(--color-status-busy) bg-[rgba(216,81,81,0.12)] p-4 text-(--color-status-busy)">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="surface-panel mt-6 space-y-5 p-6 sm:p-8">
        <div>
          <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
            Nome
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
            placeholder="Ex: João Silva"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Telefone
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
              placeholder="(67) 99999-9999"
            />
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Observações
            </label>
            <input
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
              placeholder="Preferências, detalhes, etc."
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" isLoading={isSaving} rightIcon={<span>{">"}</span>}>
            Salvar cliente
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/clientes") }>
            Cancelar
          </Button>
        </div>
      </form>
    </section>
  );
}