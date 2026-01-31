"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AUTH_TOKEN_KEY,
  getTransactions,
  getOperators,
  type Payment,
  type TransactionsMeta,
  type Operator,
  type TransactionsFilters,
} from "@/lib/api";

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

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " " + currency;
}

export default function TransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [meta, setMeta] = useState<TransactionsMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [filters, setFilters] = useState<TransactionsFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");

  const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;

  const loadTransactions = useCallback(
    (page = 1) => {
      if (!token) return;
      setLoading(true);
      setError("");
      const applied = { ...filters, search: searchApplied || undefined };
      getTransactions(token, page, PER_PAGE, applied)
        .then((res) => {
          setPayments(res.payments);
          setMeta(res.meta);
          setCurrentPage(res.meta.current_page);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
        .finally(() => setLoading(false));
    },
    [token, filters, searchApplied]
  );

  useEffect(() => {
    loadTransactions(1);
  }, [loadTransactions]);

  useEffect(() => {
    if (!token) return;
    getOperators(token, 1, 100)
      .then((res) => setOperators(res.operators))
      .catch(() => setOperators([]));
  }, [token]);

  function goToPage(page: number) {
    if (page < 1 || (meta && page > meta.last_page)) return;
    loadTransactions(page);
  }

  function applySearch() {
    setSearchApplied(searchInput.trim());
    setCurrentPage(1);
  }

  function handleFilterChange(key: keyof TransactionsFilters, value: string | boolean | undefined) {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === "" || value === undefined) {
        delete next[key];
      } else {
        (next as Record<string, unknown>)[key] = value;
      }
      return next;
    });
    setCurrentPage(1);
  }

  const hasActiveFilters =
    searchApplied ||
    filters.status_paiement ||
    filters.operator_id ||
    (filters.status !== undefined && filters.status !== null) ||
    !!filters.date_from ||
    !!filters.date_to;

  function clearFilters() {
    setSearchInput("");
    setSearchApplied("");
    setFilters({});
    setCurrentPage(1);
  }

  return (
    <div className="px-0 max-w-7xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
          Transactions
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Consultez et filtrez les paiements
        </p>
      </div>

      <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 relative flex gap-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="Rechercher (ID ou téléphone)…"
                className="flex-1 min-w-0 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={applySearch}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-semibold shrink-0 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Rechercher
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="date_from" className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                Du
              </label>
              <input
                id="date_from"
                type="date"
                value={filters.date_from ?? ""}
                onChange={(e) => handleFilterChange("date_from", e.target.value || undefined)}
                className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="date_to" className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                Au
              </label>
              <input
                id="date_to"
                type="date"
                value={filters.date_to ?? ""}
                onChange={(e) => handleFilterChange("date_to", e.target.value || undefined)}
                className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <select
              value={filters.status_paiement ?? ""}
              onChange={(e) => handleFilterChange("status_paiement", e.target.value || undefined)}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Tous les statuts paiement</option>
              <option value="pending">En attente</option>
              <option value="success">Réussi</option>
              <option value="failed">Échoué</option>
            </select>
            <select
              value={filters.operator_id ?? ""}
              onChange={(e) => handleFilterChange("operator_id", e.target.value || undefined)}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Tous les opérateurs</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
            <select
              value={filters.status === undefined ? "" : filters.status ? "1" : "0"}
              onChange={(e) => {
                const v = e.target.value;
                handleFilterChange("status", v === "" ? undefined : v === "1");
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Tous (utilisé / non utilisé)</option>
              <option value="0">Non utilisé</option>
              <option value="1">Utilisé</option>
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 text-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
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
        ) : payments.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Aucune transaction</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 max-w-sm mt-0.5">
              {hasActiveFilters ? "Aucun résultat pour ces filtres." : "Les transactions apparaîtront après les callbacks."}
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="mt-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 text-sm transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-px">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="px-3 sm:px-4 py-3">ID Transaction</th>
                  <th className="px-3 sm:px-4 py-3">Opérateur</th>
                  <th className="px-3 sm:px-4 py-3">Montant</th>
                  <th className="px-3 sm:px-4 py-3 w-16 sm:w-20">Devise</th>
                  <th className="px-3 sm:px-4 py-3 hidden md:table-cell">Téléphone</th>
                  <th className="px-3 sm:px-4 py-3 hidden lg:table-cell">Service</th>
                  <th className="px-3 sm:px-4 py-3 w-20 sm:w-24">Statut</th>
                  <th className="px-3 sm:px-4 py-3 w-16 sm:w-20">Utilisé</th>
                  <th className="px-3 sm:px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-900 dark:text-white truncate max-w-[140px]" title={p.transaction_id}>
                      {p.transaction_id}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {p.operator?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {formatAmount(p.amount, p.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {p.currency}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {p.customer_phone}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs truncate max-w-[120px]" title={p.service_codification}>
                      {p.service_codification ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                          p.status_paiement === "success"
                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                            : p.status_paiement === "failed"
                              ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                              : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {p.status_paiement === "success" ? "Réussi" : p.status_paiement === "failed" ? "Échoué" : "En attente"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                          p.status ? "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300" : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                        }`}
                      >
                        {p.status ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {formatDate(p.payment_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && payments.length > 0 && meta && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded bg-slate-50 dark:bg-slate-800/60 px-4 py-4 sm:px-5 border border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <span className="text-sm text-slate-600 dark:text-slate-400">Affichage</span>
            <span className="font-semibold text-slate-900 dark:text-white">{meta.from}</span>
            <span className="text-slate-500 dark:text-slate-500">–</span>
            <span className="font-semibold text-slate-900 dark:text-white">{meta.to}</span>
            <span className="text-slate-500 dark:text-slate-500">sur</span>
            <span className="font-semibold text-slate-900 dark:text-white">{meta.total}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">transaction{meta.total > 1 ? "s" : ""}</span>
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
      {loading && payments.length > 0 && (
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-indigo-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
