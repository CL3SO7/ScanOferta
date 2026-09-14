const checkoutTerms = ['kiwify', 'hotmart', 'asaas', 'kirvano', 'mercadopago']
const videoTerms = ['pandavideo', 'vturb', 'youtube', 'youtu.be', 'vimeo']
const trackerTerms = ['fbevents.js', 'facebook.com/tr', 'meta pixel', 'pixel', 'google-analytics', 'googletagmanager', 'analytics']
const campaignTerms = ['utm_source', 'fbclid', 'gclid']
const whatsappTerms = ['api.whatsapp.com', 'wa.me', 'whatsapp.com/send', 'whatsapp']

function containsAny(text, terms) {
  const source = String(text || '').toLowerCase()
  return terms.some((term) => source.includes(term))
}

export function extractBaseSignals(result) {
  const raw = JSON.stringify(result || {}).toLowerCase()
  return {
    whatsapp: containsAny(raw, whatsappTerms),
    tracker: containsAny(raw, trackerTerms),
    campaign: containsAny(raw, campaignTerms),
    checkout: containsAny(raw, checkoutTerms),
    video: containsAny(raw, videoTerms),
  }
}

export function calculateScore(signals) {
  let score = 0
  if (signals?.whatsapp) score += 35
  if (signals?.tracker) score += 25
  if (signals?.campaign) score += 20
  if (signals?.checkout) score += 10
  if (signals?.video) score += 10
  return Math.min(100, score)
}

export function getDomain(result) {
  const candidate = result?.page?.domain || result?.task?.domain || result?.page?.url || result?.task?.url || ''
  try {
    const normalized = candidate.includes('://') ? candidate : `https://${candidate}`
    return new URL(normalized).hostname.replace(/^www\./, '')
  } catch {
    return String(candidate).replace(/^www\./, '').split('/')[0]
  }
}

export function getOfferUrl(result) {
  return result?.page?.url || result?.task?.url || '#'
}

export function getTitle(result) {
  return result?.page?.title || getDomain(result) || 'Oferta sem título'
}

export function normalizeResult(result) {
  const id = result?._id || result?.task?.uuid || result?.task?.id
  const baseSignals = extractBaseSignals(result)
  return {
    ...result,
    id,
    domain: getDomain(result),
    offerUrl: getOfferUrl(result),
    title: getTitle(result),
    signals: baseSignals,
    score: calculateScore(baseSignals),
    whatsappMessage: '',
    inspected: false,
    inspectError: '',
  }
}

export function mergeInspection(item, inspection) {
  const signals = {
    whatsapp: item.signals.whatsapp || Boolean(inspection?.signals?.whatsapp),
    tracker: item.signals.tracker || Boolean(inspection?.signals?.tracker),
    campaign: item.signals.campaign || Boolean(inspection?.signals?.campaign),
    checkout: item.signals.checkout || Boolean(inspection?.signals?.checkout),
    video: item.signals.video || Boolean(inspection?.signals?.video),
  }
  return {
    ...item,
    signals,
    score: calculateScore(signals),
    whatsappMessage: inspection?.whatsappMessage || item.whatsappMessage || '',
    inspected: true,
    inspectError: '',
  }
}
