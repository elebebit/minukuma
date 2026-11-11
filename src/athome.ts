import { advertisedFee, derivedFee, fee, monthFee, normalize, yen, type Fee, type Listing } from './cost.ts';

function parseGuarantee(raw = '', rent: number, managementAmount: number | null): {
  guarantee: Fee;
  ongoingGuarantee?: string;
} {
  const norm = normalize(raw);
  const guaranteeRate = norm.match(/(?:初回(?:保証料|保証委託料|保証)?|契約時(?:保証料)?|賃貸保証等?\s*[:：]?\s*加入要\s*\(?)\s*(?:(?:賃料総額|総賃料|月額賃料等?|賃料等の?|賃料)の)?\s*(\d+(?:\.\d+)?)%(?![\d.,])/);
  const guaranteeFixed = norm.match(/(?:初回(?:保証料|保証委託料|保証)?|契約時(?:保証料)?)\s*[:：]\s*([\d,.]+\s*(?:万円|円))/);
  const fixedAmount = guaranteeFixed?.[1] ? yen(guaranteeFixed[1]) : null;

  const guarantee = guaranteeRate && managementAmount !== null
    ? derivedFee(raw, (rent + managementAmount) * Number(guaranteeRate[1]) / 100)
    : fixedAmount !== null
      ? derivedFee(raw, fixedAmount)
      : fee(raw);

  const hasOngoing = /継続保証料|更新保証料|保証更新料|月額保証料|月次|年間保証料|年次|毎月|毎年|\d+年(?:ごと|毎)に?\s*[\d,.]+\s*(?:万円|円)/.test(norm);
  const ongoingGuarantee = hasOngoing ? raw : undefined;

  return { guarantee, ongoingGuarantee };
}

export function* listRooms(root: ParentNode) {
  for (const section of root.querySelectorAll('.room-info-section, .property-card__accordion .room-info-section')) {
    const priceContainer = section.querySelector('.room-info-item.price, .price');
    const textElements = [...section.querySelectorAll('.room-info-item.price .room-info-item__text, .price .room-info-item__text')];
    const rentElem = section.querySelector('.room-info-item.price .rent, .price .rent, .rent') ?? textElements[0];
    const adminElem = textElements[1] ?? section.querySelector('.room-info-item.price .admin, .price .admin, .management');
    const anchor = adminElem ?? rentElem ?? priceContainer?.lastElementChild ?? priceContainer;
    if (!anchor) continue;

    const rent = yen(rentElem?.textContent ?? textElements[0]?.textContent ?? '');
    if (rent === null || rent <= 0) continue;

    const mgmtRaw = textElements[1]?.textContent?.trim() ?? '-';
    const management = advertisedFee(mgmtRaw);

    const feeElements = [...section.querySelectorAll('.room-info-item.fees .room-info-item__text')];
    const depositRaw = feeElements[0]?.textContent?.trim() ?? '-';
    const keyMoneyRaw = feeElements[1]?.textContent?.trim() ?? '-';

    const deposit = monthFee(depositRaw, rent);
    const keyMoney = monthFee(keyMoneyRaw, rent);

    const linkElem = section.querySelector<HTMLAnchorElement>(
      '.room-info-section__room-detail a[href*="/chintai/"], a[href*="/chintai/"]'
    );
    const href = linkElem?.getAttribute?.('href') ?? (linkElem as { href?: string })?.href;
    const url = href ? (href.startsWith('http') ? href : `https://www.athome.co.jp${href}`) : undefined;
    const propertyName = section.closest?.('.object-item, .mod-pickupItem')?.querySelector?.('.item-header__title, .title')?.textContent?.trim() || undefined;

    const listing: Listing = {
      propertyName,
      url,
      rent,
      management,
      deposit,
      keyMoney,
    };

    yield { anchor, listing };
  }
}

export function detailRoom(root: ParentNode) {
  const fields = new Map<string, string>();
  for (const th of root.querySelectorAll('table th')) {
    const td = th.nextElementSibling;
    if (th.textContent && td?.matches('td')) {
      const key = th.textContent.trim();
      if (!fields.has(key)) fields.set(key, td.textContent?.trim() ?? '');
    }
  }

  // 1. 租金
  const rentText = root.querySelector('.price .price__big')?.textContent?.trim() ?? fields.get('賃料') ?? '';
  const rent = yen(rentText);
  if (!rent || rent <= 0) return null;

  // 2. 管理费
  const mgmtText = root.querySelector('.price-cost dd:nth-of-type(3)')?.textContent?.trim()
    ?? fields.get('管理費等') ?? fields.get('管理費') ?? '';
  const management = advertisedFee(mgmtText);

  // 3. 敷金 / 保证金
  const depositField = fields.get('敷金 / 保証金') ?? fields.get('敷金') ?? '';
  let deposit: Fee;
  let guaranteeDeposit: Fee | undefined;
  if (depositField.includes('/')) {
    const [depPart, guarPart] = depositField.split('/').map((s) => s.trim());
    deposit = monthFee(depPart ?? '', rent);
    guaranteeDeposit = guarPart ? monthFee(guarPart, rent) : undefined;
  } else {
    deposit = monthFee(depositField, rent);
  }

  // 4. 礼金
  const keyMoney = monthFee(fields.get('礼金') ?? '', rent);

  // 5. 仲介手数料
  const agencyRaw = fields.get('仲介手数料') ?? '';
  const agency = agencyRaw && !/不要|なし|無し/.test(agencyRaw)
    ? monthFee(agencyRaw, rent)
    : fee(agencyRaw);

  // 6. その他初期費用 (如 鍵交換代等：44,000円～)
  const otherRaw = fields.get('その他一時金') ?? fields.get('ほか初期費用') ?? '';
  const otherMatch = normalize(otherRaw).match(/([\d,.]+\s*(?:万円|円))/);
  const otherInitial = otherMatch?.[1] ? fee(otherMatch[1]) : otherRaw ? fee(otherRaw) : undefined;

  // 7. 保証会社
  const guaranteeRaw = fields.get('備考') ?? fields.get('保証会社') ?? '';
  const { guarantee, ongoingGuarantee } = parseGuarantee(guaranteeRaw, rent, management.amount);

  // 8. 保険
  const insuranceRaw = fields.get('保険等') ?? fields.get('損保') ?? '';
  const insurance = insuranceRaw ? fee(insuranceRaw) : undefined;

  // 9. 房屋属性
  const gasRaw = fields.get('給油・ガス') ?? '';
  const hasCityGas = /都市ガス/.test(gasRaw);
  const hasLPGas = /(?:LP|プロパン)ガス/i.test(gasRaw);
  const gas = hasCityGas ? '都市ガス' : hasLPGas ? 'LPガス' : gasRaw || undefined;

  const structure = fields.get('建物構造・工法') ?? fields.get('構造') ?? undefined;
  const direction = fields.get('主要採光面') ?? fields.get('向き') ?? undefined;
  const built = fields.get('築年月') ?? undefined;

  // 楼龄
  const ageMatch = built ? normalize(built).match(/築\s*(\d+)\s*年/) : null;
  const age = ageMatch?.[1] ? Number(ageMatch[1]) : undefined;

  const layout = fields.get('間取り') ?? undefined;
  const area = fields.get('専有面積') ?? undefined;
  const floor = fields.get('階建 / 階') ?? fields.get('所在階') ?? fields.get('階') ?? undefined;

  // 交通到站
  const trafficText = root.querySelector('.info-item--station, .station')?.textContent?.trim()
    ?? fields.get('交通') ?? '';
  let access: { station: string; minutes?: number; stations?: { station: string; minutes?: number; line?: string; raw?: string }[] } | undefined;
  if (trafficText) {
    const rawList = trafficText.split(/[\r\n、]+/).map((s) => s.trim()).filter(Boolean);
    const allStations = rawList.map((t) => {
      const cleaned = normalize(t).replace(/[「」]/g, '').trim();
      const match = cleaned.match(/^(.*?)\s*(?:徒歩|歩)\s*(\d+)\s*分/);
      if (match && match[1] && match[2]) {
        const rawPrefix = match[1].trim();
        const minutes = Number(match[2]);
        let line: string | undefined;
        let station = rawPrefix;
        if (rawPrefix.includes('/')) {
          const parts = rawPrefix.split('/');
          line = parts.slice(0, -1).join('/').trim();
          station = parts.at(-1)?.trim() ?? rawPrefix;
        } else if (rawPrefix.includes(' ')) {
          const parts = rawPrefix.split(/\s+/);
          line = parts.slice(0, -1).join(' ').trim();
          station = parts.at(-1)?.trim() ?? rawPrefix;
        }
        return { station, minutes, line: line || undefined, raw: t };
      }
      let line: string | undefined;
      let station = cleaned;
      if (cleaned.includes('/')) {
        const parts = cleaned.split('/');
        line = parts.slice(0, -1).join('/').trim();
        station = parts.at(-1)?.trim() ?? cleaned;
      } else if (cleaned.includes(' ')) {
        const parts = cleaned.split(/\s+/);
        line = parts.slice(0, -1).join(' ').trim();
        station = parts.at(-1)?.trim() ?? cleaned;
      }
      return { station, line: line || undefined, raw: t };
    }).filter((s) => Boolean(s.station));

    const walksOnly = allStations.filter((s) => s.minutes !== undefined && !/バス|停歩/.test(s.raw ?? ''));
    const nearest = walksOnly.reduce<typeof walksOnly[number] | undefined>(
      (best, route) => !best || route.minutes! < best.minutes! ? route : best, undefined,
    ) ?? allStations[0];

    if (nearest) {
      access = {
        station: nearest.station,
        minutes: nearest.minutes,
        stations: allStations.length > 0 ? allStations : undefined,
      };
    }
  }

  // 避坑 notes
  const notes: NonNullable<Listing['notes']> = [];
  if (gas && /(?:LP|プロパン)ガス/i.test(gas)) notes.push({ kind: 'gas', raw: gas });
  if (structure && /木造/.test(structure)) notes.push({ kind: 'wood', raw: structure });

  const contract = fields.get('契約期間') ?? '';
  if (/定期借家/.test(contract)) notes.push({ kind: 'contract', raw: contract });
  if (floor && /^(?:1(?:階|[-〜~])|地下|B\d)/i.test(normalize(floor))) {
    notes.push({ kind: 'floor', raw: floor });
  }

  const updateFee = fields.get('更新料');
  const leaseCharges = updateFee ? `更新料: ${updateFee}` : undefined;

  const propertyName = root.querySelector('.item-header__title, .item-title, h1')?.textContent?.trim() || undefined;
  const address = (fields.get('所在地') ?? fields.get('住所') ?? root.querySelector('.info-item--address, .address')?.textContent?.trim()) || undefined;

  const listing: Listing = {
    propertyName,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    rent,
    management,
    deposit,
    keyMoney,
    guaranteeDeposit,
    agency,
    otherInitial,
    guarantee,
    insurance,
    notes,
    lease: {
      moveIn: fields.get('入居可能時期'),
      conditions: fields.get('条件'),
      leaseTerm: contract || undefined,
      leaseCharges,
      ongoingGuarantee,
    },
    facts: {
      access,
      address,
      gas,
      direction,
      structure,
      age,
      built,
      layout,
      area,
      floor,
    },
  };

  const anchor = root.querySelector('.item-top, .property-title, h1, body') ?? document.body;
  return { anchor, listing };
}
