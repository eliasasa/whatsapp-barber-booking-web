"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { getService, updateService } from "@/features/services";
import type { Service } from "@/types/service";

type ServiceRouteParams = {
  id?: string | string[];
};

export default function EditarServicoPage() {
  const params = useParams<ServiceRouteParams>();
  const router = useRouter();
  const { addToast } = useToast();
  const rawId = params.id;
  const serviceId = Array.isArray(rawId) ? rawId[0] : rawId;
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [pausedInput, setPausedInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedServiceId = serviceId;

    if (!resolvedServiceId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadService(currentServiceId: string) {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getService(currentServiceId);

        if (mounted) {
          setServiceData(data);
          setNameInput(data.name ?? "");
          setDurationInput(String(data.duration ?? ""));
          setPriceInput(data.price === null || data.price === undefined ? "" : String(data.price));
          setPausedInput(Boolean(data.paused));
        }
      } catch {
        if (mounted) {
          setError("Não foi possível carregar os dados do serviço.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadService(resolvedServiceId);

    return () => {
      mounted = false;
    };
  }, [serviceId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!serviceId) {
      setError("ID do serviço não informado na URL.");
      return;
    }

    if (!nameInput.trim()) {
      setError("Informe o nome do serviço.");
      return;
    }

    const durationNumber = Number(durationInput);

    if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
      setError("Informe uma duração válida.");
      return;
    }

    const priceNumber = priceInput.trim() === "" ? null : Number(priceInput);

    if (priceNumber !== null && (!Number.isFinite(priceNumber) || priceNumber < 0)) {
      setError("Informe um preço válido.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const updated = await updateService(serviceId, {
        name: nameInput.trim(),
        duration: durationNumber,
        price: priceNumber,
        paused: pausedInput,
      });

      setServiceData(updated);
      setNameInput(updated.name ?? "");
      setDurationInput(String(updated.duration ?? ""));
      setPriceInput(updated.price === null || updated.price === undefined ? "" : String(updated.price));
      setPausedInput(Boolean(updated.paused));
      addToast({
        title: "Serviço atualizado",
        description: "As alterações foram salvas com sucesso.",
        type: "success",
      });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Não foi possível atualizar o serviço.";
      setError(message);
      addToast({
        title: "Falha ao salvar",
        description: message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!serviceId) {
    return (
      <section className="container-shell pt-6 sm:pt-8">
        <div className="surface-panel border-(--color-status-busy) p-6 sm:p-8">
          <p className="text-(--color-status-busy)">ID do serviço não informado na URL.</p>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="container-shell pt-6 sm:pt-8">
        <div className="surface-panel p-6 sm:p-8">
          <p className="text-(--color-text-secondary)">Carregando serviço...</p>
        </div>
      </section>
    );
  }

  if (error && !serviceData) {
    return (
      <section className="container-shell pt-6 sm:pt-8">
        <div className="surface-panel border-(--color-status-busy) p-6 sm:p-8">
          <p className="text-(--color-status-busy)">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Atualização</p>
        <h1 className="mt-3 text-3xl font-semibold text-(--color-text-primary) sm:text-4xl">Editar serviço</h1>
        <p className="mt-2 max-w-2xl text-sm text-(--color-text-secondary) sm:text-base">
          Atualize nome, duração, preço e status do serviço.
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
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="duration" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Duração em minutos
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              value={durationInput}
              onChange={(event) => setDurationInput(event.target.value)}
              className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
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
              value={priceInput}
              onChange={(event) => setPriceInput(event.target.value)}
              className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary)">
            <input
              type="checkbox"
              checked={pausedInput}
              onChange={(event) => setPausedInput(event.target.checked)}
              className="h-4 w-4 accent-(--color-accent)"
            />
            <span className="text-sm font-medium">Serviço pausado</span>
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" isLoading={isSaving} rightIcon={<span>{">"}</span>}>
            Salvar alterações
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/servicos")}>
            Voltar
          </Button>
        </div>
      </form>
    </section>
  );
}
