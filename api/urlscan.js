const URLSCAN_BASE = 'https://urlscan.io'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Urlscan-Key')
}

function send(res, status, body) {
  res.status(status).json(body)
}

function collectStrings(root, limit = 30000) {
  const out = []
  const stack = [root]
  const seen = new Set()

  while (stack.length && out.length < limit) {
    const value = stack.pop()
    if (typeof value === 'string') {
      out.push(value)
      continue
    }
    if (!value || typeof value !== 'object') continue
    if (seen.has(value)) continue
    seen.add(value)
    if (Array.isArray(value)) {
      for (let i = value.length - 1; i >= 0; i--) stack.push(value[i])
    } else {
      for (const child of Object.values(value)) stack.push(child)
    }
  }
  return out
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term))
}

function decodeMaybe(value) {
  let current = String(value || '')
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(current.replace(/\+/g, ' '))
      if (next === current) break
      current = next
    } catch { break }
  }
  return current
}

function whatsappMessageFromStrings(strings) {
  const candidates = strings.filter((s) => /(?:wa\.me|api\.whatsapp\.com|whatsapp\.com\/send)/i.test(s) && /(?:[?&](?:text|message)=)/i.test(s))
  for (const candidate of candidates) {
    try {
      const normalized = candidate.startsWith('//') ? `https:${candidate}` : candidate
      const url = new URL(normalized)
      const text = url.searchParams.get('text') || url.searchParams.get('message')
      if (text) return decodeMaybe(text).trim()
    } catch {
      const match = candidate.match(/[?&](?:text|message)=([^&#]+)/i)
      if (match?.[1]) return decodeMaybe(match[1]).trim()
    }
  }
  return ''
}

function inspectResult(data) {
  const strings = collectStrings(data)
  const combined = strings.join('\n').toLowerCase()
  const signals = {
    whatsapp: hasAny(combined, ['api.whatsapp.com', 'wa.me', 'whatsapp.com/send', 'whatsapp']),
    tracker: hasAny(combined, ['fbevents.js', 'facebook.com/tr', 'meta pixel', 'pixel', 'google-analytics', 'googletagmanager', 'analytics']),
    campaign: hasAny(combined, ['utm_source', 'fbclid', 'gclid']),
    checkout: hasAny(combined, ['kiwify', 'hotmart', 'asaas', 'kirvano', 'mercadopago']),
    video: hasAny(combined, ['pandavideo', 'vturb', 'youtube', 'youtu.be', 'vimeo']),
  }
  return {
    signals,
    whatsappMessage: whatsappMessageFromStrings(strings),
  }
}

async function urlscanFetch(path, apiKey) {
  const headers = {
    'User-Agent': 'OfertaRadar/1.0 (+dashboard integration)',
    Accept: 'application/json',
  }
  if (apiKey) headers['api-key'] = apiKey

  const response = await fetch(`${URLSCAN_BASE}${path}`, { headers, redirect: 'follow' })
  const text = await response.text()
  let payload
  try { payload = JSON.parse(text) } catch { payload = { message: text || response.statusText } }

  if (!response.ok) {
    const message = payload?.message || payload?.description || payload?.error || `urlscan respondeu HTTP ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }
  return payload
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return send(res, 405, { message: 'Método não permitido.' })

  const apiKey = String(req.headers['x-urlscan-key'] || '').trim()
  const { action = 'search' } = req.query

  try {
    if (action === 'search') {
      const q = String(req.query.q || '').trim()
      const size = Math.min(Math.max(Number(req.query.size || 50), 1), 50)
      if (!q) return send(res, 400, { message: 'Informe uma query de busca.' })
      const params = new URLSearchParams({ q, size: String(size) })
      const data = await urlscanFetch(`/api/v1/search/?${params}`, apiKey)
      return send(res, 200, data)
    }

    if (action === 'inspect') {
      const id = String(req.query.id || '').trim()
      if (!id) return send(res, 400, { message: 'ID do scan ausente.' })
      if (!apiKey) return send(res, 401, { message: 'A análise profunda precisa de uma API Key do urlscan.' })
      const data = await urlscanFetch(`/api/v1/result/${encodeURIComponent(id)}/`, apiKey)
      return send(res, 200, inspectResult(data))
    }

    return send(res, 400, { message: 'Ação inválida.' })
  } catch (error) {
    if (error.status === 429) {
      return send(res, 429, { message: 'Limite de requisições do urlscan atingido. Aguarde um pouco ou use sua API Key.' })
    }
    if (error.status === 401 || error.status === 403) {
      return send(res, error.status, { message: 'O urlscan recusou a autenticação. Confira sua API Key.' })
    }
    return send(res, error.status || 500, { message: error.message || 'Falha ao consultar o urlscan.' })
  }
}
