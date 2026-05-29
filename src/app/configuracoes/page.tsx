"use client";

import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import {
  getBotState,
  getGreetingMessage,
  restartBot,
  setBotState,
  updateGreetingMessage,
} from "@/features/bot/api";
import { getBlockedClients, unblockClient, blockClientByPhone } from "@/features/clients";
import {
  createAvailability,
  createAvailabilityBlock,
  deleteAvailability,
  deleteAvailabilityBlock,
  listAvailability,
  listAvailabilityBlocks,
  updateAvailability,
  updateAvailabilityBlock,
} from "@/features/availability";
import * as wahaApi from "@/features/waha/api";
import type { AvailabilityBlock, AvailabilityItem } from "@/features/availability/types";
import {
  WEEKDAY_OPTIONS,
  formatDateTimeLocal,
  formatTimeToInput,
  toApiDateTime,
  toApiTime,
} from "./availability-utils";

type BotState = {
  paused: boolean;
};

import type { Client } from "@/types/client";

function BotStatusCard() {
  const { addToast } = useToast();
  const [state, setState] = useState<BotState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    async function loadState() {
      try {
        setIsLoading(true);
        const data = await getBotState();
        setState(data);
      } catch {
        addToast({
          title: "Erro ao carregar status",
          description: "Não foi possível verificar o estado do bot.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadState();
  }, [addToast]);

  async function handleTogglePause() {
    const nextPaused = !state?.paused;

    try {
      setIsUpdating(true);
      const updated = await setBotState(nextPaused);
      setState(updated);

      addToast({
        title: nextPaused ? "Bot pausado" : "Bot retomado",
        description: nextPaused
          ? "O bot deixou de responder temporariamente."
          : "O bot voltou a responder mensagens.",
        type: "success",
      });
    } catch {
      addToast({
        title: "Não foi possível alterar o status",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRestart() {
    try {
      setIsRestarting(true);
      await restartBot();
      addToast({
        title: "Bot reiniciado",
        description: "As conversas em memória foram limpas.",
        type: "success",
      });
    } catch {
      addToast({
        title: "Não foi possível reiniciar",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setIsRestarting(false);
    }
  }

  const isPaused = state?.paused ?? false;

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-(--color-text-disabled) border-r-transparent" />
        <p className="text-sm text-(--color-text-secondary)">Carregando status do bot...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">
            Status do bot
          </p>
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-3.5 w-3.5" aria-label={isPaused ? "Estado pausado" : "Estado ativo"}>
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: isPaused
                    ? "var(--color-status-busy)"
                    : "var(--color-status-available)",
                  opacity: 0.7,
                }}
              />
              <span
                className="relative inline-flex h-3.5 w-3.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: isPaused
                    ? "var(--color-status-busy)"
                    : "var(--color-status-available)",
                  boxShadow: isPaused
                    ? "0 0 0 6px rgba(216, 81, 81, 0.2), 0 0 18px rgba(216, 81, 81, 0.45)"
                    : "0 0 0 6px rgba(49, 197, 119, 0.2), 0 0 18px rgba(49, 197, 119, 0.45)",
                }}
              />
            </span>
            <h2 className="text-lg font-semibold text-(--color-text-primary)">
              {isPaused ? "Bot pausado" : "Bot ativo"}
            </h2>
          </div>
          <p className="text-sm text-(--color-text-secondary)">
            {isPaused
              ? "O bot não está respondendo no momento."
              : "O bot está respondendo mensagens normalmente."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Button variant={isPaused ? "solid" : "outline"} onClick={handleTogglePause} isLoading={isUpdating}>
            {isPaused ? "Retomar bot" : "Parar bot"}
          </Button>
          <Button variant="subtle" onClick={handleRestart} isLoading={isRestarting}>
            Reiniciar bot
          </Button>
        </div>
      </div>
    </div>
  );
}

function GreetingEditorCard() {
  const { addToast } = useToast();
  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGreeting() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getGreetingMessage();
        setContent(data.content);
        setInitialContent(data.content);
      } catch {
        setError("Não foi possível carregar a mensagem de boas-vindas.");
        addToast({
          title: "Erro ao carregar",
          description: "Verifique a conexão e tente novamente.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadGreeting();
  }, [addToast]);

  async function handleSave() {
    if (!content.trim()) {
      addToast({
        title: "Campo vazio",
        description: "A mensagem de boas-vindas não pode estar vazia.",
        type: "error",
      });
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateGreetingMessage(content.trim());
      setContent(updated.content);
      setInitialContent(updated.content);
      addToast({
        title: "Salvo com sucesso",
        description: "Mensagem de boas-vindas atualizada.",
        type: "success",
      });
    } catch {
      addToast({
        title: "Erro ao salvar",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges = content !== initialContent;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--color-text-disabled) border-r-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-(--color-status-busy)/30 bg-[rgba(230,57,70,0.06)] p-4">
        <p className="text-sm text-(--color-status-busy)">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">
            Mensagem de boas-vindas
          </p>
          <p className="mt-2 text-sm text-(--color-text-secondary)">Texto enviado quando um cliente inicia contato com o bot.</p>
        </div>

        <span className="inline-flex items-center rounded-full border border-(--color-border-soft) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold text-(--color-text-secondary)">
          {content.length} caracteres
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escreva aqui a mensagem que será enviada no primeiro contato."
          className="min-h-48 w-full resize-y rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-4 text-(--color-text-primary) outline-none transition duration-200 placeholder:text-(--color-text-disabled) focus:border-(--color-text-secondary)"
          style={{ boxShadow: "none" }}
          rows={6}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-(--color-border-soft) pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-(--color-text-disabled)">Ajuste esse texto para refletir o tom da sua barbearia.</p>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setContent(initialContent)}
            disabled={!hasChanges || isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} isLoading={isSaving}>
            Salvar mudanças
          </Button>
        </div>
      </div>
    </div>
  );
}

function BlockedClientsCard() {
  const { addToast } = useToast();
  const [blockedClients, setBlockedClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlockedClients() {
      try {
        setIsLoading(true);
        const data = await getBlockedClients();
        setBlockedClients(data);
      } catch {
        addToast({
          title: "Erro ao carregar clientes bloqueados",
          description: "Não foi possível carregar a lista.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadBlockedClients();
  }, [addToast]);

  async function handleUnblock(clientId: string, clientName: string) {
    try {
      setUnblockingId(clientId);
      await unblockClient(clientId);
      setBlockedClients((prev) => prev.filter((c) => c.id !== clientId));
      addToast({
        title: "Cliente desbloqueado",
        description: `${clientName} foi removido da lista de bloqueados.`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Erro ao desbloquear",
        description: "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setUnblockingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--color-text-disabled) border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">
        Clientes bloqueados
      </p>
      <p className="mt-2 text-sm text-(--color-text-secondary)">
        {blockedClients.length} cliente{blockedClients.length !== 1 ? "s" : ""} bloqueado{blockedClients.length !== 1 ? "s" : ""}
      </p>

      {blockedClients.length === 0 ? (
        <div className="mt-6 py-10 text-center">
          <p className="text-sm text-(--color-text-secondary)">Nenhum cliente bloqueado no momento.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2 border-t border-(--color-border-soft) pt-4">
          {blockedClients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-(--color-bg-soft) p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-(--color-text-primary) truncate">{client.name}</p>
                {client.phone && (
                  <p className="text-xs text-(--color-text-secondary) truncate">{client.phone}</p>
                )}
              </div>
              <Button
                variant="subtle"
                onClick={() => handleUnblock(client.id, client.name)}
                disabled={unblockingId !== null}
                isLoading={unblockingId === client.id}
              >
                Desbloquear
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockByPhoneCard() {
  const { addToast } = useToast();
  const [phone, setPhone] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  // Regexp: only digits, must be 55 + DDD(2 digits) + 8 digits (total 12 digits)
  // Example: 55 67 12345678 -> 556712345678
  const PHONE_REGEX = /^55\d{2}\d{8}$/;

  async function handleBlockByPhone() {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      addToast({
        title: "Telefone inválido",
        description: "Digite um telefone para bloquear.",
        type: "error",
      });
      return;
    }

    if (!/^[0-9]+$/.test(cleanPhone) || !PHONE_REGEX.test(cleanPhone)) {
      addToast({
        title: "Formato inválido",
          description:
          "Use apenas dígitos no formato: 55 + DDD + número com 8 dígitos (ex.: 556712345678)",
        type: "error",
      });
      return;
    }

    try {
      setIsBlocking(true);
      const client = await blockClientByPhone(cleanPhone);
      setPhone("");
      const blockedLabel = client.name?.trim() || client.phone?.trim() || cleanPhone;
      addToast({
        title: "Cliente bloqueado",
        description: `${blockedLabel} foi bloqueado com sucesso.`,
        type: "success",
      });
    } catch {
      addToast({
        title: "Erro ao bloquear cliente",
        description: "Cliente não encontrado ou erro ao processar. Verifique o telefone.",
        type: "error",
      });
    } finally {
      setIsBlocking(false);
    }
  }

  return (
    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">
        Bloquear cliente
      </p>
      <p className="mt-2 text-sm text-(--color-text-secondary)">
        Bloqueie um cliente informando seu número de telefone.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
        <div className="flex-1">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="556712345678"
            className="w-full rounded-lg border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-disabled) focus:border-(--color-accent)"
            disabled={isBlocking}
            aria-label="Telefone (apenas dígitos: 55 + DDD + número de 8 dígitos)"
          />
          <p className="mt-2 text-xs text-(--color-text-disabled)">Formato: apenas dígitos — ex.: 556712345678 (55 + DDD + número com 8 dígitos)</p>
        </div>
        <Button
          onClick={handleBlockByPhone}
          disabled={!phone.trim() || isBlocking}
          isLoading={isBlocking}
        >
          Bloquear
        </Button>
      </div>
    </div>
  );
}

function WahaSessionsCard() {
  const { addToast } = useToast();
  const [sessions, setSessions] = useState<
    Array<{ name: string; status?: string; me?: { id?: string; pushName?: string } }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState<string>("");
  const hasActiveSession = sessions.some(
    (session) => session.status === "WORKING" || Boolean(session.me?.pushName || session.me?.id),
  );

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await wahaApi.listSessions();

      // Expected shape: { sessions: [ { name, status, config, me, ... }, ... ] }
      const items = Array.isArray(data?.sessions) ? data.sessions : Array.isArray(data) ? data : [];

      const normalized = items.map((item: Record<string, unknown>) => {
        const rawName = item.name ?? item.id ?? String(item);
        const rawStatus = item.status;
        const rawMe = item.me;

        const me =
          rawMe && typeof rawMe === "object"
            ? {
                id:
                  typeof (rawMe as { id?: unknown }).id === "string"
                    ? (rawMe as { id?: string }).id
                    : undefined,
                pushName:
                  typeof (rawMe as { pushName?: unknown }).pushName === "string"
                    ? (rawMe as { pushName?: string }).pushName
                    : undefined,
              }
            : undefined;

        return {
          name: typeof rawName === "string" ? rawName : String(rawName),
          status: typeof rawStatus === "string" ? rawStatus : undefined,
          me,
        };
      });

      setSessions(normalized);
    } catch {
      addToast({ title: "Erro ao listar sessões", description: "Não foi possível carregar sessões WAHA.", type: "error" });
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAction(sessionName: string, fn: () => Promise<Record<string, unknown>>, successMsg: string) {
    try {
      setActionId(sessionName);
      await fn();
      addToast({ title: successMsg, type: "success" });
      await load();
    } catch (e) {
      addToast({ title: "Erro", description: (e instanceof Error ? e.message : "Falha na operação"), type: "error" });
    } finally {
      setActionId(null);
    }
  }

  function openQr(sessionName: string) {
    if (hasActiveSession) {
      return;
    }

    void (async () => {
      try {
        const res = await wahaApi.getSessionQr(sessionName);
        if (!res) throw new Error("QR não retornado");
        const qrValue = typeof res === "string" ? res : res?.value ?? res?.qr ?? res?.data;
        if (!qrValue) throw new Error("QR code não encontrado na resposta");

        setQrData(String(qrValue).trim());
        setQrModalOpen(true);
      } catch (err) {
        addToast({ title: "Erro ao buscar QR", description: (err instanceof Error ? err.message : "Falha"), type: "error" });
      }
    })();
  }

  async function showMe(sessionName: string) {
    try {
      const res = (await wahaApi.getSessionMe(sessionName)) as unknown;

      // If response is empty string or falsy, it means the session is connected and healthy
      if (!res || res === "") {
        const session = sessions.find(s => s.name === sessionName);
        const displayName = session?.me?.pushName || session?.me?.id || sessionName;
        addToast({ title: "✓ Conectado", description: `Sessão '${displayName}' está ativa e respondendo`, type: "success" });
      } else if (typeof res === "string") {
        const number = res;
        addToast({ title: `Conectado: ${number}`, type: "success" });
      } else if (typeof res === "object" && res !== null) {
        const payload = res as { id?: string; number?: string };
        const number = payload.id ?? payload.number ?? JSON.stringify(res);
        addToast({ title: `Conectado: ${number}`, type: "success" });
      }
    } catch {
      addToast({ title: "Erro ao verificar", description: "Não foi possível verificar a sessão", type: "error" });
    }
  }

  return (
    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">WhatsApp Hub</p>
          <p className="mt-2 text-sm text-(--color-text-secondary)">Gerencie suas sessões do WhatsApp</p>
        </div>
        <Button onClick={() => void load()} isLoading={isLoading} size="sm">
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-(--color-text-secondary)">Carregando sessões...</div>
      ) : sessions.length === 0 ? (
        <div className="py-8 text-center text-sm text-(--color-text-secondary)">Nenhuma sessão encontrada</div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            (() => {
              const isConnected = s.status === "WORKING" || Boolean(s.me?.pushName || s.me?.id);
              const statusLabel = s.status ?? "Desconhecido";

              return (
            <div
              key={s.name}
              className="rounded-lg border border-(--color-border-soft) bg-(--color-bg-soft) p-4 transition-all hover:border-(--color-accent) hover:shadow-sm"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                {/* Session Info */}
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3 mb-2">
                    <p className="text-base font-semibold text-(--color-text-primary) truncate">{s.name}</p>
                    <span className="inline-flex items-center rounded-full border border-(--color-border-soft) bg-(--color-bg-card) px-2.5 py-0.5 text-xs font-semibold tracking-[0.04em] text-(--color-text-primary)">
                      {statusLabel}
                    </span>
                  </div>
                  {(s.me?.pushName || s.me?.id) && (
                    <p className="text-sm text-(--color-text-secondary)">
                      📱 {s.me.pushName || s.me.id}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-stretch">
                  {!hasActiveSession && !isConnected && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openQr(s.name)}
                      title="Exibir código QR para autenticação"
                      className="w-full sm:flex-1"
                    >
                      QR
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void showMe(s.name)}
                    title="Verificar número autenticado"
                    className="w-full sm:flex-1"
                  >
                    Info
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void handleAction(s.name, () => wahaApi.startSession(s.name), "Sessão iniciada")}
                    isLoading={actionId === s.name}
                    title="Iniciar sessão"
                    className="w-full sm:flex-1"
                  >
                    Iniciar
                  </Button>
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => void handleAction(s.name, () => wahaApi.stopSession(s.name), "Sessão parada")}
                    isLoading={actionId === s.name}
                    title="Parar sessão"
                    className="w-full sm:flex-1"
                  >
                    Parar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleAction(s.name, () => wahaApi.restartSession(s.name), "Sessão reiniciada")}
                    isLoading={actionId === s.name}
                    title="Reiniciar sessão"
                    className="w-full sm:flex-1"
                  >
                    Reiniciar
                  </Button>
                </div>
              </div>

              {/* Logout Button - Secondary Row */}
              <div className="mt-3 flex justify-start border-t border-(--color-border-soft) pt-3">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => void handleAction(s.name, () => wahaApi.logoutSession(s.name), "Logout executado")}
                  isLoading={actionId === s.name}
                  title="Fazer logout da sessão"
                  className="w-full sm:w-auto"
                >
                  Logout
                </Button>
              </div>
            </div>
              );
            })()
          ))}
        </div>
      )}

      {/* QR Preview Panel */}
      {!hasActiveSession && qrModalOpen && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-(--color-border-soft) bg-(--color-bg-soft) shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3 border-b border-(--color-border-soft) bg-(--color-bg-card) px-4 py-3 sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">
                WAHA
              </p>
              <h3 className="mt-1 text-base font-semibold text-(--color-text-primary)">QR Code da Sessão</h3>
            </div>
            <Button size="sm" variant="outline" onClick={() => setQrModalOpen(false)}>
              Fechar
            </Button>
          </div>

          <div className="grid gap-5 px-4 py-4 sm:px-5 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="flex justify-center rounded-2xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 shadow-sm">
              {qrData ? <QRCodeSVG value={qrData} size={216} includeMargin /> : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-4">
                <p className="text-sm font-medium text-(--color-text-primary)">Escaneie para conectar</p>
                <p className="mt-2 text-sm leading-6 text-(--color-text-secondary)">
                  Abra o WhatsApp no celular e aponte a câmera para este QR.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const svg = document.querySelector("svg");
                    if (!svg) return;
                    const xml = new XMLSerializer().serializeToString(svg);
                    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "qr-code.svg";
                    link.click();
                  }}
                >
                  Baixar QR
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getWeekdayLabel(weekday: number) {
  return WEEKDAY_OPTIONS.find((option) => option.value === weekday)?.label ?? "Dia da semana";
}

type WeeklyDraft = {
  weekday: string;
  startTime: string;
  endTime: string;
};

type BlockDraft = {
  startAt: string;
  endAt: string;
  reason: string;
};

function WeeklyAvailabilityCard() {
  const { addToast } = useToast();
  const [items, setItems] = useState<AvailabilityItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, WeeklyDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AvailabilityItem | null>(null);
  const [weekday, setWeekday] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  useEffect(() => {
    async function loadAvailability() {
      try {
        setIsLoading(true);
        const data = await listAvailability();
        const sorted = [...data].sort((first, second) => {
          if (first.weekday !== second.weekday) {
            return first.weekday - second.weekday;
          }

          return first.startTime.localeCompare(second.startTime);
        });

        setItems(sorted);
        setDrafts(
          Object.fromEntries(
            sorted.map((item) => [
              item.id,
              {
                weekday: String(item.weekday),
                startTime: formatTimeToInput(item.startTime),
                endTime: formatTimeToInput(item.endTime),
              },
            ]),
          ),
        );
      } catch {
        addToast({
          title: "Erro ao carregar expediente",
          description: "Não foi possível consultar os horários.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadAvailability();
  }, [addToast]);

  function updateDraft(itemId: string, field: keyof WeeklyDraft, value: string) {
    setDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? { weekday: "1", startTime: "09:00", endTime: "18:00" }),
        [field]: value,
      },
    }));
  }

  function validateTimeRange(start: string, end: string) {
    if (!start || !end) return false;
    return start < end;
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateTimeRange(startTime, endTime)) {
      addToast({
        title: "Horário inválido",
        description: "O horário inicial precisa ser menor que o final.",
        type: "error",
      });
      return;
    }

    try {
      setIsCreating(true);
      const created = await createAvailability({
        weekday: Number(weekday),
        startTime: toApiTime(startTime),
        endTime: toApiTime(endTime),
      });

      setItems((current) =>
        [...current, created].sort((first, second) => {
          if (first.weekday !== second.weekday) {
            return first.weekday - second.weekday;
          }

          return first.startTime.localeCompare(second.startTime);
        }),
      );
      setDrafts((current) => ({
        ...current,
        [created.id]: {
          weekday: String(created.weekday),
          startTime: formatTimeToInput(created.startTime),
          endTime: formatTimeToInput(created.endTime),
        },
      }));

      addToast({
        title: "Expediente criado",
        description: "O novo horário semanal foi salvo.",
        type: "success",
      });
    } catch (caughtError) {
      addToast({
        title: "Erro ao criar expediente",
        description: caughtError instanceof Error ? caughtError.message : "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSave(item: AvailabilityItem) {
    const draft = drafts[item.id] ?? {
      weekday: String(item.weekday),
      startTime: formatTimeToInput(item.startTime),
      endTime: formatTimeToInput(item.endTime),
    };

    if (!validateTimeRange(draft.startTime, draft.endTime)) {
      addToast({
        title: "Horário inválido",
        description: "O horário inicial precisa ser menor que o final.",
        type: "error",
      });
      return;
    }

    try {
      setSavingId(item.id);
      const updated = await updateAvailability(item.id, {
        weekday: Number(draft.weekday),
        startTime: toApiTime(draft.startTime),
        endTime: toApiTime(draft.endTime),
      });

      setItems((current) =>
        current
          .map((currentItem) => (currentItem.id === updated.id ? updated : currentItem))
          .sort((first, second) => {
            if (first.weekday !== second.weekday) {
              return first.weekday - second.weekday;
            }

            return first.startTime.localeCompare(second.startTime);
          }),
      );

      addToast({
        title: "Expediente atualizado",
        description: "As alterações foram salvas.",
        type: "success",
      });
    } catch (caughtError) {
      addToast({
        title: "Erro ao atualizar expediente",
        description: caughtError instanceof Error ? caughtError.message : "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    try {
      setSavingId(pendingDelete.id);
      await deleteAvailability(pendingDelete.id);
      setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
      setDrafts((current) => {
        const next = { ...current };
        delete next[pendingDelete.id];
        return next;
      });
      addToast({
        title: "Expediente removido",
        description: "O horário semanal foi excluído.",
        type: "success",
      });
    } catch (caughtError) {
      addToast({
        title: "Erro ao remover expediente",
        description: caughtError instanceof Error ? caughtError.message : "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setSavingId(null);
      setPendingDelete(null);
    }
  }

  const sortedItems = [...items].sort((first, second) => {
    if (first.weekday !== second.weekday) {
      return first.weekday - second.weekday;
    }

    return first.startTime.localeCompare(second.startTime);
  });

  return (
    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 sm:p-6">
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remover expediente?"
        description={`Tem certeza que deseja remover o expediente de ${pendingDelete ? getWeekdayLabel(pendingDelete.weekday) : "este dia"}?`}
        confirmText="Sim, remover"
        cancelText="Não, manter"
        confirmVariant="danger"
        isLoading={savingId !== null}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">
            Gerenciar expediente semanal
          </p>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            Defina os horários de atendimento por dia da semana.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full border border-(--color-border-soft) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold text-(--color-text-secondary)">
          {sortedItems.length} expediente{sortedItems.length !== 1 ? "s" : ""}
        </span>
      </div>

      <form onSubmit={handleCreate} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
            Dia da semana
          </label>
          <select
            value={weekday}
            onChange={(event) => setWeekday(event.target.value)}
            className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
          >
            {WEEKDAY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
            Início
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
            Fim
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
          />
        </div>
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <Button type="submit" isLoading={isCreating} className="w-full">
            Adicionar
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="mt-6 rounded-xl border border-dashed border-(--color-border-soft) bg-(--color-bg-soft) py-10 text-center text-sm text-(--color-text-secondary)">
          Carregando expediente...
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-(--color-border-soft) bg-(--color-bg-soft) py-10 text-center text-sm text-(--color-text-secondary)">
          Nenhum expediente cadastrado ainda.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {sortedItems.map((item) => {
            const draft = drafts[item.id] ?? {
              weekday: String(item.weekday),
              startTime: formatTimeToInput(item.startTime),
              endTime: formatTimeToInput(item.endTime),
            };

            return (
              <div key={item.id} className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) p-4">
                <div className="grid gap-3 overflow-x-hidden sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_minmax(0,200px)]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                      Dia
                    </label>
                    <select
                      value={draft.weekday}
                      onChange={(event) => updateDraft(item.id, "weekday", event.target.value)}
                      className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
                    >
                      {WEEKDAY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                      Início
                    </label>
                    <input
                      type="time"
                      value={draft.startTime}
                      onChange={(event) => updateDraft(item.id, "startTime", event.target.value)}
                      className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                      Fim
                    </label>
                    <input
                      type="time"
                      value={draft.endTime}
                      onChange={(event) => updateDraft(item.id, "endTime", event.target.value)}
                      className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-1 lg:items-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleSave(item)}
                      isLoading={savingId === item.id}
                      className="min-w-0"
                    >
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setPendingDelete(item)}
                      disabled={savingId !== null}
                      className="min-w-0"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AvailabilityBlocksCard() {
  const { addToast } = useToast();
  const [items, setItems] = useState<AvailabilityBlock[]>([]);
  const [drafts, setDrafts] = useState<Record<string, BlockDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AvailabilityBlock | null>(null);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function loadBlocks() {
      try {
        setIsLoading(true);
        const data = await listAvailabilityBlocks();
        const sorted = [...data].sort(
          (first, second) => new Date(first.startAt).getTime() - new Date(second.startAt).getTime(),
        );

        setItems(sorted);
        setDrafts(
          Object.fromEntries(
            sorted.map((item) => [
              item.id,
              {
                startAt: formatDateTimeLocal(item.startAt),
                endAt: formatDateTimeLocal(item.endAt),
                reason: item.reason ?? "",
              },
            ]),
          ),
        );
      } catch {
        addToast({
          title: "Erro ao carregar bloqueios",
          description: "Não foi possível consultar os bloqueios.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadBlocks();
  }, [addToast]);

  function updateDraft(itemId: string, field: keyof BlockDraft, value: string) {
    setDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? { startAt: "", endAt: "", reason: "" }),
        [field]: value,
      },
    }));
  }

  function validateRange(start: string, end: string) {
    if (!start || !end) return false;
    return new Date(start) < new Date(end);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateRange(startAt, endAt)) {
      addToast({
        title: "Período inválido",
        description: "O início do bloqueio precisa ser antes do fim.",
        type: "error",
      });
      return;
    }

    try {
      setIsCreating(true);
      const created = await createAvailabilityBlock({
        startAt: toApiDateTime(startAt),
        endAt: toApiDateTime(endAt),
        reason: reason.trim() || undefined,
      });

      setItems((current) =>
        [...current, created].sort(
          (first, second) => new Date(first.startAt).getTime() - new Date(second.startAt).getTime(),
        ),
      );
      setDrafts((current) => ({
        ...current,
        [created.id]: {
          startAt: formatDateTimeLocal(created.startAt),
          endAt: formatDateTimeLocal(created.endAt),
          reason: created.reason ?? "",
        },
      }));
      setStartAt("");
      setEndAt("");
      setReason("");

      addToast({
        title: "Bloqueio criado",
        description: "O período bloqueado foi salvo com sucesso.",
        type: "success",
      });
    } catch (caughtError) {
      addToast({
        title: "Erro ao criar bloqueio",
        description: caughtError instanceof Error ? caughtError.message : "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSave(item: AvailabilityBlock) {
    const draft = drafts[item.id] ?? {
      startAt: formatDateTimeLocal(item.startAt),
      endAt: formatDateTimeLocal(item.endAt),
      reason: item.reason ?? "",
    };

    if (!validateRange(draft.startAt, draft.endAt)) {
      addToast({
        title: "Período inválido",
        description: "O início do bloqueio precisa ser antes do fim.",
        type: "error",
      });
      return;
    }

    try {
      setSavingId(item.id);
      const updated = await updateAvailabilityBlock(item.id, {
        startAt: toApiDateTime(draft.startAt),
        endAt: toApiDateTime(draft.endAt),
        reason: draft.reason.trim() || undefined,
      });

      setItems((current) =>
        current
          .map((currentItem) => (currentItem.id === updated.id ? updated : currentItem))
          .sort(
            (first, second) => new Date(first.startAt).getTime() - new Date(second.startAt).getTime(),
          ),
      );
      addToast({
        title: "Bloqueio atualizado",
        description: "As alterações foram salvas.",
        type: "success",
      });
    } catch (caughtError) {
      addToast({
        title: "Erro ao atualizar bloqueio",
        description: caughtError instanceof Error ? caughtError.message : "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    try {
      setSavingId(pendingDelete.id);
      await deleteAvailabilityBlock(pendingDelete.id);
      setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
      setDrafts((current) => {
        const next = { ...current };
        delete next[pendingDelete.id];
        return next;
      });
      addToast({
        title: "Bloqueio removido",
        description: "O período bloqueado foi excluído.",
        type: "success",
      });
    } catch (caughtError) {
      addToast({
        title: "Erro ao remover bloqueio",
        description: caughtError instanceof Error ? caughtError.message : "Tente novamente em instantes.",
        type: "error",
      });
    } finally {
      setSavingId(null);
      setPendingDelete(null);
    }
  }

  const sortedItems = [...items].sort(
    (first, second) => new Date(first.startAt).getTime() - new Date(second.startAt).getTime(),
  );

  return (
    <div className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) p-5 sm:p-6">
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remover bloqueio?"
        description={`Tem certeza que deseja remover o bloqueio${pendingDelete?.reason ? ` (${pendingDelete.reason})` : ""}?`}
        confirmText="Sim, remover"
        cancelText="Não, manter"
        confirmVariant="danger"
        isLoading={savingId !== null}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-disabled)">
            Gerenciar bloqueios
          </p>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            Registre intervalos específicos, como férias ou indisponibilidades pontuais.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full border border-(--color-border-soft) bg-(--color-bg-soft) px-3 py-1 text-xs font-semibold text-(--color-text-secondary)">
          {sortedItems.length} bloqueio{sortedItems.length !== 1 ? "s" : ""}
        </span>
      </div>

      <form onSubmit={handleCreate} className="mt-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Início
            </label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Fim
            </label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
              className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
              Motivo
            </label>
            <input
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Férias, evento, manutenção..."
              className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent)"
            />
          </div>
          <Button type="submit" isLoading={isCreating} className="w-full sm:w-auto">
            Adicionar
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="mt-6 rounded-xl border border-dashed border-(--color-border-soft) bg-(--color-bg-soft) py-10 text-center text-sm text-(--color-text-secondary)">
          Carregando bloqueios...
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-(--color-border-soft) bg-(--color-bg-soft) py-10 text-center text-sm text-(--color-text-secondary)">
          Nenhum bloqueio cadastrado ainda.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {sortedItems.map((item) => {
            const draft = drafts[item.id] ?? {
              startAt: formatDateTimeLocal(item.startAt),
              endAt: formatDateTimeLocal(item.endAt),
              reason: item.reason ?? "",
            };

            return (
              <div key={item.id} className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) p-4">
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr]">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                        Início
                      </label>
                      <input
                        type="datetime-local"
                        value={draft.startAt}
                        onChange={(event) => updateDraft(item.id, "startAt", event.target.value)}
                        className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                        Fim
                      </label>
                      <input
                        type="datetime-local"
                        value={draft.endAt}
                        onChange={(event) => updateDraft(item.id, "endAt", event.target.value)}
                        className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) px-4 py-3 text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent)"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)">
                        Motivo
                      </label>
                      <input
                        type="text"
                        value={draft.reason}
                        onChange={(event) => updateDraft(item.id, "reason", event.target.value)}
                        placeholder="(opcional)"
                        className="w-full rounded-xl border border-(--color-border-soft) bg-(--color-bg-card) px-4 py-3 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent)"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 sm:col-span-1 sm:items-end">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void handleSave(item)}
                        isLoading={savingId === item.id}
                        className="whitespace-nowrap"
                      >
                        Salvar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setPendingDelete(item)}
                        disabled={savingId !== null}
                        className="whitespace-nowrap"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Preferências</p>
        <h1 className="mt-3 text-3xl font-semibold text-(--color-text-primary) sm:text-4xl">Configurações</h1>
        <p className="mt-2 text-sm text-(--color-text-secondary) sm:text-base">
          Defina parâmetros operacionais, integrações e comportamento do painel.
        </p>
      </div>

      <div className="mt-4 surface-panel reveal-up px-6 py-4 sm:px-8 sm:py-6">
        <p className="text-sm text-(--color-text-secondary)">Integrações</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="max-w-lg text-sm text-(--color-text-primary)">
            Abra o dashboard do WAHA para gerenciar integrações do bot e filas.
          </p>
          <div className="sm:ml-auto">
            <Button
              onClick={() => {
                const url = (process.env.NEXT_PUBLIC_WAHA_API_URL as string) || "http://localhost:3001";
                try {
                  window.open(url, "_blank");
                } catch {
                  // fallback
                  window.location.href = url;
                }
              }}
            >
              Abrir WAHA Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5">
        <div className="reveal-up" style={{ animationDelay: "40ms" }}>
          <WahaSessionsCard />
        </div>

        <div className="reveal-up" style={{ animationDelay: "80ms" }}>
          <BotStatusCard />
        </div>

        <div className="mt-2 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="reveal-up" style={{ animationDelay: "120ms" }}>
            <WeeklyAvailabilityCard />
          </div>

          <div className="reveal-up" style={{ animationDelay: "160ms" }}>
            <AvailabilityBlocksCard />
          </div>
        </div>

        <div className="reveal-up" style={{ animationDelay: "200ms" }}>
          <GreetingEditorCard />
        </div>

        <div className="reveal-up" style={{ animationDelay: "240ms" }}>
          <BlockedClientsCard />
        </div>

        <div className="reveal-up" style={{ animationDelay: "280ms" }}>
          <BlockByPhoneCard />
        </div>
      </div>
    </section>
  );
}
