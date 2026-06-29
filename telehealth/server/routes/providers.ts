import { Router } from 'express';
import { db, type AppointmentRow, type ProviderRow } from '../db.js';
import { generateSlots, isValidCategory } from '../domain.js';

export const providersRouter = Router();

function publicProvider(p: ProviderRow) {
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    category: p.category,
    specialty: p.specialty,
    bio: p.bio,
    languages: p.languages.split(','),
    years: p.years,
    priceUsd: p.price_usd,
    rating: p.rating,
    avatar: p.avatar,
  };
}

// Listado público de proveedores, filtrable por categoría.
providersRouter.get('/', (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  let rows: ProviderRow[];
  if (category && isValidCategory(category)) {
    rows = db
      .prepare('SELECT * FROM providers WHERE category = ? ORDER BY rating DESC')
      .all(category) as ProviderRow[];
  } else {
    rows = db.prepare('SELECT * FROM providers ORDER BY rating DESC').all() as ProviderRow[];
  }
  res.json(rows.map(publicProvider));
});

providersRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id) as
    | ProviderRow
    | undefined;
  if (!row) {
    res.status(404).json({ error: 'Proveedor no encontrado' });
    return;
  }
  res.json(publicProvider(row));
});

// Horarios disponibles del proveedor (excluye los ya agendados).
providersRouter.get('/:id/slots', (req, res) => {
  const provider = db.prepare('SELECT id FROM providers WHERE id = ?').get(req.params.id);
  if (!provider) {
    res.status(404).json({ error: 'Proveedor no encontrado' });
    return;
  }
  const taken = db
    .prepare(
      "SELECT scheduled_at FROM appointments WHERE provider_id = ? AND status != 'cancelada'",
    )
    .all(req.params.id) as Pick<AppointmentRow, 'scheduled_at'>[];
  const takenSet = new Set(taken.map((t) => t.scheduled_at));
  res.json({ slots: generateSlots(takenSet) });
});
