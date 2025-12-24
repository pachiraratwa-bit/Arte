
export type TemplateType = 'LIVE_MINIMAL' | 'LIVE_BANNER' | 'LIVE_SIDEBAR' | 'LIVE_FULL_PROMO';

export interface ClinicContent {
  headline: string;
  title: string;
  subtitle: string;
  promotion: string;
  mainImage: string;
  inset1: string; // Used for secondary product focus in live
  inset2: string; // Used for secondary product focus in live
  phone: string;
  lineId: string;
  registrationNo: string;
  price: string;
}

export interface GeneratedCaption {
  caption: string;
  hashtags: string[];
}
