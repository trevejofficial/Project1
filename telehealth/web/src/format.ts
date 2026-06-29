const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatUsd = (n: number) => usdFmt.format(n);

export const CATEGORY_LABELS: Record<string, string> = {
  medica: 'Consulta médica',
  psicologica: 'Atención psicológica',
};

export const STATUS_LABELS: Record<string, string> = {
  agendada: 'Agendada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

const dateFmt = new Intl.DateTimeFormat('es', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('es', { weekday: 'short', day: '2-digit', month: 'short' });

export const formatDateTime = (iso: string) => dateFmt.format(new Date(iso));
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));
export const formatDay = (iso: string) => dayFmt.format(new Date(iso));

/** Agrupa una lista de horarios ISO por día (clave: YYYY-MM-DD). */
export function groupSlotsByDay(slots: string[]): { day: string; slots: string[] }[] {
  const map = new Map<string, string[]>();
  for (const iso of slots) {
    const key = iso.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(iso);
  }
  return [...map.entries()].map(([, items]) => ({ day: items[0], slots: items }));
}
