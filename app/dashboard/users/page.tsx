"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  AUTH_TOKEN_KEY,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type UserFormData,
  type UsersMeta,
} from "@/lib/api";
import ActionButton from "@/components/ui/ActionButton";
import Modal from "@/components/ui/Modal";

const emptyForm: UserFormData = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "ROLE_AGENT",
};

const PER_PAGE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<UsersMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;

  function loadUsers(page = 1) {
    if (!token) return;
    setLoading(true);
    setError("");
    getUsers(token, page, PER_PAGE)
      .then((res) => {
        setUsers(res.users);
        setMeta(res.meta);
        setCurrentPage(res.meta.current_page);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers(1);
  }, [token]);

  function goToPage(page: number) {
    if (page < 1 || (meta && page > meta.last_page)) return;
    loadUsers(page);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditUser(null);
    setCreateOpen(true);
    setError("");
  }

  function openEdit(user: User) {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
      role: user.role,
    });
    setEditUser(user);
    setCreateOpen(false);
    setError("");
  }

  function closeModals() {
    setCreateOpen(false);
    setEditUser(null);
    setDeleteUserTarget(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitLoading(true);
    setError("");
    const promise = editUser
      ? updateUser(token, editUser.id, {
          name: form.name,
          email: form.email,
          role: form.role,
          ...(form.password ? { password: form.password, password_confirmation: form.password_confirmation } : {}),
        })
      : createUser(token, {
          name: form.name,
          email: form.email,
          password: form.password!,
          password_confirmation: form.password_confirmation!,
          role: form.role,
        });
    promise
      .then(() => {
        closeModals();
        loadUsers(editUser ? currentPage : 1);
        void Swal.fire({
          icon: "success",
          title: editUser ? "Modification enregistrée" : "Utilisateur créé",
          text: editUser ? "L'utilisateur a été mis à jour." : "L'utilisateur a été créé avec succès.",
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

  function handleDelete() {
    if (!token || !deleteUserTarget) return;
    setDeleteLoading(true);
    setError("");
    deleteUser(token, deleteUserTarget.id)
      .then(() => {
        closeModals();
        const pageToLoad = users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        loadUsers(pageToLoad);
        void Swal.fire({
          icon: "success",
          title: "Utilisateur supprimé",
          text: "L'utilisateur a été supprimé.",
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
      .finally(() => setDeleteLoading(false));
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors disabled:opacity-60";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="px-0 max-w-7xl mx-auto animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Utilisateurs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Créer, modifier et supprimer les comptes
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
          Nouvel utilisateur
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
        ) : users.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Aucun utilisateur</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs">Créez un compte avec le bouton ci-dessus.</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 text-sm transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvel utilisateur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-px">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="px-3 sm:px-4 py-3">Nom</th>
                  <th className="px-3 sm:px-4 py-3">Email</th>
                  <th className="px-3 sm:px-4 py-3 hidden md:table-cell">Code agent</th>
                  <th className="px-3 sm:px-4 py-3 w-20">Rôle</th>
                  <th className="px-3 sm:px-4 py-3 text-right w-28 sm:w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-3 sm:px-4 py-3 font-medium text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                      {user.name}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[140px] sm:max-w-none">
                      {user.email}
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400 hidden md:table-cell">
                      {user.code_agent}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                          user.role === "ROLE_ADMIN"
                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {user.role === "ROLE_ADMIN" ? "Admin" : "Agent"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="rounded px-2 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors inline-flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteUserTarget(user)}
                          className="rounded px-2 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors inline-flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination professionnelle */}
      {users.length > 0 && meta && (
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
      <Modal open={createOpen || !!editUser} onClose={closeModals}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {editUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className={inputClass}
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              disabled={!!editUser}
              className={inputClass}
              placeholder="jean@exemple.com"
            />
            {editUser && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">L'email ne peut pas être modifié.</p>
            )}
          </div>
          {!editUser && (
            <>
              <div>
                <label className={labelClass}>Mot de passe</label>
                <input type="password" value={form.password ?? ""} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required className={inputClass} placeholder="••••••••" />
              </div>
              <div>
                <label className={labelClass}>Confirmer le mot de passe</label>
                <input type="password" value={form.password_confirmation ?? ""} onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))} required className={inputClass} placeholder="••••••••" />
              </div>
            </>
          )}
          {editUser && (
            <>
              <div>
                <label className={labelClass}>Nouveau mot de passe (optionnel)</label>
                <input type="password" value={form.password ?? ""} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={inputClass} placeholder="••••••••" />
              </div>
              <div>
                <label className={labelClass}>Confirmer le mot de passe</label>
                <input type="password" value={form.password_confirmation ?? ""} onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))} className={inputClass} placeholder="••••••••" />
              </div>
            </>
          )}
          <div>
            <label className={labelClass}>Rôle</label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputClass}>
              <option value="ROLE_AGENT">Agent</option>
              <option value="ROLE_ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <ActionButton type="submit" loading={submitLoading} loadingLabel="Enregistrement…" className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
              {editUser ? (
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
            <button type="button" onClick={closeModals} className="rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium py-2.5 px-4 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmation suppression */}
      <Modal open={!!deleteUserTarget} onClose={() => setDeleteUserTarget(null)} size="sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Supprimer l'utilisateur</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">
            Êtes-vous sûr de vouloir supprimer <strong className="text-slate-900 dark:text-white">{deleteUserTarget?.name}</strong> ({deleteUserTarget?.email}) ? Cette action est irréversible.
          </p>
          <div className="flex gap-2">
            <ActionButton type="button" onClick={handleDelete} loading={deleteLoading} loadingLabel="Suppression…" className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </ActionButton>
            <button type="button" onClick={() => setDeleteUserTarget(null)} disabled={deleteLoading} className="rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium py-2.5 px-4 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
