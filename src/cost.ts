import type { NoteKind } from './locale.ts';

export type Fee = {
  amount: number | null;
  raw: string;
  derived?: boolean;
};

export interface StationAccess {
  station: string;
  minutes?: number;
  line?: string;
  raw?: string;
}

export type Listing = {
  propertyName?: string;
  url?: string;
  rent: number;
  management: Fee;
  deposit: Fee;
  keyMoney: Fee;
  depreciation?: Fee;
  guaranteeDeposit?: Fee;
  agency?: Fee;
  insurance?: Fee;
  guarantee?: Fee;
  otherInitial?: Fee;
  facts?: {
    access?: {
      station: string;
      minutes?: number;
      stations?: StationAccess[];
    };
    address?: string;
    gas?: string;
    direction?: string;
    structure?: string;
    age?: number;
    built?: string;
    layout?: string;
    area?: string;
    floor?: string;
  };
  lease?: {
    moveIn?: string;
    conditions?: string;
    leaseTerm?: string;
    leaseCharges?: string;
    ongoingGuarantee?: string;
  };
  notes?: { kind: NoteKind; raw: string }[];
};

export function normalize(value: string): string {
  return value.normalize('NFKC').trim();
}

export function yen(value: string): number | null {
  const match = normalize(value).match(/^((?:\d{1,3}(?:,\d{3})+|\d+))(?:\.(\d{1,4}))?\s*(万円|円)$/);
  if (!match?.[1]) return null;
  const whole = Number(match[1].replaceAll(',', ''));
  const fraction = match[2];
  if (match[3] === '円' && fraction) return null;
  const amount = match[3] === '円' ? whole : whole * 10000 + Number((fraction ?? '').padEnd(4, '0'));
  return Number.isSafeInteger(amount) ? amount : null;
}

export function fee(raw = ''): Fee {
  const value = normalize(raw);
  return { amount: /^(?:なし|無し|不要|無|0)$/.test(value) ? 0 : yen(value), raw };
}

export function derivedFee(raw: string, amount: number): Fee {
  return { raw, amount: Math.round(amount), derived: true };
}

export function advertisedFee(raw = ''): Fee {
  return /^[-−―ー無]$/.test(normalize(raw)) ? { raw, amount: 0 } : fee(raw);
}

export function monthFee(raw = '', rent: number): Fee {
  const norm = normalize(raw);
  const match = norm.match(/^(\d+(?:\.\d+)?)\s*[ヶケかカ箇]月(?:分)?$/);
  if (match) {
    return derivedFee(raw, rent * Number(match[1]));
  }
  return advertisedFee(raw);
}

export function calculate(listing: Listing, amortizationMonths = 24) {
  const months = amortizationMonths > 0 ? amortizationMonths : 24;
  const { rent, management, deposit, keyMoney, depreciation, guaranteeDeposit, agency, insurance, guarantee, otherInitial } = listing;
  const initial = [deposit, guaranteeDeposit, keyMoney, agency, insurance, guarantee, otherInitial];
  const initialSubtotal = initial.reduce((sum, item) => sum + (item?.amount ?? 0), 0);
  const upfrontNonrefundable = initialSubtotal - (deposit.amount ?? 0) - (guaranteeDeposit?.amount ?? 0)
    + (depreciation?.amount ?? 0);
  const monthly = rent + (management.amount ?? 0) + Math.round(upfrontNonrefundable / months);
  return { monthly, difference: monthly - rent, initialSubtotal };
}
