const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const cupFmt = new Intl.NumberFormat('es-CU', { maximumFractionDigits: 0 });

export const formatUsd = (n: number) => usdFmt.format(n);
export const formatCup = (n: number) => `${cupFmt.format(n)} CUP`;

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Entregada',
};

export const DELIVERY_LABELS: Record<string, string> = {
  cash: 'Efectivo a domicilio',
  card_cup: 'Recarga a tarjeta (CUP)',
  mlc: 'Tarjeta MLC',
};

export function formatDate(iso: string): string {
  // SQLite devuelve "YYYY-MM-DD HH:MM:SS" en UTC.
  const date = new Date(iso.replace(' ', 'T') + 'Z');
  return date.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
