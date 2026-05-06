"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { isAuthenticated, isLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      addToast({
        title: "Email obrigatório",
        description: "Informe seu email para fazer login.",
        type: "error",
      });
      return;
    }

    if (!password.trim()) {
      addToast({
        title: "Senha obrigatória",
        description: "Informe sua senha para fazer login.",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);

      addToast({
        title: "Login realizado",
        description: "Bem-vindo ao painel!",
        type: "success",
      });

      router.push("/");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível fazer login.";

      addToast({
        title: "Falha ao fazer login",
        description: message.includes("401")
          ? "Email ou senha inválidos."
          : message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border-soft)] border-r-[var(--color-accent)] mx-auto" />
          <p className="text-sm text-[var(--color-text-secondary)]">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-dark)] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            Barber Painel
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Faça login para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-card)] p-8 space-y-6">
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                disabled={isSubmitting}
                className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-dark)] px-4 py-3 text-[var(--color-text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-dark)] px-4 py-3 text-[var(--color-text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 disabled:opacity-50"
              />
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!email.trim() || !password.trim()}
              className="w-full"
              rightIcon={<span>{">"}</span>}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </div>

          <p className="text-center text-xs text-[var(--color-text-secondary)]">
            Sistema de gerenciamento de agendamentos da barbearia
          </p>
        </form>
      </div>
    </div>
  );
}
