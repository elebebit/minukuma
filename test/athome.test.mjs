import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detailRoom, listRooms } from '../src/athome.ts';
import { calculate } from '../src/cost.ts';

test('parses at home list room row and calculates monthly cost', () => {
  const mockSection = {
    querySelector(selector) {
      if (selector.includes('rent')) {
        return { textContent: '13.4万円' };
      }
      if (selector.includes('a[href*="/chintai/"]')) {
        return { tagName: 'A', textContent: '301' };
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector.includes('room-info-item.price .room-info-item__text')) {
        return [{ textContent: '13.4万円' }, { textContent: '8,000円' }];
      }
      if (selector.includes('room-info-item.fees .room-info-item__text')) {
        return [{ textContent: '1ヶ月' }, { textContent: '1ヶ月' }];
      }
      return [];
    },
  };

  const mockRoot = {
    querySelectorAll(selector) {
      if (selector.includes('room-info-section')) {
        return [mockSection];
      }
      return [];
    },
  };

  const results = [...listRooms(mockRoot)];
  assert.equal(results.length, 1);
  const { listing } = results[0];
  assert.equal(listing.rent, 134000);
  assert.equal(listing.management.amount, 8000);
  // 1 ヶ月換算
  assert.equal(listing.deposit.amount, 134000);
  assert.equal(listing.keyMoney.amount, 134000);

  const calc = calculate(listing);
  // 月均 = 134000 + 8000 + Math.round(134000 / 24) = 142000 + 5583 = 147583
  assert.equal(calc.monthly, 147583);
  assert.equal(calc.difference, 13583);
});

test('parses at home detail table correctly', () => {
  const fields = [
    ['賃料', '13.4万円'],
    ['管理費等', '8,000円'],
    ['敷金 / 保証金', '1ヶ月/なし'],
    ['礼金', '1ヶ月'],
    ['その他一時金', '鍵交換代等：44,000円～'],
    ['備考', '賃貸保証等：加入要（賃料等の５０％）'],
    ['保険等', '要'],
    ['給油・ガス', '都市ガス、都市ガス給湯、給湯'],
    ['建物構造・工法', 'ＲＣ'],
    ['築年月', '2009年4月(築17年8ヶ月)'],
    ['主要採光面', '北東'],
    ['間取り', 'ワンルーム（洋 8.3）'],
    ['専有面積', '27.67m²'],
    ['契約期間', '2年'],
    ['条件', '楽器相談、常時ゴミ出し可能、保証人不要'],
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
      if (selector.includes('th')) {
        return mockThs;
      }
      return [];
    },
    querySelector(selector) {
      if (selector.includes('station')) {
        return { textContent: 'ＪＲ総武線 「東中野」駅 徒歩10分' };
      }
      return { tagName: 'DIV' };
    },
  };

  const res = detailRoom(mockDoc);
  assert.ok(res);
  const { listing } = res;
  assert.equal(listing.rent, 134000);
  assert.equal(listing.management.amount, 8000);
  assert.equal(listing.deposit.amount, 134000);
  assert.equal(listing.keyMoney.amount, 134000);
  assert.equal(listing.otherInitial?.amount, 44000);
  // 初回保証料: (134000 + 8000) * 50% = 71000
  assert.equal(listing.guarantee?.amount, 71000);
  assert.equal(listing.facts?.gas, '都市ガス');
  assert.equal(listing.facts?.structure, 'ＲＣ');
  assert.equal(listing.facts?.age, 17);
  assert.equal(listing.facts?.access?.station, '東中野駅');
  assert.equal(listing.facts?.access?.minutes, 10);
});
