import test from 'node:test';
import assert from 'node:assert/strict';
import { generateInquiryText, INQUIRY_OPTIONS } from '../src/inquiry.ts';
import { calculate } from '../src/cost.ts';

test('generates polite Japanese inquiry text for upfront quote with detected risks', () => {
  const listing = {
    rent: 95000,
    management: { raw: '5000円', amount: 5000 },
    deposit: { raw: '1ヶ月', amount: 95000 },
    keyMoney: { raw: '1ヶ月', amount: 95000 },
    notes: [
      { kind: 'gas', raw: 'LPガス' },
      { kind: 'wood', raw: '木造' },
      { kind: 'contract', raw: '定期借家 2年' },
    ],
  };

  const text = generateInquiryText({
    type: 'quote',
    propertyName: 'メゾン・ミヌクマ 201号室',
    url: 'https://suumo.jp/chintai/bc_12345/',
    listing,
  });

  assert.ok(text.includes('メゾン・ミヌクマ 201号室'));
  assert.ok(text.includes('95,000円 / 月'));
  assert.ok(text.includes('初期費用の概算お見積もり'));
  assert.ok(text.includes('定期借家契約について、期間満了時の再契約（更新）の可否や条件'));
  assert.ok(text.includes('ガスの種別（プロパンガス等）および月額費用の目安'));
  assert.ok(text.includes('建物の遮音性や周辺の生活環境'));
});

test('generates discount consultation text correctly', () => {
  const text = generateInquiryText({
    type: 'discount',
    propertyName: 'サンライズ高田馬場',
  });

  assert.ok(text.includes('仲介手数料の割引（半額等のご相談）'));
  assert.ok(text.includes('サンライズ高田馬場'));
});

test('generates foreigner inquiry text correctly', () => {
  const text = generateInquiryText({
    type: 'foreigner',
    propertyName: 'グランドパレス新宿',
  });

  assert.ok(text.includes('当方、外国籍'));
  assert.ok(text.includes('外国籍の入居申し込みおよび審査は可能でしょうか'));
});

test('calculates monthly amortization correctly for 12, 24, and 36 months', () => {
  const listing = {
    rent: 100000,
    management: { raw: '10000円', amount: 10000 },
    deposit: { raw: '100000円', amount: 100000 },
    keyMoney: { raw: '120000円', amount: 120000 }, // 不可退初期费用 120000
  };

  // 12 个月摊销: 100000 + 10000 + 120000 / 12 = 120000
  const cost12 = calculate(listing, 12);
  assert.equal(cost12.monthly, 120000);
  assert.equal(cost12.difference, 20000);

  // 24 个月摊销: 100000 + 10000 + 120000 / 24 = 115000
  const cost24 = calculate(listing, 24);
  assert.equal(cost24.monthly, 115000);
  assert.equal(cost24.difference, 15000);

  // 36 个月摊销: 100000 + 10000 + round(120000 / 36) = 110000 + 3333 = 113333
  const cost36 = calculate(listing, 36);
  assert.equal(cost36.monthly, 113333);
});
