"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getClient, updateClient } from "@/features/clients";
import type { Client } from "@/types/client";

type ClientRouteParams = {
  id?: string | string[];
};

export default function EditarClientePage() {
  const params = useParams<ClientRouteParams>();
  const router = useRouter();
  const rawId = params.id;
  const clientId = Array.isArray(rawId) ? rawId[0] : rawId;
  const [clientData, setClientData] = useState<Client | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function normalizePhone(value?: string | null) {
    return (value ?? "").replace(/\D/g, "");
  }

  const whatsappNumber = normalizePhone(clientData?.phone);
  const whatsappMessage = encodeURIComponent(`Olá ${clientData?.name ?? ""}, tudo bem?`);
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : null;

  function handleOpenWhatsApp() {
    if (!whatsappUrl) {
      return;
    }

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    const resolvedClientId = clientId;

    if (!resolvedClientId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadClient(currentClientId: string) {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getClient(currentClientId);

        if (mounted) {
          setClientData(data);
          setNameInput(data.name ?? "");
          setPhoneInput(data.phone ?? "");
          setNotesInput(data.notes ?? "");
        }
      } catch {
        if (mounted) {
          setError("Não foi possível carregar os dados do cliente.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadClient(resolvedClientId);

    return () => {
            mounted = false;
    };
    }, [clientId]);

    if (!clientId) {
    return (
            <section className="container-shell pt-6 sm:pt-8">
        <div className="surface-panel border-(--color-status-busy) p-6 sm:p-8">
                    <p className="text-(--color-status-busy)">ID do cliente não informado na URL.</p>
        </div>
            </section>
    );
    }

    if (isLoading) {
    return (
            <section className="container-shell pt-6 sm:pt-8">
                <div className="surface-panel p-6 sm:p-8">
                    <p className="text-(--color-text-secondary)">Carregando cliente...</p>
                </div>
            </section>
    );
    }

    if (error) {
    return (
            <section className="container-shell pt-6 sm:pt-8">
                <div className="surface-panel border-(--color-status-busy) p-6 sm:p-8">
                    <p className="text-(--color-status-busy)">{error}</p>
                </div>
            </section>
    );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      if (!clientId) {
        setError("ID do cliente não informado na URL.");
        return;
      }

      if (!nameInput.trim()) {
        setError("Informe o nome do cliente.");
        return;
      }

      try {
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        const updated = await updateClient(clientId, {
          name: nameInput.trim(),
          phone: phoneInput.trim() || null,
          notes: notesInput.trim() || null,
        });

        setClientData(updated);
        setNameInput(updated.name ?? "");
        setPhoneInput(updated.phone ?? "");
        setNotesInput(updated.notes ?? "");
        setSuccessMessage("Cliente atualizado com sucesso.");
      } catch (caughtError) {
        if (caughtError instanceof Error) {
          setError(caughtError.message);
        } else {
          setError("Não foi possível atualizar o cliente.");
        }
      } finally {
        setIsSaving(false);
      }
    }

    return (
    <section className="container-shell pt-6 sm:pt-8">
            <div className="surface-panel accent-outline reveal-up px-6 py-7 sm:px-8 sm:py-8">
                <p className="section-title">Atualização</p>
                <h1 className="mt-3 text-3xl font-semibold text-(--color-text-primary) sm:text-4xl">Editar cliente</h1>
                <p className="mt-2 max-w-2xl text-sm text-(--color-text-secondary) sm:text-base">
                  Consulte os dados principais do cliente e inicie um contato rápido por WhatsApp.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <article className="surface-card p-5 sm:p-6 lg:col-span-2">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                        Dados do cliente
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark)/45 px-4 py-3">
                            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">Nome</p>
                            <p className="mt-1 text-base font-medium text-(--color-text-primary)">{clientData?.name ?? "-"}</p>
                        </div>

                        <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark)/45 px-4 py-3">
                            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">ID</p>
                            <p className="mt-1 text-base font-medium text-(--color-text-primary)">{clientData?.id ?? "-"}</p>
                        </div>
                    </div>
                </article>

                <article className="surface-card p-5 sm:p-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                        Contato
                    </p>

                    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark)/45 px-4 py-3">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">Telefone</p>
                        <p className="mt-1 text-base font-medium text-(--color-text-primary)">{clientData?.phone ?? "-"}</p>
                    </div>

                    <div className="mt-4">
                        <Button
                            variant="solid"
                            fullWidth
                            onClick={handleOpenWhatsApp}
                            disabled={!whatsappUrl}
                            rightIcon={<span>{">"}</span>}
                        >
                            Conversar no WhatsApp
                        </Button>

                        <p className="mt-2 text-xs text-(--color-text-secondary)">
                          {whatsappUrl ? "Abre conversa com mensagem pré-preenchida." : "Telefone inválido para gerar link do WhatsApp."}
                        </p>
                    </div>
                </article>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-(--color-status-busy) bg-[rgba(216,81,81,0.12)] p-4 text-(--color-status-busy)">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mt-6 rounded-xl border border-(--color-status-available) bg-[rgba(49,197,119,0.12)] p-4 text-(--color-status-available)">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="surface-panel mt-6 p-5 sm:p-6">
              <p className="mb-4 text-sm text-(--color-text-secondary)">
                Edite os campos abaixo e salve para atualizar os dados do cliente.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                    Nome
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={phoneInput}
                    onChange={(event) => setPhoneInput(event.target.value)}
                    className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                    Observações
                  </label>
                  <input
                    id="notes"
                    type="text"
                    value={notesInput}
                    onChange={(event) => setNotesInput(event.target.value)}
                    className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-dark) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
                  />
                </div>
              </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button type="submit" isLoading={isSaving} rightIcon={<span>{">"}</span>}>
                  Salvar cliente
                </Button>
                    <Button type="button" variant="outline" onClick={() => router.push("/clientes")}>
                        Voltar para clientes
                    </Button>
        </div>
            </form>
    </section>
    );
}