import {useEffect,useMemo,useState} from 'react'
import {RefreshCw,ExternalLink,Search,Copy,Trash2,Target,Layers3,CalendarDays,Link2,Image as ImageIcon} from 'lucide-react'

const metaSearch=q=>`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(q)}&search_type=keyword_unordered`
const daysAgo=s=>{
 if(!s)return null;
 const m=s.match(/(\d{1,2}) de ([a-zç]+) de (\d{4})/i); if(!m)return null;
 const months={janeiro:0,fevereiro:1,'março':2,abril:3,maio:4,junho:5,julho:6,agosto:7,setembro:8,outubro:9,novembro:10,dezembro:11}
 const d=new Date(Number(m[3]),months[m[2].toLowerCase()],Number(m[1])); if(Number.isNaN(+d))return null;
 return Math.max(0,Math.floor((Date.now()-d.getTime())/86400000))
}
export default function MetaConnectedMiner(){
 const[connected,setConnected]=useState(false),[items,setItems]=useState([]),[term,setTerm]=useState(''),[filter,setFilter]=useState('')
 useEffect(()=>{
  const h=e=>{
   if(e.data?.type==='OFERTA_RADAR_EXTENSION_READY'){setConnected(true);window.postMessage({type:'OFERTA_RADAR_REQUEST_META_CAPTURES'},'*')}
   if(e.data?.type==='OFERTA_RADAR_META_CAPTURES'){setConnected(true);setItems(Array.isArray(e.data.payload)?e.data.payload:[])}
  }; window.addEventListener('message',h); window.postMessage({type:'OFERTA_RADAR_REQUEST_META_CAPTURES'},'*'); return()=>window.removeEventListener('message',h)
 },[])
 const grouped=useMemo(()=>{
  const q=filter.toLowerCase().trim(); const list=q?items.filter(x=>JSON.stringify(x).toLowerCase().includes(q)):items
  const m=new Map()
  for(const x of list){const key=x.pageName||x.destinations?.[0]||x.libraryId||x.captureId;const g=m.get(key)||{key,pageName:x.pageName||'Anunciante não identificado',ads:[],destinations:new Set(),images:new Set(),oldest:null};g.ads.push(x);(x.destinations||[]).forEach(v=>g.destinations.add(v));(x.images||[]).forEach(v=>g.images.add(v));const age=daysAgo(x.startDate);if(age!==null&&(g.oldest===null||age>g.oldest))g.oldest=age;m.set(key,g)}
  return [...m.values()].map(g=>({...g,destinations:[...g.destinations],images:[...g.images],score:Math.min(100,30+Math.min(30,g.ads.length*5)+(g.oldest?Math.min(25,g.oldest):0)+(g.destinations.size?10:0)+(g.images.size>=3?5:0))})).sort((a,b)=>b.score-a.score)
 },[items,filter])
 return <div>
  <section className="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/[.08] to-zinc-900/60 p-5">
   <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><div className="flex items-center gap-2"><Target className="h-5 w-5 text-blue-400"/><h2 className="text-lg font-bold">Caçador Meta Ads</h2><span className="rounded bg-blue-500/15 px-2 py-1 text-[10px] font-bold text-blue-300">FASE 5</span></div><p className="mt-2 max-w-3xl text-xs leading-relaxed text-zinc-400">Busca na Biblioteca oficial da Meta + captura automática dos anúncios visíveis pela extensão do Oferta Radar.</p></div><div className={`rounded-xl border px-3 py-2 text-xs font-bold ${connected?'border-emerald-400/20 bg-emerald-400/10 text-emerald-300':'border-amber-400/20 bg-amber-400/10 text-amber-300'}`}>{connected?'● Extensão conectada':'● Extensão não detectada'}</div></div>
   <div className="mt-5 grid gap-2 md:grid-cols-[1fr_auto_auto]"><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Ex.: emagrecimento, colágeno, renda extra..." className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-blue-400/50"/><a href={term.trim()?metaSearch(term.trim()):'#'} onClick={e=>{if(!term.trim())e.preventDefault()}} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-xs font-bold text-white"><Search className="h-4 w-4"/>Buscar na Meta</a><button onClick={()=>window.postMessage({type:'OFERTA_RADAR_REQUEST_META_CAPTURES'},'*')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-xs font-bold"><RefreshCw className="h-4 w-4"/>Sincronizar</button></div>
  </section>

  {!connected&&<div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[.05] p-5"><h3 className="font-semibold text-amber-300">Instale a extensão incluída no projeto</h3><p className="mt-2 text-xs leading-relaxed text-zinc-400">Chrome → Extensões → Modo do desenvolvedor → Carregar sem compactação → selecione a pasta <b>meta-captor-extension</b>. Depois atualize este dashboard.</p></div>}

  <div className="mt-5 grid gap-3 md:grid-cols-4">
   <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"><div className="text-2xl font-black">{items.length}</div><div className="mt-1 text-[10px] uppercase text-zinc-600">Anúncios capturados</div></div>
   <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"><div className="text-2xl font-black">{grouped.length}</div><div className="mt-1 text-[10px] uppercase text-zinc-600">Grupos / anunciantes</div></div>
   <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"><div className="text-2xl font-black">{grouped.filter(x=>x.score>=70).length}</div><div className="mt-1 text-[10px] uppercase text-zinc-600">Pistas quentes</div></div>
   <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"><div className="text-2xl font-black">{Math.max(0,...grouped.map(x=>x.oldest||0))}d</div><div className="mt-1 text-[10px] uppercase text-zinc-600">Maior longevidade</div></div>
  </div>

  <div className="mt-5 flex items-center justify-between gap-3"><div><h3 className="font-semibold">Ofertas encontradas</h3><p className="mt-1 text-xs text-zinc-500">Agrupadas automaticamente por anunciante.</p></div><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar capturas..." className="w-56 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"/></div>

  <div className="mt-3 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">{grouped.map(g=><article key={g.key} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
   {g.images[0]?<img src={g.images[0]} className="h-44 w-full object-cover" onError={e=>e.currentTarget.style.display='none'}/>:<div className="grid h-32 place-items-center bg-zinc-950 text-zinc-800"><ImageIcon className="h-8 w-8"/></div>}
   <div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Meta Ads</div><h4 className="mt-1 truncate font-bold">{g.pageName}</h4></div><div className={`rounded-lg px-2 py-1 text-xs font-black ${g.score>=70?'bg-emerald-400/10 text-emerald-300':g.score>=50?'bg-amber-400/10 text-amber-300':'bg-zinc-800 text-zinc-400'}`}>{g.score}</div></div>
    <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-zinc-950 p-2"><div className="font-bold">{g.ads.length}</div><div className="text-[9px] text-zinc-600">anúncios</div></div><div className="rounded-lg bg-zinc-950 p-2"><div className="font-bold">{g.images.length}</div><div className="text-[9px] text-zinc-600">criativos</div></div><div className="rounded-lg bg-zinc-950 p-2"><div className="font-bold">{g.oldest??'—'}{g.oldest!==null?'d':''}</div><div className="text-[9px] text-zinc-600">mais antigo</div></div></div>
    {g.ads[0]?.adText&&<p className="mt-3 line-clamp-4 text-xs leading-relaxed text-zinc-400">{g.ads[0].adText}</p>}
    {g.destinations[0]&&<div className="mt-3 flex items-center gap-2 truncate text-xs text-fuchsia-400"><Link2 className="h-3.5 w-3.5 shrink-0"/>{g.destinations[0]}</div>}
    <div className="mt-4 flex gap-2"><a href={metaSearch(g.pageName)} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-blue-500/10 px-3 py-2 text-center text-xs font-bold text-blue-300">Ver na Meta</a>{g.destinations[0]&&<a href={g.destinations[0]} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-400"><ExternalLink className="h-4 w-4"/></a>}</div>
   </div>
  </article>)}</div>
  {!grouped.length&&<div className="mt-3 rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-600">Nenhum anúncio capturado ainda. Pesquise na Meta, role a página para carregar resultados e clique em “Capturar anúncios visíveis”.</div>}
 </div>
}