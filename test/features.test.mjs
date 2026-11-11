import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateProperty } from '../src/score.ts';
import { formatForeignCurrency } from '../src/currency.ts';

test('evaluates safe and top pick property with high grade S', () => {
  const listing = {
    rent: 90000,
    management: { raw: '5000円', amount: 5000 },
    deposit: { raw: '1ヶ月', amount: 90000 },
    keyMoney: { raw: '0円', amount: 0 },
    facts: {
      gas: '都市ガス',
      structure: 'RC(鉄筋コンクリート)',
      access: { station: '新宿', minutes: 4 },
      floor: '3階',
    },
    lease: {
      leaseTerm: '普通借家 2年',
    },
  };

  const report = evaluateProperty(listing, 5000);
  assert.equal(report.grade, 'S');
  assert.ok(report.score >= 80);
  assert.ok(report.label.zh.includes('太鼓判'));
});

test('evaluates risky property with low grade C when traps exist', () => {
  const listing = {
    rent: 80000,
    management: { raw: '4000円', amount: 4000 },
    deposit: { raw: '1ヶ月', amount: 80000 },
    keyMoney: { raw: '2ヶ月', amount: 160000 },
    facts: {
      gas: 'プロパンガス', // 扣分
      structure: '木造',     // 扣分
      access: { station: '八王子', minutes: 18 },
      floor: '1階',         // 扣分
    },
    notes: [
      { kind: 'gas', raw: 'LPガス' },
      { kind: 'wood', raw: '木造' },
      { kind: 'contract', raw: '定期借家' },
    ],
  };

  const report = evaluateProperty(listing, 20000);
  assert.equal(report.grade, 'C');
  assert.ok(report.label.zh.includes('要警戒'));
});

test('formats foreign currency correctly', () => {
  assert.equal(formatForeignCurrency(100000, 'none'), null);
  const cny = formatForeignCurrency(100000, 'CNY');
  assert.ok(cny?.includes('¥4,700 CNY'));
  const usd = formatForeignCurrency(100000, 'USD');
  assert.ok(usd?.includes('$650 USD'));
});
