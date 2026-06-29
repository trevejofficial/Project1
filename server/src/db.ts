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
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recipients (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name       TEXT    NOT NULL,
    phone           TEXT    NOT NULL,
    province        TEXT    NOT NULL,
    delivery_method TEXT    NOT NULL,
    account_number  TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id    INTEGER NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    amount_usd      REAL    NOT NULL,
    fee_usd         REAL    NOT NULL,
    total_usd       REAL    NOT NULL,
    rate            REAL    NOT NULL,
    amount_cup      REAL    NOT NULL,
    delivery_method TEXT    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'pending',
    reference       TEXT    NOT NULL UNIQUE,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_recipients_user ON recipients(user_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
`);

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface RecipientRow {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  province: string;
  delivery_method: string;
  account_number: string | null;
  created_at: string;
}

export interface TransactionRow {
  id: number;
  user_id: number;
  recipient_id: number;
  amount_usd: number;
  fee_usd: number;
  total_usd: number;
  rate: number;
  amount_cup: number;
  delivery_method: string;
  status: string;
  reference: string;
  created_at: string;
}
