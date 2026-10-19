const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value.trim())
}

export function normalizeUsPhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

/** Collapse whitespace and hard-cap length before anything is stored. */
export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

/** Multi-line text (notes, SMS bodies) keeps newlines but still caps length. */
export function cleanMultiline(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\r\n/g, '\n').trim().slice(0, maxLength)
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null
}

export function isStrongEnoughPassword(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 10 && value.length <= 200
}
