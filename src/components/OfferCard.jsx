import { ExternalLink, Heart, LoaderCircle, MessageCircle, Search, Video, Activity, Eye } from 'lucide-react'
import ScoreBadge from './ScoreBadge'
import { offerStage } from '../lib/mining'

function SignalBadge({ active, children }) {
  if (!active) return null
  return <span className="rounded-md border border-zinc-700 bg-zinc-900/90 px-2 py-1 text-[11px] font-medium text-zinc-200">{children}</span>
}

export default function OfferCard({ item, favorite, onFavorite, inspecting, onDetails }) {
  const screenshot = item.id ? `https://urlscan.io/screenshots/${item.id}.png` : ''
  const metaUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=${encodeURIComponent(item.domain)}&search_type=keyword_unordered`
  const score = item.miningScore ?? item.score

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-zinc-700">
      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
        {screenshot ? <img src={screenshot} alt={`Screenshot de ${item.title}`} className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.015]" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} /> : null}
        <div className={`${screenshot ? 'hidden' : ''} absolute inset-0 grid place-items-center bg-gradient-to-br from-zinc-900 to-slate-950 text-zinc-600`}><div className="text-center"><Search className="mx-auto mb-2" /><p className="text-xs">Screenshot indisponível</p></div></div>
        <button onClick={() => onFavorite(item)} className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/60 p-2 backdrop-blur hover:bg-black/80" title={favorite ? 'Remover dos favoritos' : 'Salvar'}><Heart className={`h-4 w-4 ${favorite ? 'fill-emerald-400 text-emerald-400' : 'text-white'}`} /></button>
        {(item.activityCount || 1) > 1 && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-lg border border-amber-400/20 bg-black/75 px-2 py-1 text-[10px] font-bold text-amber-300 backdrop-blur"><Activity className="h-3 w-3" /> {item.activityCount}x nesta coleta</span>}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><h3 className="line-clamp-2 font-semibold text-zinc-100">{item.title}</h3><p className="mt-1 truncate text-xs text-zinc-500">{item.domain}</p><p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">{offerStage(item)}</p></div>
          <ScoreBadge score={score} />
        </div>

        <div className="flex min-h-7 flex-wrap gap-1.5">
          <SignalBadge active={item.signals.whatsapp}>WhatsApp</SignalBadge>
          <SignalBadge active={item.signals.tracker}>Pixel/Analytics</SignalBadge>
          <SignalBadge active={item.signals.checkout}>Checkout</SignalBadge>
          <SignalBadge active={item.signals.campaign}>UTM</SignalBadge>
          <SignalBadge active={item.signals.video}><span className="inline-flex items-center gap-1"><Video className="h-3 w-3" /> VSL</span></SignalBadge>
        </div>

        {item.whatsappMessage && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3"><div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300"><MessageCircle className="h-3.5 w-3.5" /> Mensagem do WhatsApp</div><p className="line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">{item.whatsappMessage}</p></div>}
        {!item.inspected && inspecting && <div className="flex items-center gap-2 text-xs text-zinc-500"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Analisando funil…</div>}
        {item.inspectError && <p className="text-xs text-amber-400">{item.inspectError}</p>}

        <button onClick={() => onDetails(item)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-xs font-semibold text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900"><Eye className="h-3.5 w-3.5" /> Investigar oferta</button>
        <div className="grid grid-cols-2 gap-2">
          <a href={metaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-400/20 bg-blue-500/10 px-2 py-2.5 text-[11px] font-semibold text-blue-300 hover:bg-blue-500/15">Meta Ads <ExternalLink className="h-3 w-3" /></a>
          <a href={item.offerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-2 py-2.5 text-[11px] font-bold text-zinc-950 hover:bg-emerald-300">Abrir oferta <ExternalLink className="h-3 w-3" /></a>
        </div>
      </div>
    </article>
  )
}
