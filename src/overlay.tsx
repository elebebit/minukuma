import type { Root } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { browser } from 'wxt/browser';
import { addToCompare, getCompareList, removeFromCompare, clearCompare, isPropertySaved, formatCompareListText, type CompareItem } from './compare';
import { calculate, type Fee, type Listing } from './cost';
import { formatForeignCurrency, type TargetCurrency } from './currency';
import { INQUIRY_OPTIONS, generateInquiryText, type InquiryType } from './inquiry';
import { translateLeaseChinese } from './lease-zh';
import { defaultLocale, isLocale, messages, propertyValue, type Locale } from './locale';
import mascot from './mascot.svg?inline';
import styles from './panel.css?inline';
import { evaluateProperty, type ScoreReport } from './score';

const localeTags = { ja: 'ja-JP', zh: 'zh-CN', en: 'en' };
const formatters = {
  ja: new Intl.NumberFormat(localeTags.ja),
  zh: new Intl.NumberFormat(localeTags.zh),
  en: new Intl.NumberFormat(localeTags.en),
};
const yen = (amount: number, locale: Locale) => `¥${formatters[locale].format(amount)}`;

// 列表项悬停预览气泡与徽章
export function Summary({
  listing,
  locale,
  amortizationMonths = 24,
  showBadges = true,
  currency = 'none',
}: {
  listing: Listing;
  locale: Locale;
  amortizationMonths?: number;
  showBadges?: boolean;
  currency?: TargetCurrency;
}) {
  const t = messages[locale];
  const { monthly, difference, initialSubtotal } = calculate(listing, amortizationMonths);
  const [showTooltip, setShowTooltip] = useState(false);

  const propertyId = listing.url || listing.propertyName || '';
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    void isPropertySaved(propertyId).then(setSaved);
  }, [propertyId]);

  const handleToggleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!propertyId) return;

    if (saved) {
      await removeFromCompare(propertyId);
      setSaved(false);
    } else {
      const score = evaluateProperty(listing, difference);
      const item: CompareItem = {
        id: propertyId,
        propertyName: listing.propertyName || '物件',
        url: listing.url || (typeof window !== 'undefined' ? window.location.href : ''),
        rent: listing.rent,
        monthly,
        difference,
        initialSubtotal,
        address: listing.facts?.address,
        station: listing.facts?.access?.station || '—',
        structure: listing.facts?.structure || '—',
        gas: listing.facts?.gas || '—',
        grade: score.label[locale],
        gradeColor: score.color,
        addedAt: Date.now(),
      };
      const res = await addToCompare(item);
      if (res.success) {
        setSaved(true);
      } else if (res.reason === 'limit') {
        alert(t.compareMaxNotice);
      }
    }
  };

  const amount = `${yen(monthly, locale)} ${t.month}`;
  const delta = difference > 0 ? ` · ${t.delta} +${yen(difference, locale)}` : '';
  const foreign = formatForeignCurrency(monthly, currency);

  const badges: { text: string; severity: 'danger' | 'warning' | 'info' }[] = [];
  if (showBadges) {
    if (listing.notes?.some((n) => n.kind === 'gas') || /プロパン|LP/i.test(listing.facts?.gas ?? '')) {
      badges.push({ text: t.badgeLpGas, severity: 'danger' });
    }
    if (listing.notes?.some((n) => n.kind === 'wood') || /木造|軽量鉄骨/i.test(listing.facts?.structure ?? '')) {
      badges.push({ text: t.badgeWood, severity: 'warning' });
    }
    if (listing.notes?.some((n) => n.kind === 'contract') || /定期借家/i.test(listing.lease?.leaseTerm ?? '')) {
      badges.push({ text: t.badgeContract, severity: 'danger' });
    }
    if (listing.notes?.some((n) => n.kind === 'floor') || /^1階/i.test(listing.facts?.floor ?? '')) {
      badges.push({ text: t.badgeFloor, severity: 'info' });
    }
  }

  const amortizedPart = Math.round((difference - (listing.management.amount ?? 0)));

  return (
    <span
      className="summary-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="pop-price-card"
        title={`${t.listEstimate(amortizationMonths)}: ${amount}${delta}`}
      >
        <div className="pop-card-header">
          <div className="pop-brand-tag">
            <img src={mascot} className="pop-mascot-img" alt="" />
            <span className="pop-tag-label">{t.trueTag}</span>
          </div>
          <button
            type="button"
            className={`fav-heart-btn ${saved ? 'saved' : ''}`}
            title={saved ? t.compareRemove : t.favorite}
            onClick={handleToggleFav}
          >
            {saved ? '❤️' : '♡'}
          </button>
        </div>

        <div className="pop-card-price">
          <span className="pop-price-num">{yen(monthly, locale)}</span>
        </div>

        {difference > 0 && (
          <div className="pop-card-delta">
            <span>(+{yen(difference, locale)})</span>
          </div>
        )}
      </div>

      {badges.length > 0 && (
        <span className="badge-row">
          {badges.map((b, i) => (
            <span key={i} className={`mini-badge badge-${b.severity}`}>
              {b.text}
            </span>
          ))}
        </span>
      )}

      {/* 悬停微型明细卡 */}
      {showTooltip && (
        <div className="hover-tooltip">
          <div className="tooltip-row">
            <span>{t.rent}:</span>
            <strong>{yen(listing.rent, locale)}</strong>
          </div>
          <div className="tooltip-row">
            <span>{t.management}:</span>
            <strong>+{yen(listing.management.amount ?? 0, locale)}</strong>
          </div>
          {amortizedPart > 0 && (
            <div className="tooltip-row">
              <span>{t.estimate(amortizationMonths)}:</span>
              <strong className="tooltip-accent">+{yen(amortizedPart, locale)}/月</strong>
            </div>
          )}
          {foreign && (
            <div className="tooltip-foreign">
              {foreign}
            </div>
          )}
        </div>
      )}
    </span>
  );
}

// 费用构成多色分段条 (Cost Stacked Bar)
export function CostStackedBar({ listing, locale }: { listing: Listing; locale: Locale }) {
  const t = messages[locale];
  const deposit = (listing.deposit.amount ?? 0) + (listing.guaranteeDeposit?.amount ?? 0);
  const nonrefundable = (listing.keyMoney.amount ?? 0) + (listing.depreciation?.amount ?? 0);
  const otherFees = ((listing.agency?.amount ?? 0) + (listing.insurance?.amount ?? 0)
    + (listing.guarantee?.amount ?? 0) + (listing.otherInitial?.amount ?? 0));

  const total = deposit + nonrefundable + otherFees;
  if (total <= 0) return null;

  const pctDep = Math.round((deposit / total) * 100);
  const pctSunk = Math.round((nonrefundable / total) * 100);
  const pctFees = Math.max(0, 100 - pctDep - pctSunk);

  return (
    <div className="stacked-bar-section">
      <div className="stacked-bar-title">{t.breakdownTitle}</div>
      <div className="stacked-bar">
        {pctDep > 0 && (
          <div className="bar-segment seg-deposit" style={{ width: `${pctDep}%` }} title={`${t.legendRefundable}: ${pctDep}%`} />
        )}
        {pctSunk > 0 && (
          <div className="bar-segment seg-sunk" style={{ width: `${pctSunk}%` }} title={`${t.legendSunk}: ${pctSunk}%`} />
        )}
        {pctFees > 0 && (
          <div className="bar-segment seg-fees" style={{ width: `${pctFees}%` }} title={`${t.legendFees}: ${pctFees}%`} />
        )}
      </div>
      <div className="stacked-legend">
        <span className="legend-item"><i className="dot dot-deposit" />{t.legendRefundable} {pctDep}%</span>
        <span className="legend-item"><i className="dot dot-sunk" />{t.legendSunk} {pctSunk}%</span>
        <span className="legend-item"><i className="dot dot-fees" />{t.legendFees} {pctFees}%</span>
      </div>
    </div>
  );
}

export function FeeRow({ label, locale, value }: { label: string; locale: Locale; value?: Fee }) {
  const isPending = value?.amount == null;
  return (
    <div className={`row${isPending ? ' pending' : ''}`}>
      <dt>{label}</dt>
      <dd>{isPending ? messages[locale].check : yen(value.amount!, locale)}</dd>
    </div>
  );
}

export function PropertyOverview({ facts, locale }: { facts: NonNullable<Listing['facts']>; locale: Locale }) {
  const t = messages[locale];
  const { access, address, gas, direction, structure, age, built, layout, area, floor } = facts;
  const floorMatch = floor?.match(/^(\d+(?:[-–〜~]\d+)?)階(?:\s*[/／]\s*(\d+)階建)?$/);
  const floorLabel = locale !== 'ja' && floorMatch
    ? `${floorMatch[1]}${floorMatch[2] ? `/${floorMatch[2]}` : ''}${t.floorUnit}` : floor;
  const room = [layout, area, floorLabel].filter(Boolean).join(' · ');
  return (
    <section className="property-overview">
      <h3>{t.overview}</h3>
      <dl>
        {address && (
          <div className="station address-overview-row">
            <dt>{t.address}</dt>
            <dd>
              <span className="address-text" lang="ja">📍 {address}</span>
              <div className="address-jump-actions">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="address-jump-btn map-btn"
                  title="在 Google 地图中查看位置与街景"
                >
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                  <span>{t.googleMap}</span>
                </a>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="address-jump-btn search-btn"
                  title="在 Google 中搜索房源背景与周边"
                >
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>{t.googleSearch}</span>
                </a>
              </div>
            </dd>
          </div>
        )}
        <div className="station">
          <dt>{t.station}</dt>
          <dd>
            {access?.stations && access.stations.length > 0 ? (
              <div className="station-list">
                {access.stations.map((st, i) => (
                  <div key={i} className="station-item">
                    {st.line && <span className="station-line">{st.line} · </span>}
                    <strong className="station-name">{st.station}</strong>
                    {st.minutes !== undefined && <small className="station-walk">{t.walk(st.minutes)}</small>}
                  </div>
                ))}
              </div>
            ) : access ? (
              <div className="station-item">
                <strong className="station-name">{access.station}</strong>
                {access.minutes !== undefined && <small className="station-walk">{t.walk(access.minutes)}</small>}
              </div>
            ) : (
              '—'
            )}
          </dd>
        </div>
        {room && <div className="station"><dt>{t.room}</dt><dd>{room}</dd></div>}
        <div><dt>{t.gasType}</dt><dd>{propertyValue(gas, locale)}</dd></div>
        <div><dt>{t.direction}</dt><dd>{propertyValue(direction, locale)}</dd></div>
        <div><dt>{t.structure}</dt><dd>{propertyValue(structure, locale)}</dd></div>
        <div><dt>{t.age}</dt><dd>{age !== undefined ? t.years(age) : built ?? '—'}</dd></div>
      </dl>
    </section>
  );
}

export function SourceText({ raw, locale, fallback = raw }: { raw: string; locale: Locale; fallback?: string }) {
  const value = locale === 'zh' ? translateLeaseChinese(raw) : fallback;
  return <span lang={value === raw ? 'ja' : localeTags[locale]}>{value}</span>;
}

export function LeaseDetails({ lease, locale }: { lease: NonNullable<Listing['lease']>; locale: Locale }) {
  const t = messages[locale];
  const sections = [
    { title: t.moveInDetails, keys: ['moveIn', 'conditions', 'leaseTerm'] },
    { title: t.leaseCosts, keys: ['leaseCharges', 'ongoingGuarantee'] },
  ] as const;
  return sections.map(({ title, keys }) => {
    const rows = keys.flatMap((key) => {
      const raw = lease[key];
      if (!raw) return [];
      const value = key === 'moveIn'
        ? propertyValue(raw, locale)
        : key === 'conditions' && locale === 'zh'
          ? translateLeaseChinese(raw).replace(/\s*[\/／]\s*/g, ' · ')
          : raw;
      return [{ key, value, raw }];
    });
    return rows.length > 0 && (
      <details className="fee-sources" key={keys[0]}>
        <summary>{title}</summary>
        <dl>{rows.map(({ key, value, raw }) => (
          <div key={key}><dt>{t[key]}</dt><dd><SourceText raw={raw} locale={locale} fallback={value} /></dd></div>
        ))}</dl>
      </details>
    );
  });
}

// 侦探评级与印章卡片
export function DetectiveVerdict({
  listing,
  locale,
  difference,
}: {
  listing: Listing;
  locale: Locale;
  difference: number;
}) {
  const t = messages[locale];
  const notes = listing.notes ?? [];
  const isHighCost = difference >= 10000;
  const scoreReport: ScoreReport = evaluateProperty(listing, difference);

  return (
    <div className="verdict-box" style={{ borderColor: scoreReport.color }}>
      <div className="verdict-header">
        <span className="verdict-badge">🕵️ {t.verdictTitle}</span>
        <span className="score-stamp" style={{ backgroundColor: scoreReport.color }}>
          {scoreReport.label[locale]}
        </span>
      </div>
      <p className="verdict-text">
        {scoreReport.summary[locale]}
        {isHighCost ? ` ${t.verdictHighInitial(yen(difference, locale))}` : ''}
        {notes.length > 0 ? ` ${t.verdictNotesWarning}` : ''}
      </p>
    </div>
  );
}

// 日文商务询盘模板
export function InquirySection({
  listing,
  locale,
}: {
  listing: Listing;
  locale: Locale;
}) {
  const t = messages[locale];
  const [selectedType, setSelectedType] = useState<InquiryType>('quote');
  const [copied, setCopied] = useState(false);

  const room = [listing.facts?.layout, listing.facts?.area, listing.facts?.floor].filter(Boolean).join(' · ');
  const generatedText = generateInquiryText({
    type: selectedType,
    propertyName: listing.propertyName,
    room,
    listing,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <details className="fee-sources inquiry-container">
      <summary>{t.inquirySectionTitle}</summary>
      <div className="inquiry-body">
        <p className="inquiry-desc">{t.inquirySectionDesc}</p>
        <div className="inquiry-tabs">
          {INQUIRY_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.id}
              className={`inquiry-tab ${selectedType === opt.id ? 'active' : ''}`}
              onClick={() => setSelectedType(opt.id)}
            >
              {opt.title[locale]}
            </button>
          ))}
        </div>
        <textarea
          readOnly
          rows={6}
          value={generatedText}
          className="inquiry-textarea"
        />
        <div className="inquiry-actions">
          <button
            type="button"
            className={`inquiry-copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? `✓ ${t.copied}` : `📋 ${t.copy}`}
          </button>
        </div>
      </div>
    </details>
  );
}

// 房源对比弹窗
export function CompareModal({
  isOpen,
  onClose,
  locale,
}: {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
}) {
  const t = messages[locale];
  const [items, setItems] = useState<CompareItem[]>([]);
  const [listCopied, setListCopied] = useState(false);

  const refresh = () => {
    void getCompareList().then(setItems);
  };

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen]);

  const handleExportList = async () => {
    const text = formatCompareListText(items);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setListCopied(true);
      setTimeout(() => setListCopied(false), 2000);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="compare-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compare-header">
          <h3>📊 {t.compareTitle} ({items.length}/20)</h3>
          <div className="compare-header-actions">
            {items.length > 0 && (
              <>
                <button
                  type="button"
                  className={`compare-export-btn ${listCopied ? 'copied' : ''}`}
                  onClick={handleExportList}
                >
                  {listCopied ? `✓ ${t.listCopied}` : t.exportList}
                </button>
                <button
                  type="button"
                  className="compare-clear-btn"
                  onClick={async () => {
                    await clearCompare();
                    refresh();
                  }}
                >
                  {t.compareClear}
                </button>
              </>
            )}
            <button type="button" className="compare-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="compare-empty">{t.compareEmpty}</div>
        ) : (
          <div className="compare-grid">
            {items.map((item) => (
              <div key={item.id} className="compare-card">
                <div className="compare-card-top">
                  <span className="compare-card-grade" style={{ backgroundColor: item.gradeColor }}>
                    {item.grade}
                  </span>
                  <button
                    type="button"
                    className="compare-remove-btn"
                    onClick={async () => {
                      await removeFromCompare(item.id);
                      refresh();
                    }}
                  >
                    {t.compareRemove}
                  </button>
                </div>
                <h4 className="compare-prop-name">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.propertyName || '物件詳細'}
                  </a>
                </h4>
                <div className="compare-metric">
                  <span>実質月額:</span>
                  <strong>{yen(item.monthly, locale)}</strong>
                </div>
                <div className="compare-metric">
                  <span>表面家賃:</span>
                  <span>{yen(item.rent, locale)}</span>
                </div>
                <div className="compare-metric">
                  <span>初期費用計:</span>
                  <span>{yen(item.initialSubtotal, locale)}</span>
                </div>
                <div className="compare-spec">
                  {item.address && (
                    <div>
                      📍 {item.address}{' '}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="compare-map-link"
                        title="在 Google 地图查看"
                      >
                        [地图]
                      </a>
                    </div>
                  )}
                  <div>🚉 {item.station || '—'}</div>
                  <div>🏢 {item.structure || '—'}</div>
                  <div>🔥 {item.gas || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 详情页主卡片
export function Detail({
  listing,
  locale,
  amortizationMonths = 24,
  currency = 'none',
  onLocale,
  onMonths,
}: {
  listing: Listing;
  locale: Locale;
  amortizationMonths: number;
  currency?: TargetCurrency;
  onLocale: (locale: Locale) => void;
  onMonths: (months: number) => void;
}) {
  const t = messages[locale];
  const { initialSubtotal, monthly, difference } = calculate(listing, amortizationMonths);
  const foreignMonthly = formatForeignCurrency(monthly, currency);

  const [inCompare, setInCompare] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    void getCompareList().then((list) => {
      setInCompare(list.some((item) => item.url === currentUrl));
    });
  }, [currentUrl]);

  const handleToggleCompare = async () => {
    if (inCompare) {
      await removeFromCompare(currentUrl);
      setInCompare(false);
    } else {
      const score = evaluateProperty(listing, difference);
      const item: CompareItem = {
        id: currentUrl,
        propertyName: listing.propertyName || document.title.split(/[-–|]/)[0]?.trim() || '物件',
        url: currentUrl,
        rent: listing.rent,
        monthly,
        difference,
        initialSubtotal,
        address: listing.facts?.address,
        station: listing.facts?.access?.station ? `${listing.facts.access.station} ${listing.facts.access.minutes ? `${listing.facts.access.minutes}分` : ''}` : '—',
        structure: listing.facts?.structure || '—',
        gas: listing.facts?.gas || '—',
        grade: score.label[locale],
        gradeColor: score.color,
        addedAt: Date.now(),
      };
      const res = await addToCompare(item);
      if (res.success) {
        setInCompare(true);
      } else if (res.reason === 'limit') {
        alert(t.compareMaxNotice);
      }
    }
  };

  const fees = [
    'deposit', 'guaranteeDeposit', 'depreciation', 'keyMoney',
    'agency', 'insurance', 'guarantee', 'otherInitial',
  ] as const;
  const visibleFees = fees.filter((key) => {
    const item = listing[key];
    if (!item) return false;
    if (key === 'guaranteeDeposit' || key === 'depreciation') {
      return item.amount !== null && item.amount > 0;
    }
    if (key === 'deposit' || key === 'keyMoney') {
      return true;
    }
    return item.amount !== null ? item.amount > 0 : Boolean(item.raw && !/^[-−―ー]$/.test(item.raw.trim()));
  });
  const sources = (['management', ...visibleFees] as const).flatMap((key) => {
    const value = listing[key];
    if (!value?.raw || /^[-−―ー]$/.test(value.raw.trim())) return [];
    return [{ key, value }];
  });

  return (
    <>
      <details className="detail-panel" onKeyDown={(event) => {
        if (event.key === 'Escape' && event.currentTarget.open) {
          event.stopPropagation();
          event.currentTarget.open = false;
          event.currentTarget.querySelector('summary')?.focus();
        }
      }}>
        <summary>
          <img className="mascot" src={mascot} width="40" height="40" alt="" />
          <span className="title">
            <strong lang="ja">みぬくま</strong>
            <small>{t.title}</small>
          </span>
          <span className="chevron" aria-hidden="true" />
        </summary>
        <div className="body">
          <div className="hero">
            <div className="hero-top">
              <span>{t.estimate(amortizationMonths)}</span>
              <div className="hero-selectors">
                <select
                  aria-label={t.amortizationLabel}
                  value={amortizationMonths}
                  onChange={(e) => onMonths(Number(e.currentTarget.value))}
                >
                  <option value={12}>{t.amortization12}</option>
                  <option value={24}>{t.amortization24}</option>
                  <option value={36}>{t.amortization36}</option>
                </select>
                <select
                  aria-label={locale === 'zh' ? '界面语言' : locale === 'ja' ? '表示言語' : 'Display language'}
                  value={locale}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (isLocale(value)) onLocale(value);
                  }}
                >
                  <option value="zh" lang="zh-CN">中文</option>
                  <option value="ja" lang="ja">日本語</option>
                  <option value="en" lang="en">English</option>
                </select>
              </div>
            </div>
            <div className="monthly">
              <strong>{yen(monthly, locale)}</strong> <small>{t.month}</small>
              {foreignMonthly && <span className="monthly-foreign">{foreignMonthly}</span>}
            </div>
            {difference > 0 && <small>{t.delta} +{yen(difference, locale)}</small>}
          </div>

          {/* 侦探诊断小结与评级印章 */}
          <DetectiveVerdict listing={listing} locale={locale} difference={difference} />

          {/* 收藏对比与操作快捷条 */}
          <div className="quick-action-bar">
            <button
              type="button"
              className={`action-pill-btn ${inCompare ? 'active' : ''}`}
              onClick={handleToggleCompare}
            >
              {inCompare ? `🔖 ${t.compareAdded}` : `＋ ${t.compareAdd}`}
            </button>
            <button
              type="button"
              className="action-pill-btn secondary"
              onClick={() => setShowCompareModal(true)}
            >
              📊 {t.compareOpen}
            </button>
          </div>

          {listing.facts && <PropertyOverview facts={listing.facts} locale={locale} />}
          <p>{t.coverage}</p>
          <dl>
            <FeeRow label={t.rent} locale={locale} value={{ amount: listing.rent, raw: '' }} />
            <FeeRow label={t.management} locale={locale} value={listing.management} />
          </dl>

          <h3>{t.upfront} <strong>{yen(initialSubtotal, locale)}</strong></h3>

          {/* 初期费用构成彩色进度条 */}
          <CostStackedBar listing={listing} locale={locale} />

          <dl>{visibleFees.map((key) => <FeeRow key={key} label={t[key]} locale={locale} value={listing[key]} />)}</dl>
          {sources.length > 0 && (
            <details className="fee-sources">
              <summary>{t.viewSources}</summary>
              <dl>{sources.map(({ key, value }) => (
                <div key={key}>
                  <dt>{t[key]}</dt>
                  <dd><SourceText raw={value.raw} locale={locale} /></dd>
                </div>
              ))} </dl>
            </details>
          )}
          {listing.lease && <LeaseDetails lease={listing.lease} locale={locale} />}
          {!!listing.notes?.length && (
            <>
              <h3>{t.notes}</h3>
              <ul>
                {listing.notes.map(({ kind, raw }) => (
                  <li key={kind}>
                    <strong>{t[kind]}</strong>
                    <div className="note-source"><SourceText raw={raw} locale={locale} /></div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* 商务日文询盘模板 */}
          <InquirySection listing={listing} locale={locale} />
        </div>
      </details>

      {/* 对比弹窗 */}
      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        locale={locale}
      />
    </>
  );
}

// 列表页吸顶快捷排雷工具栏
export function FilterBar({
  locale,
  onToggleWood,
  onToggleGas,
  hideWood,
  hideGas,
  hiddenCount,
}: {
  locale: Locale;
  onToggleWood: () => void;
  onToggleGas: () => void;
  hideWood: boolean;
  hideGas: boolean;
  hiddenCount: number;
}) {
  const t = messages[locale];
  return (
    <div className="minukuma-filter-bar">
      <div className="filter-title">
        <img src={mascot} width="18" height="18" alt="" />
        <span>{t.filterTitle}</span>
      </div>
      <div className="filter-toggles">
        <button
          type="button"
          className={`filter-btn ${hideWood ? 'active' : ''}`}
          onClick={onToggleWood}
        >
          {hideWood ? '✓ ' : ''}{t.filterHideWood}
        </button>
        <button
          type="button"
          className={`filter-btn ${hideGas ? 'active' : ''}`}
          onClick={onToggleGas}
        >
          {hideGas ? '✓ ' : ''}{t.filterHideGas}
        </button>
        {hiddenCount > 0 && (
          <span className="filter-count">
            {t.filterHiddenNotice(hiddenCount)}
          </span>
        )}
      </div>
    </div>
  );
}

type Mount = { host: HTMLElement; root: Root; signature: string };

export type ContentScriptContext = {
  isInvalid?: boolean;
  onInvalidated: (callback: () => void) => void;
};

export type OverlayConfig = {
  isDetail: (pathname: string) => boolean;
  listRooms: (root: ParentNode) => Iterable<{ anchor: Element; listing: Listing }>;
  detailRoom: (root: ParentNode) => { anchor: Element; listing: Listing } | null;
};

export async function setupOverlay(ctx: ContentScriptContext, config: OverlayConfig) {
  const mounts = new Map<Element, Mount>();
  const stored = (await browser.storage.local.get(['locale', 'months', 'showBadges', 'currency']).catch(() => ({}))) as Record<string, unknown>;
  let locale: Locale = isLocale(stored.locale) ? stored.locale : defaultLocale(browser.i18n.getUILanguage());
  let months: number = typeof stored.months === 'number' && [12, 24, 36].includes(stored.months) ? stored.months : 24;
  let showBadges: boolean = typeof stored.showBadges === 'boolean' ? stored.showBadges : true;
  let currency: TargetCurrency = (stored.currency as TargetCurrency) || 'none';

  // 列表筛选状态
  let hideWood = false;
  let hideGas = false;
  let filterBarMount: { host: HTMLElement; root: Root } | null = null;

  if (ctx.isInvalid) return;

  function setLocale(next: Locale) {
    locale = next;
    reconcile();
    void browser.storage.local.set({ locale: next }).catch(() => {});
  }

  function setMonths(next: number) {
    months = next;
    reconcile();
    void browser.storage.local.set({ months: next }).catch(() => {});
  }

  function handleStorageChange(changes: Record<string, { newValue?: unknown }>, area: string) {
    if (area !== 'local') return;
    let changed = false;
    const nextLocale = changes.locale?.newValue;
    if (isLocale(nextLocale) && nextLocale !== locale) {
      locale = nextLocale;
      changed = true;
    }
    const nextMonths = changes.months?.newValue;
    if (typeof nextMonths === 'number' && nextMonths !== months) {
      months = nextMonths;
      changed = true;
    }
    const nextBadges = changes.showBadges?.newValue;
    if (typeof nextBadges === 'boolean' && nextBadges !== showBadges) {
      showBadges = nextBadges;
      changed = true;
    }
    const nextCurr = changes.currency?.newValue;
    if (nextCurr && nextCurr !== currency) {
      currency = nextCurr as TargetCurrency;
      changed = true;
    }
    if (changed) {
      reconcile();
    }
  }

  function applyListFilter(rooms: Iterable<{ anchor: Element; listing: Listing }>) {
    let hidden = 0;
    for (const { anchor, listing } of rooms) {
      const isWood = listing.notes?.some((n) => n.kind === 'wood') || /木造|軽量鉄骨/.test(listing.facts?.structure ?? '');
      const isGas = listing.notes?.some((n) => n.kind === 'gas') || /プロパン|LP/.test(listing.facts?.gas ?? '');

      const shouldHide = (hideWood && isWood) || (hideGas && isGas);
      // 向上寻找房源卡片容器
      const container = anchor.closest?.('tr, .cassetteitem, .mod-listKks, .room-info-section, .object-item') as HTMLElement | null;
      if (container) {
        if (shouldHide) {
          container.style.display = 'none';
          hidden++;
        } else {
          container.style.display = '';
        }
      }
    }
    return hidden;
  }

  function reconcile() {
    const detail = config.isDetail(location.pathname);
    const room = detail ? config.detailRoom(document) : null;
    const rooms = detail ? (room ? [room] : []) : Array.from(config.listRooms(document));

    // 如果是列表页，注入吸顶筛选条
    if (!detail && rooms.length > 0) {
      const hiddenCount = applyListFilter(rooms);

      if (!filterBarMount) {
        const host = document.createElement('div');
        host.id = 'minukuma-filter-host';
        const shadow = host.attachShadow({ mode: 'open' });
        const sheet = document.createElement('style');
        sheet.textContent = styles;
        const container = document.createElement('div');
        shadow.append(sheet, container);
        document.body.prepend(host);
        filterBarMount = { host, root: createRoot(container) };
      }

      filterBarMount.root.render(
        <FilterBar
          locale={locale}
          hideWood={hideWood}
          hideGas={hideGas}
          hiddenCount={hiddenCount}
          onToggleWood={() => {
            hideWood = !hideWood;
            reconcile();
          }}
          onToggleGas={() => {
            hideGas = !hideGas;
            reconcile();
          }}
        />
      );
    } else if (filterBarMount) {
      filterBarMount.root.unmount();
      filterBarMount.host.remove();
      filterBarMount = null;
    }

    const seen = new Set<Element>();
    for (const { anchor, listing } of rooms) {
      seen.add(anchor);
      let mount = mounts.get(anchor);
      if (!mount) {
        const host = document.createElement('div');
        host.dataset.minukuma = '';
        if (detail) host.dataset.minukumaDetail = '';
        const shadow = host.attachShadow({ mode: 'open' });
        const sheet = document.createElement('style');
        sheet.textContent = styles;
        const container = document.createElement('div');
        shadow.append(sheet, container);
        mount = { host, root: createRoot(container), signature: '' };
        mounts.set(anchor, mount);
      }
      if (detail) {
        if (mount.host.parentElement !== document.body) document.body.append(mount.host);
      } else if (anchor.nextElementSibling !== mount.host) {
        anchor.after(mount.host);
      }
      mount.host.lang = localeTags[locale];
      const signature = JSON.stringify([listing, locale, months, showBadges, currency]);
      if (mount.signature !== signature) {
        mount.signature = signature;
        mount.root.render(detail
          ? <Detail listing={listing} locale={locale} amortizationMonths={months} currency={currency} onLocale={setLocale} onMonths={setMonths} />
          : <Summary listing={listing} locale={locale} amortizationMonths={months} showBadges={showBadges} currency={currency} />);
      }
    }
    for (const [anchor, mount] of mounts) {
      if (seen.has(anchor)) continue;
      mount.root.unmount();
      mount.host.remove();
      mounts.delete(anchor);
    }
  }

  let frame: number | undefined;
  const observer = new MutationObserver(() => {
    if (frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      reconcile();
    });
  });
  reconcile();
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  browser.storage.onChanged.addListener(handleStorageChange);
  ctx.onInvalidated(() => {
    browser.storage.onChanged.removeListener(handleStorageChange);
    observer.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
    if (filterBarMount) {
      filterBarMount.root.unmount();
      filterBarMount.host.remove();
    }
    for (const { root, host } of mounts.values()) {
      root.unmount();
      host.remove();
    }
    mounts.clear();
  });
}
