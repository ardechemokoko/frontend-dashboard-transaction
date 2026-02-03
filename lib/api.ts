const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

export function getApiUrl(): string {
  return API_URL.replace(/\/$/, "");
}

export type User = {
  id: string;
  name: string;
  email: string;
  code_agent: string;
  role: string;
  created_at?: string;
};

export type UserFormData = {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export async function login(
  email: string,
  password: string,
  code_agent: string
): Promise<LoginResponse> {
  const res = await fetch(`${getApiUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, code_agent }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Connexion échouée");
  }
  return res.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${getApiUrl()}/api/auth/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Session invalide");
  }
  const data = await res.json();
  return data.user ?? data;
}

export const AUTH_TOKEN_KEY = "dashboard_auth_token";

export type Operator = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type OperatorsMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_prev: boolean;
  has_next: boolean;
  prev_page: number | null;
  next_page: number | null;
};

export type OperatorsResponse = {
  operators: Operator[];
  meta: OperatorsMeta;
};

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export type UsersMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_prev: boolean;
  has_next: boolean;
  prev_page: number | null;
  next_page: number | null;
};

export type UsersResponse = {
  users: User[];
  meta: UsersMeta;
};

export async function getOperators(token: string, page = 1, perPage = 10): Promise<OperatorsResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const res = await fetch(`${getApiUrl()}/api/operators?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Erreur chargement opérateurs");
  }
  const data = await res.json();
  return {
    operators: data.operators ?? [],
    meta: data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: perPage,
      total: 0,
      from: null,
      to: null,
      has_prev: false,
      has_next: false,
      prev_page: null,
      next_page: null,
    },
  };
}

export async function getUsers(token: string, page = 1, perPage = 10): Promise<UsersResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const res = await fetch(`${getApiUrl()}/api/users?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Erreur chargement utilisateurs");
  }
  const data = await res.json();
  return {
    users: data.users ?? [],
    meta: data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: perPage,
      total: 0,
      from: null,
      to: null,
      has_prev: false,
      has_next: false,
      prev_page: null,
      next_page: null,
    },
  };
}

export async function createUser(
  token: string,
  body: { name: string; email: string; password: string; password_confirmation: string; role?: string }
): Promise<User> {
  const res = await fetch(`${getApiUrl()}/api/users`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ ...body, role: body.role ?? "ROLE_AGENT" }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = (data as { message?: string; errors?: Record<string, string[]> }).message;
    const errors = (data as { errors?: Record<string, string[]> }).errors;
    const firstError = errors ? Object.values(errors).flat()[0] : undefined;
    throw new Error(msg ?? firstError ?? "Erreur création utilisateur");
  }
  const data = await res.json();
  return data.user;
}

export async function updateUser(
  token: string,
  userId: string,
  body: { name?: string; email?: string; password?: string; password_confirmation?: string; role?: string }
): Promise<User> {
  const res = await fetch(`${getApiUrl()}/api/users/${userId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = (data as { message?: string }).message;
    const errors = (data as { errors?: Record<string, string[]> }).errors;
    const firstError = errors ? Object.values(errors).flat()[0] : undefined;
    throw new Error(msg ?? firstError ?? "Erreur mise à jour");
  }
  const data = await res.json();
  return data.user;
}

export async function deleteUser(token: string, userId: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Erreur suppression");
  }
}

export async function createOperator(token: string, body: { name: string }): Promise<Operator> {
  const res = await fetch(`${getApiUrl()}/api/operators`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = (data as { message?: string }).message;
    const errors = (data as { errors?: Record<string, string[]> }).errors;
    const firstError = errors ? Object.values(errors).flat()[0] : undefined;
    throw new Error(msg ?? firstError ?? "Erreur création opérateur");
  }
  const data = await res.json();
  return data.operator;
}

export async function updateOperator(token: string, operatorId: string, body: { name: string }): Promise<Operator> {
  const res = await fetch(`${getApiUrl()}/api/operators/${operatorId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = (data as { message?: string }).message;
    const errors = (data as { errors?: Record<string, string[]> }).errors;
    const firstError = errors ? Object.values(errors).flat()[0] : undefined;
    throw new Error(msg ?? firstError ?? "Erreur mise à jour opérateur");
  }
  const data = await res.json();
  return data.operator;
}

// ——— API Tokens ———

export type ApiToken = {
  id: string;
  operator_id: string;
  operator?: { id: string; name: string } | null;
  expires_at: string;
  is_active: boolean;
  created_at?: string;
};

export type ApiTokensMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_prev: boolean;
  has_next: boolean;
  prev_page: number | null;
  next_page: number | null;
};

export type ApiTokensResponse = {
  api_tokens: ApiToken[];
  meta: ApiTokensMeta;
};

export type CreateApiTokenResponse = {
  api_token: ApiToken;
  token: string;
  signature: string;
};

export async function getApiTokens(token: string, page = 1, perPage = 10): Promise<ApiTokensResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const res = await fetch(`${getApiUrl()}/api/api-tokens?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Erreur chargement tokens");
  }
  const data = await res.json();
  return {
    api_tokens: data.api_tokens ?? [],
    meta: data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: perPage,
      total: 0,
      from: null,
      to: null,
      has_prev: false,
      has_next: false,
      prev_page: null,
      next_page: null,
    },
  };
}

export async function createApiToken(
  token: string,
  body: { operator_id: string; expires_at?: string }
): Promise<CreateApiTokenResponse> {
  const res = await fetch(`${getApiUrl()}/api/api-tokens`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = (data as { message?: string }).message;
    const errors = (data as { errors?: Record<string, string[]> }).errors;
    const firstError = errors ? Object.values(errors).flat()[0] : undefined;
    throw new Error(msg ?? firstError ?? "Erreur création token");
  }
  const data = await res.json();
  return {
    api_token: data.api_token,
    token: data.token ?? "",
    signature: data.signature ?? "",
  };
}

export async function activateApiToken(token: string, apiTokenId: string): Promise<ApiToken> {
  const res = await fetch(`${getApiUrl()}/api/api-tokens/${apiTokenId}/activate`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Erreur activation");
  }
  const data = await res.json();
  return data.api_token;
}

export async function deactivateApiToken(token: string, apiTokenId: string): Promise<ApiToken> {
  const res = await fetch(`${getApiUrl()}/api/api-tokens/${apiTokenId}/deactivate`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Erreur désactivation");
  }
  const data = await res.json();
  return data.api_token;
}

export async function deleteApiToken(token: string, apiTokenId: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/api-tokens/${apiTokenId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Erreur suppression");
  }
}

// ——— Transactions (paiements) ———

export type Payment = {
  id: string;
  operator_id: string;
  operator?: { id: string; name: string } | null;
  transaction_id: string;
  amount: number;
  currency: string;
  customer_phone: string;
  service_codification: string;
  status_paiement: string;
  status: boolean;
  payment_date: string;
  created_at?: string;
};

export type TransactionsMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_prev: boolean;
  has_next: boolean;
  prev_page: number | null;
  next_page: number | null;
};

export type TransactionsResponse = {
  payments: Payment[];
  meta: TransactionsMeta;
};

export type TransactionsFilters = {
  search?: string;
  status_paiement?: string;
  operator_id?: string;
  status?: boolean;
  date_from?: string;
  date_to?: string;
};

export async function getTransactions(
  token: string,
  page = 1,
  perPage = 10,
  filters: TransactionsFilters = {}
): Promise<TransactionsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status_paiement) params.set("status_paiement", filters.status_paiement);
  if (filters.operator_id) params.set("operator_id", filters.operator_id);
  if (filters.status !== undefined && filters.status !== null) params.set("status", filters.status ? "1" : "0");
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);

  const res = await fetch(`${getApiUrl()}/api/transactions?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Erreur chargement des transactions");
  }
  const data = await res.json();
  return {
    payments: data.payments ?? [],
    meta: data.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: perPage,
      total: 0,
      from: null,
      to: null,
      has_prev: false,
      has_next: false,
      prev_page: null,
      next_page: null,
    },
  };
}
