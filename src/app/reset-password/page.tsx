"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { requestPasswordReset, resetPassword } from "@/features/auth";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const token = searchParams.get("token");
  const step = token ? "reset" : "request";

  // Step 1: Request password reset
  const [email, setEmail] = useState("");
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  // Step 2: Reset with token
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  async function handleRequestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      addToast({
        title: "Email obrigatório",
        description: "Informe seu email para receber o link de reset.",
        type: "error",
      });
      return;
    }

    try {
      setIsRequestingReset(true);
      await requestPasswordReset({ email: email.trim() });
      addToast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para o link de reset de senha.",
        type: "success",
      });
      setEmail("");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Erro ao solicitar reset.";

      addToast({
        title: "Erro ao solicitar reset",
        description: message.includes("404")
          ? "Email não encontrado."
          : message,
        type: "error",
      });
    } finally {
      setIsRequestingReset(false);
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password.trim()) {
      addToast({
        title: "Senha obrigatória",
        description: "Informe uma nova senha.",
        type: "error",
      });
      return;
    }

    if (password.length < 8) {
      addToast({
        title: "Senha fraca",
        description: "A senha precisa ter pelo menos 8 caracteres.",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      addToast({
        title: "Confirmação inválida",
        description: "As senhas não conferem.",
        type: "error",
      });
      return;
    }

    if (!token) {
      addToast({
        title: "Token inválido",
        description: "O link de reset expirou ou é inválido.",
        type: "error",
      });
      return;
    }

    try {
      setIsResettingPassword(true);
      await resetPassword({ token, password: password.trim() });
      addToast({
        title: "Senha alterada com sucesso",
        description: "Você será redirecionado para o login.",
        type: "success",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Erro ao redefinir senha.";

      addToast({
        title: "Erro ao redefinir senha",
        description: message.includes("401")
          ? "Token expirado ou inválido."
          : message,
        type: "error",
      });
    } finally {
      setIsResettingPassword(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Header Section */}
        <div className="text-center pb-4">
          <h1 className="text-3xl sm:text-4xl font-semibold text-(--color-text-primary)">
            Recuperar Senha
          </h1>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            {step === "request"
              ? "Informe seu email para receber um link de reset"
              : "Defina uma nova senha"}
          </p>
        </div>

        {step === "request" ? (
          // Step 1: Request Password Reset
          <form onSubmit={handleRequestReset} className="space-y-5">
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
                disabled={isRequestingReset}
                className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent) focus:bg-(--color-bg-card) disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={!email.trim() || isRequestingReset}
              className="w-full mt-6 bg-(--color-accent) hover:bg-[#C19B2E] text-[#121212] font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              {isRequestingReset ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#121212] border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar Link
                </>
              )}
            </button>
          </form>
        ) : (
          // Step 2: Reset Password with Token
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)"
              >
                Nova Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                disabled={isResettingPassword}
                className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent) focus:bg-(--color-bg-card) disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="confirmPassword"
                className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-text-secondary)"
              >
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                disabled={isResettingPassword}
                className="rounded-xl border border-(--color-border-soft) bg-(--color-bg-soft) px-4 py-3 text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-secondary) focus:border-(--color-accent) focus:bg-(--color-bg-card) disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={
                !password.trim() ||
                !confirmPassword.trim() ||
                isResettingPassword
              }
              className="w-full mt-6 bg-(--color-accent) hover:bg-[#C19B2E] text-[#121212] font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              {isResettingPassword ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#121212] border-t-transparent" />
                  Redefinindo...
                </>
              ) : (
                <>
                  Redefinir Senha
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="text-center pt-4 border-t border-(--color-border-soft)">
          <p className="text-sm text-(--color-text-secondary)">
            Voltou a lembrar?{" "}
            <Link
              href="/login"
              className="font-semibold text-(--color-accent) hover:text-[#C19B2E] transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
