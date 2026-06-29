import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { CATEGORIES } from './domain.js';
import { authRouter } from './routes/auth.js';
import { appointmentsRouter } from './routes/appointments.js';
import { providersRouter } from './routes/providers.js';
import { seedProviders } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Cliente compilado por Vite (web/dist). Desde server/dist hay que subir dos niveles.
const clientDist = path.resolve(__dirname, '..', '..', 'web', 'dist');

export function createApp() {
  seedProviders();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/meta', (_req, res) =>
    res.json({ categories: CATEGORIES, crisisLine: config.crisisLine }),
  );
  app.use('/api/auth', authRouter);
  app.use('/api/providers', providersRouter);
  app.use('/api/appointments', appointmentsRouter);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Recurso no encontrado' }));

  // Sirve la SPA compilada; cualquier ruta no-/api devuelve index.html.
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  } else {
    app.get('*', (_req, res) =>
      res.status(503).send('El cliente no está compilado. Ejecuta "npm run build".'),
    );
  }

  return app;
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const app = createApp();
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🩺  SaludJuntos en http://localhost:${config.port}`);
  });
}
