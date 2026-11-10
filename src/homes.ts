import { advertisedFee, derivedFee, fee, monthFee, normalize, yen, type Fee, type Listing } from './cost.ts';

function getOrCreateAnchor(container: Element, tagName = 'div'): Element {
  let anchor = container.querySelector('.minukuma-anchor');
  if (!anchor) {
    const doc = container.ownerDocument ?? globalThis.document;
    if (doc?.createElement) {
      anchor = doc.createElement(tagName);
      anchor.className = 'minukuma-anchor';
      container.append(anchor);
    } else {
      anchor = { className: 'minukuma-anchor' } as unknown as Element;
    }
  }
  return anchor;
}

export function* listRooms(root: ParentNode) {
  // 1. 合并建筑表格中的房间行 (.prg-room)
  for (const row of root.querySelectorAll('.prg-roomList tr.prg-room, tr.prg-roomRow')) {
    const priceCell = row.querySelector<HTMLElement>('td.price, .price');
    if (!priceCell) continue;

    const normText = normalize(priceCell.textContent ?? '');
    // 形式: "14.6 万円 / 15,000円 14.6万円/29.2万円/-/-" 或 "7.6万円/3,000円 無/無/-/-"
    const match = normText.match(/^([\d,.]+\s*(?:万円|円))\s*[/／]\s*([\d,.]+\s*(?:万円|円)|[-−―ー]|なし|不要|無|0円)?\s*(.*)$/);
    if (!match?.[1]) continue;

    const rent = yen(match[1]);
    if (rent === null || rent <= 0) continue;

    const management = advertisedFee(match[2] ?? '-');
    const initials = (match[3] ?? '').split(/[/／]/).map((item) => item.trim());

    const deposit = monthFee(initials[0] ?? '-', rent);
    const keyMoney = monthFee(initials[1] ?? '-', rent);
    const guaranteeDeposit = initials[2] ? monthFee(initials[2], rent) : undefined;
    const depreciation = initials[3] ? monthFee(initials[3], rent) : undefined;

    const listing: Listing = {
      rent,
      management,
      deposit,
      keyMoney,
      guaranteeDeposit,
      depreciation,
    };

    // 锚定在价格单元格内部，确保徽章准确出现在价格列中，不会错位到户型图等其他位置
    const anchor = getOrCreateAnchor(priceCell, 'div');
    yield { anchor, listing };
  }

  // 2. 单物件卡片形式 (.mod-listKks, .bukkenSpec 等)
  for (const card of root.querySelectorAll('.ui-frame.mod-listKks, .mod-listKks')) {
    const priceCell = card.querySelector<HTMLElement>('.bukkenSpec td.price, td.price');
    if (!priceCell) continue;

    const normText = normalize(priceCell.textContent ?? '');
    const match = normText.match(/^([\d,.]+\s*(?:万円|円))\s*(?:[/／]\s*([\d,.]+\s*(?:万円|円)|[-−―ー]|なし|不要|無|0円)?)?/);
    if (!match?.[1]) continue;

    const rent = yen(match[1]);
    if (rent === null || rent <= 0) continue;

    const management = match[2] ? advertisedFee(match[2]) : { raw: '-', amount: 0 };
    const listing: Listing = {
      rent,
      management,
      deposit: { raw: '-', amount: 0 },
      keyMoney: { raw: '-', amount: 0 },
    };

    // 锚定在价格单元格内部，避免污染卡片标题链接
    const anchor = getOrCreateAnchor(priceCell, 'span');
    yield { anchor, listing };
  }
}

function parseGuarantee(raw = '', rent: number, managementAmount: number | null): {
  guarantee: Fee;
  ongoingGuarantee?: string;
} {
  const norm = normalize(raw);
  const guaranteeRate = norm.match(/(?:初回(?:保証料|保証委託料|保証)?|契約時(?:保証料)?)\s*[:：]\s*(?:(?:賃料総額|総賃料|月額賃料等?|賃料等の?|賃料)の)?\s*(\d+(?:\.\d+)?)%(?![\d.,])/);
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

function parseJsonLdDetail(root: ParentNode): Listing | null {
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent ?? '');
      if (data?.['@type'] !== 'RealEstateListing' || !data?.offers) continue;

      const rent = typeof data.offers.price === 'number' ? data.offers.price : yen(String(data.offers.price ?? ''));
      if (rent === null || rent <= 0) continue;

      const offerProps = new Map<string, unknown>();
      for (const p of data.offers.additionalProperty ?? []) {
        if (p?.name) offerProps.set(p.name, p.value);
      }

      const entityProps = new Map<string, unknown>();
      for (const p of data.mainEntity?.additionalProperty ?? []) {
        if (p?.name) {
          const current = entityProps.get(p.name);
          if (current) {
            entityProps.set(p.name, Array.isArray(current) ? [...current, p.value] : [current, p.value]);
          } else {
            entityProps.set(p.name, p.value);
          }
        }
      }

      const mgmtVal = offerProps.get('管理費等');
      const management = typeof mgmtVal === 'number'
        ? { raw: `${mgmtVal}円`, amount: mgmtVal }
        : mgmtVal ? fee(String(mgmtVal)) : { raw: '-', amount: 0 };

      const deposit = monthFee(String(offerProps.get('敷金') ?? ''), rent);
      const keyMoney = monthFee(String(offerProps.get('礼金') ?? ''), rent);
      const guaranteeDeposit = monthFee(String(offerProps.get('保証金') ?? ''), rent);
      const depreciation = monthFee(String(offerProps.get('敷引・償却') ?? offerProps.get('敷引') ?? ''), rent);

      // その他費用 (如 仲介手数料：160,600円)
      const otherCostsRaw = String(offerProps.get('その他費用') ?? '');
      const agencyMatch = normalize(otherCostsRaw).match(/仲介手数料\s*[:：]?\s*([\d,.]+\s*(?:万円|円))/);
      const agency = agencyMatch?.[1] ? fee(agencyMatch[1]) : otherCostsRaw ? fee(otherCostsRaw) : undefined;

      // 保証会社
      const guaranteeRaw = String(offerProps.get('保証会社') ?? '');
      const { guarantee, ongoingGuarantee } = parseGuarantee(guaranteeRaw, rent, management.amount);

      // 住宅保険
      const insuranceRaw = String(offerProps.get('住宅保険') ?? offerProps.get('損保') ?? '');
      const insurance = insuranceRaw ? fee(insuranceRaw) : undefined;

      // 交通 (Station access)
      const traffic = entityProps.get('交通');
      const trafficList = Array.isArray(traffic) ? traffic : traffic ? [traffic] : [];
      let nearest: { station: string; minutes?: number } | undefined;
      for (const t of trafficList) {
        const match = normalize(String(t)).match(/^(.*?)\s*(?:徒歩|歩)\s*(\d+)\s*分$/);
        const station = match?.[1]?.split(/[\/\s]+/).at(-1)?.trim();
        if (station && match?.[2]) {
          const minutes = Number(match[2]);
          if (!nearest || minutes < (nearest.minutes ?? Infinity)) {
            nearest = { station, minutes };
          }
        }
      }

      // 燃气、朝向、结构
      const amenities = (data.mainEntity?.amenityFeature ?? []) as Array<{ name: string; value: boolean }>;
      const hasCityGas = amenities.some((a) => a.name === '都市ガス');
      const hasLPGas = amenities.some((a) => /(?:LP|プロパン)ガス/i.test(a.name));
      const gas = hasCityGas ? '都市ガス' : hasLPGas ? 'LPガス' : undefined;

      const direction = String(entityProps.get('主要採光面') ?? entityProps.get('向き') ?? '') || undefined;
      const structure = String(entityProps.get('建物構造') ?? entityProps.get('構造') ?? '') || undefined;

      // 楼龄与建筑时间
      const built = String(entityProps.get('築年月') ?? '') || undefined;
      const yearBuilt = data.mainEntity?.yearBuilt;
      const age = typeof yearBuilt === 'number'
        ? Math.max(0, new Date().getFullYear() - yearBuilt)
        : undefined;

      const layout = String(entityProps.get('間取り') ?? '') || undefined;
      const area = data.mainEntity?.floorSize?.value
        ? `${data.mainEntity.floorSize.value} m²`
        : undefined;
      const floor = String(entityProps.get('所在階 / 階数') ?? data.mainEntity?.floorLevel ?? '') || undefined;

      // 避坑 notes
      const notes: NonNullable<Listing['notes']> = [];
      if (gas && /(?:LP|プロパン)ガス/i.test(gas)) notes.push({ kind: 'gas', raw: gas });
      if (structure && /木造/.test(structure)) notes.push({ kind: 'wood', raw: structure });

      const contract = String(offerProps.get('契約期間') ?? '');
      if (/定期借家/.test(contract)) notes.push({ kind: 'contract', raw: contract });
      if (floor && /^(?:1(?:階|[-〜~])|地下|B\d)/i.test(normalize(floor))) {
        notes.push({ kind: 'floor', raw: floor });
      }

      // 入住条件标签
      const conditionsList: string[] = [];
      for (const a of amenities) {
        if (['二人入居可', 'ペット相談', '事務所可', '楽器相談', '楽器不可', '子供可'].includes(a.name)) {
          conditionsList.push(a.name);
        }
      }
      const remarks = String(entityProps.get('備考') ?? '');
      const updateFee = offerProps.get('更新料');
      const leaseCharges = updateFee ? `更新料: ${updateFee}円` : undefined;

      return {
        rent,
        management,
        deposit,
        keyMoney,
        guaranteeDeposit,
        depreciation,
        agency,
        insurance,
        guarantee,
        notes,
        lease: {
          moveIn: String(offerProps.get('入居可能時期') ?? offerProps.get('現況') ?? '') || undefined,
          conditions: conditionsList.length > 0 ? conditionsList.join(' · ') : undefined,
          leaseTerm: contract || undefined,
          leaseCharges,
          ongoingGuarantee,
        },
        facts: {
          access: nearest,
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
    } catch {}
  }
  return null;
}

export function detailRoom(root: ParentNode) {
  // 首选 JSON-LD 结构化数据解析
  const jsonListing = parseJsonLdDetail(root);
  const anchor = root.querySelector('#chk-bkhd, .mod-propertyHeader, #property, .bukkenName, h1, h2, body') ?? document.body;
  if (jsonListing) {
    return { anchor, listing: jsonListing };
  }

  // DOM 表格备用兜底解析 (针对无有效 JSON-LD 的页面)
  const fields = new Map<string, string>();
  for (const th of root.querySelectorAll('table th')) {
    const td = th.nextElementSibling;
    if (th.textContent && td?.matches('td')) {
      fields.set(th.textContent.trim(), td.textContent?.trim() ?? '');
    }
  }

  const rent = yen(fields.get('賃料') ?? '');
  if (!rent || rent <= 0) return null;

  const management = advertisedFee(fields.get('管理費等') ?? fields.get('管理費') ?? '');

  // 敷金 / 礼金（支持合并表头 "敷金/礼金" 或独立表头 "敷金", "礼金"）
  let depositRaw = fields.get('敷金') ?? '';
  let keyMoneyRaw = fields.get('礼金') ?? '';
  const depKeySplit = fields.get('敷金/礼金') ?? fields.get('敷金・礼金') ?? fields.get('敷金／礼金');
  if (depKeySplit && depKeySplit.includes('/')) {
    const parts = depKeySplit.split('/').map((s) => s.trim());
    depositRaw = parts[0] ?? '';
    keyMoneyRaw = parts[1] ?? '';
  }

  // 保证金 / 敷引・偿却
  let guarDepRaw = fields.get('保証金') ?? '';
  let deprecRaw = fields.get('敷引・償却') ?? fields.get('敷引') ?? '';
  const guarDeprecSplit = fields.get('保証金/敷引・償却') ?? fields.get('保証金・敷引・償却') ?? fields.get('保証金／敷引・償却');
  if (guarDeprecSplit && guarDeprecSplit.includes('/')) {
    const parts = guarDeprecSplit.split('/').map((s) => s.trim());
    guarDepRaw = parts[0] ?? '';
    deprecRaw = parts[1] ?? '';
  }

  const deposit = monthFee(depositRaw, rent);
  const keyMoney = monthFee(keyMoneyRaw, rent);
  const guaranteeDeposit = guarDepRaw ? monthFee(guarDepRaw, rent) : undefined;
  const depreciation = deprecRaw ? monthFee(deprecRaw, rent) : undefined;

  const guaranteeRaw = fields.get('保証会社') ?? '';
  const { guarantee, ongoingGuarantee } = parseGuarantee(guaranteeRaw, rent, management.amount);

  const listing: Listing = {
    rent,
    management,
    deposit,
    keyMoney,
    guaranteeDeposit,
    depreciation,
    guarantee,
    lease: {
      moveIn: fields.get('入居可能時期'),
      leaseTerm: fields.get('契約期間'),
      ongoingGuarantee,
    },
    facts: {
      direction: fields.get('主要採光面') ?? fields.get('向き'),
      structure: fields.get('建物構造') ?? fields.get('構造'),
      built: fields.get('築年月'),
      layout: fields.get('間取り'),
      area: fields.get('専有面積'),
      floor: fields.get('所在階 / 階数') ?? fields.get('階'),
    },
  };

  return { anchor, listing };
}
