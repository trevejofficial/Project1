import { Router } from 'express';
import { config } from '../config.js';
import { DELIVERY_METHODS, getCurrentRate, PROVINCES, quote } from '../domain.js';

export const ratesRouter = Router();

// Información pública: tasa actual, límites y catálogos.
ratesRouter.get('/', (_req, res) => {
  res.json({
    rate: getCurrentRate(),
    base: 'USD',
    quote: 'CUP',
    feePercent: config.feePercent,
    feeFixedUsd: config.feeFixedUsd,
    minSendUsd: config.minSendUsd,
    maxSendUsd: config.maxSendUsd,
    deliveryMethods: DELIVERY_METHODS,
    provinces: PROVINCES,
  });
});

// Cotización de un envío concreto (no requiere sesión, sólo simula).
ratesRouter.get('/quote', (req, res) => {
  const amount = Number(req.query.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: 'Monto inválido' });
    return;
  }
  if (amount < config.minSendUsd || amount > config.maxSendUsd) {
    res.status(400).json({
      error: `El monto debe estar entre $${config.minSendUsd} y $${config.maxSendUsd}`,
    });
    return;
  }
  res.json(quote(amount));
});
