export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface Provider {
  id: number;
  name: string;
  title: string;
  category: 'medica' | 'psicologica';
  specialty: string;
  bio: string;
  languages: string[];
  years: number;
  priceUsd: number;
  rating: number;
  avatar: string;
}

export interface Appointment {
  id: number;
  scheduledAt: string;
  reason: string;
  status: 'agendada' | 'completada' | 'cancelada';
  roomCode: string;
  createdAt: string;
  provider: {
    id: number;
    name: string;
    title: string;
    specialty: string;
    category: 'medica' | 'psicologica';
    avatar: string;
    priceUsd: number;
  };
}

export interface Meta {
  categories: { id: string; label: string }[];
  crisisLine: string;
}

let token: string | null = localStorage.getItem('sj_token');

export function setToken(value: string | null) {
  token = value;
  if (value) localStorage.setItem('sj_token', value);
  else localStorage.removeItem('sj_token');
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
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Ocurrió un error inesperado');
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; phone?: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getMeta: () => request<Meta>('/meta'),
  listProviders: (category?: string) =>
    request<Provider[]>(`/providers${category ? `?category=${category}` : ''}`),
  getProvider: (id: number) => request<Provider>(`/providers/${id}`),
  getSlots: (id: number) => request<{ slots: string[] }>(`/providers/${id}/slots`),
  listAppointments: () => request<Appointment[]>('/appointments'),
  createAppointment: (body: { providerId: number; scheduledAt: string; reason: string }) =>
    request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  cancelAppointment: (id: number) =>
    request<Appointment>(`/appointments/${id}/cancel`, { method: 'POST' }),
};
