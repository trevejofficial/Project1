import assert from 'node:assert/strict';
import { test } from 'node:test';
import { config } from './config.js';
import { generateReference, isValidDeliveryMethod, quote } from './domain.js';

test('quote aplica comisión porcentual más cargo fijo', () => {
  const q = quote(100);
  const expectedFee = Math.round((100 * config.feePercent + config.feeFixedUsd) * 100) / 100;
  assert.equal(q.amountUsd, 100);
  assert.equal(q.feeUsd, expectedFee);
  assert.equal(q.totalUsd, Math.round((100 + expectedFee) * 100) / 100);
});

test('quote convierte a CUP usando la tasa vigente', () => {
  const q = quote(50);
  assert.ok(q.rate > 0);
  assert.equal(q.amountCup, Math.round(50 * q.rate * 100) / 100);
});

test('isValidDeliveryMethod reconoce métodos válidos e inválidos', () => {
  assert.equal(isValidDeliveryMethod('cash'), true);
  assert.equal(isValidDeliveryMethod('mlc'), true);
  assert.equal(isValidDeliveryMethod('bitcoin'), false);
});

test('generateReference produce el formato CR-XXXXXXXX', () => {
  const ref = generateReference();
  assert.match(ref, /^CR-[A-Z0-9]{8}$/);
});
