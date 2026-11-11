const ja = {
  title: '賃貸費用', month: '/ 月', delta: '家賃比', trueTag: '実質',
  estimate: (m: number) => `${m}か月換算・概算`,
  listEstimate: (m: number) => `掲載分のみ・${m}か月換算`,
  approx: '約', check: '要確認', source: '掲載', basis: '換算元', viewSources: '費用の根拠を見る',
  coverage: '前家賃・日割り家賃・未確定の費用を除く。',
  overview: '物件概要', station: '駅アクセス', address: '所在地', googleMap: 'Google マップ', googleSearch: 'Google 検索', gasType: 'ガス', direction: '向き', structure: '構造', age: '築年数',
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

  amortizationLabel: '換算期間',
  amortization12: '1年 (12か月)',
  amortization24: '2年 (24か月・標準)',
  amortization36: '3年 (36か月)',
  badgeLpGas: 'LPガス',
  badgeWood: '木造',
  badgeContract: '定期借家',
  badgeFloor: '1階',
  verdictTitle: 'みぬくま 探偵診断',
  verdictReasonable: '費用構成が明瞭で、大きな初期費用の跳ね上がりは見当たりません。',
  verdictHighInitial: (amount: string) => `不可逆の初期費用（礼金・償却等）が高めで、実質月額が毎月 ${amount} 上乗せされます。`,
  verdictNotesWarning: '内見や契約前に以下の注意点を確認することをおすすめします。',
  inquirySectionTitle: '問い合わせ・条件交渉テンプレート',
  inquirySectionDesc: '空室確認や初期費用交渉時に、コピーしてそのまま不動産会社へ送信できるビジネス文面です。',
  copy: '文面をコピー',
  copied: 'クリップボードにコピーしました！',

  // 进度条与结构
  breakdownTitle: '初期費用の構成比',
  legendRefundable: '敷金・保証金（返還対象）',
  legendSunk: '礼金・償却（返還不可）',
  legendFees: '諸費用（仲介・保証・保険等）',

  // 货币换算
  currencyRef: '参考外貨',

  // 房源对比与收藏
  compareAdd: 'お気に入り・比較に追加',
  compareAdded: 'お気に入り追加済み',
  compareRemove: '削除',
  compareTitle: '検討物件の横並び比較',
  compareClear: 'すべてクリア',
  compareEmpty: 'まだ物件が追加されていません。一覧や詳細のハートアイコン［♡］から追加できます。',
  compareOpen: '比較表を開く',
  compareMaxNotice: '保存できるのは最大20件までです',
  exportList: '📋 検討リストをコピー',
  listCopied: 'リストをクリップボードにコピーしました！',
  favorite: 'お気に入り',

  // 快捷筛选
  filterTitle: 'みぬくま 絞り込み',
  filterHideWood: '木造を隠す',
  filterHideGas: 'LPガスを隠す',
  filterHiddenNotice: (n: number) => `${n}件の物件を非表示中`,
};

export const messages = {
  ja,
  zh: {
    title: '租房费用', month: '/ 月', delta: '比标价', trueTag: '实付',
    estimate: (m: number) => `按 ${m} 个月折算 · 估算`,
    listEstimate: (m: number) => `仅已知费用 · ${m} 个月折算`,
    approx: '约', check: '待确认', source: '房源标注', basis: '换算依据', viewSources: '查看费用依据',
    coverage: '不含预付租金、按日计租金及待确认费用。',
    overview: '房源速览', station: '到站', address: '所在地', googleMap: 'Google 地图', googleSearch: 'Google 搜索', gasType: '燃气', direction: '朝向', structure: '结构', age: '楼龄',
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

    amortizationLabel: '折算周期',
    amortization12: '1 年 (12 个月)',
    amortization24: '2 年 (24 个月 · 推荐)',
    amortization36: '3 年 (36 个月)',
    badgeLpGas: 'LP瓦斯',
    badgeWood: '木造',
    badgeContract: '定期借家',
    badgeFloor: '1楼',
    verdictTitle: 'みぬくま 侦探综合诊断',
    verdictReasonable: '费用构成清晰，无明显一次性溢价或隐藏暗坑。',
    verdictHighInitial: (amount: string) => `不可退初期费用偏高，每月摊销多出 ${amount}。`,
    verdictNotesWarning: '建议在看房或签约前重点确认上述注意点。',
    inquirySectionTitle: '日文询盘 · 沟通与谈判话术',
    inquirySectionDesc: '联系中介或提交咨询时，可一键复制地道礼貌的商务日文模板：',
    copy: '复制日文话术',
    copied: '已复制到剪贴板！',

    breakdownTitle: '初期费用水份透视',
    legendRefundable: '押金/保证金 (可退还)',
    legendSunk: '礼金/不退部分 (纯损耗)',
    legendFees: '固定服务费 (中介/保证/火险)',

    currencyRef: '参考外币',

    compareAdd: '加入对比',
    compareAdded: '已在对比中',
    compareRemove: '移除',
    compareTitle: '备选房源横向对比',
    compareClear: '清空对比',
    compareEmpty: '尚未加入房源。在房源列表或详情页点击小红心［♡］即可收藏并横向对比。',
    compareOpen: '查看对比',
    compareMaxNotice: '最多支持保存 20 套房源',
    exportList: '📋 复制收藏清单',
    listCopied: '清单已复制到剪贴板！',
    favorite: '收藏',

    filterTitle: 'Minukuma 快捷排雷',
    filterHideWood: '隐藏木造',
    filterHideGas: '隐藏LP瓦斯',
    filterHiddenNotice: (n: number) => `已折叠隐藏 ${n} 套暗坑房源`,
  },
  en: {
    title: 'Rental costs', month: '/ mo', delta: 'vs. rent', trueTag: 'True',
    estimate: (m: number) => `${m}-month estimate`,
    listEstimate: (m: number) => `Listed fees · ${m}-month estimate`,
    approx: '≈', check: 'Check with agent', source: 'Listed', basis: 'Based on', viewSources: 'View fee sources',
    coverage: 'Excludes advance rent, prorated rent, and unconfirmed charges.',
    overview: 'Property at a glance', station: 'Station access', address: 'Address', googleMap: 'Google Maps', googleSearch: 'Google Search', gasType: 'Gas', direction: 'Facing', structure: 'Structure', age: 'Building age',
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

    amortizationLabel: 'Amortization',
    amortization12: '1 Year (12 mos)',
    amortization24: '2 Years (24 mos · Std)',
    amortization36: '3 Years (36 mos)',
    badgeLpGas: 'Propane',
    badgeWood: 'Wood',
    badgeContract: 'Fixed-term',
    badgeFloor: '1st Fl',
    verdictTitle: 'Minukuma Detective Verdict',
    verdictReasonable: 'Fees are transparent with no high upfront markup.',
    verdictHighInitial: (amount: string) => `Significant upfront non-refundable fees add ${amount}/mo to the true cost.`,
    verdictNotesWarning: 'We recommend checking the points above before signing.',
    inquirySectionTitle: 'Japanese Inquiry Templates',
    inquirySectionDesc: 'Copy polite business Japanese templates directly to contact the agent:',
    copy: 'Copy Template',
    copied: 'Copied to clipboard!',

    breakdownTitle: 'Upfront Cost Breakdown',
    legendRefundable: 'Deposit (Refundable)',
    legendSunk: 'Key Money / Sunk (Non-refundable)',
    legendFees: 'Service Fees (Agency/Guarantor)',

    currencyRef: 'Ref Currency',

    compareAdd: 'Add to Compare',
    compareAdded: 'In Compare List',
    compareRemove: 'Remove',
    compareTitle: 'Property Comparison',
    compareClear: 'Clear All',
    compareEmpty: 'No properties added yet. Click the heart [♡] on listings or detail pages to save.',
    compareOpen: 'Compare Properties',
    compareMaxNotice: 'You can save up to 20 properties',
    exportList: '📋 Copy Property List',
    listCopied: 'List copied to clipboard!',
    favorite: 'Save',

    filterTitle: 'Minukuma Quick Filter',
    filterHideWood: 'Hide Wood',
    filterHideGas: 'Hide Propane',
    filterHiddenNotice: (n: number) => `Filtered out ${n} properties`,
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
