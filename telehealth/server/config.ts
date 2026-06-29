import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-cambiar-en-produccion',
  jwtExpiresIn: '7d',
  dbPath: process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'saludjuntos.sqlite'),
  // Línea de ayuda en crisis (988, opción en español) — se muestra en la app.
  crisisLine: process.env.CRISIS_LINE ?? '988',
};
