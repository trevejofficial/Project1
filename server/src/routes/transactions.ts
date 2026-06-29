import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { config } from '../config.js';
import { db, type RecipientRow, type TransactionRow } from '../db.js';
import { generateReference, quote } from '../domain.js';

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

const createSchema = z.object({
  recipientId: z.number().int().positive(),
  amountUsd: z
    .number()
    .min(config.minSendUsd, `El monto mínimo es $${config.minSendUsd}`)
    .max(config.maxSendUsd, `El monto máximo es $${config.maxSendUsd}`),
});

function publicTransaction(t: TransactionRow, r?: RecipientRow) {
  return {
    id: t.id,
    reference: t.reference,
    amountUsd: t.amount_usd,
    feeUsd: t.fee_usd,
    totalUsd: t.total_usd,
    rate: t.rate,
    amountCup: t.amount_cup,
    deliveryMethod: t.delivery_method,
    status: t.status,
    createdAt: t.created_at,
    recipient: r
      ? { id: r.id, fullName: r.full_name, province: r.province, phone: r.phone }
      : undefined,
  };
}

transactionsRouter.get('/', (req, res) => {
  const rows = db
    .prepare(
      `SELECT t.*, r.full_name, r.province, r.phone
       FROM transactions t
       JOIN recipients r ON r.id = t.recipient_id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
    )
    .all(req.auth!.userId) as Array<TransactionRow & { full_name: string; province: string; phone: string }>;

  res.json(
    rows.map((row) =>
      publicTransaction(row, {
        id: row.recipient_id,
        full_name: row.full_name,
        province: row.province,
        phone: row.phone,
      } as RecipientRow),
    ),
  );
});

transactionsRouter.post('/', (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }
  const { recipientId, amountUsd } = parsed.data;

  const recipient = db
    .prepare('SELECT * FROM recipients WHERE id = ? AND user_id = ?')
    .get(recipientId, req.auth!.userId) as RecipientRow | undefined;
  if (!recipient) {
    res.status(404).json({ error: 'Destinatario no encontrado' });
    return;
  }

  const q = quote(amountUsd);
  const reference = generateReference();
  const info = db
    .prepare(
      `INSERT INTO transactions
        (user_id, recipient_id, amount_usd, fee_usd, total_usd, rate, amount_cup, delivery_method, status, reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    )
    .run(
      req.auth!.userId,
      recipientId,
      q.amountUsd,
      q.feeUsd,
      q.totalUsd,
      q.rate,
      q.amountCup,
      recipient.delivery_method,
      reference,
    );

  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid) as TransactionRow;
  res.status(201).json(publicTransaction(row, recipient));
});

// Simulación de avance de estado (pending -> processing -> completed).
const STATUS_FLOW: Record<string, string> = {
  pending: 'processing',
  processing: 'completed',
};

transactionsRouter.post('/:id/advance', (req, res) => {
  const tx = db
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.auth!.userId) as TransactionRow | undefined;
  if (!tx) {
    res.status(404).json({ error: 'Transacción no encontrada' });
    return;
  }
  const next = STATUS_FLOW[tx.status];
  if (!next) {
    res.status(409).json({ error: 'La transacción ya está completada' });
    return;
  }
  db.prepare('UPDATE transactions SET status = ? WHERE id = ?').run(next, tx.id);
  const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(tx.id) as TransactionRow;
  res.json(publicTransaction(updated));
});
