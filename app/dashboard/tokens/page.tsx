"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  AUTH_TOKEN_KEY,
  getApiTokens,
  getOperators,
  createApiToken,
  activateApiToken,
  deactivateApiToken,
  deleteApiToken,
  type ApiToken,
  type ApiTokensMeta,
  type Operator,
} from "@/lib/api";
import ActionButton from "@/components/ui/ActionButton";
import Modal from "@/components/ui/Modal";

const PER_PAGE = 10;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [meta, setMeta] = useState<ApiTokensMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [operatorId, setOperatorId] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newTokenPlain, setNewTokenPlain] = useState<{ token: string; signature: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiToken | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;

  function loadTokens(page = 1) {
    if (!token) return;
    setLoading(true);
    setError("");
    getApiTokens(token, page, PER_PAGE)
      .then((res) => {
        setTokens(res.api_tokens);
        setMeta(res.meta);
        setCurrentPage(res.meta.current_page);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }

  function loadOperatorsForSelect() {
    if (!token) return;
    getOperators(token, 1, 100)
      .then((res) => setOperators(res.operators))
      .catch(() => setOperators([]));
  }

  useEffect(() => {
    loadTokens(1);
  }, [token]);

  function goToPage(page: number) {
    if (page < 1 || (meta && page > meta.last_page)) return;
    loadTokens(page);
  }

  function openCreate() {
    setOperatorId("");
    setDurationDays(30);
    setCreateOpen(true);
    setError("");
    setNewTokenPlain(null);
    loadOperatorsForSelect();
  }

  function closeModals() {
    setCreateOpen(false);
    setOperatorId("");
    setDurationDays(30);
    setNewTokenPlain(null);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !operatorId) return;
    const days = Math.max(1, Math.min(365, durationDays));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    setSubmitLoading(true);
    setError("");
    createApiToken(token, { operator_id: operatorId, expires_at: expiresAt })
      .then((res) => {
        setNewTokenPlain({ token: res.token, signature: res.signature });
        loadTokens(currentPage);
        void Swal.fire({
          icon: "success",
          title: "Token créé",
          text: "Copiez le token et la signature ci-dessous. Ils ne seront plus affichés après fermeture.",
          confirmButtonColor: "#4f46e5",
        });
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Erreur";
        setError(msg);
        void Swal.fire({
          icon: "error",
          title: "Erreur",
          text: msg,
          confirmButtonColor: "#4f46e5",
        });
      })
      .finally(() => setSubmitLoading(false));
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      void Swal.fire({
        icon: "success",
        title: "Copié",
        text: `${label} copié dans le presse-papiers.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      void Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de copier.",
        confirmButtonColor: "#4f46e5",
      });
    }
  }

  function handleActivate(t: ApiToken) {
    if (!token) return;
    setActionLoadingId(t.id);
    activateApiToken(token, t.id)
      .then(() => {
        loadTokens(currentPage);
        void Swal.fire({
          icon: "success",
          title: "Token activé",
          text: "Les autres tokens de cet opérateur ont été désactivés.",
          confirmButtonColor: "#4f46e5",
        });
      })
      .catch((err) => {
        void Swal.fire({
          icon: "error",
          title: "Erreur",
          text: err instanceof Error ? err.message : "Erreur activation",
          confirmButtonColor: "#4f46e5",
        });
      })
      .finally(() => setActionLoadingId(null));
  }

  function handleDeactivate(t: ApiToken) {
    if (!token) return;
    setActionLoadingId(t.id);
    deactivateApiToken(token, t.id)
      .then(() => {
        loadTokens(currentPage);
        void Swal.fire({
          icon: "success",
          title: "Token désactivé",
          confirmButtonColor: "#4f46e5",
        });
      })
      .catch((err) => {
        void Swal.fire({
          icon: "error",
          title: "Erreur",
          text: err instanceof Error ? err.message : "Erreur désactivation",
          confirmButtonColor: "#4f46e5",
        });
      })
      .finally(() => setActionLoadingId(null));
  }

  function handleDelete() {
    if (!token || !deleteTarget) return;
    setDeleteLoading(true);
    deleteApiToken(token, deleteTarget.id)
      .then(() => {
        setDeleteTarget(null);
        const pageToLoad = tokens.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        loadTokens(pageToLoad);
        void Swal.fire({
          icon: "success",
          title: "Token supprimé",
          text: "Le token API a été supprimé.",
          confirmButtonColor: "#4f46e5",
        });
      })
      .catch((err) => {
        void Swal.fire({
          icon: "error",
          title: "Erreur",
          text: err instanceof Error ? err.message : "Erreur suppression",
          confirmButtonColor: "#4f46e5",
        });
      })
      .finally(() => setDeleteLoading(false));
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors disabled:opacity-60";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="px-0 max-w-7xl mx-auto animate-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Tokens API
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Créer, activer et désactiver les tokens par opérateur
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 text-sm flex items-center justify-center gap-2 shrink-0 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Créer un token
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Aucun token</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 max-w-sm mt-0.5">Créez un token avec le bouton ci-dessus.</p>
            <button type="button" onClick={openCreate} className="mt-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 text-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un token
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-px">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="px-4 py-3">Opérateur</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3 w-24">Statut</th>
                  <th className="px-4 py-3 text-right w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                {tokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {t.operator?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {formatDate(t.expires_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                          t.is_active
                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {t.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {t.is_active ? (
                          <ActionButton
                            type="button"
                            onClick={() => handleDeactivate(t)}
                            loading={actionLoadingId === t.id}
                            loadingLabel="Désactivation…"
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition inline-flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Désactiver
                          </ActionButton>
                        ) : (
                          <ActionButton
                            type="button"
                            onClick={() => handleActivate(t)}
                            loading={actionLoadingId === t.id}
                            loadingLabel="Activation…"
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition inline-flex items-center gap-1.5"
                          >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Activer
                          </ActionButton>
                        )}
                        <ActionButton
                          type="button"
                          onClick={() => setDeleteTarget(t)}
                          loading={deleteLoading && deleteTarget?.id === t.id}
                          loadingLabel="Suppression…"
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition inline-flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && tokens.length > 0 && meta && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded bg-slate-50 dark:bg-slate-800/60 px-4 py-4 sm:px-5 border border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Affichage
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">{meta.from}</span>
            <span className="text-slate-500 dark:text-slate-500">–</span>
            <span className="font-semibold text-slate-900 dark:text-white">{meta.to}</span>
            <span className="text-slate-500 dark:text-slate-500">sur</span>
            <span className="font-semibold text-slate-900 dark:text-white">{meta.total}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              token{meta.total > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 order-1 sm:order-2">
            <button
              type="button"
              onClick={() => goToPage(meta.prev_page ?? currentPage - 1)}
              disabled={!meta.has_prev || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm"
              aria-label="Page précédente"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Précédent
            </button>
            {meta.last_page > 1 && (
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                  .filter((p) => {
                    const first = 1;
                    const last = meta.last_page;
                    if (last <= 7) return true;
                    if (p === first || p === last) return true;
                    if (p >= currentPage - 2 && p <= currentPage + 2) return true;
                    return false;
                  })
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-0.5">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-slate-400 dark:text-slate-500 text-sm">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => goToPage(p)}
                        disabled={loading}
                        className={`min-w-[2.25rem] h-9 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:pointer-events-none ${
                          p === currentPage
                            ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/30"
                            : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                        aria-label={`Page ${p}`}
                        aria-current={p === currentPage ? "page" : undefined}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
            )}
            {meta.last_page > 1 && (
              <span className="hidden md:inline text-sm text-slate-500 dark:text-slate-400 mx-1">
                Page {currentPage} / {meta.last_page}
              </span>
            )}
            <button
              type="button"
              onClick={() => goToPage(meta.next_page ?? currentPage + 1)}
              disabled={!meta.has_next || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none transition"
              aria-label="Page suivante"
            >
              Suivant
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {loading && tokens.length > 0 && (
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-indigo-500 rounded-full animate-pulse" />
        </div>
      )}

      {/* Modal Création */}
      <Modal open={createOpen} onClose={closeModals}>
        {newTokenPlain ? (
          <>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Token créé — Copiez ces valeurs</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ces valeurs ne seront plus affichées après fermeture.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Token (en clair)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newTokenPlain.token}
                    className={`${inputClass} font-mono text-xs flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newTokenPlain.token, "Token")}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-sm font-medium shrink-0 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v2m2 4h10a2 2 0 001-2v-2a2 2 0 00-2-2h-2m-4-1h6m-6 0H6" />
                    </svg>
                    Copier
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Signature (en clair)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newTokenPlain.signature}
                    className={`${inputClass} font-mono text-xs flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newTokenPlain.signature, "Signature")}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-sm font-medium shrink-0 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v2m2 4h10a2 2 0 001-2v-2a2 2 0 00-2-2h-2m-4-1h6m-6 0H6" />
                    </svg>
                    Copier
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={closeModals}
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 text-sm transition-colors"
              >
                J&apos;ai copié, fermer
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Créer un token API</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Opérateur</label>
                <select
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Sélectionner un opérateur</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Durée (jours)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, Math.min(365, parseInt(e.target.value, 10) || 30)))}
                  className={inputClass}
                  placeholder="30"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Le token expirera après ce nombre de jours (1 à 365). Par défaut : 30 jours.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <ActionButton
                  type="submit"
                  loading={submitLoading}
                  loadingLabel="Création…"
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer
                </ActionButton>
                <button
                  type="button"
                  onClick={closeModals}
                  className="rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Modal confirmation suppression */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Supprimer le token</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Êtes-vous sûr de vouloir supprimer le token de l&apos;opérateur <strong className="text-slate-900 dark:text-white">{deleteTarget?.operator?.name ?? "—"}</strong> ? Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <ActionButton
              type="button"
              onClick={handleDelete}
              loading={deleteLoading}
              loadingLabel="Suppression…"
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </ActionButton>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
              className="rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
