"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getCurrentUser,
  getUsers,
  getOperators,
  getApiTokens,
  getTransactions,
  type User,
  type Payment,
} from "@/lib/api";
import { AUTH_TOKEN_KEY } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export type DashboardStats = {
  users: number;
  operators: number;
  apiTokens: number;
  transactions: number;
};

const CHART_COLORS = {
  success: "#10b981",
  failed: "#ef4444",
  pending: "#f59e0b",
  default: "#6366f1",
};

const PIE_COLORS = [CHART_COLORS.success, CHART_COLORS.failed, CHART_COLORS.pending];

function aggregateByStatus(payments: Payment[]) {
  const map = { success: 0, failed: 0, pending: 0 };
  payments.forEach((p) => {
    if (p.status_paiement === "success") map.success += 1;
    else if (p.status_paiement === "failed") map.failed += 1;
    else map.pending += 1;
  });
  return [
    { name: "Réussi", value: map.success, color: CHART_COLORS.success },
    { name: "Échoué", value: map.failed, color: CHART_COLORS.failed },
    { name: "En attente", value: map.pending, color: CHART_COLORS.pending },
  ].filter((d) => d.value > 0);
}

function aggregateByOperator(payments: Payment[]) {
  const map: Record<string, number> = {};
  payments.forEach((p) => {
    const name = p.operator?.name ?? "Inconnu";
    map[name] = (map[name] ?? 0) + 1;
  });
  return Object.entries(map).map(([name, count]) => ({ name, count }));
}

function aggregateByDay(payments: Payment[]) {
  const map: Record<string, number> = {};
  payments.forEach((p) => {
    try {
      const day = p.payment_date.slice(0, 10);
      map[day] = (map[day] ?? 0) + 1;
    } catch {
      // ignore
    }
  });
  return Object.entries(map)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) return;
    getCurrentUser(token)
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token || !user) return;
    Promise.all([
      getUsers(token, 1, 1),
      getOperators(token, 1, 1),
      getApiTokens(token, 1, 1),
      getTransactions(token, 1, 50),
    ])
      .then(([u, o, t, tr]) => {
        setStats({
          users: u.meta.total,
          operators: o.meta.total,
          apiTokens: t.meta.total,
          transactions: tr.meta.total,
        });
        setPayments(tr.payments);
      })
      .catch(() => {
        setStats({ users: 0, operators: 0, apiTokens: 0, transactions: 0 });
        setPayments([]);
      });
  }, [user]);

  const chartStatus = useMemo(() => aggregateByStatus(payments), [payments]);
  const chartOperator = useMemo(() => aggregateByOperator(payments), [payments]);
  const chartByDay = useMemo(() => aggregateByDay(payments), [payments]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <div
          role="alert"
          className="rounded bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 max-w-7xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          KPIs et graphiques (données en temps réel)
        </p>
      </div>

      {/* KPIs */}
      {stats !== null && (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Utilisateurs
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.users}
            </p>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Opérateurs
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.operators}
            </p>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Tokens API
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.apiTokens}
            </p>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
              Transactions
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.transactions}
            </p>
          </div>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Répartition par statut */}
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Répartition des transactions par statut
          </h2>
          {chartStatus.length > 0 ? (
            <div className="h-56 sm:h-64 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--chart-tooltip-bg, #1e293b)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#f1f5f9",
                    }}
                    formatter={(value: number | undefined) => [value ?? 0, "Nombre"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 h-64 flex items-center justify-center">
              Aucune donnée (50 dernières transactions)
            </p>
          )}
        </div>

        {/* Transactions par opérateur */}
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Transactions par opérateur
          </h2>
          {chartOperator.length > 0 ? (
            <div className="h-56 sm:h-64 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartOperator} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="text-slate-500 dark:text-slate-400"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-slate-500 dark:text-slate-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--chart-tooltip-bg, #1e293b)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#f1f5f9",
                    }}
                    formatter={(value: number | undefined) => [value ?? 0, "Transactions"]}
                  />
                  <Bar dataKey="count" fill={CHART_COLORS.default} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 h-64 flex items-center justify-center">
              Aucune donnée
            </p>
          )}
        </div>

        {/* Volume par jour (50 dernières transactions) */}
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 lg:col-span-2 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Volume par jour (50 dernières)
          </h2>
          {chartByDay.length > 0 ? (
            <div className="h-60 sm:h-72 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    className="text-slate-500 dark:text-slate-400"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-slate-500 dark:text-slate-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--chart-tooltip-bg, #1e293b)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#f1f5f9",
                    }}
                    formatter={(value: number | undefined) => [value ?? 0, "Transactions"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 h-72 flex items-center justify-center">
              Aucune donnée
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
