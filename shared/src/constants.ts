export const BIHAR_DISTRICTS = [
  'Patna',
  'Gaya',
  'Muzaffarpur',
  'Bhagalpur',
  'Darbhanga',
  'Purnia',
  'Begusarai',
  'Arrah (Bhojpur)',
  'Bihar Sharif (Nalanda)',
  'Katihar',
  'Munger',
  'Chhapra (Saran)',
  'Samastipur',
  'Saharsa',
  'Sasaram (Rohtas)',
  'Motihari (East Champaran)',
  'Bettiah (West Champaran)',
  'Siwan',
  'Buxar',
  'Vaishali (Hajipur)',
  'Sitamarhi',
  'Gopalganj',
  'Madhubani',
  'Kishanganj',
  'Aurangabad',
  'Nawada',
  'Jehanabad',
  'Jamui'
] as const;

export const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding (Baraat & Vidai)' },
  { id: 'reception', label: 'Wedding Reception' },
  { id: 'engagement', label: 'Engagement / Ring Ceremony' },
  { id: 'tilak', label: 'Tilak / Sangeet / Mehendi' },
  { id: 'religious', label: 'Religious / Pilgrimage' },
  { id: 'corporate_family', label: 'Corporate / Family Event' },
] as const;

export const DEFAULT_PLATFORM_SETTINGS = {
  advance_payment_percentage: '25',
  platform_commission_percentage: '10',
  hold_duration_minutes: '60',
  cancellation_policy: 'Full refund if cancelled 7 days prior. 50% refund if cancelled 3-6 days prior. No refund within 48 hours.',
  support_phone: '+91 98765 43210',
  support_email: 'support@shaadiyatra.in',
  currency_symbol: '₹',
};
