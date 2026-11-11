import type { Listing } from './cost';
import type { Locale } from './locale';

export type ScoreGrade = 'S' | 'A' | 'B' | 'C';

export interface ScoreReport {
  grade: ScoreGrade;
  score: number;
  label: Record<Locale, string>;
  summary: Record<Locale, string>;
  color: string;
}

export function evaluateProperty(listing: Listing, difference = 0): ScoreReport {
  let score = 70; // 基础基准分
  const notes = listing.notes ?? [];
  const facts = listing.facts ?? {};
  const gas = facts.gas ?? '';
  const structure = facts.structure ?? '';
  const leaseTerm = listing.lease?.leaseTerm ?? '';

  let hasSevereTrap = false;

  // 1. 燃气类型
  if (notes.some((n) => n.kind === 'gas') || /プロパン|LP/i.test(gas)) {
    score -= 25;
    hasSevereTrap = true;
  } else if (/都市ガス/i.test(gas)) {
    score += 10;
  }

  // 2. 建筑结构
  if (notes.some((n) => n.kind === 'wood') || /木造/i.test(structure)) {
    score -= 20;
  } else if (/軽量鉄骨/i.test(structure)) {
    score -= 10;
  } else if (/RC|鉄筋コンクリート|SRC|鉄骨鉄筋/i.test(structure)) {
    score += 15;
  }

  // 3. 租约形态
  if (notes.some((n) => n.kind === 'contract') || /定期借家/i.test(leaseTerm)) {
    score -= 25;
    hasSevereTrap = true;
  }

  // 4. 楼层
  if (notes.some((n) => n.kind === 'floor') || /^1階|地下/i.test(facts.floor ?? '')) {
    score -= 10;
  }

  // 5. 礼金与溢价
  if (listing.keyMoney.amount === 0) {
    score += 10; // 0 礼金
  } else if (listing.keyMoney.amount && listing.rent && listing.keyMoney.amount >= listing.rent * 1.9) {
    score -= 15; // 2个月以上礼金
  }

  // 差额与表面租金比例
  if (listing.rent > 0) {
    const ratio = difference / listing.rent;
    if (ratio > 0.2) score -= 15;
    else if (ratio < 0.08) score += 5;
  }

  // 车站步行
  if (facts.access?.minutes !== undefined) {
    if (facts.access.minutes <= 5) score += 10;
    else if (facts.access.minutes > 15) score -= 10;
  }

  score = Math.max(10, Math.min(100, score));

  if (score >= 80 && !hasSevereTrap) {
    return {
      grade: 'S',
      score,
      label: {
        zh: '💮 太鼓判 · 优质推荐',
        ja: '💮 太鼓判・優良物件',
        en: '💮 Certified · Top Pick',
      },
      summary: {
        zh: '无明显隐形暗坑，结构与能源配置良好，初期费用合理。',
        ja: '目立った落とし穴がなく、構造・設備・費用ともにバランスが優れています。',
        en: 'Well-balanced property with no major traps and reasonable upfront costs.',
      },
      color: '#2e7d32',
    };
  }

  if (score >= 65 && !hasSevereTrap) {
    return {
      grade: 'A',
      score,
      label: {
        zh: '✨ 良好 · 值得考虑',
        ja: '✨ 良好・おすすめ',
        en: '✨ Good · Solid Option',
      },
      summary: {
        zh: '整体条件优良，性价比较高，可放心预约看房。',
        ja: '全体的に良好な条件です。安心して内見を申し込めます。',
        en: 'Solid overall conditions with good value. Recommended for viewing.',
      },
      color: '#0277bd',
    };
  }

  if (score >= 50) {
    return {
      grade: 'B',
      score,
      label: {
        zh: '🧐 尚可 · 需多核实',
        ja: '🧐 普通・要確認',
        en: '🧐 Fair · Check Details',
      },
      summary: {
        zh: '存在部分需确认事项（如楼层、隔音或初期费用），建议看房时重点求证。',
        ja: '一部確認が必要な項目があります。内見時にチェックをおすすめします。',
        en: 'A few details require attention during a viewing before making a decision.',
      },
      color: '#ef6c00',
    };
  }

  return {
    grade: 'C',
    score,
    label: {
      zh: '⚠️ 要警戒 · 暗坑偏多',
      ja: '⚠️ 要警戒・注意',
      en: '⚠️ Caution · High Risk',
    },
    summary: {
      zh: '命中 LP 瓦斯、木造或定期借家等关键避坑点，居住成本或续住可能受限。',
      ja: 'LPガス・木造・定期借家など注意すべき条件が含まれています。慎重にご検討ください。',
      en: 'Contains critical risk factors like propane gas, wood frame, or fixed-term lease.',
    },
    color: '#c62828',
  };
}
