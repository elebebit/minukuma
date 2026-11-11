import type { Listing } from './cost';
import type { Locale } from './locale';

export type InquiryType = 'quote' | 'discount' | 'foreigner';

export interface InquiryOption {
  id: InquiryType;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
}

export const INQUIRY_OPTIONS: InquiryOption[] = [
  {
    id: 'quote',
    title: {
      zh: '初期费用明细与空室确认',
      ja: '空室状況・初期費用の内訳見積もり依頼',
      en: 'Availability & Upfront Cost Estimate',
    },
    description: {
      zh: '礼貌询问房间是否仍可租，并请求提供包含保证费、清扫费等在内的完整初期费用估价单。',
      ja: '現在の募集状況を確認し、敷金・礼金・保証会社・鍵交換等の初期費用明細の提示を依頼します。',
      en: 'Inquire if the room is available and request a full breakdown of upfront costs.',
    },
  },
  {
    id: 'discount',
    title: {
      zh: '中介费优惠与条件磋商',
      ja: '仲介手数料の割引・条件相談',
      en: 'Agency Fee Discount / Conditions Inquiry',
    },
    description: {
      zh: '表达强烈入住意向，礼貌商量中介手续费是否能减免或半额（日本法律上限为1.1个月）。',
      ja: '前向きな入居意欲を伝えつつ、仲介手数料やフリーレント等の条件相談が可能か伺います。',
      en: 'Express strong interest while politely inquiring about agency fee discounts or free rent.',
    },
  },
  {
    id: 'foreigner',
    title: {
      zh: '外国籍入居与审查确认',
      ja: '外国籍入居・審査相談',
      en: 'Foreign Resident & Screening Inquiry',
    },
    description: {
      zh: '说明自身具备合法在留资格及日语交流能力，提前确认房东和保证公司是否接纳外国籍。',
      ja: '在留資格や保証会社利用が可能か事前に確認し、スムーズな内見・審査を目指します。',
      en: 'Confirm in advance whether the property accepts foreign residents and guarantor companies.',
    },
  },
];

export function generateInquiryText({
  type,
  propertyName = '掲載物件',
  room = '',
  url = typeof window !== 'undefined' ? window.location.href : '',
  listing,
}: {
  type: InquiryType;
  propertyName?: string;
  room?: string;
  url?: string;
  listing?: Listing;
}): string {
  const propertyLines = [
    `【物件名】${propertyName || 'ご掲載の物件'}`,
    room ? `【お部屋/号室】${room}` : '',
    listing?.rent ? `【掲載家賃】${listing.rent.toLocaleString('ja-JP')}円 / 月` : '',
    url ? `【物件URL】${url}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // 根据已识别的房源风险与特点，追加针对性疑问
  const extraQuestions: string[] = [];
  if (listing?.notes?.some((n) => n.kind === 'contract')) {
    extraQuestions.push('・定期借家契約について、期間満了時の再契約（更新）の可否や条件');
  }
  if (listing?.notes?.some((n) => n.kind === 'gas')) {
    extraQuestions.push('・ガスの種別（プロパンガス等）および月額費用の目安');
  }
  if (listing?.notes?.some((n) => n.kind === 'wood')) {
    extraQuestions.push('・建物の遮音性や周辺の生活環境');
  }

  const extraSection = extraQuestions.length > 0
    ? `\nまた、併せて以下の点についてもご教示いただけますと幸いです：\n${extraQuestions.join('\n')}\n`
    : '';

  if (type === 'quote') {
    return `担当者様

突然のご連絡にて失礼いたします。
貴社にて掲載されている以下の物件を拝見し、大変魅力を感じてご連絡いたしました。

${propertyLines}

現在、転居先を探しており、内見を前向きに検討しております。
つきましては、以下についてご確認いただけますでしょうか。

1. こちらの物件は現在も募集中（空室）でしょうか。
2. 契約にかかる「初期費用の概算お見積もり」をご教示いただくことは可能でしょうか。
（敷金・礼金・仲介手数料・初回保証料・火災保険・鍵交換費用等の内訳が分かりますと幸いです）
${extraSection}
お忙しいところ恐縮ですが、ご返信のほど何卒よろしくお願い申し上げます。
`.trim();
  }

  if (type === 'discount') {
    return `担当者様

お世話になっております。
貴社にて掲載されている以下の物件について、内見および前向きに入居を検討しております。

${propertyLines}

立地や間取りが希望条件に非常に合致しており、ぜひお申し込みさせていただきたいと考えております。
その際、初期費用を少しでも抑えて契約できればと考えており、大変恐縮ながら「仲介手数料の割引（半額等のご相談）」や「フリーレント等の諸条件のご相談」が可能か伺うことはできますでしょうか。

条件面が合えば、速やかに内見および申込手続きを進めたいと考えております。
ご多忙中恐れ入りますが、ご検討いただけますと幸いです。
何卒よろしくお願い申し上げます。
`.trim();
  }

  if (type === 'foreigner') {
    return `担当者様

はじめまして。突然のご連絡失礼いたします。
貴社にて掲載されている以下の物件に大変関心があり、ご連絡させていただきました。

${propertyLines}

当方、外国籍（有効な在留資格あり・日本語でのコミュニケーションや日常会話に問題ございません）なのですが、こちらの物件は外国籍の入居申し込みおよび審査は可能でしょうか。

また、利用可能な賃貸保証会社等の指定や条件がございましたら、併せてご教示いただけますと幸いです。
${extraSection}
入居可能であれば、ぜひ日程を調整の上、内見にお伺いしたく存じます。
お手数をおかけいたしますが、ご確認のほど何卒よろしくお願い申し上げます。
`.trim();
  }

  return '';
}
