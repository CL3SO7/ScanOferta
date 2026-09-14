import {useEffect,useMemo,useState} from 'react'
import {BadgeCheck,BookOpen,ExternalLink,Flame,RefreshCw,Search,ShieldCheck,TrendingUp,Layers3,Clock3} from 'lucide-react'

const META=t=>`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(t)}&search_type=keyword_unordered`
const TRENDS=t=>`https://trends.google.com/trends/explore?geo=BR&q=${encodeURIComponent(t)}`
const INFOS=[
 {name:'Cursos de ferramentas práticas',angle:'Ensinar uma habilidade útil com resultado concreto',queries:['curso excel','curso canva','curso inteligência artificial','curso edição de vídeo','curso tráfego pago'],why:'Boa escalabilidade quando existe transformação clara, demonstração e ticket compatível.'},
 {name:'Planilhas, templates e sistemas',angle:'Produto simples, entrega imediata e alta margem',queries:['planilha pronta','template canva','planilha financeira','planilha de precificação','sistema para pequenos negócios'],why:'Baixo custo de entrega e fácil criação de bundles/upsells.'},
 {name:'Idiomas e aprendizado',angle:'Dor recorrente + progresso mensurável',queries:['curso inglês','inglês do zero','espanhol online','aprender inglês rápido'],why:'Mercado evergreen; procure operações com muitos criativos e longa duração.'},
 {name:'Carreira e concursos',angle:'Desejo econômico/profissional forte',queries:['curso concurso','curso preparação concurso','currículo profissional','entrevista de emprego'],why:'Boa intenção de compra, mas evite promessas garantidas de aprovação ou renda.'},
 {name:'Hobbies monetizáveis',angle:'Aprender + produzir algo vendável',queries:['curso confeitaria','curso crochê','curso unhas','curso artesanato','curso fotografia celular'],why:'Une habilidade prática e possibilidade de renda sem depender de promessa financeira agressiva.'},
 {name:'Organização e produtividade',angle:'Resolver rotina, tempo e método',queries:['método produtividade','curso organização','planner digital','notion template'],why:'Funciona melhor quando a oferta demonstra método e entrega tangível.'},
 {name:'Relacionamento e desenvolvimento pessoal',angle:'Dor emocional ampla',queries:['curso relacionamento','desenvolvimento pessoal','comunicação no relacionamento'],why:'Mercado grande, mas exige cuidado com claims e qualidade da promessa.'},
 {name:'Fitness e bem-estar não médico',angle:'Rotina, treino e hábitos',queries:['programa de treino','treino em casa','desafio fitness','receitas saudáveis'],why:'Prefira ofertas de hábito/treino e evite promessas médicas ou resultados milagrosos.'}
]

function domainOf(x){try{return new URL(x.destinations?.[0]||'').hostname.replace(/^www\./,'')}catch{return''}}
function productName(x){
 const d=domainOf(x)
 if(x.pageName&&x.pageName!=='Anunciante não identificado')return x.pageName
 return d||'Oferta sem nome'
}
function infoSignals(x){
 const blob=((x.adText||'')+' '+(x.destinations||[]).join(' ')).toLowerCase()
 const checkout=/hotmart|kiwify|kirvano|perfectpay|monetizze|eduzz/.test(blob)
 const education=/curso|aula|método|metodo|treinamento|mentoria|ebook|e-book|planilha|template|acesso imediato|aprenda|passo a passo/.test(blob)
 const vsl=x.hasVideo||/vturb|pandavideo/.test(blob)
 return {checkout,education,vsl,isInfo:checkout||education||vsl}
}
function evidence(g,dossier){
 const count=g.ads.length,days=g.maxDays,vars=g.variants,queries=g.queries.size,media=g.images.size
 let score=0
 score+=days>=90?28:days>=60?25:days>=30?21:days>=14?15:days>=7?8:0
 score+=count>=8?18:count>=5?15:count>=3?10:count>=2?6:0
 score+=vars>=12?14:vars>=7?11:vars>=4?8:vars>=2?4:0
 score+=media>=6?10:media>=4?8:media>=2?4:0
 score+=queries>=4?12:queries>=3?9:queries>=2?5:0
 if(g.ads.some(x=>x.checkout))score+=5
 if(g.ads.some(x=>x.hasVideo))score+=5
 if(dossier?.checkouts?.length)score+=5
 if(dossier?.tech?.metaPixel)score+=3
 return Math.min(100,score)
}
function status(s){
 if(s>=80)return {label:'Validação forte',cls:'text-emerald-300 bg-emerald-400/10 border-emerald-400/20'}
 if(s>=60)return {label:'Promissora',cls:'text-blue-300 bg-blue-400/10 border-blue-400/20'}
 if(s>=40)return {label:'Em observação',cls:'text-amber-300 bg-amber-400/10 border-amber-400/20'}
 return {label:'Evidência insuficiente',cls:'text-zinc-500 bg-zinc-900 border-zinc-800'}
}
export default function ValidatedMarket(){
 const[items,setItems]=useState([]),[q,setQ]=useState(''),[kind,setKind]=useState('all'),[tab,setTab]=useState('validated')
 const[dossiers]=useState(()=>{try{return JSON.parse(localStorage.getItem('ofertaRadarDossiers')||'{}')}catch{return{}}})
 useEffect(()=>{const h=e=>{if(e.data?.type==='OFERTA_RADAR_INBOX')setItems(e.data.payload||[])};window.addEventListener('message',h);window.postMessage({type:'OFERTA_RADAR_REQUEST_INBOX'},'*');return()=>window.removeEventListener('message',h)},[])
 const groups=useMemo(()=>{
  const map=new Map()
  for(const x of items){
   const key=(domainOf(x)||x.pageName||x.libraryId||'').toLowerCase()
   if(!map.has(key))map.set(key,{key,name:productName(x),ads:[],queries:new Set(),images:new Set(),maxDays:0,variants:0,info:false})
   const g=map.get(key);g.ads.push(x);if(x.searchQuery)g.queries.add(x.searchQuery);(x.images||[]).forEach(i=>g.images.add(i));g.maxDays=Math.max(g.maxDays,x.days||0);g.variants+=x.metaVariants||1;if(infoSignals(x).isInfo)g.info=true
  }
  return [...map.values()].map(g=>{
    const d=g.ads.map(a=>dossiers[a.captureId]).find(Boolean)
    const score=evidence(g,d)
    return {...g,dossier:d,score,status:status(score),queries:[...g.queries],images:[...g.images],domain:domainOf(g.ads[0])}
  }).filter(g=>(kind==='all'||(kind==='info'?g.info:!g.info))&&(!q||JSON.stringify(g).toLowerCase().includes(q.toLowerCase()))).sort((a,b)=>b.score-a.score)
 },[items,dossiers,q,kind])
 const strong=groups.filter(x=>x.score>=80)
 const promising=groups.filter(x=>x.score>=60&&x.score<80)
 return <div>
  <section className="rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-emerald-950/25 via-zinc-900/75 to-zinc-950 p-6 shadow-2xl shadow-black/20">
   <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10"><BadgeCheck className="h-5 w-5 text-emerald-300"/></div><div><h2 className="text-xl font-bold tracking-tight">Mercado Validado</h2><p className="text-[11px] text-zinc-500">operações com evidência de continuidade e escala</p></div></div><p className="mt-4 max-w-4xl text-sm leading-relaxed text-zinc-400">Aqui não chamamos algo de “vende muito” sem dado de faturamento. O Radar classifica operações pela força dos sinais observáveis: tempo no ar, recorrência, variações, diversidade criativa, reaparecimento em pesquisas e estrutura do funil.</p></div>
   <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1 text-xs"><button onClick={()=>setTab('validated')} className={`rounded-lg px-3 py-2 ${tab==='validated'?'bg-emerald-400 text-zinc-950':'text-zinc-500'}`}>Validadas observadas</button><button onClick={()=>setTab('discover')} className={`rounded-lg px-3 py-2 ${tab==='discover'?'bg-zinc-100 text-zinc-950':'text-zinc-500'}`}>Descobrir infoprodutos</button></div></div>
  </section>

  {tab==='validated'&&<>
   <div className="mt-5 grid gap-3 md:grid-cols-4"><div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 p-4"><div className="text-2xl font-black">{groups.length}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">operações observadas</div></div><div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[.04] p-4"><div className="text-2xl font-black text-emerald-300">{strong.length}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">validação forte</div></div><div className="rounded-2xl border border-blue-400/15 bg-blue-400/[.04] p-4"><div className="text-2xl font-black text-blue-300">{promising.length}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">promissoras</div></div><div className="rounded-2xl border border-zinc-800 bg-zinc-900/55 p-4"><div className="text-2xl font-black">{groups.filter(x=>x.info).length}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">infoprodutos prováveis</div></div></div>
   <div className="mt-4 flex flex-col gap-2 md:flex-row"><div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4"><Search className="h-4 w-4 text-zinc-600"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar operação, domínio ou palavra encontrada..." className="w-full bg-transparent py-3 text-sm outline-none"/></div><select value={kind} onChange={e=>setKind(e.target.value)} className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"><option value="all">Todos os tipos</option><option value="info">Só infoprodutos prováveis</option><option value="physical">Só produtos físicos prováveis</option></select></div>
   <div className="mt-4 grid gap-4 xl:grid-cols-2">{groups.map(g=><article key={g.key} className="rounded-2xl border border-zinc-800 bg-zinc-900/55 p-5"><div className="flex gap-4">{g.images[0]&&<img src={g.images[0]} className="h-24 w-28 rounded-xl object-cover"/>}<div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><span className={`inline-flex rounded-lg border px-2 py-1 text-[10px] font-bold ${g.status.cls}`}>{g.status.label}</span><h3 className="mt-2 truncate text-base font-bold">{g.name}</h3><div className="mt-1 text-[10px] text-zinc-600">{g.info?'Infoproduto provável':'Produto/operação'}{g.domain?` • ${g.domain}`:''}</div></div><div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-2xl font-black">{g.score}</div></div>
   <div className="mt-4 grid grid-cols-5 gap-2 text-center"><div><b>{g.maxDays||'—'}</b><div className="text-[9px] text-zinc-600">dias</div></div><div><b>{g.ads.length}</b><div className="text-[9px] text-zinc-600">capturas</div></div><div><b>{g.variants}</b><div className="text-[9px] text-zinc-600">variações</div></div><div><b>{g.images.length}</b><div className="text-[9px] text-zinc-600">mídias</div></div><div><b>{g.queries.length}</b><div className="text-[9px] text-zinc-600">pesquisas</div></div></div></div></div>
   <div className="mt-4 rounded-xl bg-zinc-950/70 p-3 text-[11px] leading-relaxed text-zinc-400">{g.score>=80?'Sinal forte de operação sustentada: combine longevidade, repetição e renovação antes de investir.':g.score>=60?'Há sinais suficientes para investigar o funil e acompanhar se novos anúncios aparecem.':'Ainda faltam evidências; mantenha em observação antes de tratar como oportunidade.'}</div>
   {g.queries.length>0&&<div className="mt-3 flex flex-wrap gap-1">{g.queries.slice(0,6).map(x=><span key={x} className="rounded bg-zinc-950 px-2 py-1 text-[9px] text-zinc-500">{x}</span>)}</div>}
   <div className="mt-4 flex gap-2"><a href={META(g.name)} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-blue-500/10 px-3 py-2.5 text-center text-xs font-bold text-blue-300">Pesquisar operação na Meta</a>{g.ads[0]?.destinations?.[0]&&<a href={g.ads[0].destinations[0]} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-800 px-3 py-2.5 text-zinc-400"><ExternalLink className="h-4 w-4"/></a>}</div></article>)}</div>
   {!groups.length&&<div className="mt-5 rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-600">Ainda não há operações suficientes para validar. Selecione anúncios interessantes na extensão; o Mercado Validado vai ficando mais confiável conforme você coleta evidências.</div>}
  </>}

  {tab==='discover'&&<>
   <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[.04] p-4 text-xs leading-relaxed text-zinc-400"><b className="text-amber-200">Como usar:</b> escolha um arquétipo, pesquise 2–3 termos na Meta, carregue alguns lotes e envie apenas operações com boa longevidade/variações. Depois elas entram automaticamente na área “Validadas observadas”.</div>
   <div className="mt-4 grid gap-4 xl:grid-cols-2">{INFOS.map(x=><article key={x.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/55 p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400">Infoproduto escalável • hipótese</div><h3 className="mt-1 text-lg font-bold">{x.name}</h3></div><BookOpen className="h-5 w-5 text-zinc-700"/></div><p className="mt-3 text-xs text-zinc-400">{x.angle}</p><p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{x.why}</p><div className="mt-4 flex flex-wrap gap-1.5">{x.queries.map(q=><a key={q} href={META(q)} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-[10px] text-blue-300">{q}</a>)}</div><div className="mt-4 flex gap-2"><a href={META(x.queries[0])} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-blue-500 px-3 py-2.5 text-center text-xs font-bold text-white">Minerar na Meta</a><a href={TRENDS(x.queries[0])} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-800 px-3 py-2.5 text-xs font-bold text-emerald-300">Trends</a></div></article>)}</div>
  </>}
 </div>
}