import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    phone         TEXT,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS providers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    title        TEXT    NOT NULL,            -- Dra., Dr., Lic.
    category     TEXT    NOT NULL,            -- 'medica' | 'psicologica'
    specialty    TEXT    NOT NULL,
    bio          TEXT    NOT NULL,
    languages    TEXT    NOT NULL,            -- CSV, p. ej. "Español,Inglés"
    years        INTEGER NOT NULL,
    price_usd    REAL    NOT NULL,
    rating       REAL    NOT NULL,
    avatar       TEXT    NOT NULL             -- emoji o iniciales
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id  INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    scheduled_at TEXT    NOT NULL,            -- ISO 8601 (UTC)
    reason       TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'agendada', -- agendada|completada|cancelada
    room_code    TEXT    NOT NULL UNIQUE,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_appt_user ON appointments(user_id);
  CREATE INDEX IF NOT EXISTS idx_appt_provider ON appointments(provider_id);
`);

export interface UserRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  created_at: string;
}

export interface ProviderRow {
  id: number;
  name: string;
  title: string;
  category: 'medica' | 'psicologica';
  specialty: string;
  bio: string;
  languages: string;
  years: number;
  price_usd: number;
  rating: number;
  avatar: string;
}

export interface AppointmentRow {
  id: number;
  user_id: number;
  provider_id: number;
  scheduled_at: string;
  reason: string;
  status: 'agendada' | 'completada' | 'cancelada';
  room_code: string;
  created_at: string;
}
