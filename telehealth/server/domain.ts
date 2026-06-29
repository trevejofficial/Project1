export const CATEGORIES = [
  { id: 'medica', label: 'Consultas médicas' },
  { id: 'psicologica', label: 'Atención psicológica' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function isValidCategory(id: string): id is CategoryId {
  return CATEGORIES.some((c) => c.id === id);
}

// Horarios de atención (hora local simulada en UTC para simplicidad del MVP).
const SLOT_HOURS = [9, 10, 11, 13, 14, 15, 16, 17];
const DAYS_AHEAD = 10;

/**
 * Genera los horarios disponibles de un proveedor para los próximos días,
 * excluyendo los que ya están ocupados y los que ya pasaron.
 */
export function generateSlots(takenISO: Set<string>, now = new Date()): string[] {
  const slots: string[] = [];
  for (let d = 0; d < DAYS_AHEAD; d++) {
    const day = new Date(now);
    day.setUTCDate(now.getUTCDate() + d);
    const weekday = day.getUTCDay(); // 0 = domingo, 6 = sábado
    if (weekday === 0 || weekday === 6) continue; // sólo días laborables

    for (const hour of SLOT_HOURS) {
      const slot = new Date(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, 0, 0),
      );
      if (slot.getTime() <= now.getTime()) continue; // descarta pasado
      const iso = slot.toISOString();
      if (takenISO.has(iso)) continue; // descarta ocupado
      slots.push(iso);
    }
  }
  return slots;
}

export function generateRoomCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 9; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
    if (i === 2 || i === 5) out += '-';
  }
  return out;
}
