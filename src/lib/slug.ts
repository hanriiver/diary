export function generateSlug(title: string): string {
  const encoded = encodeURIComponent(title.toLowerCase().trim())
  const cleaned = encoded
    .replace(/%[0-9A-Fa-f]{2}/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const suffix = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, '0')
  return `${cleaned || 'post'}-${suffix}`
}
