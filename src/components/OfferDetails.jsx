import { X, ExternalLink, MessageCircle, Activity, Layers3, Globe2 } from 'lucide-react'
import { offerStage } from '../lib/mining'

function Row({ label, children }) {
  return <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-zinc-800/70 py-3 text-sm"><span className="text-zinc-500">{label}</span><div className="min-w-0 text-zinc-200">{children}</div></div>
}

export default function OfferDetails({ item, onClose }) {
  if (!item) return null
  const metaDomain = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=${encodeURIComponent(item.domain)}&search_type=keyword_unordered`
  const metaTitle = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=${encodeURIComponent(item.title || item.domain)}&search_type=keyword_unordered`
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm" onMouseDown={onClose}>
    <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-5 py-4 backdrop-blur">
        <div><p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Ficha da oferta</p><h2 className="mt-1 font-bold">{item.title}</h2></div>
        <button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900"><X className="h-5 w-5" /></button>
      </div>
      <div className="p-5">
        <img src={`https://urlscan.io/screenshots/${item.id}.png`} className="aspect-video w-full rounded-xl border border-zinc-800 bg-zinc-900 object-cover object-top" />
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4">
          <Row label="Domínio"><span className="break-all">{item.domain}</span></Row>
          <Row label="Estrutura"><span className="inline-flex items-center gap-2"><Layers3 className="h-4 w-4 text-blue-400" />{offerStage(item)}</span></Row>
          <Row label="Score"><b className="text-emerald-300">{item.miningScore ?? item.score}/100</b></Row>
          <Row label="Recorrência"><span className="inline-flex items-center gap-2"><Activity className="h-4 w-4 text-amber-400" />{item.activityCount || 1} ocorrência(s) nesta coleta</span></Row>
          <Row label="URL"><span className="break-all text-xs">{item.offerUrl}</span></Row>
        </div>
        {item.whatsappMessage && <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-300"><MessageCircle className="h-4 w-4"/>Mensagem pré-preenchida</div><p className="whitespace-pre-wrap text-sm leading-relaxed">{item.whatsappMessage}</p></div>}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <a href={metaDomain} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-xs font-bold text-white hover:bg-blue-400">Meta: domínio <ExternalLink className="h-4 w-4"/></a>
          <a href={metaTitle} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-xs font-bold text-blue-300 hover:bg-blue-500/15">Meta: título <ExternalLink className="h-4 w-4"/></a>
          <a href={item.offerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-300">Abrir oferta <Globe2 className="h-4 w-4"/></a>
          <a href={`https://urlscan.io/result/${item.id}/`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-900">Ver no urlscan <ExternalLink className="h-4 w-4"/></a>
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-zinc-600">Recorrência significa quantas vezes o domínio apareceu nos resultados desta busca; não representa quantidade de anúncios ativos na Meta.</p>
      </div>
    </aside>
  </div>
}
