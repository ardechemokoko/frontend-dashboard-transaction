"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  AUTH_TOKEN_KEY,
  getOperators,
  createOperator,
  updateOperator,
  type Operator,
  type OperatorsMeta,
} from "@/lib/api";
import ActionButton from "@/components/ui/ActionButton";
import Modal from "@/components/ui/Modal";

const PER_PAGE = 10;

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [meta, setMeta] = useState<OperatorsMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOperator, setEditOperator] = useState<Operator | null>(null);
  const [name, setName] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;

  function loadOperators(page = 1) {
    if (!token) return;
    setLoading(true);
    setError("");
    getOperators(token, page, PER_PAGE)
      .then((res) => {
        setOperators(res.operators);
        setMeta(res.meta);
        setCurrentPage(res.meta.current_page);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOperators(1);
  }, [token]);

  function goToPage(page: number) {
    if (page < 1 || (meta && page > meta.last_page)) return;
    loadOperators(page);
  }

  function openCreate() {
    setName("");
    setEditOperator(null);
    setCreateOpen(true);
    setError("");
  }

  function openEdit(op: Operator) {
    setName(op.name);
    setEditOperator(op);
    setCreateOpen(false);
    setError("");
  }

  function closeModals() {
    setCreateOpen(false);
    setEditOperator(null);
    setName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setSubmitLoading(true);
    setError("");
    const promise = editOperator
      ? updateOperator(token, editOperator.id, { name: name.trim() })
      : createOperator(token, { name: name.trim() });
    promise
      .then(() => {
        closeModals();
        loadOperators(editOperator ? currentPage : 1);
        void Swal.fire({
          icon: "success",
          title: editOperator ? "Modification enregistrée" : "Opérateur créé",
          text: editOperator
            ? "L'opérateur a été mis à jour."
            : "L'opérateur a été créé avec succès.",
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

  const inputClass =
    "w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors disabled:opacity-60";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="px-0 max-w-7xl mx-auto animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Opérateurs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Créer et modifier les opérateurs (MTN, Airtel, etc.)
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
          Nouvel opérateur
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
        ) : operators.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Aucun opérateur</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs">Créez un opérateur avec le bouton ci-dessus.</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 text-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvel opérateur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-px">
            <table className="w-full text-left text-sm min-w-[280px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="px-3 sm:px-4 py-3">Nom</th>
                  <th className="px-3 sm:px-4 py-3 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                {operators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 sm:px-4 py-3 font-medium text-slate-900 dark:text-white truncate">
                      {op.name}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(op)}
                        className="rounded px-2 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors inline-flex items-center gap-1 ml-auto"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination (sans card) */}
      {operators.length > 0 && meta && (
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 order-2 sm:order-1">
              <span className="font-semibold text-slate-900 dark:text-white">{meta.from}</span>
              <span className="mx-1">–</span>
              <span className="font-semibold text-slate-900 dark:text-white">{meta.to}</span>
              <span className="mx-1">sur</span>
              <span className="font-semibold text-slate-900 dark:text-white">{meta.total}</span>
              <span className="ml-1">résultat{meta.total > 1 ? "s" : ""}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-2 order-1 sm:order-2">
              <button
                type="button"
                onClick={() => goToPage(meta.prev_page ?? currentPage - 1)}
                disabled={!meta.has_prev || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm"
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
                              : "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
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
          {loading && (
            <div className="mt-2 h-0.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-indigo-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* Modal Création / Modification */}
      <Modal open={createOpen || !!editOperator} onClose={closeModals}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {editOperator ? "Modifier l'opérateur" : "Nouvel opérateur"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              placeholder="MTN, Airtel, …"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <ActionButton
              type="submit"
              loading={submitLoading}
              loadingLabel="Enregistrement…"
              className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 text-sm flex items-center justify-center gap-2"
            >
              {editOperator ? (
                <>
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer
                </>
              )}
            </ActionButton>
            <button
              type="button"
              onClick={closeModals}
              className="rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium py-2.5 px-4 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
