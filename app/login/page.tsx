"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, AUTH_TOKEN_KEY } from "@/lib/api";
import LoginBackground from "./LoginBackground";
import ActionButton from "@/components/ui/ActionButton";

const inputBase =
  "w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 px-4 py-3 text-[15px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codeAgent, setCodeAgent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await login(email, password, codeAgent);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUTH_TOKEN_KEY, token);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion échouée");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 relative bg-[#fafafa] dark:bg-slate-950">
      <LoginBackground />
      <div className="w-full max-w-[400px] min-w-0 relative z-10 animate-in">
        <div className="bg-white dark:bg-slate-900 rounded border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
          {/* En-tête minimal */}
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-2 text-center border-b border-slate-100 dark:border-slate-800">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-500 text-white mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Dashboard Transaction
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Connectez-vous à votre compte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 text-sm"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputBase}
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputBase}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="code_agent" className={labelClass}>
                Code agent
              </label>
              <input
                id="code_agent"
                type="text"
                value={codeAgent}
                onChange={(e) => setCodeAgent(e.target.value)}
                required
                autoComplete="off"
                className={inputBase}
                placeholder="RD-12345"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Format : RD-XXXXX
              </p>
            </div>

            <div className="pt-1">
              <ActionButton
                type="submit"
                loading={loading}
                loadingLabel="Connexion…"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 text-sm transition-colors flex items-center justify-center gap-2"
              >
                Se connecter
              </ActionButton>
            </div>
          </form>

          <div className="px-8 pb-8 pt-0 text-center border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
