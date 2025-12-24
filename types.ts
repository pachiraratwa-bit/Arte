
export type TemplateType = 'STYLE_1' | 'STYLE_2' | 'STYLE_3' | 'LIVE';

export interface ClinicContent {
  headline: string;
  title: string;
  subtitle: string;
  promotion: string;
  mainImage: string;
  inset1: string;
  inset2: string;
  phone: string;
  lineId: string;
  registrationNo: string;
}

export interface GeneratedCaption {
  caption: string;
  hashtags: string[];
}
