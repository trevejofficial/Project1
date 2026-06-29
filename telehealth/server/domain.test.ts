import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateRoomCode, generateSlots, isValidCategory } from './domain.js';

test('isValidCategory reconoce las categorías válidas', () => {
  assert.equal(isValidCategory('medica'), true);
  assert.equal(isValidCategory('psicologica'), true);
  assert.equal(isValidCategory('dental'), false);
});

test('generateSlots sólo devuelve horarios futuros y en días laborables', () => {
  // Miércoles 2030-01-02 08:00 UTC como "ahora".
  const now = new Date('2030-01-02T08:00:00.000Z');
  const slots = generateSlots(new Set(), now);
  assert.ok(slots.length > 0);
  for (const iso of slots) {
    const d = new Date(iso);
    assert.ok(d.getTime() > now.getTime(), 'todos en el futuro');
    const wd = d.getUTCDay();
    assert.ok(wd !== 0 && wd !== 6, 'sin fines de semana');
  }
});

test('generateSlots excluye los horarios ocupados', () => {
  const now = new Date('2030-01-02T08:00:00.000Z');
  const all = generateSlots(new Set(), now);
  const taken = new Set([all[0]]);
  const remaining = generateSlots(taken, now);
  assert.equal(remaining.includes(all[0]), false);
  assert.equal(remaining.length, all.length - 1);
});

test('generateRoomCode produce un código con guiones', () => {
  assert.match(generateRoomCode(), /^[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3}$/);
});
