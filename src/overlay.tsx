import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { browser } from 'wxt/browser';
import { calculate, type Fee, type Listing } from './cost';
import { translateLeaseChinese } from './lease-zh';
import { defaultLocale, isLocale, messages, propertyValue, type Locale } from './locale';
import mascot from './mascot.svg?inline';
import styles from './panel.css?inline';

const localeTags = { ja: 'ja-JP', zh: 'zh-CN', en: 'en' };
const formatters = {
  ja: new Intl.NumberFormat(localeTags.ja),
  zh: new Intl.NumberFormat(localeTags.zh),
  en: new Intl.NumberFormat(localeTags.en),
};
const yen = (amount: number, locale: Locale) => `¥${formatters[locale].format(amount)}`;

export function Summary({ listing, locale }: { listing: Listing; locale: Locale }) {
  const t = messages[locale];
  const { monthly, difference } = calculate(listing);
  const amount = `${yen(monthly, locale)} ${t.month}`;
  const delta = difference > 0 ? ` · ${t.delta} +${yen(difference, locale)}` : '';
  return (
    <span className="summary" title={`${t.listEstimate}: ${amount}${delta}`}>
      {monthly < 1_000_000 ? t.approx : '≈'}{yen(monthly, locale)}{t.month.replaceAll(' ', '')}
    </span>
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
  const { access, gas, direction, structure, age, built, layout, area, floor } = facts;
  const floorMatch = floor?.match(/^(\d+(?:[-–〜~]\d+)?)階(?:\s*[/／]\s*(\d+)階建)?$/);
  const floorLabel = locale !== 'ja' && floorMatch
    ? `${floorMatch[1]}${floorMatch[2] ? `/${floorMatch[2]}` : ''}${t.floorUnit}` : floor;
  const room = [layout, area, floorLabel].filter(Boolean).join(' · ');
  return (
    <section className="property-overview">
      <h3>{t.overview}</h3>
      <dl>
        <div className="station">
          <dt>{t.station}</dt>
          <dd>
            {access ? <span lang="ja">{access.station}</span> : '—'}
            {access?.minutes !== undefined && <small>{t.walk(access.minutes)}</small>}
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

export function Detail({ listing, locale, onLocale }: {
  listing: Listing;
  locale: Locale;
  onLocale: (locale: Locale) => void;
}) {
  const t = messages[locale];
  const { initialSubtotal, monthly, difference } = calculate(listing);
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
            <span>{t.estimate}</span>
            <select aria-label={locale === 'zh' ? '界面语言' : locale === 'ja' ? '表示言語' : 'Display language'}
              value={locale} onChange={(event) => {
                const value = event.currentTarget.value;
                if (isLocale(value)) onLocale(value);
              }}>
              <option value="zh" lang="zh-CN">中文</option>
              <option value="ja" lang="ja">日本語</option>
              <option value="en" lang="en">English</option>
            </select>
          </div>
          <div className="monthly"><strong>{yen(monthly, locale)}</strong> <small>{t.month}</small></div>
          {difference > 0 && <small>{t.delta} +{yen(difference, locale)}</small>}
        </div>
        {listing.facts && <PropertyOverview facts={listing.facts} locale={locale} />}
        <p>{t.coverage}</p>
        <dl>
          <FeeRow label={t.rent} locale={locale} value={{ amount: listing.rent, raw: '' }} />
          <FeeRow label={t.management} locale={locale} value={listing.management} />
        </dl>
        <h3>{t.upfront} <strong>{yen(initialSubtotal, locale)}</strong></h3>
        <dl>{visibleFees.map((key) => <FeeRow key={key} label={t[key]} locale={locale} value={listing[key]} />)}</dl>
        {sources.length > 0 && (
          <details className="fee-sources">
            <summary>{t.viewSources}</summary>
            <dl>{sources.map(({ key, value }) => (
              <div key={key}>
                <dt>{t[key]}</dt>
                <dd><SourceText raw={value.raw} locale={locale} /></dd>
              </div>
            ))}</dl>
          </details>
        )}
        {listing.lease && <LeaseDetails lease={listing.lease} locale={locale} />}
        {!!listing.notes?.length && (
          <><h3>{t.notes}</h3><ul>{listing.notes.map(({ kind, raw }) => (
            <li key={kind}><strong>{t[kind]}</strong><div className="note-source"><SourceText raw={raw} locale={locale} /></div></li>
          ))}</ul></>
        )}
      </div>
    </details>
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
  const stored = await browser.storage.local.get('locale').catch(() => ({} as Record<string, unknown>));
  let locale = isLocale(stored.locale) ? stored.locale : defaultLocale(browser.i18n.getUILanguage());
  if (ctx.isInvalid) return;

  function setLocale(next: Locale) {
    locale = next;
    reconcile();
    void browser.storage.local.set({ locale: next }).catch(() => {});
  }

  function updateLocale(changes: Record<string, { newValue?: unknown }>, area: string) {
    const next = changes.locale?.newValue;
    if (area === 'local' && isLocale(next) && next !== locale) {
      locale = next;
      reconcile();
    }
  }

  function reconcile() {
    const detail = config.isDetail(location.pathname);
    const room = detail ? config.detailRoom(document) : null;
    const rooms = detail ? (room ? [room] : []) : config.listRooms(document);
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
      const signature = JSON.stringify([listing, locale]);
      if (mount.signature !== signature) {
        mount.signature = signature;
        mount.root.render(detail
          ? <Detail listing={listing} locale={locale} onLocale={setLocale} />
          : <Summary listing={listing} locale={locale} />);
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
  browser.storage.onChanged.addListener(updateLocale);
  ctx.onInvalidated(() => {
    browser.storage.onChanged.removeListener(updateLocale);
    observer.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
    for (const { root, host } of mounts.values()) {
      root.unmount();
      host.remove();
    }
    mounts.clear();
  });
}
