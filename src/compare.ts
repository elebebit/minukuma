import { browser } from 'wxt/browser';

export interface CompareItem {
  id: string; // url 或 唯一标识
  propertyName: string;
  url: string;
  address?: string;
  rent: number;
  monthly: number;
  difference: number;
  initialSubtotal: number;
  station: string;
  structure: string;
  gas: string;
  grade: string;
  gradeColor: string;
  addedAt: number;
}

const STORAGE_KEY = 'minukuma_compare_list';
const MAX_COMPARE_ITEMS = 20;

export async function getCompareList(): Promise<CompareItem[]> {
  try {
    const res = await browser.storage.local.get(STORAGE_KEY);
    const list = res[STORAGE_KEY];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function isPropertySaved(idOrUrl: string): Promise<boolean> {
  const list = await getCompareList();
  return list.some((item) => item.id === idOrUrl || (idOrUrl && item.url === idOrUrl));
}

export async function addToCompare(item: CompareItem): Promise<{ success: boolean; reason?: 'limit' | 'exists' }> {
  const list = await getCompareList();
  if (list.some((existing) => existing.id === item.id || (item.url && existing.url === item.url))) {
    return { success: false, reason: 'exists' };
  }
  if (list.length >= MAX_COMPARE_ITEMS) {
    return { success: false, reason: 'limit' };
  }
  list.unshift(item);
  await browser.storage.local.set({ [STORAGE_KEY]: list });
  return { success: true };
}

export async function removeFromCompare(idOrUrl: string): Promise<void> {
  const list = await getCompareList();
  const next = list.filter((item) => item.id !== idOrUrl && item.url !== idOrUrl);
  await browser.storage.local.set({ [STORAGE_KEY]: next });
}

export async function clearCompare(): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: [] });
}

export function formatCompareListText(items: CompareItem[]): string {
  if (items.length === 0) return '';
  const lines = [
    '【みぬくま 検討物件リスト / 租房备选清单】',
    `作成日時: ${new Date().toLocaleDateString('ja-JP')} (全${items.length}件)`,
    '----------------------------------------',
  ];

  items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.propertyName || '物件詳細'}`,
      `   ・実質月額: ¥${item.monthly.toLocaleString('ja-JP')} (表面家賃: ¥${item.rent.toLocaleString('ja-JP')})`,
      `   ・初期費用概算: ¥${item.initialSubtotal.toLocaleString('ja-JP')}`,
      item.address ? `   ・所在地: ${item.address}` : '',
      `   ・最寄り駅: ${item.station || '—'}`,
      `   ・建物構造: ${item.structure || '—'} | ガス: ${item.gas || '—'}`,
      item.url ? `   ・URL: ${item.url}` : '',
      ''
    );
  });

  return lines.filter(Boolean).join('\n');
}
