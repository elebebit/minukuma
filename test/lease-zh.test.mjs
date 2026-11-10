import assert from 'node:assert/strict';
import { test } from 'node:test';
import { translateLeaseChinese } from '../src/lease-zh.ts';
import { propertyValue } from '../src/locale.ts';

test('translates move-in restrictions and retains the lease duration', () => {
  assert.equal(translateLeaseChinese('相談'), '需协商');
  assert.equal(translateLeaseChinese('ペット相談'), '养宠需协商');
  assert.equal(translateLeaseChinese('普通借家 ２年'), '普通租约 2 年');
});

test('translates structures and guarantees correctly', () => {
  assert.equal(propertyValue('鉄筋コン', 'zh'), '钢筋混凝土 (RC)');
  assert.equal(
    translateLeaseChinese('保証会社利用必 初回:総賃料の40% 毎月:1000円'),
    '须使用担保公司 首次:租金总额的40% 每月:1000 日元',
  );
});

test('preserves amounts, billing intervals, and unrecognized source names', () => {
  assert.equal(
    translateLeaseChinese('更新料 新賃料1.00ヶ月分 火災保険料相当額 月額950円'),
    '续约费 新租金1.00 个月 火灾保险费等额费用 每月950 日元',
  );
  assert.equal(
    translateLeaseChinese('初回保証料：賃料総額の50％／2年毎に20000円'),
    '首次担保费:租金总额的50%/每 2 年 20000 日元',
  );
  assert.equal(translateLeaseChinese('オリコフォレントインシュア'), 'オリコフォレントインシュア');
});
