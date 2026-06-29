export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface DeliveryMethod {
  id: string;
  label: string;
  etaHours: number;
}

export interface RatesInfo {
  rate: number;
  base: string;
  quote: string;
  feePercent: number;
  feeFixedUsd: number;
  minSendUsd: number;
  maxSendUsd: number;
  deliveryMethods: DeliveryMethod[];
  provinces: string[];
}

export interface Quote {
  amountUsd: number;
  feeUsd: number;
  totalUsd: number;
  rate: number;
  amountCup: number;
}

export interface Recipient {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  deliveryMethod: string;
  accountNumber: string | null;
  createdAt: string;
}

export interface Transaction {
  id: number;
  reference: string;
  amountUsd: number;
  feeUsd: number;
  totalUsd: number;
  rate: number;
  amountCup: number;
  deliveryMethod: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
  recipient?: { id: number; fullName: string; province: string; phone: string };
}

let token: string | null = localStorage.getItem('cr_token');

export function setToken(value: string | null) {
  token = value;
  if (value) localStorage.setItem('cr_token', value);
  else localStorage.removeItem('cr_token');
}

export function getToken() {
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? 'Ocurrió un error inesperado');
  }
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getRates: () => request<RatesInfo>('/rates'),
  getQuote: (amount: number) => request<Quote>(`/rates/quote?amount=${amount}`),
  listRecipients: () => request<Recipient[]>('/recipients'),
  createRecipient: (body: {
    fullName: string;
    phone: string;
    province: string;
    deliveryMethod: string;
    accountNumber?: string | null;
  }) => request<Recipient>('/recipients', { method: 'POST', body: JSON.stringify(body) }),
  deleteRecipient: (id: number) => request<void>(`/recipients/${id}`, { method: 'DELETE' }),
  listTransactions: () => request<Transaction[]>('/transactions'),
  createTransaction: (body: { recipientId: number; amountUsd: number }) =>
    request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  advanceTransaction: (id: number) =>
    request<Transaction>(`/transactions/${id}/advance`, { method: 'POST' }),
};
