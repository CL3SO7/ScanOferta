import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, Bookmark, Filter, KeyRound, Radar, Search, ShieldCheck, Sparkles, X, SlidersHorizontal } from 'lucide-react'
import OfferCard from './components/OfferCard'
import SkeletonCard from './components/SkeletonCard'
import StatsBar from './components/StatsBar'
import OfferDetails from './components/OfferDetails'
import MetaHunt from './components/MetaHunt'
import OfferAnalyzer from './components/OfferAnalyzer'
import OfferLibrary from './components/OfferLibrary'
import InvestigationCenter from './components/InvestigationCenter'
import ValidatedMarket from './components/ValidatedMarket'
import DiscoveryEngine from './components/DiscoveryEngine'
import MetaInbox from './components/MetaInbox'
import KeywordLab from './components/KeywordLab'
import { inspectUrlscan, searchUrlscan } from './lib/api'
import { mergeInspection, normalizeResult } from './lib/scoring'
import { loadApiKey, loadFavorites, saveApiKey, saveFavorites } from './lib/storage'
import { buildFallbackQuery, buildMiningQuery, decorateActivity, MINING_MODES, miningScore } from './lib/mining'

const PRESETS = [
  { label: 'Radar Brasil provável', query: 'date:>now-30d AND ((domain:kiwify.com.br OR domain:pay.hotmart.com OR domain:kirvano.com OR domain:asaas.com OR domain:mercadopago.com.br) OR (page.language:pt AND (domain:api.whatsapp.com OR domain:wa.me OR domain:pandavideo.com OR domain:vturb.com.br)))' },
  { label: 'WhatsApp PT', query: 'date:>now-30d AND page.language:pt AND (domain:api.whatsapp.com OR domain:wa.me OR domain:whatsapp.com)' },
  { label: 'Checkout Brasil', query: 'date:>now-30d AND (domain:kiwify.com.br OR domain:pay.hotmart.com OR domain:hotmart.com OR domain:kirvano.com OR domain:asaas.com OR domain:mercadopago.com.br)' },
  { label: 'VSL em português', query: 'date:>now-30d AND page.language:pt AND (domain:pandavideo.com OR domain:vturb.com.br OR domain:youtube.com OR domain:vimeo.com)' },
]

function friendlyError(error) {
  if (error?.status === 429) return 'O urlscan atingiu o limite de requisições. Reduza a frequência das buscas ou use sua API Key.'
  if (error?.status === 401 || error?.status === 403) return 'A consulta foi recusada pelo urlscan. Confira sua API Key.'
  return error?.message || 'Não foi possível concluir a busca.'
}

export default function App() {
  const [query, setQuery] = useState(PRESETS[0].query)
  const [results, setResults] = useState([])
  const [favorites, setFavorites] = useState(() => loadFavorites())
  const [apiKey, setApiKeyState] = useState(() => loadApiKey())
  const [apiDraft, setApiDraft] = useState(() => loadApiKey())
  const [tab, setTab] = useState('mine')
  const [engine, setEngine] = useState('inbox')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [showKey, setShowKey] = useState(false)
  const [inspectingIds, setInspectingIds] = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState('all')
  const [days, setDays] = useState(7)
  const [term, setTerm] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [signalFilter, setSignalFilter] = useState('all')
  const [sort, setSort] = useState('score')
  const controllerRef = useRef(null)

  useEffect(() => saveFavorites(favorites), [favorites])

  const preparedResults = useMemo(() => decorateActivity(results).map(x => ({ ...x, miningScore: miningScore(x) })), [results])
  const preparedFavorites = useMemo(() => decorateActivity(favorites).map(x => ({ ...x, miningScore: miningScore(x) })), [favorites])

  const displayed = useMemo(() => {
    let source = tab === 'favorites' ? preparedFavorites : preparedResults
    source = source.filter(x => (x.miningScore ?? x.score ?? 0) >= minScore)
    if (signalFilter !== 'all') source = source.filter(x => Boolean(x.signals?.[signalFilter]))
    const copy = [...source]
    if (sort === 'score') copy.sort((a,b) => (b.miningScore ?? b.score) - (a.miningScore ?? a.score))
    if (sort === 'activity') copy.sort((a,b) => (b.activityCount || 1) - (a.activityCount || 1))
    if (sort === 'recent') copy.sort((a,b) => new Date(b.task?.time || b.task?.date || 0) - new Date(a.task?.time || a.task?.date || 0))
    if (sort === 'domain') copy.sort((a,b) => a.domain.localeCompare(b.domain))
    return copy
  }, [tab, preparedResults, preparedFavorites, minScore, signalFilter, sort])

  const favoriteIds = useMemo(() => new Set(favorites.map(x => x.id)), [favorites])

  function toggleFavorite(item) {
    setFavorites(current => current.some(x => x.id === item.id) ? current.filter(x => x.id !== item.id) : [{ ...item }, ...current])
  }
  function updateEverywhere(id, updater) {
    setResults(current => current.map(x => x.id === id ? updater(x) : x))
    setFavorites(current => current.map(x => x.id === id ? updater(x) : x))
    setSelected(current => current?.id === id ? updater(current) : current)
  }

  async function enrichItems(items, signal) {
    if (!apiKey) return
    const queue = items.filter(x => x.id).slice(0, 50)
    let cursor = 0
    async function worker() {
      while (cursor < queue.length && !signal.aborted) {
        const item = queue[cursor++]
        setInspectingIds(set => new Set(set).add(item.id))
        try {
          const inspection = await inspectUrlscan(item.id, apiKey, signal)
          updateEverywhere(item.id, old => mergeInspection(old, inspection))
        } catch (e) {
          if (e?.name !== 'AbortError') {
            updateEverywhere(item.id, old => ({ ...old, inspected: true, inspectError: e.status === 429 ? 'Limite da análise profunda atingido.' : 'Detalhes indisponíveis.' }))
            if (e?.status === 429) return
          }
        } finally {
          setInspectingIds(set => { const next = new Set(set); next.delete(item.id); return next })
        }
      }
    }
    await Promise.all([worker(), worker(), worker()])
  }

  async function runSearch(nextQuery = query) {
    const q = String(nextQuery || '').trim()
    if (!q) return setError('Digite uma query para pesquisar.')
    controllerRef.current?.abort()
    const controller = new AbortController(); controllerRef.current = controller
    setLoading(true); setError(''); setTab('mine'); setResults([]); setTotal(0)
    try {
      const data = await searchUrlscan(q, apiKey, controller.signal)
      const items = (data?.results || []).map(normalizeResult).filter(x => x.id)
      setResults(items); setTotal(data?.total ?? items.length); setLoading(false)
      if (apiKey && items.length) enrichItems(items, controller.signal)
    } catch (e) {
      if (e?.name !== 'AbortError') setError(friendlyError(e))
      setLoading(false)
    }
  }

  async function mineNow() {
    const primary = buildMiningQuery({ days, mode, term })
    const fallback = buildFallbackQuery({ days, mode, term })
    setQuery(primary)

    controllerRef.current?.abort()
    const controller = new AbortController(); controllerRef.current = controller
    setLoading(true); setError(''); setTab('mine'); setResults([]); setTotal(0)
    try {
      let data = await searchUrlscan(primary, apiKey, controller.signal)
      let usedFallback = false
      if (!(data?.results || []).length && fallback !== primary) {
        data = await searchUrlscan(fallback, apiKey, controller.signal)
        usedFallback = true
        setQuery(fallback)
      }
      const items = (data?.results || []).map(normalizeResult).filter(x => x.id)
      setResults(items); setTotal(data?.total ?? items.length); setLoading(false)
      if (usedFallback && items.length) setError('A busca Brasil/português estava estreita; ampliei automaticamente para uma janela de 30+ dias e infraestrutura do funil.')
      if (!items.length) setError('Nenhum scan encontrado. Tente sem palavra-chave, aumente o período para 30/90 dias ou troque o tipo de funil. O urlscan não é uma biblioteca de anúncios e só encontra páginas que foram escaneadas.')
      if (apiKey && items.length) enrichItems(items, controller.signal)
    } catch (e) {
      if (e?.name !== 'AbortError') setError(friendlyError(e))
      setLoading(false)
    }
  }
  function usePreset(preset) { setQuery(preset.query); runSearch(preset.query) }
  function storeKey() { const key = apiDraft.trim(); saveApiKey(key); setApiKeyState(key); setShowKey(false) }

  return <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,.07),transparent_28%)] bg-zinc-950 text-zinc-100">
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 shadow-neon"><Radar className="h-5 w-5 text-emerald-400" /></div><div><h1 className="font-bold tracking-tight">Oferta Radar</h1><p className="text-[11px] text-zinc-500">inteligência de ofertas & operações</p></div></div>
      </div>
    </header>

    <main className="mx-auto max-w-[1700px] px-4 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-1.5 shadow-xl shadow-black/10">
        <button onClick={()=>setEngine('keywords')} className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${engine==='keywords'?'bg-zinc-100 text-zinc-950 shadow':'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}>Oportunidades</button>
        <button onClick={()=>setEngine('inbox')} className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${engine==='inbox'?'bg-zinc-100 text-zinc-950 shadow':'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}>Caixa de Entrada</button>
        <button onClick={()=>setEngine('investigation')} className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${engine==='investigation'?'bg-zinc-100 text-zinc-950 shadow':'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}>Central de Investigação</button><button onClick={()=>setEngine('validated')} className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${engine==='validated'?'bg-zinc-100 text-zinc-950 shadow':'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}>Mercado Validado</button><button onClick={()=>setEngine('discovery')} className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${engine==='discovery'?'bg-emerald-400 text-zinc-950 shadow':'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}>⚡ Descoberta</button>
        <button onClick={()=>setEngine('analyzer')} className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${engine==='analyzer'?'bg-zinc-100 text-zinc-950 shadow':'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}>Analisar Oferta</button>
        <button onClick={()=>setEngine('web')} className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${engine==='web'?'bg-zinc-100 text-zinc-950 shadow':'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}>Web Radar</button>
        <button onClick={()=>setEngine('library')} className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${engine==='library'?'bg-zinc-100 text-zinc-950 shadow':'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}>Minhas Ofertas</button>
      </div>
      {engine==='keywords' && <KeywordLab/>}
      {engine==='inbox' && <MetaInbox/>}
      {engine==='investigation' && <InvestigationCenter/>}
      {engine==='validated' && <ValidatedMarket/>}
      {engine==='discovery' && <DiscoveryEngine/>}
      {engine==='analyzer' && <OfferAnalyzer/>}
      
      {engine==='library' && <OfferLibrary/>}
      {engine==='web' && <>
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-2xl shadow-black/20">
        <div className="border-b border-zinc-800 px-4 py-4 lg:px-5"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-400"/><h2 className="font-semibold">Minerador V1</h2><span className="rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">WEB RADAR</span></div><p className="mt-1 text-xs text-zinc-500">Encontre páginas conectadas a WhatsApp, checkout, VSL e tracking. Brasil é inferido por idioma e infraestrutura — não pelo país do servidor.</p></div>
        <div className="grid gap-3 p-4 lg:grid-cols-[1.2fr_.65fr_.65fr_1fr_auto] lg:p-5">
          <div><label className="mb-1.5 block text-[11px] font-semibold text-zinc-500">PALAVRA / PISTA OPCIONAL</label><input value={term} onChange={e => setTerm(e.target.value)} placeholder="ex: emagrecimento, desconto, curso..." className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm outline-none focus:border-emerald-400/50" /></div>
          <div><label className="mb-1.5 block text-[11px] font-semibold text-zinc-500">TIPO DE FUNIL</label><select value={mode} onChange={e => setMode(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm outline-none">{MINING_MODES.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
          <div><label className="mb-1.5 block text-[11px] font-semibold text-zinc-500">PERÍODO</label><select value={days} onChange={e => setDays(Number(e.target.value))} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm outline-none"><option value={1}>24 horas</option><option value={3}>3 dias</option><option value={7}>7 dias</option><option value={14}>14 dias</option><option value={30}>30 dias</option><option value={90}>90 dias</option></select></div>
          <div><label className="mb-1.5 block text-[11px] font-semibold text-zinc-500">PAÍS</label><div className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-300">🇧🇷 Brasil provável <span className="text-zinc-600">(idioma/infra)</span></div></div>
          <button onClick={mineNow} disabled={loading} className="self-end inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-bold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60">{loading ? <Activity className="h-4 w-4 animate-pulse"/> : <Search className="h-4 w-4"/>} Minerar</button>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-zinc-800 px-4 py-3 lg:px-5">{PRESETS.map(p => <button key={p.label} onClick={() => usePreset(p)} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-[11px] font-medium text-zinc-400 hover:border-emerald-400/30 hover:text-emerald-300">{p.label}</button>)}</div>
      </section>

      <details className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40"><summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-zinc-500">Configurações avançadas do urlscan</summary><div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3"><div><div className="text-xs font-semibold text-zinc-300">Análise profunda do urlscan</div><div className="mt-1 text-[10px] text-zinc-600">{apiKey?'API Key configurada — detalhes extras habilitados.':'Opcional. A busca principal funciona sem chave; ela serve apenas para enriquecer resultados do urlscan.'}</div></div><button onClick={()=>setShowKey(true)} className="rounded-lg border border-zinc-700 px-3 py-2 text-[10px] font-bold text-zinc-400">{apiKey?'Gerenciar chave':'Configurar chave opcional'}</button></div><div className="flex flex-col gap-3 border-t border-zinc-800 p-4 lg:flex-row"><textarea value={query} onChange={e => setQuery(e.target.value)} rows={2} spellCheck={false} className="min-h-[52px] flex-1 resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-xs text-zinc-300 outline-none focus:border-emerald-400/50"/><button onClick={() => runSearch()} className="rounded-xl border border-emerald-400/30 px-5 py-3 text-xs font-bold text-emerald-300">Executar query</button></div></details>

      {!apiKey && <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-500/[0.07] px-4 py-3 text-xs leading-relaxed text-blue-200">Sem API Key você pode obter a busca básica, mas a leitura profunda de Pixel, links de saída, VSL e mensagem do WhatsApp fica limitada.</div>}
      {error && <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="mt-5"><StatsBar items={tab === 'favorites' ? preparedFavorites : preparedResults}/></div>

      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="inline-flex w-fit rounded-xl border border-zinc-800 bg-zinc-900 p-1"><button onClick={() => setTab('mine')} className={`rounded-lg px-4 py-2 text-xs font-semibold ${tab === 'mine' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>Ofertas encontradas</button><button onClick={() => setTab('favorites')} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold ${tab === 'favorites' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}><Bookmark className="h-3.5 w-3.5"/> Salvas ({favorites.length})</button></div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 text-xs"><SlidersHorizontal className="ml-1 h-4 w-4 text-zinc-500"/><select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2"><option value={0}>Score: todos</option><option value={40}>Score ≥ 40</option><option value={70}>Score ≥ 70</option></select><select value={signalFilter} onChange={e => setSignalFilter(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2"><option value="all">Sinal: todos</option><option value="whatsapp">WhatsApp</option><option value="tracker">Pixel/Analytics</option><option value="checkout">Checkout</option><option value="campaign">UTM</option><option value="video">VSL/Vídeo</option></select><select value={sort} onChange={e => setSort(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2"><option value="score">Ordenar: score</option><option value="activity">Recorrência</option><option value="recent">Mais recentes</option><option value="domain">Domínio</option></select></div>
      </div>

      {tab === 'mine' && !loading && results.length > 0 && <div className="mt-3 text-right text-[11px] text-zinc-600"><b className="text-zinc-400">{displayed.length}</b> exibidos • {total.toLocaleString('pt-BR')} correspondências no urlscan</div>}
      {loading ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)}</div> : displayed.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{displayed.map(item => <OfferCard key={item.id} item={item} favorite={favoriteIds.has(item.id)} onFavorite={toggleFavorite} inspecting={inspectingIds.has(item.id)} onDetails={setSelected}/>)}</div> : <div className="mt-16 text-center text-zinc-600"><Radar className="mx-auto mb-3 h-9 w-9"/><p className="text-sm">{tab === 'favorites' ? 'Nenhuma oferta salva ainda.' : 'Configure o minerador e clique em Minerar.'}</p></div>}
      </>}
    </main>

    <OfferDetails item={selected} onClose={() => setSelected(null)}/>
    {showKey && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="font-bold">API Key do urlscan.io</h2><p className="mt-1 text-xs text-zinc-500">Necessária para análise profunda.</p></div><button onClick={() => setShowKey(false)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900"><X className="h-4 w-4"/></button></div><input type="password" value={apiDraft} onChange={e => setApiDraft(e.target.value)} className="mt-5 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-emerald-400/50" placeholder="Cole sua API Key" autoFocus/><p className="mt-2 text-[11px] leading-relaxed text-zinc-600"><ShieldCheck className="mr-1 inline h-3 w-3"/>A chave fica no localStorage deste navegador e é encaminhada ao proxy Vercel.</p><div className="mt-5 flex gap-2"><button onClick={() => {setApiDraft(''); saveApiKey(''); setApiKeyState(''); setShowKey(false)}} className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-400">Remover</button><button onClick={storeKey} className="flex-1 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-zinc-950">Salvar</button></div></div></div>}
  </div>
}
