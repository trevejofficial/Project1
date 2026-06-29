import { config } from './config.js';

export const DELIVERY_METHODS = [
  { id: 'cash', label: 'Efectivo a domicilio', etaHours: 24 },
  { id: 'card_cup', label: 'Recarga a tarjeta (CUP)', etaHours: 2 },
  { id: 'mlc', label: 'Tarjeta MLC', etaHours: 6 },
] as const;

export type DeliveryMethodId = (typeof DELIVERY_METHODS)[number]['id'];

export const PROVINCES = [
  'Pinar del Río',
  'Artemisa',
  'La Habana',
  'Mayabeque',
  'Matanzas',
  'Cienfuegos',
  'Villa Clara',
  'Sancti Spíritus',
  'Ciego de Ávila',
  'Camagüey',
  'Las Tunas',
  'Holguín',
  'Granma',
  'Santiago de Cuba',
  'Guantánamo',
  'Isla de la Juventud',
];

export function isValidDeliveryMethod(id: string): id is DeliveryMethodId {
  return DELIVERY_METHODS.some((m) => m.id === id);
}

/**
 * Devuelve la tasa de cambio USD -> CUP. Se simula una pequeña
 * variación determinística por hora para que el valor "se mueva"
 * sin depender de un proveedor externo en este MVP.
 */
export function getCurrentRate(): number {
  const hour = new Date().getUTCHours();
  const jitter = Math.sin(hour) * 6; // +/- 6 CUP a lo largo del día
  return Math.round((config.baseRateUsdToCup + jitter) * 100) / 100;
}

export interface Quote {
  amountUsd: number;
  feeUsd: number;
  totalUsd: number;
  rate: number;
  amountCup: number;
}

/**
 * Calcula la cotización de un envío a partir del monto en USD.
 * Comisión = monto * feePercent + cargo fijo.
 */
export function quote(amountUsd: number): Quote {
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const rate = getCurrentRate();
  const feeUsd = round2(amountUsd * config.feePercent + config.feeFixedUsd);
  const totalUsd = round2(amountUsd + feeUsd);
  const amountCup = round2(amountUsd * rate);
  return { amountUsd: round2(amountUsd), feeUsd, totalUsd, rate, amountCup };
}

export function generateReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CR-${out}`;
}
