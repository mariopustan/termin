export enum ProductInterest {
  ENTERPRISE_API = 'enterprise_api',
  HR_PAYROLL_INTEGRATION = 'hr_payroll_integration',
  PORTALE = 'portale',
  PAYROLL_SCANNER = 'payroll_scanner',
  AI_ACT_TRAINING = 'ai_act_training',
  SMART_BAV = 'smart_bav',
  STRATEGISCHER_AUSTAUSCH = 'strategischer_austausch',
  IBS = 'ibs',
}

export const PRODUCT_LABELS: Record<ProductInterest, string> = {
  [ProductInterest.ENTERPRISE_API]: 'Enterprise API',
  [ProductInterest.HR_PAYROLL_INTEGRATION]: 'HR & Payroll Integration',
  [ProductInterest.PORTALE]: 'Mitarbeiter- & Arbeitgeberportal',
  [ProductInterest.PAYROLL_SCANNER]: 'Gehaltsabrechnungs-Scanner',
  [ProductInterest.AI_ACT_TRAINING]: 'EU AI Act Training',
  [ProductInterest.SMART_BAV]: 'smart!bAV',
  [ProductInterest.STRATEGISCHER_AUSTAUSCH]: 'Strategischer Austausch',
  [ProductInterest.IBS]: 'IBS | Insurance Business Server',
};

export const PRODUCT_DESCRIPTIONS: Record<ProductInterest, string> = {
  [ProductInterest.ENTERPRISE_API]:
    'Leistungsstarke API für nahtlose Systemintegration',
  [ProductInterest.HR_PAYROLL_INTEGRATION]:
    'Anbindung an über 200 HR- und Payroll-Systeme',
  [ProductInterest.PORTALE]:
    'Moderne Portale für Mitarbeiter und Arbeitgeber',
  [ProductInterest.PAYROLL_SCANNER]:
    'Intelligenter Scanner für Gehaltsabrechnungen',
  [ProductInterest.AI_ACT_TRAINING]:
    'KI-Kompetenzschulung nach EU AI Act Artikel 4',
  [ProductInterest.SMART_BAV]:
    'Ökosystem für betriebliche Vorsorge',
  [ProductInterest.STRATEGISCHER_AUSTAUSCH]:
    'Nutzen Sie unsere Erfahrung und Nähe zum Markt',
  [ProductInterest.IBS]:
    'Plattform für datensouveräne Bestandsverwaltung',
};

export interface BookingRequest {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  productInterest: ProductInterest;
  slotStart: string;
  consentGiven: boolean;
  message?: string;
}

export interface BookingResponse {
  data: {
    bookingId: string;
    status: string;
    slotStart: string;
    slotEnd: string;
    productInterest: ProductInterest;
    zoomJoinUrl: string;
  };
  message: string;
}

export interface CancellationInfo {
  data: {
    bookingId: string;
    status: string;
    slotStart: string;
    slotEnd: string;
    productInterest: ProductInterest;
    prospectName: string;
    dateFormatted: string;
  };
}
