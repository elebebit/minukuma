const ja = {
  title: '賃貸費用', month: '/ 月', delta: '家賃比', estimate: '24か月換算・概算',
  listEstimate: '掲載分のみ・24か月換算', approx: '約', check: '要確認', source: '掲載', basis: '換算元', viewSources: '費用の根拠を見る',
  coverage: '前家賃・日割り家賃・未確定の費用を除く。',
  overview: '物件概要', station: '駅アクセス', gasType: 'ガス', direction: '向き', structure: '構造', age: '築年数',
  walk: (minutes: number) => `徒歩${minutes}分`, years: (age: number) => age === 0 ? '新築' : `築${age}年`,
  room: '間取り・広さ・階', floorUnit: '階',
  moveInDetails: '入居条件', moveIn: '入居時期', conditions: '条件', leaseTerm: '契約期間',
  leaseCosts: '入居後・退去時の費用', leaseCharges: '掲載の諸費用', ongoingGuarantee: '継続保証料の記載',
  rent: '家賃', management: '管理費・共益費', upfront: '掲載分の初期費用',
  deposit: '敷金', guaranteeDeposit: '保証金', depreciation: '敷引・償却（内数）',
  keyMoney: '礼金', agency: '仲介手数料', insurance: '損害保険',
  guarantee: '初回保証料', otherInitial: 'ほか初期費用', notes: '確認ポイント',
  gas: 'ガスの料金体系を確認', wood: '遮音性を内見で確認',
  contract: '契約期間と再契約の条件を確認', floor: '採光・窓まわりを確認',
  otherRecurring: '試算に含まれない諸費用',
};

export const messages = {
  ja,
  zh: {
    title: '租房费用', month: '/ 月', delta: '比标价', estimate: '按 24 个月折算 · 估算',
    listEstimate: '仅已知费用 · 24 个月折算', approx: '约', check: '待确认', source: '房源标注', basis: '换算依据', viewSources: '查看费用依据',
    coverage: '不含预付租金、按日计租金及待确认费用。',
    overview: '房源速览', station: '到站', gasType: '燃气', direction: '朝向', structure: '结构', age: '楼龄',
    walk: (minutes: number) => `步行 ${minutes} 分钟`, years: (age: number) => age === 0 ? '新建' : `${age} 年`,
    room: '户型、面积与楼层', floorUnit: ' 层',
    moveInDetails: '入住条件', moveIn: '可入住时间', conditions: '入住限制', leaseTerm: '租约期限',
    leaseCosts: '续住与退租费用', leaseCharges: '房源标注的费用', ongoingGuarantee: '后续担保费说明',
    rent: '租金', management: '管理费及共益费', upfront: '已知初期费用',
    deposit: '押金（敷金）', guaranteeDeposit: '保证金', depreciation: '押金不退部分（已含）',
    keyMoney: '礼金', agency: '中介费', insurance: '财产保险',
    guarantee: '首次担保费', otherInitial: '其他初期费用', notes: '建议核实',
    gas: '确认燃气计费方式', wood: '看房时确认隔音',
    contract: '确认租期和重新签约条件', floor: '确认采光和窗户周边情况',
    otherRecurring: '未计入估算的其他费用',
  },
  en: {
    title: 'Rental costs', month: '/ mo', delta: 'vs. rent', estimate: '24-month estimate',
    listEstimate: 'Listed fees · 24-month estimate', approx: '≈', check: 'Check with agent', source: 'Listed', basis: 'Based on', viewSources: 'View fee sources',
    coverage: 'Excludes advance rent, prorated rent, and unconfirmed charges.',
    overview: 'Property at a glance', station: 'Station access', gasType: 'Gas', direction: 'Facing', structure: 'Structure', age: 'Building age',
    walk: (minutes: number) => `${minutes} min walk`, years: (age: number) => age === 0 ? 'New build' : `${age} yr`,
    room: 'Layout, size & floor', floorUnit: ' fl.',
    moveInDetails: 'Move-in conditions', moveIn: 'Availability', conditions: 'Conditions', leaseTerm: 'Lease term',
    leaseCosts: 'Ongoing & move-out fees', leaseCharges: 'Listed charges', ongoingGuarantee: 'Ongoing guarantor fees',
    rent: 'Rent', management: 'Management fees', upfront: 'Known upfront costs',
    deposit: 'Security deposit', guaranteeDeposit: 'Guarantee deposit', depreciation: 'Non-refundable deposit (included)',
    keyMoney: 'Key money', agency: 'Agency fee', insurance: 'Property insurance',
    guarantee: 'Initial guarantor fee', otherInitial: 'Other upfront costs', notes: 'What to check',
    gas: 'Check the gas tariff', wood: 'Check sound insulation during a viewing',
    contract: 'Check the lease term and re-contracting conditions', floor: 'Check daylight and the area around the windows',
    otherRecurring: 'Other charges excluded from the estimate',
  },
} satisfies Record<string, typeof ja>;

export type Locale = keyof typeof messages;
export type NoteKind = 'gas' | 'wood' | 'contract' | 'floor' | 'otherRecurring';

export function isLocale(value: unknown): value is Locale {
  return value === 'ja' || value === 'zh' || value === 'en';
}

export function defaultLocale(browserLanguage: string): Locale {
  const primary = browserLanguage.toLowerCase().split('-')[0];
  return isLocale(primary) ? primary : 'ja';
}


const propertyValues: Record<string, [zh: string, en: string]> = {
  即: ['可立即入住', 'Available now'],
  即入居可: ['可立即入住', 'Available now'],
  都市ガス: ['城市燃气', 'City gas'],
  LPガス: ['液化石油气（LP）', 'LPG'],
  プロパンガス: ['液化石油气（LP）', 'LPG'],
  木造: ['木结构', 'Timber'],
  鉄骨: ['钢结构', 'Steel frame'],
  鉄骨造: ['钢结构', 'Steel frame'],
  軽量鉄骨: ['轻钢结构', 'Light steel'],
  軽量鉄骨造: ['轻钢结构', 'Light steel'],
  重量鉄骨: ['重钢结构', 'Heavy steel'],
  重量鉄骨造: ['重钢结构', 'Heavy steel'],
  鉄筋コン: ['钢筋混凝土 (RC)', 'Reinforced concrete (RC)'],
  鉄筋コンクリート: ['钢筋混凝土 (RC)', 'Reinforced concrete (RC)'],
  鉄筋コンクリート造: ['钢筋混凝土 (RC)', 'Reinforced concrete (RC)'],
  鉄骨鉄筋コンクリート: ['钢骨钢筋混凝土 (SRC)', 'Steel-reinforced concrete (SRC)'],
  鉄骨鉄筋コンクリート造: ['钢骨钢筋混凝土 (SRC)', 'Steel-reinforced concrete (SRC)'],
  RC: ['钢筋混凝土 (RC)', 'Reinforced concrete (RC)'],
  SRC: ['钢骨钢筋混凝土 (SRC)', 'Steel-reinforced concrete (SRC)'],
  気泡コン: ['加气混凝土', 'Aerated concrete'],
  ALC: ['ALC轻质混凝土', 'Autoclaved lightweight concrete'],
  ブロック: ['混凝土砌块', 'Concrete block'],
  PC: ['预制混凝土 (PC)', 'Precast concrete (PC)'],
  北: ['北', 'North'], 東: ['东', 'East'], 南: ['南', 'South'], 西: ['西', 'West'],
  北東: ['东北', 'Northeast'], 南東: ['东南', 'Southeast'],
  南西: ['西南', 'Southwest'], 北西: ['西北', 'Northwest'],
};

export function propertyValue(raw: string | undefined, locale: Locale) {
  if (!raw) return '—';
  const key = raw.replace(/向き$/, '');
  const translated = Object.hasOwn(propertyValues, key) ? propertyValues[key] : undefined;
  return !translated || locale === 'ja' ? raw : translated[locale === 'zh' ? 0 : 1];
}
