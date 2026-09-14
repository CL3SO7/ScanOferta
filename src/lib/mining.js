export const MINING_MODES = [
  { id: 'all', label: 'Radar amplo' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'vsl', label: 'VSL / Vídeo' },
  { id: 'tracking', label: 'Pixel / Tracking' },
]

const brazilCheckout = '(domain:kiwify.com.br OR domain:pay.hotmart.com OR domain:hotmart.com OR domain:kirvano.com OR domain:asaas.com OR domain:mercadopago.com.br)'
const whatsapp = '(domain:api.whatsapp.com OR domain:wa.me OR domain:whatsapp.com)'
const video = '(domain:pandavideo.com OR domain:vturb.com.br OR domain:youtube.com OR domain:youtu.be OR domain:vimeo.com)'
const tracking = '(domain:connect.facebook.net OR domain:facebook.com OR domain:googletagmanager.com OR domain:google-analytics.com)'

// page.country is the GeoIP country of the page server, NOT the target market.
// A Brazilian offer hosted on Vercel/Cloudflare/AWS can therefore be US/DE/etc.
// For discovery we use Portuguese-language signals and Brazil-heavy commerce infrastructure instead.
const modeQuery = {
  all: `(${brazilCheckout} OR (page.language:pt AND (${whatsapp} OR ${video})))`,
  whatsapp: `(page.language:pt AND ${whatsapp})`,
  checkout: brazilCheckout,
  vsl: `(page.language:pt AND ${video})`,
  tracking: `(page.language:pt AND ${tracking})`,
}

function cleanTokens(term) {
  return String(term || '')
    .trim()
    .toLowerCase()
    .replace(/[+\-=!(){}\[\]^"~*?:\\/<>|&]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
}

export function buildMiningQuery({ days = 7, mode = 'all', term = '' }) {
  const pieces = [`date:>now-${Number(days) || 7}d`]
  if (modeQuery[mode]) pieces.push(modeQuery[mode])

  const tokens = cleanTokens(term)
  if (tokens.length) {
    // Free Search API cannot search full page text. Title, URL/filename and domain are public fields.
    // OR across words is intentional: requiring every word makes discovery too brittle.
    const tokenClauses = tokens.map(token => `(page.title:${token} OR filename:${token} OR page.domain:${token} OR task.url:${token})`)
    pieces.push(`(${tokenClauses.join(' OR ')})`)
  }
  return pieces.join(' AND ')
}

export function buildFallbackQuery({ days = 7, mode = 'all', term = '' }) {
  const tokens = cleanTokens(term)
  const infra = mode === 'checkout' ? brazilCheckout
    : mode === 'whatsapp' ? whatsapp
      : mode === 'vsl' ? video
        : mode === 'tracking' ? tracking
          : `(${brazilCheckout} OR ${whatsapp} OR ${video})`
  const pieces = [`date:>now-${Math.max(Number(days) || 7, 30)}d`, infra]
  if (tokens.length) {
    const clauses = tokens.map(token => `(page.title:${token} OR filename:${token} OR page.domain:${token} OR task.url:${token})`)
    pieces.push(`(${clauses.join(' OR ')})`)
  }
  return pieces.join(' AND ')
}

export function decorateActivity(items) {
  const counts = new Map()
  for (const item of items) counts.set(item.domain, (counts.get(item.domain) || 0) + 1)
  return items.map((item) => ({ ...item, activityCount: counts.get(item.domain) || 1 }))
}

export function miningScore(item) {
  let score = Number(item.score || 0)
  const activity = Number(item.activityCount || 1)
  if (activity >= 5) score += 15
  else if (activity >= 3) score += 10
  else if (activity >= 2) score += 5
  return Math.min(100, score)
}

export function offerStage(item) {
  const s = item?.signals || {}
  if (s.checkout && s.video && s.tracker) return 'Funil estruturado'
  if (s.checkout && s.tracker) return 'Venda direta'
  if (s.whatsapp && s.tracker) return 'WhatsApp performance'
  if (s.video) return 'VSL / conteúdo'
  if (s.checkout) return 'Checkout detectado'
  if (s.whatsapp) return 'Captação WhatsApp'
  return 'Em investigação'
}
