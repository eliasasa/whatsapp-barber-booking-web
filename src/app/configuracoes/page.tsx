"use client";

import { BotGreetingSettings } from "@/components/bot/BotGreetingSettings";

export default function ConfiguracoesPage() {
  return (
    <section className="container-shell pt-6 sm:pt-8">
      <div className="surface-panel reveal-up px-6 py-7 sm:px-8 sm:py-8">
        <p className="section-title">Preferências</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">Configurações</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Defina parâmetros operacionais, integrações e comportamento do painel.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        {/* Bot Settings */}
        <article className="surface-card reveal-up p-6 sm:p-8" style={{ animationDelay: "80ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Bot & Automação</p>
          <p className="mt-2 mb-6 text-sm text-[var(--color-text-secondary)]">Mensagens e comportamento do bot WhatsApp.</p>
          <BotGreetingSettings />
        </article>
      </div>
    </section>
  );
}
