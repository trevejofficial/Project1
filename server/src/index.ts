import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { ratesRouter } from './routes/rates.js';
import { recipientsRouter } from './routes/recipients.js';
import { transactionsRouter } from './routes/transactions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Cliente compilado por Vite. Tanto en src/ como en dist/ el servidor
// está un nivel por debajo de server/, así que la ruta relativa coincide.
const clientDist = path.resolve(__dirname, '..', '..', 'client', 'dist');

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRouter);
  app.use('/api/rates', ratesRouter);
  app.use('/api/recipients', recipientsRouter);
  app.use('/api/transactions', transactionsRouter);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Recurso no encontrado' }));

  // Sirve el cliente compilado (SPA) si existe. Cualquier ruta que no sea
  // /api devuelve index.html para que React Router maneje la navegación.
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  } else {
    app.get('*', (_req, res) =>
      res
        .status(503)
        .send('El cliente no está compilado. Ejecuta "npm run build" antes de "npm start".'),
    );
  }

  return app;
}

// Arranca el servidor sólo cuando se ejecuta directamente (no en tests).
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const app = createApp();
  // Escucha en 0.0.0.0 para ser accesible desde fuera del contenedor.
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🇨🇺  CubaRemesas en http://localhost:${config.port}`);
  });
}
