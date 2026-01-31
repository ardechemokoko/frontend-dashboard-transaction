"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AUTH_TOKEN_KEY, getCurrentUser, type User } from "@/lib/api";
import ActionButton from "@/components/ui/ActionButton";

const navItems = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: (
      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/operators",
    label: "Gestion Opérateurs",
    icon: (
      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tokens",
    label: "Gestion des Tokens",
    icon: (
      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/transactions",
    label: "Gestion transaction",
    icon: (
      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/users",
    label: "Gestion utilisateurs",
    icon: (
      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer la sidebar sur mobile après navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    getCurrentUser(token)
      .then(setUser)
      .catch(() => router.replace("/login"));
  }, [mounted, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  function handleLogout() {
    setLogoutLoading(true);
    setDropdownOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    router.replace("/login");
    router.refresh();
  }

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
  if (!mounted || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 animate-spin" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#fafafa] dark:bg-slate-950">
      {/* Overlay mobile (ferme la sidebar au clic) */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Fermer le menu"
        />
      )}

      {/* Sidebar : drawer sur mobile, fixe sur lg+ */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:w-60 lg:max-w-none shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between lg:block">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-slate-900 dark:text-white rounded-lg p-2 -m-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold tracking-tight block truncate">Dashboard</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">Transaction</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className={`shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-14 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              aria-label="Ouvrir le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-sm sm:text-base font-medium text-slate-800 dark:text-white truncate">
              Tableau de bord
            </h1>
          </div>

          <div className="relative flex items-center gap-4" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-w-0"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300 font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  {user?.name ?? "Profil"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email ?? ""}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-52 max-w-[calc(100vw-2rem)] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-[60] animate-in-modal"
                role="menu"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {user?.name ?? "Profil"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email ?? ""}
                  </p>
                  {user?.code_agent && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                      {user.code_agent}
                    </p>
                  )}
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  role="menuitem"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mon compte
                </Link>
                <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                  <ActionButton
                    type="button"
                    onClick={handleLogout}
                    loading={logoutLoading}
                    loadingLabel="Déconnexion…"
                    className="w-full flex items-center justify-start gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </ActionButton>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto overflow-x-hidden px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="animate-in max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
