import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detailRoom, listRooms } from '../src/homes.ts';
import { calculate } from '../src/cost.ts';

test("parses HOME'S list room price format and calculates monthly cost", () => {
  const priceCell = {
    textContent: '14.6 万円 / 15,000円 14.6万円/29.2万円/-/-',
    querySelector() { return null; },
    append() {},
  };
  const tr = {
    querySelector(selector) {
      if (selector.includes('price')) return priceCell;
      return null;
    },
  };
  const mockRoot = {
    querySelectorAll(selector) {
      if (selector.includes('.prg-roomList') || selector.includes('prg-room')) {
        return [tr];
      }
      return [];
    },
  };

  const results = [...listRooms(mockRoot)];
  assert.equal(results.length, 1);
  const { listing } = results[0];
  assert.equal(listing.rent, 146000);
  assert.equal(listing.management.amount, 15000);
  assert.equal(listing.deposit.amount, 146000);
  assert.equal(listing.keyMoney.amount, 292000);

  const calc = calculate(listing);
  // 月均 = 146000 + 15000 + Math.round(292000 / 24) = 161000 + 12167 = 173167
  assert.equal(calc.monthly, 173167);
  assert.equal(calc.difference, 27167);
});

test("parses HOME'S list room with '無' deposit/keyMoney format correctly", () => {
  const priceCell = {
    textContent: '7.6万円/3,000円 無/無/-/-',
    querySelector() { return null; },
    append() {},
  };
  const tr = {
    querySelector(selector) {
      if (selector.includes('price')) return priceCell;
      return null;
    },
  };
  const mockRoot = {
    querySelectorAll(selector) {
      if (selector.includes('.prg-roomList') || selector.includes('prg-room')) {
        return [tr];
      }
      return [];
    },
  };

  const results = [...listRooms(mockRoot)];
  assert.equal(results.length, 1);
  const { listing } = results[0];
  assert.equal(listing.rent, 76000);
  assert.equal(listing.management.amount, 3000);
  assert.equal(listing.deposit.amount, 0);
  assert.equal(listing.keyMoney.amount, 0);

  const calc = calculate(listing);
  // 月均 = 76000 + 3000 = 79000
  assert.equal(calc.monthly, 79000);
  assert.equal(calc.difference, 3000);
});

test("parses HOME'S detail JSON-LD correctly", () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    offers: {
      price: 146000,
      additionalProperty: [
        { name: '管理費等', value: 15000 },
        { name: '敷金', value: '14.6万円' },
        { name: '礼金', value: '29.2万円' },
        { name: '保証金', value: '-' },
        { name: 'その他費用', value: '仲介手数料：160,600円' },
        {
          name: '保証会社',
          value: '加入要\n保証会社：BGパートナーズ（株）\n保証会社利用料：初回：賃料等の50%、月次：550円、年次：10、000 円',
        },
        { name: '住宅保険', value: '要' },
        { name: '契約期間', value: '2年間' },
      ],
    },
    mainEntity: {
      floorSize: { value: 30.33 },
      floorLevel: '5階',
      yearBuilt: 2026,
      amenityFeature: [
        { name: '都市ガス', value: true },
        { name: 'ペット相談', value: true },
      ],
      additionalProperty: [
        { name: '交通', value: '東京メトロ東西線 落合駅 徒歩1分' },
        { name: '建物構造', value: 'RC(鉄筋コンクリート)' },
        { name: '主要採光面', value: '南' },
        { name: '間取り', value: '1K' },
      ],
    },
  };

  const scriptElem = {
    textContent: JSON.stringify(jsonLd),
  };
  const mockDoc = {
    querySelectorAll(selector) {
      if (selector.includes('application/ld+json')) {
        return [scriptElem];
      }
      return [];
    },
    querySelector() {
      return { tagName: 'DIV' };
    },
  };

  const res = detailRoom(mockDoc);
  assert.ok(res);
  const { listing } = res;
  assert.equal(listing.rent, 146000);
  assert.equal(listing.management.amount, 15000);
  assert.equal(listing.deposit.amount, 146000);
  assert.equal(listing.keyMoney.amount, 292000);
  assert.equal(listing.agency?.amount, 160600);
  // 初回担保费: (146000 + 15000) * 50% = 80500
  assert.equal(listing.guarantee?.amount, 80500);
  assert.equal(listing.facts?.gas, '都市ガス');
  assert.equal(listing.facts?.structure, 'RC(鉄筋コンクリート)');
  assert.equal(listing.facts?.access?.station, '落合駅');
  assert.equal(listing.facts?.access?.minutes, 1);
});

test("parses HOME'S detail DOM table with merged fields and month multipliers", () => {
  const fields = [
    ['賃料', '17.2万円'],
    ['管理費等', '8,000円'],
    ['敷金/礼金', '1ヶ月/1.5ヶ月'],
    ['保証金/敷引・償却', '-/-'],
  ];

  const mockThs = fields.map(([thText, tdText]) => ({
    textContent: thText,
    nextElementSibling: {
      matches(tag) { return tag === 'td'; },
      textContent: tdText,
    },
  }));

  const mockDoc = {
    querySelectorAll(selector) {
      if (selector.includes('th')) return mockThs;
      return [];
    },
    querySelector() {
      return { tagName: 'DIV' };
    },
  };

  const res = detailRoom(mockDoc);
  assert.ok(res);
  const { listing } = res;
  assert.equal(listing.rent, 172000);
  assert.equal(listing.management.amount, 8000);
  // 1 ヶ月換算: 172000
  assert.equal(listing.deposit.amount, 172000);
  // 1.5 ヶ月換算: 172000 * 1.5 = 258000
  assert.equal(listing.keyMoney.amount, 258000);
  assert.equal(listing.guaranteeDeposit?.amount, 0);
  assert.equal(listing.depreciation?.amount, 0);

  const calc = calculate(listing);
  // 初始小计: 172000 (敷金) + 258000 (礼金) = 430000
  assert.equal(calc.initialSubtotal, 430000);
  // 月均 = 172000 + 8000 + Math.round(258000 / 24) = 180000 + 10750 = 190750
  assert.equal(calc.monthly, 190750);
  assert.equal(calc.difference, 18750);
});
