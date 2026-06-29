import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { db, type AppointmentRow, type ProviderRow } from '../db.js';
import { generateRoomCode } from '../domain.js';

export const appointmentsRouter = Router();
appointmentsRouter.use(requireAuth);

const createSchema = z.object({
  providerId: z.number().int().positive(),
  scheduledAt: z.string().datetime({ message: 'Fecha/hora inválida' }),
  reason: z.string().trim().min(3, 'Cuéntanos brevemente el motivo').max(500),
});

type ApptWithProvider = AppointmentRow & {
  p_name: string;
  p_title: string;
  p_specialty: string;
  p_category: string;
  p_avatar: string;
  p_price: number;
};

function publicAppointment(a: ApptWithProvider) {
  return {
    id: a.id,
    scheduledAt: a.scheduled_at,
    reason: a.reason,
    status: a.status,
    roomCode: a.room_code,
    createdAt: a.created_at,
    provider: {
      id: a.provider_id,
      name: a.p_name,
      title: a.p_title,
      specialty: a.p_specialty,
      category: a.p_category,
      avatar: a.p_avatar,
      priceUsd: a.p_price,
    },
  };
}

const SELECT_WITH_PROVIDER = `
  SELECT a.*, p.name AS p_name, p.title AS p_title, p.specialty AS p_specialty,
         p.category AS p_category, p.avatar AS p_avatar, p.price_usd AS p_price
  FROM appointments a
  JOIN providers p ON p.id = a.provider_id
`;

appointmentsRouter.get('/', (req, res) => {
  const rows = db
    .prepare(`${SELECT_WITH_PROVIDER} WHERE a.user_id = ? ORDER BY a.scheduled_at DESC`)
    .all(req.auth!.userId) as ApptWithProvider[];
  res.json(rows.map(publicAppointment));
});

appointmentsRouter.post('/', (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }
  const { providerId, scheduledAt, reason } = parsed.data;

  const provider = db.prepare('SELECT * FROM providers WHERE id = ?').get(providerId) as
    | ProviderRow
    | undefined;
  if (!provider) {
    res.status(404).json({ error: 'Proveedor no encontrado' });
    return;
  }

  // Normaliza al ISO con Z y valida que el horario no esté en el pasado.
  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
    res.status(400).json({ error: 'Elige un horario futuro válido' });
    return;
  }
  const iso = when.toISOString();

  // Evita doble reserva del mismo horario con el proveedor.
  const clash = db
    .prepare(
      "SELECT id FROM appointments WHERE provider_id = ? AND scheduled_at = ? AND status != 'cancelada'",
    )
    .get(providerId, iso);
  if (clash) {
    res.status(409).json({ error: 'Ese horario ya fue tomado, elige otro' });
    return;
  }

  const roomCode = generateRoomCode();
  const info = db
    .prepare(
      `INSERT INTO appointments (user_id, provider_id, scheduled_at, reason, status, room_code)
       VALUES (?, ?, ?, ?, 'agendada', ?)`,
    )
    .run(req.auth!.userId, providerId, iso, reason, roomCode);

  const row = db
    .prepare(`${SELECT_WITH_PROVIDER} WHERE a.id = ?`)
    .get(info.lastInsertRowid) as ApptWithProvider;
  res.status(201).json(publicAppointment(row));
});

appointmentsRouter.post('/:id/cancel', (req, res) => {
  const appt = db
    .prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.auth!.userId) as AppointmentRow | undefined;
  if (!appt) {
    res.status(404).json({ error: 'Cita no encontrada' });
    return;
  }
  if (appt.status !== 'agendada') {
    res.status(409).json({ error: 'Sólo puedes cancelar citas agendadas' });
    return;
  }
  db.prepare("UPDATE appointments SET status = 'cancelada' WHERE id = ?").run(appt.id);
  const row = db.prepare(`${SELECT_WITH_PROVIDER} WHERE a.id = ?`).get(appt.id) as ApptWithProvider;
  res.json(publicAppointment(row));
});
