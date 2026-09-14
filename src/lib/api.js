async function parseResponse(response) {
  const text = await response.text()
  let data
  try { data = JSON.parse(text) } catch { data = { message: text } }
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Erro HTTP ${response.status}`)
    error.status = response.status
    error.payload = data
    throw error
  }
  return data
}

export async function searchUrlscan(query, apiKey, signal) {
  const params = new URLSearchParams({ action: 'search', q: query, size: '50' })
  const response = await fetch(`/api/urlscan?${params}`, {
    headers: apiKey ? { 'x-urlscan-key': apiKey } : {},
    signal,
  })
  return parseResponse(response)
}

export async function inspectUrlscan(id, apiKey, signal) {
  const params = new URLSearchParams({ action: 'inspect', id })
  const response = await fetch(`/api/urlscan?${params}`, {
    headers: apiKey ? { 'x-urlscan-key': apiKey } : {},
    signal,
  })
  return parseResponse(response)
}
