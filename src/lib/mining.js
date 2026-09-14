export const MINING_MODES = [
  { id: 'all', label: 'Radar amplo' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'vsl', label: 'VSL / Vídeo' },
  { id: 'tracking', label: 'Pixel / Tracking' },
]

const modeQuery = {
  all: '(domain:api.whatsapp.com OR domain:wa.me OR domain:kiwify.com.br OR domain:pay.hotmart.com OR domain:kirvano.com OR domain:pandavideo.com OR domain:vturb.com.br)',
  whatsapp: '(domain:api.whatsapp.com OR domain:wa.me OR domain:whatsapp.com)',
  checkout: '(domain:kiwify.com.br OR domain:pay.hotmart.com OR domain:hotmart.com OR domain:kirvano.com OR domain:asaas.com OR domain:mercadopago.com.br)',
  vsl: '(domain:pandavideo.com OR domain:vturb.com.br OR domain:youtube.com OR domain:vimeo.com)',
  tracking: '(domain:connect.facebook.net OR domain:facebook.com OR domain:googletagmanager.com OR domain:google-analytics.com)',
}

export function buildMiningQuery({ days = 7, country = 'BR', mode = 'all', term = '' }) {
  const pieces = [`date:>now-${Number(days) || 7}d`]
  if (country) pieces.push(`page.country:${country}`)
  if (modeQuery[mode]) pieces.push(modeQuery[mode])

  const clean = String(term || '').trim().toLowerCase()
  if (clean) {
    const tokens = clean
      .replace(/[+\-=!(){}\[\]^"~*?:\\/<>|&]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4)
    if (tokens.length) {
      const clauses = tokens.map(token => `(filename:${token} OR page.domain:${token})`)
      pieces.push(clauses.join(' AND '))
    }
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
