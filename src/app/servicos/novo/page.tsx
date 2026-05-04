"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { createService } from "@/features/services";

export default function NovoServicoPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Informe o nome do serviço.");
      return;
    }

    const durationNumber = Number(duration);

    if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
      setError("Informe uma duração válida.");
      return;
    }

    const priceNumber = price.trim() === "" ? null : Number(price);

    if (priceNumber !== null && (!Number.isFinite(priceNumber) || priceNumber < 0)) {
      setError("Informe um preço válido.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await createService({
        name: name.trim(),
        duration: durationNumber,
        price: priceNumber,
      });

      addToast({
        title: "Serviço criado",
        description: "O novo serviço foi salvo com sucesso.",
        type: "success",
      });

      router.push("/servicos");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Não foi possível criar o serviço.";
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
        <h1 className="mt-3 text-3xl font-semibold text-(--color-text-primary) sm:text-4xl">Novo serviço</h1>
        <p className="mt-2 max-w-2xl text-sm text-(--color-text-secondary) sm:text-base">
          Cadastre um novo serviço com duração, preço e status inicial.
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
            placeholder="Ex: Corte clássico"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="duration" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Duração em minutos
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
              placeholder="30"
            />
          </div>

          <div>
            <label htmlFor="price" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Preço
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" isLoading={isSaving} rightIcon={<span>{">"}</span>}>
            Salvar serviço
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/servicos")}>
            Cancelar
          </Button>
        </div>
      </form>
    </section>
  );
}
