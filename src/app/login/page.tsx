"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      <div className="flex h-screen items-center justify-center bg-linear-to-br from-[#121212] to-[#1a1a1a]">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-(--color-border-soft) border-t-(--color-accent) mx-auto" />
          <p className="text-sm text-(--color-text-secondary)">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Header Section */}
        <div className="text-center pb-4">
          <h1 className="text-3xl sm:text-4xl font-semibold text-(--color-text-primary)">
            Bem-vindo
          </h1>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            Faça login para acessar o painel
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)"
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
              className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent) focus:bg-(--color-bg-card) disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)"
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
              className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent) focus:bg-(--color-bg-card) disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-xs text-(--color-accent) hover:text-[#C19B2E] transition-colors font-medium"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!email.trim() || !password.trim() || isSubmitting}
            className="w-full mt-6 bg-(--color-accent) hover:bg-[#C19B2E] text-[#121212] font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#121212] border-t-transparent" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
