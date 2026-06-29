import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { db, type RecipientRow } from '../db.js';
import { isValidDeliveryMethod, PROVINCES } from '../domain.js';

export const recipientsRouter = Router();
recipientsRouter.use(requireAuth);

const recipientSchema = z.object({
  fullName: z.string().trim().min(3, 'Nombre del destinatario requerido').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{6,20}$/, 'Teléfono inválido'),
  province: z.string().refine((p) => PROVINCES.includes(p), 'Provincia inválida'),
  deliveryMethod: z.string().refine(isValidDeliveryMethod, 'Método de entrega inválido'),
  accountNumber: z.string().trim().max(40).optional().nullable(),
});

function publicRecipient(r: RecipientRow) {
  return {
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    province: r.province,
    deliveryMethod: r.delivery_method,
    accountNumber: r.account_number,
    createdAt: r.created_at,
  };
}

recipientsRouter.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM recipients WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.auth!.userId) as RecipientRow[];
  res.json(rows.map(publicRecipient));
});

recipientsRouter.post('/', (req, res) => {
  const parsed = recipientSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }
  const { fullName, phone, province, deliveryMethod, accountNumber } = parsed.data;
  const info = db
    .prepare(
      `INSERT INTO recipients (user_id, full_name, phone, province, delivery_method, account_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(req.auth!.userId, fullName, phone, province, deliveryMethod, accountNumber ?? null);
  const row = db.prepare('SELECT * FROM recipients WHERE id = ?').get(info.lastInsertRowid) as RecipientRow;
  res.status(201).json(publicRecipient(row));
});

recipientsRouter.delete('/:id', (req, res) => {
  const info = db
    .prepare('DELETE FROM recipients WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.auth!.userId);
  if (info.changes === 0) {
    res.status(404).json({ error: 'Destinatario no encontrado' });
    return;
  }
  res.status(204).end();
});
