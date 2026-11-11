import { fee, normalize, yen, type Fee, type Listing } from './cost.ts';

function read(root: ParentNode, selector: string) {
  return root.querySelector(selector)?.textContent?.trim() ?? '';
}

function advertisedFee(raw: string) {
  // SUUMO displays a dash in its headline fee fields when no charge is listed.
  // Preserve the original text so this convention is visible in the detail panel.
  return /^[-−―]$/.test(normalize(raw)) ? { raw, amount: 0 } : fee(raw);
}

export function* listRooms(root: ParentNode) {
  for (const row of root.querySelectorAll('.cassetteitem_other tbody tr')) {
    const price = row.querySelector('.cassetteitem_price--rent');
    const admin = row.querySelector('.cassetteitem_price--administration');
    const anchor = admin ?? price;
    const rent = yen(price?.textContent ?? '');
    if (!anchor || rent === null || rent <= 0) continue;

    const cassette = row.closest?.('.cassetteitem');
    const col1 = cassette?.querySelector?.('.cassetteitem_detail-col1')?.textContent ?? '';
    const col2 = cassette?.querySelector?.('.cassetteitem_detail-col2')?.textContent ?? '';
    const bldName = cassette?.querySelector?.('.cassetteitem_content-title')?.textContent?.trim() ?? '';
    const structure = col1.match(/木造|軽量鉄骨|鉄骨造|RC|鉄筋コンクリート|SRC/)?.[0];
    const floor = row.querySelector('.cassetteitem_other-col--floor, td:nth-child(3)')?.textContent?.trim();
    const linkElem = row.querySelector<HTMLAnchorElement>(
      'a.cassetteitem_other-linktext, a.js-cassette_link_href, a[href*="/chintai/jnc_"], a[href*="/chintai/"], td a[href]'
    );
    const hrefAttr = linkElem?.getAttribute?.('href');
    const detailLink = hrefAttr
      ? (hrefAttr.startsWith('http') ? hrefAttr : `https://suumo.jp${hrefAttr.startsWith('/') ? '' : '/'}${hrefAttr}`)
      : linkElem?.href || undefined;
    const propertyName = [bldName, floor].filter(Boolean).join(' ') || undefined;

    const stationMatch = col2.match(/([^\s\/]+駅\s*(?:歩|徒歩)\s*\d+\s*分)/);
    const station = stationMatch?.[1]?.trim();

    const notes: Listing['notes'] = [];
    if (/木造|軽量鉄骨/.test(col1)) {
      notes.push({ kind: 'wood', raw: structure ?? '木造' });
    }
    if (floor && /^1階/.test(floor)) {
      notes.push({ kind: 'floor', raw: floor });
    }

    const listing: Listing = {
      propertyName,
      url: detailLink,
      rent,
      management: advertisedFee(read(row, '.cassetteitem_price--administration')),
      deposit: advertisedFee(read(row, '.cassetteitem_price--deposit')),
      keyMoney: advertisedFee(read(row, '.cassetteitem_price--gratuity')),
      facts: {
        access: station ? { station } : undefined,
        address: col1.trim() || undefined,
        structure,
        floor,
      },
      notes: notes.length > 0 ? notes : undefined,
    };
    yield { anchor, listing };
  }
}

function derivedFee(raw: string, amount: number): Fee {
  return { raw, amount: Math.round(amount), derived: true };
}

export function detailRoom(root: ParentNode) {
  const anchor = root.querySelector('.property_view_note-info');
  if (!anchor) return null;
  const rent = yen(read(anchor, '.property_view_note-emphasis'));
  if (rent === null || rent <= 0) return null;

  const headline = new Map<string, string>();
  for (const item of anchor.querySelectorAll('.property_view_note-list > span')) {
    const match = item.textContent?.trim().match(/^([^:：]+)[:：]\s*(.*)$/s);
    if (match?.[1]) headline.set(match[1].trim(), match[2]?.trim() ?? '');
  }

  const fields = new Map<string, string>();
  for (const label of root.querySelectorAll('.table_gaiyou th')) {
    const value = label.nextElementSibling;
    if (label.textContent && value?.matches('td')) {
      fields.set(label.textContent.trim(), value.textContent?.trim() ?? '');
    }
  }

  const overview = new Map<string, Element>();
  for (const label of root.querySelectorAll('.property_view_table th')) {
    const cell = label.nextElementSibling;
    if (label.textContent && cell?.matches('td')) overview.set(label.textContent.trim(), cell);
  }
  const shown = (value = '') => {
    const trimmed = value.trim();
    return !trimmed || /^[-−―ー]+$/.test(normalize(trimmed)) ? undefined : trimmed;
  };
  const accessCell = overview.get('駅徒歩');
  let routes = [...(accessCell?.querySelectorAll('.property_view_table-read') ?? [])]
    .map((item) => item.textContent?.trim() ?? '').filter(Boolean);
  if (routes.length === 0 && accessCell) {
    routes = (accessCell.innerHTML || '')
      .split(/<br\s*\/?>|[\r\n]+/)
      .map((s) => s.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
  }

  const allStations = routes.map((route) => {
    const cleaned = normalize(route).trim();
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
      return { station, minutes, line: line || undefined, raw: route };
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
    return { station, line: line || undefined, raw: route };
  }).filter((s) => Boolean(s.station));

  const walksOnly = allStations.filter((s) => s.minutes !== undefined && !/バス|停歩/.test(s.raw ?? ''));
  const nearest = walksOnly.reduce<typeof walksOnly[number] | undefined>(
    (best, route) => !best || route.minutes! < best.minutes! ? route : best, undefined,
  ) ?? allStations[0];
  const firstRoute = shown(routes[0] ?? accessCell?.textContent ?? '');
  const ageLabel = normalize(overview.get('築年数')?.textContent ?? '');
  const age = ageLabel.match(/^築\s*(\d+)\s*年$/)?.[1];

  const management = advertisedFee(headline.get('管理費・共益費') ?? '');
  const deposit = advertisedFee(headline.get('敷金') ?? '');
  const guaranteeDeposit = advertisedFee(headline.get('保証金') ?? '');
  const depreciation = advertisedFee(headline.get('敷引・償却') ?? '');
  if (depreciation.amount && (deposit.amount === null || guaranteeDeposit.amount === null
    || depreciation.amount > deposit.amount + guaranteeDeposit.amount)) {
    depreciation.amount = null;
  }

  const agencyRaw = fields.get('仲介手数料') ?? '';
  const agencyMonths = normalize(agencyRaw).match(/^(\d+(?:\.\d+)?)\s*[ヶケかカ箇]月(?:分)?$/);
  const agency = agencyMonths ? derivedFee(agencyRaw, rent * Number(agencyMonths[1])) : fee(agencyRaw);

  const insuranceRaw = fields.get('損保') ?? '';
  const insuranceAmount = normalize(insuranceRaw).match(/^(.+?円)\s*2年$/);
  const insurance = insuranceAmount ? { ...fee(insuranceAmount[1]), raw: insuranceRaw } : fee(insuranceRaw);

  const guaranteeRaw = fields.get('保証会社') ?? '';
  const normGuarantee = normalize(guaranteeRaw);
  const guaranteeRate = normGuarantee.match(/(?:初回(?:保証料|保証委託料|保証)?|契約時(?:保証料)?)\s*[:：]\s*(?:(?:賃料総額|総賃料|月額賃料等?|賃料等の?|賃料)の)?\s*(\d+(?:\.\d+)?)%(?![\d.,])/);
  const guaranteeFixed = normGuarantee.match(/(?:初回(?:保証料|保証委託料|保証)?|契約時(?:保証料)?)\s*[:：]\s*([\d,.]+\s*(?:万円|円))/);
  const fixedAmount = guaranteeFixed?.[1] ? yen(guaranteeFixed[1]) : null;
  const guarantee = guaranteeRate && management.amount !== null
    ? derivedFee(guaranteeRaw, (rent + management.amount) * Number(guaranteeRate[1]) / 100)
    : fixedAmount !== null
      ? derivedFee(guaranteeRaw, fixedAmount)
      : fee(guaranteeRaw);

  const otherRaw = fields.get('ほか初期費用') ?? '';
  const otherTotal = normalize(otherRaw).match(/^合計\s*([\d,.]+\s*(?:万円|円))\s*\(内訳\s*:/);
  const otherInitial = otherTotal ? { ...fee(otherTotal[1]), raw: otherRaw } : fee(otherRaw);

  const facilities = read(root, '#bkdt-option .inline_list');
  const structure = fields.get('構造') ?? '';
  const contract = fields.get('契約期間') ?? '';
  const floor = fields.get('階建') ?? '';
  const notes: NonNullable<Listing['notes']> = [];
  const gas = shown(fields.get('ガス')) ?? normalize(facilities)
    .match(/(?:^|[、,\s])(都市ガス|(?:LP|プロパン)ガス)(?=$|[、,\s])/i)?.[1];
  if (gas && /(?:LP|プロパン)ガス/i.test(gas)) notes.push({ kind: 'gas', raw: gas });
  if (/木造/.test(structure)) notes.push({ kind: 'wood', raw: structure });
  if (/定期借家/.test(contract)) notes.push({ kind: 'contract', raw: contract });
  if (/^(?:1(?:階|[-〜~])|地下|B\d)/i.test(normalize(floor))) {
    notes.push({ kind: 'floor', raw: floor });
  }
  const otherRecurring = shown(fields.get('ほか諸費用'));
  const leaseCharges = otherRecurring && /更新料|更新事務手数料|再契約料|退去|解約|違約金|清掃費|クリーニング|月額保証料/.test(otherRecurring)
    ? otherRecurring : undefined;
  const hasOngoingGuarantee = /継続保証料|更新保証料|保証更新料|月額保証料|年間保証料|毎月|毎年|\d+年(?:ごと|毎)に?\s*[\d,.]+\s*(?:万円|円)/
    .test(normalize(guaranteeRaw));
  const ongoingGuarantee = hasOngoingGuarantee ? guaranteeRaw : undefined;
  if (otherRecurring && !leaseCharges) {
    notes.push({ kind: 'otherRecurring', raw: otherRecurring });
  }

  const propertyName = shown(read(root, '.section_header-title, .property_view_header-title, h1'));
  const address = shown(overview.get('所在地')?.textContent ?? fields.get('所在地') ?? read(root, '.property_view_detail--address'));

  const listing: Listing = {
    propertyName,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    rent, management, deposit, keyMoney: advertisedFee(headline.get('礼金') ?? ''),
    guaranteeDeposit, depreciation, agency, insurance, guarantee, otherInitial, notes,
    lease: {
      moveIn: shown(fields.get('入居')),
      conditions: shown(fields.get('条件')),
      leaseTerm: shown(contract),
      leaseCharges,
      ongoingGuarantee,
    },
    facts: {
      access: nearest ? {
        station: nearest.station,
        minutes: nearest.minutes,
        stations: allStations.length > 0 ? allStations : undefined,
      } : (firstRoute ? { station: firstRoute } : undefined),
      address,
      gas,
      direction: shown(overview.get('向き')?.textContent ?? ''),
      structure: shown(structure),
      age: age ? Number(age) : ageLabel === '新築' ? 0 : undefined,
      built: shown(fields.get('築年月')),
      layout: shown(overview.get('間取り')?.textContent ?? ''),
      area: shown(overview.get('専有面積')?.textContent ?? '')?.replace(/m\s*2$/, ' m²'),
      floor: shown(floor) ?? shown(overview.get('階')?.textContent ?? ''),
    },
  };
  return { anchor, listing };
}
