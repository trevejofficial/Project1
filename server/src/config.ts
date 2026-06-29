import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me-in-production',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'cubaremesas.sqlite'),
  // Tasa de cambio informal de referencia (USD -> CUP). En producción
  // vendría de un proveedor externo; aquí se simula con una base + jitter.
  baseRateUsdToCup: Number(process.env.BASE_RATE_USD_CUP ?? 370),
  // Comisión: porcentaje sobre el monto enviado + cargo fijo.
  feePercent: Number(process.env.FEE_PERCENT ?? 0.05),
  feeFixedUsd: Number(process.env.FEE_FIXED_USD ?? 2.99),
  minSendUsd: 10,
  maxSendUsd: 2000,
};
