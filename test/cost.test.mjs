import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculate, fee, yen } from '../src/cost.ts';

test('parses yen precisely and preserves unknown charges', () => {
  assert.equal(yen('６．９９９９万円'), 69999);
  assert.equal(yen('8,000円'), 8000);
  assert.equal(yen('8,00円'), null);
  assert.equal(yen('8万円〜'), null);
  assert.equal(fee('なし').amount, 0);
  assert.equal(fee().amount, null);
});

test('counts the deposit once upfront and amortizes only its nonrefundable portion', () => {
  assert.deepEqual(calculate({
    rent: 85000,
    management: fee('8,000円'),
    deposit: fee('8.5万円'),
    depreciation: fee('3万円'),
    keyMoney: fee('8.5万円'),
    agency: fee('4.675万円'),
  }), { monthly: 99740, difference: 14740, initialSubtotal: 216750 });
});
