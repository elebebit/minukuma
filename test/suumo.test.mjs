import test from 'node:test';
import assert from 'node:assert/strict';
import { listRooms, detailRoom } from '../src/suumo.ts';

test('parses SUUMO list room price, anchors under rent/admin fee, and computes costs', () => {
  const rowHtml = `
    <tr class="js-cassette_link">
      <td><input type="checkbox" /></td>
      <td><img src="thumb.jpg" /></td>
      <td>2階</td>
      <td class="cassetteitem_other-col cassetteitem_other-col--rent">
        <span class="cassetteitem_price cassetteitem_price--rent">12万円</span>
        <span class="cassetteitem_price cassetteitem_price--administration">6000円</span>
      </td>
      <td>
        <span class="cassetteitem_price cassetteitem_price--deposit">12万円</span>
        <span class="cassetteitem_price cassetteitem_price--gratuity">12万円</span>
      </td>
      <td>1DK / 36.51m2</td>
      <td></td>
      <td></td>
      <td>
        <a href="/chintai/bc_10001/" class="cassetteitem_other-linktext">詳細を見る</a>
      </td>
    </tr>
  `;

  const container = {
    querySelectorAll(selector) {
      if (selector === '.cassetteitem_other tbody tr') {
        const adminElem = { textContent: '6000円' };
        const rentElem = { textContent: '12万円' };
        const depositElem = { textContent: '12万円' };
        const keyMoneyElem = { textContent: '12万円' };
        const linkElem = { textContent: '詳細を見る' };

        const mockRow = {
          querySelector(sel) {
            if (sel === '.cassetteitem_price--rent') return rentElem;
            if (sel === '.cassetteitem_price--administration') return adminElem;
            if (sel === '.cassetteitem_price--deposit') return depositElem;
            if (sel === '.cassetteitem_price--gratuity') return keyMoneyElem;
            if (sel === 'a.cassetteitem_other-linktext') return linkElem;
            return null;
          },
          closest() { return null; },
        };
        return [mockRow];
      }
      return [];
    },
  };

  const rooms = Array.from(listRooms(container));
  assert.equal(rooms.length, 1);
  const { anchor, listing } = rooms[0];
  // 锚点必须是管理费/价格元素，而不是右侧的詳細を見る链接
  assert.equal(anchor.textContent, '6000円');
  assert.equal(listing.rent, 120000);
  assert.equal(listing.management.amount, 6000);
  assert.equal(listing.deposit.amount, 120000);
  assert.equal(listing.keyMoney.amount, 120000);
});

test('parses SUUMO detail multi-station access covering all routes', () => {
  const noteInfo = {
    querySelector(sel) {
      if (sel === '.property_view_note-emphasis') return { textContent: '10.5万円' };
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.property_view_note-list > span') {
        return [
          { textContent: '管理費・共益費: 9,492円' },
          { textContent: '敷金: -' },
          { textContent: '礼金: -' },
        ];
      }
      return [];
    },
  };

  const walkTd = {
    querySelectorAll(sel) {
      if (sel === '.property_view_table-read') {
        return [
          { textContent: '京成本線/新三河島駅 歩5分' },
          { textContent: '東京メトロ千代田線/町屋駅 歩9分' },
          { textContent: '都電荒川線/町屋二丁目駅 歩9分' },
        ];
      }
      return [];
    },
  };

  const overviewTh = [
    { textContent: '所在地', nextElementSibling: { matches: (s) => s === 'td', textContent: '東京都荒川区東尾久１' } },
    { textContent: '駅徒歩', nextElementSibling: { matches: (s) => s === 'td', ...walkTd } },
    { textContent: '間取り', nextElementSibling: { matches: (s) => s === 'td', textContent: '1K' } },
  ];

  const root = {
    querySelector(sel) {
      if (sel === '.property_view_note-info') return noteInfo;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.property_view_table th') return overviewTh;
      return [];
    },
  };

  const res = detailRoom(root);
  assert.ok(res);
  const { listing } = res;
  assert.equal(listing.rent, 105000);
  assert.equal(listing.facts?.address, '東京都荒川区東尾久１');
  assert.equal(listing.facts?.access?.station, '新三河島駅');
  assert.equal(listing.facts?.access?.minutes, 5);
  assert.equal(listing.facts?.access?.stations?.length, 3);
  assert.equal(listing.facts?.access?.stations[0].line, '京成本線');
  assert.equal(listing.facts?.access?.stations[0].station, '新三河島駅');
  assert.equal(listing.facts?.access?.stations[0].minutes, 5);
  assert.equal(listing.facts?.access?.stations[1].line, '東京メトロ千代田線');
  assert.equal(listing.facts?.access?.stations[1].station, '町屋駅');
  assert.equal(listing.facts?.access?.stations[1].minutes, 9);
  assert.equal(listing.facts?.access?.stations[2].line, '都電荒川線');
  assert.equal(listing.facts?.access?.stations[2].station, '町屋二丁目駅');
  assert.equal(listing.facts?.access?.stations[2].minutes, 9);
});
