import {useMemo,useState} from 'react'
import {Brain,Search,Copy,ExternalLink,Sparkles,Target} from 'lucide-react'
const META=t=>`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(t)}&search_type=keyword_unordered`
const TRENDS=t=>`https://trends.google.com/trends/explore?geo=BR&q=${encodeURIComponent(t)}`
const INTENTS=[
 ['Oferta direta',['compre agora','garanta o seu','por apenas','oferta especial','últimas unidades']],
 ['Infoproduto',['acesso imediato','curso online','método','treinamento','passo a passo','aula gratuita']],
 ['Preço',['R$ 27','R$ 47','R$ 67','R$ 97','R$ 147','R$ 197','12x de']],
 ['Conversão',['clique em saiba mais','garantia de 7 dias','inscrições abertas','últimas vagas','comece hoje']],
 ['Mecanismo',['sem precisar','mesmo que você','descubra como','aprenda como','em poucos minutos']],
 ['Prova/transformação',['resultado','transformação','antes e depois','depoimento','alunos']]
]
const NICHE={
 'emagrecimento':['treino em casa','receitas saudáveis','desafio fitness','programa de treino','hábitos saudáveis'],
 'renda extra':['curso confeitaria','curso crochê','curso canva','curso edição de vídeo','planilha de precificação'],
 'beleza':['curso unhas','curso maquiagem','cuidado com cabelo','skincare','autocuidado'],
 'relacionamento':['curso relacionamento','comunicação no relacionamento','reconquistar relacionamento','desenvolvimento pessoal'],
 'marketing digital':['curso tráfego pago','curso canva','curso instagram','curso inteligência artificial','social media'],
 'concurso':['curso concurso','preparação concurso','apostila concurso','método de estudos','cronograma de estudos'],
 'inglês':['curso inglês','inglês do zero','inglês online','aprender inglês','conversação inglês'],
 'culinária':['curso confeitaria','receitas lucrativas','bolo no pote','curso doces','curso salgados'],
 'pet':['adestramento cachorro','curso banho e tosa','produto para cachorro','acessório pet'],
 'organização':['planner digital','planilha financeira','notion template','organização pessoal','produtividade']
}
function norm(x){return x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function build(niche){
 const n=niche.trim();if(!n)return[]
 const base=NICHE[norm(n)]||[n,`curso ${n}`,`método ${n}`,`${n} online`,`${n} passo a passo`]
 const out=[]
 for(const b of base){
  out.push({term:b,type:'Nicho',reason:'Busca ampla para descobrir anunciantes e produtos.'})
  out.push({term:`${b} acesso imediato`,type:'Infoproduto',reason:'Tende a encontrar ofertas digitais com entrega imediata.'})
  out.push({term:`${b} por apenas`,type:'Preço',reason:'Procura copy de venda com preço/oferta.'})
  out.push({term:`${b} garantia`,type:'Conversão',reason:'Procura funis com mecanismo de redução de risco.'})
 }
 return out.slice(0,20)
}
export default function KeywordLab(){
 const[niche,setNiche]=useState(''),[generated,setGenerated]=useState([])
 const suggestions=useMemo(()=>generated,[generated])
 function generate(){setGenerated(build(niche))}
 return <div>
  <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-violet-950/30 via-zinc-900/80 to-zinc-950 p-6 shadow-2xl shadow-black/20">
   <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-violet-400/20 bg-violet-400/10"><Brain className="h-5 w-5 text-violet-300"/></div><div><h2 className="text-xl font-bold">Laboratório de Busca</h2><p className="text-[11px] text-zinc-500">transforme um nicho em pesquisas úteis para a Biblioteca da Meta</p></div></div>
   <p className="mt-4 max-w-4xl text-sm leading-relaxed text-zinc-400">Em vez de mostrar oportunidades genéricas, diga <b className="text-zinc-200">o mercado que você quer investigar</b>. O Radar gera combinações para encontrar oferta, preço, mecanismo, curso e sinais de conversão.</p>
   <div className="mt-5 flex flex-col gap-2 md:flex-row"><div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4"><Search className="h-4 w-4 text-zinc-600"/><input value={niche} onChange={e=>setNiche(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()} placeholder="Ex.: emagrecimento, inglês, concurso, beleza, culinária..." className="w-full bg-transparent py-3.5 text-sm outline-none"/></div><button onClick={generate} className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold text-white">Gerar buscas</button></div>
   <div className="mt-3 flex flex-wrap gap-1.5">{Object.keys(NICHE).map(x=><button key={x} onClick={()=>{setNiche(x);setGenerated(build(x))}} className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[10px] text-zinc-500 hover:text-zinc-200">{x}</button>)}</div>
  </section>
  {suggestions.length>0&&<><div className="mt-5 flex items-end justify-between"><div><h3 className="font-bold">Buscas sugeridas para “{niche}”</h3><p className="mt-1 text-xs text-zinc-500">Abra uma busca e ligue o ⚡ Motor de Descoberta na extensão.</p></div><div className="text-xs text-zinc-600">{suggestions.length} combinações</div></div><div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{suggestions.map((x,i)=><article key={x.term} className="rounded-2xl border border-zinc-800 bg-zinc-900/55 p-4"><div className="flex items-start justify-between"><div><span className="text-[9px] font-bold uppercase tracking-wider text-violet-400">{x.type}</span><h4 className="mt-1 font-semibold">{x.term}</h4></div><span className="text-[10px] text-zinc-700">#{i+1}</span></div><p className="mt-2 text-[10px] leading-relaxed text-zinc-500">{x.reason}</p><div className="mt-4 flex gap-2"><a href={META(x.term)} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-blue-500/10 px-2 py-2 text-center text-[10px] font-bold text-blue-300">Buscar na Meta</a><a href={TRENDS(x.term)} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-800 px-2 py-2 text-[10px] text-emerald-300">Trends</a></div></article>)}</div></>}
  {!suggestions.length&&<section className="mt-5"><h3 className="text-sm font-bold">Estratégias que o gerador combina</h3><div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{INTENTS.map(([name,terms])=><div key={name} className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-4"><b className="text-xs">{name}</b><div className="mt-3 flex flex-wrap gap-1">{terms.map(t=><span key={t} className="rounded bg-zinc-950 px-2 py-1 text-[9px] text-zinc-500">{t}</span>)}</div></div>)}</div></section>}
 </div>
}