import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { ratesRouter } from './routes/rates.js';
import { recipientsRouter } from './routes/recipients.js';
import { transactionsRouter } from './routes/transactions.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRouter);
  app.use('/api/rates', ratesRouter);
  app.use('/api/recipients', recipientsRouter);
  app.use('/api/transactions', transactionsRouter);

  app.use((_req, res) => res.status(404).json({ error: 'Recurso no encontrado' }));

  return app;
}

// Arranca el servidor sólo cuando se ejecuta directamente (no en tests).
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`🇨🇺  CubaRemesas API escuchando en http://localhost:${config.port}`);
  });
}
