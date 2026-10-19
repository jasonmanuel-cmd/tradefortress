export const TRADE_CATEGORIES = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Roofing',
  'General contracting',
  'Landscaping',
  'Cleaning',
  'Junk removal',
  'Handyman',
  'Painting',
  'Concrete / masonry',
  'Other trade service',
] as const

export type TradeCategory = (typeof TRADE_CATEGORIES)[number]
