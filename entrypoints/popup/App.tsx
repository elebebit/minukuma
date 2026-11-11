import React, { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { clearCompare, formatCompareListText, getCompareList, removeFromCompare, type CompareItem } from '../../src/compare';
import { type TargetCurrency } from '../../src/currency';
import { defaultLocale, isLocale, type Locale } from '../../src/locale';
import mascot from '../../src/mascot.svg';
import './popup.css';

const UI_TEXT = {
  zh: {
    slogan: '识破日本租房暗坑与虚标，还原真实月租！',
    statusActive: (site: string) => `${site} 实时测算中`,
    statusInactive: '未在找房平台',
    statusInactiveDesc: '打开支持的找房平台将自动激活：',
    quickAccess: '快速前往支持的找房平台：',
    favoritesTitle: '❤️ 我的收藏清单',
    favoritesEmpty: '尚未收藏房源。在房源列表或详情页点击小红心［♡］即可随手收藏！',
    copyList: '📋 复制清单',
    listCopied: '已复制！',
    clearAll: '清空',
    trueMonthly: '实付:',
    rent: '标价:',
    initialCost: '头金:',
    settingsTitle: '偏好设置',
    langLabel: '界面语言',
    monthsLabel: '折算周期',
    months12: '1年 (12个月)',
    months24: '2年 (24个月 · 推荐)',
    months36: '3年 (36个月)',
    currencyLabel: '外币参考',
    currencyNone: '不显示',
    currencyCNY: '人民币 (CNY)',
    currencyUSD: '美元 (USD)',
    currencyHKD: '港币 (HKD)',
    badgesLabel: '列表页直接标注暗坑',
    badgesDesc: 'LP瓦斯、木造、定期借家',
    guideTitle: '📖 日本租房四大避坑必知',
    tip1Title: '🚨 LP瓦斯 (プロパンガス)',
    tip1Desc: '私人液化气管道。冬季洗澡暖气煤气费普遍比都市瓦斯(都市ガス)贵 1.5~2 倍，每月可能多支出 5,000~8,000 円。',
    tip2Title: '⚠️ 木造 / 轻量铁骨 (木造・軽量鉄骨)',
    tip2Desc: '非混凝土建筑，隔音与保温较弱，楼上脚步声与隔壁生活声清晰可闻。对声音敏感者建议优先选择 RC (钢筋混凝土)。',
    tip3Title: '🚨 定期借家 (非普通租约)',
    tip3Desc: '租约到期后房东有绝对权力收房不予续约。普通借家租客享有极强法律续约保障，定期借家需确认是否写明“可再签约”。',
    tip4Title: '💡 敷引与偿却 (敷引・償却)',
    tip4Desc: '名义上虽称为押金/保证金，但合同已写明退房时扣除不退的部分。Minukuma 已将其如实计入不可退初期费用分摊。',
    privacy: '100% 本地运算 · 零数据上传',
    openListing: '直达房源',
  },
  ja: {
    slogan: '日本の賃貸のウラを、見抜くま！実質家賃チェッカー',
    statusActive: (site: string) => `${site} で稼働中`,
    statusInactive: '対象外のサイトです',
    statusInactiveDesc: '対応の賃貸サイトを開くと自動で起動します：',
    quickAccess: '対応サイトを開く：',
    favoritesTitle: '❤️ お気に入り候補リスト',
    favoritesEmpty: 'まだ物件が保存されていません。一覧や詳細のハート［♡］から追加できます！',
    copyList: '📋 リストコピー',
    listCopied: 'コピー済！',
    clearAll: 'クリア',
    trueMonthly: '実質:',
    rent: '表面:',
    initialCost: '初期:',
    settingsTitle: '動作設定',
    langLabel: '表示言語',
    monthsLabel: '換算期間',
    months12: '1年 (12ヶ月)',
    months24: '2年 (24ヶ月・標準)',
    months36: '3年 (36ヶ月)',
    currencyLabel: '外貨換算',
    currencyNone: '表示なし',
    currencyCNY: '人民元 (CNY)',
    currencyUSD: '米ドル (USD)',
    currencyHKD: '香港ドル (HKD)',
    badgesLabel: '一覧での落とし穴タグ表示',
    badgesDesc: 'LPガス・木造・定期借家',
    guideTitle: '📖 賃貸契約の4大チェックポイント',
    tip1Title: '🚨 LPガス（プロパンガス）',
    tip1Desc: '都市ガスに比べ基本料金・従量単価が高く、特に冬場の光熱費が月5,000〜8,000円ほど割高になる傾向があります。',
    tip2Title: '⚠️ 木造・軽量鉄骨造',
    tip2Desc: 'RC（鉄筋コンクリート）に比べ遮音性が低く、生活音が響きやすい傾向があります。内見時の確認が必須です。',
    tip3Title: '🚨 定期借家契約',
    tip3Desc: '契約満了時に更新がなく退去が原則となる契約形態です。「再契約可」の記載があるか事前に不動産会社へ確認しましょう。',
    tip4Title: '💡 敷引・償却',
    tip4Desc: '敷金・保証金のうち退去時に返還されない確定費用です。みぬくまでは実質初期費用として均等計算に算入しています。',
    privacy: '100% ローカル処理 · プライバシー安全',
    openListing: '物件を開く',
  },
  en: {
    slogan: 'See through true rental costs & hidden traps in Japan!',
    statusActive: (site: string) => `Active on ${site}`,
    statusInactive: 'No portal active',
    statusInactiveDesc: 'Open a supported portal to activate:',
    quickAccess: 'Quick access to supported portals:',
    favoritesTitle: '❤️ Saved Properties',
    favoritesEmpty: 'No properties saved yet. Click the heart [♡] on any listing to save!',
    copyList: '📋 Copy List',
    listCopied: 'Copied!',
    clearAll: 'Clear',
    trueMonthly: 'True:',
    rent: 'Rent:',
    initialCost: 'Upfront:',
    settingsTitle: 'Preferences',
    langLabel: 'Language',
    monthsLabel: 'Amortization',
    months12: '1 Year (12 mos)',
    months24: '2 Years (24 mos · Std)',
    months36: '3 Years (36 mos)',
    currencyLabel: 'Foreign Currency',
    currencyNone: 'Disabled',
    currencyCNY: 'Yuan (CNY)',
    currencyUSD: 'Dollar (USD)',
    currencyHKD: 'HK Dollar (HKD)',
    badgesLabel: 'Risk Badges on List Pages',
    badgesDesc: 'Propane, Wood, Fixed-term',
    guideTitle: '📖 Key Pitfalls to Watch Out For',
    tip1Title: '🚨 Propane Gas (LPG)',
    tip1Desc: 'Typically 1.5x to 2x more expensive than city gas, adding ¥5,000–¥8,000/month during winter months.',
    tip2Title: '⚠️ Timber / Light Steel Frame',
    tip2Desc: 'Poorer soundproofing compared to RC (reinforced concrete). Expect footsteps and neighbors\' voices to be audible.',
    tip3Title: '🚨 Fixed-term Lease (定期借家)',
    tip3Desc: 'The landlord can refuse renewal when the term ends. Verify if re-contracting is guaranteed.',
    tip4Title: '💡 Non-refundable Deposit (敷引・償却)',
    tip4Desc: 'A mandatory non-refundable deduction from the deposit upon moving out, factored into Minukuma\'s monthly amortized cost.',
    privacy: '100% Local Processing · Zero Data Collected',
    openListing: 'View',
  },
};

export function App() {
  const [locale, setLocale] = useState<Locale>('ja');
  const [months, setMonths] = useState<number>(24);
  const [showBadges, setShowBadges] = useState<boolean>(true);
  const [currency, setCurrency] = useState<TargetCurrency>('none');
  const [currentPlatform, setCurrentPlatform] = useState<string | null>(null);
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [listCopied, setListCopied] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    void browser.storage.local.get(['locale', 'months', 'showBadges', 'currency']).then((res) => {
      if (isLocale(res.locale)) {
        setLocale(res.locale);
      } else {
        setLocale(defaultLocale(browser.i18n.getUILanguage()));
      }
      if (typeof res.months === 'number' && [12, 24, 36].includes(res.months)) {
        setMonths(res.months);
      }
      if (typeof res.showBadges === 'boolean') {
        setShowBadges(res.showBadges);
      }
      if (res.currency && ['none', 'CNY', 'USD', 'HKD'].includes(String(res.currency))) {
        setCurrency(res.currency as TargetCurrency);
      }
    });

    void getCompareList().then(setCompareItems);

    void browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      const url = tab?.url ?? '';
      if (url.includes('suumo.jp')) {
        setCurrentPlatform('SUUMO');
      } else if (url.includes('homes.co.jp')) {
        setCurrentPlatform("LIFULL HOME'S");
      } else if (url.includes('athome.co.jp')) {
        setCurrentPlatform('at home');
      } else {
        setCurrentPlatform(null);
      }
    }).catch(() => {});
  }, []);

  const handleLocaleChange = (next: Locale) => {
    setLocale(next);
    void browser.storage.local.set({ locale: next });
  };

  const handleMonthsChange = (next: number) => {
    setMonths(next);
    void browser.storage.local.set({ months: next });
  };

  const handleBadgesToggle = (next: boolean) => {
    setShowBadges(next);
    void browser.storage.local.set({ showBadges: next });
  };

  const handleCurrencyChange = (next: TargetCurrency) => {
    setCurrency(next);
    void browser.storage.local.set({ currency: next });
  };

  const handleRemoveItem = async (id: string) => {
    await removeFromCompare(id);
    const updated = await getCompareList();
    setCompareItems(updated);
  };

  const handleClearAll = async () => {
    await clearCompare();
    setCompareItems([]);
  };

  const handleCopyList = async () => {
    const text = formatCompareListText(compareItems);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setListCopied(true);
      setTimeout(() => setListCopied(false), 2000);
    } catch {}
  };

  const handleOpenProperty = (rawUrl: string | undefined, propertyName?: string) => {
    let url = rawUrl?.trim();
    if (url && url.startsWith('/')) {
      url = `https://suumo.jp${url}`;
    }
    if (!url || !url.startsWith('http')) {
      if (propertyName) {
        url = `https://suumo.jp/jj/chintai/ichiran/FR301FC001/?fw=${encodeURIComponent(propertyName)}`;
      } else {
        return;
      }
    }
    try {
      void browser.tabs.create({ url });
    } catch {
      window.open(url, '_blank');
    }
  };

  const t = UI_TEXT[locale] ?? UI_TEXT.ja;
  const langDisplay = locale === 'zh' ? '中文' : locale === 'ja' ? '日本語' : 'EN';

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="popup-header">
        <img src={mascot} alt="みぬくま" className="popup-logo" />
        <div className="popup-title-group">
          <h1>
            みぬくま <span className="version">v0.1.0</span>
          </h1>
          <p>{t.slogan}</p>
        </div>

        {/* 右上角偏好设置按钮 */}
        <button
          type="button"
          className={`header-settings-btn ${showSettings ? 'active' : ''}`}
          title={t.settingsTitle}
          onClick={() => setShowSettings(!showSettings)}
        >
          <span className="settings-gear">⚙️</span>
          <span className="settings-btn-badge">{langDisplay}</span>
        </button>
      </header>

      {/* 偏好设置面板（点击右上角展开） */}
      {showSettings && (
        <section className="settings-flyout">
          <div className="settings-flyout-header">
            <strong>⚙️ {t.settingsTitle}</strong>
            <button
              type="button"
              className="settings-close-x"
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>
          </div>

          <div className="settings-content">
            {/* Language */}
            <div className="setting-row">
              <span className="setting-name">{t.langLabel}</span>
              <select
                className="setting-select"
                value={locale}
                onChange={(e) => isLocale(e.target.value) && handleLocaleChange(e.target.value)}
              >
                <option value="zh">简体中文</option>
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Amortization */}
            <div className="setting-row">
              <span className="setting-name">{t.monthsLabel}</span>
              <select
                className="setting-select"
                value={months}
                onChange={(e) => handleMonthsChange(Number(e.target.value))}
              >
                <option value={12}>{t.months12}</option>
                <option value={24}>{t.months24}</option>
                <option value={36}>{t.months36}</option>
              </select>
            </div>

            {/* Currency Reference */}
            <div className="setting-row">
              <span className="setting-name">{t.currencyLabel}</span>
              <select
                className="setting-select"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value as TargetCurrency)}
              >
                <option value="none">{t.currencyNone}</option>
                <option value="CNY">{t.currencyCNY}</option>
                <option value="USD">{t.currencyUSD}</option>
                <option value="HKD">{t.currencyHKD}</option>
              </select>
            </div>

            {/* List Badges Toggle */}
            <div className="setting-row">
              <div className="setting-name-group">
                <span>{t.badgesLabel}</span>
                <small>{t.badgesDesc}</small>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={showBadges}
                  onChange={(e) => handleBadgesToggle(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>
      )}

      {/* Realtime Status */}
      <div className={`status-card ${currentPlatform ? 'status-active' : 'status-inactive'}`}>
        <div className="status-indicator">
          <span className="status-dot">{currentPlatform ? '🟢' : '⚪'}</span>
          <span className="status-title">
            {currentPlatform ? t.statusActive(currentPlatform) : t.statusInactive}
          </span>
          {currentPlatform && <span className="status-live-tag">LIVE</span>}
        </div>
        {!currentPlatform && (
          <>
            <p className="status-desc">{t.statusInactiveDesc}</p>
            <div className="platform-links">
              <a href="https://suumo.jp/chintai/" target="_blank" rel="noreferrer" className="platform-btn">SUUMO</a>
              <a href="https://www.homes.co.jp/chintai/" target="_blank" rel="noreferrer" className="platform-btn">HOME'S</a>
              <a href="https://www.athome.co.jp/chintai/" target="_blank" rel="noreferrer" className="platform-btn">at home</a>
            </div>
          </>
        )}
      </div>

      {/* Favorites / Pocket Section */}
      <section className="favorites-section">
        <div className="favorites-header">
          <div className="favorites-title">
            <strong>{t.favoritesTitle}</strong>
            <span className="favorites-badge">{compareItems.length}/20</span>
          </div>
          {compareItems.length > 0 && (
            <div className="favorites-actions">
              <button
                type="button"
                className={`fav-btn-export ${listCopied ? 'copied' : ''}`}
                onClick={handleCopyList}
              >
                {listCopied ? `✓ ${t.listCopied}` : t.copyList}
              </button>
              <button
                type="button"
                className="fav-btn-clear"
                onClick={handleClearAll}
              >
                {t.clearAll}
              </button>
            </div>
          )}
        </div>

        {compareItems.length === 0 ? (
          <div className="favorites-empty">
            <p>{t.favoritesEmpty}</p>
          </div>
        ) : (
          <div className="favorites-list">
            {compareItems.map((item) => (
              <div key={item.id} className="fav-item-card">
                <div className="fav-card-header">
                  <button
                    type="button"
                    className="fav-prop-title-btn"
                    title={item.propertyName || '在浏览器中打开房源'}
                    onClick={() => handleOpenProperty(item.url, item.propertyName)}
                  >
                    <span className="fav-title-text">{item.propertyName || '物件詳細'}</span>
                    <span className="fav-jump-tag">
                      <svg className="jump-svg-icon" viewBox="0 0 24 24" width="10.5" height="10.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span>{t.openListing}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="fav-del-btn"
                    title="移除"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    ✕
                  </button>
                </div>

                <div className="fav-card-metrics">
                  <div className="fav-monthly-pill">
                    <small>{t.trueMonthly}</small>
                    <strong>¥{item.monthly.toLocaleString('ja-JP')}</strong>
                  </div>
                  <div className="fav-sub-metrics">
                    <span>{t.rent} ¥{item.rent.toLocaleString('ja-JP')}</span>
                    <span>{t.initialCost} ¥{item.initialSubtotal.toLocaleString('ja-JP')}</span>
                  </div>
                </div>

                <div className="fav-card-tags">
                  {item.grade && (
                    <span className="fav-pill-grade" style={{ backgroundColor: item.gradeColor }}>
                      {item.grade}
                    </span>
                  )}
                  {item.address && (
                    <button
                      type="button"
                      className="fav-pill-info fav-pill-addr-btn"
                      title="在 Google 地图中查看位置与街景"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProperty(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address!)}`);
                      }}
                    >
                      📍 {item.address} 🗺️
                    </button>
                  )}
                  {item.station && item.station !== '—' && (
                    <span className="fav-pill-info">🚉 {item.station}</span>
                  )}
                  {item.structure && item.structure !== '—' && (
                    <span className="fav-pill-info">🏢 {item.structure}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mini Tips (Collapsible - 默认折叠) */}
      <section className="collapsible-section">
        <details className="tips-accordion">
          <summary>
            <span>{t.guideTitle}</span>
            <span className="chevron-icon">▼</span>
          </summary>
          <ul className="tips-list">
            <li className="tip-item">
              <strong>{t.tip1Title}</strong>
              <p>{t.tip1Desc}</p>
            </li>
            <li className="tip-item">
              <strong>{t.tip2Title}</strong>
              <p>{t.tip2Desc}</p>
            </li>
            <li className="tip-item">
              <strong>{t.tip3Title}</strong>
              <p>{t.tip3Desc}</p>
            </li>
            <li className="tip-item">
              <strong>{t.tip4Title}</strong>
              <p>{t.tip4Desc}</p>
            </li>
          </ul>
        </details>
      </section>

      {/* Footer */}
      <footer className="popup-footer">
        <span className="privacy-badge">🔒 {t.privacy}</span>
        <span>Minukuma Project</span>
      </footer>
    </div>
  );
}
