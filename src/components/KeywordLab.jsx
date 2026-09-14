import {useEffect,useMemo,useState} from 'react'
import {Search,TrendingUp,CalendarDays,ExternalLink,RefreshCw,Target,Copy} from 'lucide-react'

const BANK=[
['compre 1 leve 2','Oferta','evergreen',94],['frete grátis','Oferta','evergreen',91],['últimas unidades','Urgência','evergreen',86],
['garanta o seu','CTA','evergreen',83],['50% de desconto','Desconto','evergreen',88],['oferta por tempo limitado','Urgência','evergreen',85],
['pagamento na entrega','Produto físico','evergreen',92],['receba em casa','Produto físico','evergreen',78],['kit promocional','Oferta','evergreen',82],
['antes e depois','Transformação','evergreen',80],['resultado em 30 dias','Transformação','evergreen',76],['sem precisar','Mecanismo','evergreen',73],
['descubra como','Curiosidade','evergreen',79],['método exclusivo','Mecanismo','evergreen',77],['passo a passo','Educação','evergreen',70],
['assista até o final','VSL','evergreen',84],['aula gratuita','Lead/VSL','evergreen',75],['acesso imediato','Infoproduto','evergreen',79],
['chame no whatsapp','WhatsApp','evergreen',82],['peça pelo whatsapp','WhatsApp','evergreen',84],['clique no botão abaixo','CTA','evergreen',72],
['volta às aulas','Sazonal','jan-fev',88],['dia das mães','Sazonal','abr-mai',95],['dia dos namorados','Sazonal','mai-jun',94],
['festa junina','Sazonal','mai-jun',78],['dia dos pais','Sazonal','jul-ago',90],['dia das crianças','Sazonal','set-out',91],
['black friday','Sazonal','out-nov',99],['natal presente','Sazonal','nov-dez',98],['ano novo','Sazonal','dez-jan',87],
['verão','Sazonal','nov-fev',80],['emagrecimento','Nicho','jan-mar',88],['material escolar','Nicho','jan-fev',86],
['presente personalizado','Produto','abr-dez',87],['organizador','Produto','evergreen',76],['limpeza prática','Produto','evergreen',74],
['acessório automotivo','Produto','evergreen',80],['pet','Nicho','evergreen',79],['dor nas costas','Dor','evergreen',81],
['queda de cabelo','Dor','evergreen',82],['unhas fracas','Dor','evergreen',73],['sono','Dor','evergreen',76]
].map(([term,type,season,score])=>({term,type,season,score}))

const meta=t=>`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(t)}&search_type=keyword_unordered`
const trends=t=>`https://trends.google.com/trends/explore?geo=BR&q=${encodeURIComponent(t)}`
const month=new Date().getMonth()+1
function seasonNow(s){
 if(s==='evergreen')return true
 const map={'jan-fev':[1,2],'abr-mai':[4,5],'mai-jun':[5,6],'jul-ago':[7,8],'set-out':[9,10],'out-nov':[10,11],'nov-dez':[11,12],'dez-jan':[12,1],'nov-fev':[11,12,1,2],'jan-mar':[1,2,3],'abr-dez':[4,5,6,7,8,9,10,11,12]}
 return (map[s]||[]).includes(month)
}
export default function KeywordLab(){
 const[live,setLive]=useState([]),[loading,setLoading]=useState(false),[q,setQ]=useState(''),[type,setType]=useState('Todos')
 async function load(){setLoading(true);try{const r=await fetch('/api/trends');const d=await r.json();setLive(d.items||[])}catch{}finally{setLoading(false)}}
 useEffect(()=>{load()},[])
 const types=['Todos',...new Set(BANK.map(x=>x.type))]
 const rows=useMemo(()=>BANK.filter(x=>(type==='Todos'||x.type===type)&&(!q||x.term.toLowerCase().includes(q.toLowerCase()))).sort((a,b)=>(seasonNow(b.season)-seasonNow(a.season))||b.score-a.score),[q,type])
 return <div>
  <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[.08] to-zinc-900/60 p-5">
   <div className="flex items-center gap-2"><Target className="h-5 w-5 text-violet-400"/><h2 className="text-lg font-bold">Laboratório de Palavras-chave</h2><span className="rounded bg-violet-500/15 px-2 py-1 text-[10px] font-bold text-violet-300">FASE 5.6</span></div>
   <p className="mt-2 max-w-4xl text-xs leading-relaxed text-zinc-400">Descubra termos para minerar ofertas, combine intenção comercial + sazonalidade e valide interesse no Google Trends. O score abaixo é de utilidade para mineração — não é volume de busca nem garantia de venda.</p>
   <div className="mt-4 grid gap-2 md:grid-cols-[1fr_220px]"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar termo, ex.: desconto, whatsapp, natal..." className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm"/><select value={type} onChange={e=>setType(e.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm">{types.map(x=><option key={x}>{x}</option>)}</select></div>
  </section>

  <div className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
   <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Banco de termos para caça</h3><p className="mt-1 text-xs text-zinc-500">Prioriza termos comerciais e os que estão em janela sazonal agora.</p></div><span className="text-xs text-zinc-500">{rows.length} termos</span></div>
    <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-zinc-600"><tr><th className="py-2">Termo</th><th>Tipo</th><th>Sazonalidade</th><th>Radar</th><th></th></tr></thead><tbody>{rows.map(x=><tr key={x.term} className="border-t border-zinc-800"><td className="py-3 font-semibold">{x.term}</td><td><span className="rounded bg-zinc-800 px-2 py-1 text-[10px]">{x.type}</span></td><td className={seasonNow(x.season)?'text-emerald-300':'text-zinc-500'}>{x.season==='evergreen'?'Ano todo':x.season}{seasonNow(x.season)&&x.season!=='evergreen'?' • AGORA':''}</td><td><b className={x.score>=90?'text-emerald-300':x.score>=80?'text-blue-300':'text-zinc-300'}>{x.score}</b></td><td><div className="flex justify-end gap-1"><a href={meta(x.term)} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-500/10 px-2 py-1.5 text-blue-300">Meta</a><a href={trends(x.term)} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-500/10 px-2 py-1.5 text-emerald-300">Trends</a></div></td></tr>)}</tbody></table></div>
   </section>

   <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"><div className="flex items-center justify-between"><div><h3 className="flex items-center gap-2 font-semibold"><TrendingUp className="h-4 w-4 text-emerald-400"/>Em alta no Brasil</h3><p className="mt-1 text-xs text-zinc-500">Google Trends, para descobrir assuntos e derivações.</p></div><button onClick={load} className="rounded-lg border border-zinc-800 p-2 text-zinc-400"><RefreshCw className={`h-4 w-4 ${loading?'animate-spin':''}`}/></button></div>
    <div className="mt-3 space-y-2">{live.slice(0,15).map((x,i)=><div key={x.title} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"><div className="flex gap-2"><span className="text-zinc-700">{i+1}</span><div className="min-w-0 flex-1"><div className="font-semibold">{x.title}</div><div className="mt-1 text-[10px] text-zinc-600">{x.traffic||'Tendência ativa'}</div><div className="mt-2 flex gap-2"><a href={meta(x.title)} target="_blank" rel="noreferrer" className="text-[10px] text-blue-300">Buscar anúncios</a><a href={trends(x.title)} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-300">Estudar tendência</a></div></div></div></div>)}</div>
   </section>
  </div>

  <section className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[.04] p-5"><h3 className="flex items-center gap-2 font-semibold text-amber-200"><CalendarDays className="h-4 w-4"/>Radar sazonal</h3><p className="mt-2 text-xs leading-relaxed text-zinc-400">Use a sazonalidade como antecipação: comece a minerar 30–60 dias antes do pico. Em setembro, por exemplo, vale observar Dia das Crianças e começar Black Friday/Natal; não espere a semana do evento para descobrir a oferta.</p></section>
 </div>
}