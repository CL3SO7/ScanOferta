import {useEffect,useMemo,useState} from 'react'
import {BrainCircuit,Search,Target,Zap,ExternalLink,Lightbulb,PackageCheck,Flame,ChevronDown} from 'lucide-react'

const META=t=>`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(t)}&search_type=keyword_unordered`
const TRENDS=t=>`https://trends.google.com/trends/explore?geo=BR&q=${encodeURIComponent(t)}`
const NORM=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')

const LIB={
 'manicure':[
  ['Agenda vazia / poucos clientes','Ter uma agenda previsível sem depender só de indicação',['Sistema de captação local','Pacote de conteúdo que gera agendamento','Follow-up de WhatsApp','Programa de indicação'],['agenda cheia manicure','como conseguir clientes manicure','clientes nail designer','lotar agenda manicure'],94,'Aquisição'],
  ['Cliente pergunta preço e some','Converter mais conversas em agendamentos',['Roteiro de atendimento','Catálogo/portfólio de conversão','Follow-up automático','Página de orçamento'],['cliente pergunta preço e some manicure','orçamento manicure whatsapp','agendamento nail designer'],88,'Conversão'],
  ['Não sabe quanto cobrar','Cobrar com segurança e preservar margem',['Calculadora de preço','Planilha de custos','Sistema de precificação'],['precificação manicure','quanto cobrar unha','planilha manicure preço'],84,'Margem'],
 ],
 'pequenos negocios':[
  ['Não consegue clientes suficientes','Gerar procura constante e previsível',['Gerador de campanhas locais','Sistema de leads + WhatsApp','Google/Meta Ads simplificado','Programa de indicação'],['como conseguir clientes','atrair clientes negócio local','clientes pelo whatsapp','anúncio negócio local'],95,'Aquisição'],
  ['Vende, mas não sabe se lucra','Saber margem e preço mínimo antes de vender',['Calculadora de margem','Precificador inteligente','Painel financeiro simples'],['como calcular margem','precificação pequeno negócio','calculadora preço de venda'],92,'Margem'],
  ['Perde orçamentos no WhatsApp','Transformar mais conversas em vendas',['CRM simples','Follow-up automático','Scripts de resposta','Lembrete de orçamento'],['follow up whatsapp vendas','cliente pediu orçamento sumiu','crm whatsapp pequeno negócio'],91,'Conversão'],
  ['Não consegue produzir conteúdo','Ter conteúdo que gere procura sem perder horas',['Gerador de conteúdo','Calendário inteligente','Templates por segmento'],['conteúdo para empresa','posts prontos instagram negócio','ia conteúdo empresa'],78,'Produtividade'],
 ],
 'ingles':[
  ['Entende palavras mas trava para falar','Conseguir conversar sem traduzir mentalmente',['Treino guiado de conversação','Simulador com IA','Rotina diária de fala'],['destravar inglês','falar inglês sem travar','conversação inglês método'],94,'Transformação'],
  ['Estuda e esquece','Reter vocabulário e usar no cotidiano',['Sistema de repetição','Microlições contextuais','Desafios diários'],['como memorizar inglês','inglês todo dia','método vocabulário inglês'],86,'Aprendizado'],
 ],
 'concurso':[
  ['Estuda muito e não sabe o que priorizar','Saber exatamente o que estudar a cada dia',['Cronograma adaptativo','Mapa de incidência','Planner de revisão'],['cronograma concurso','o que estudar concurso','método revisão concurso'],92,'Clareza'],
  ['Não consegue manter constância','Criar uma rotina sustentável até a prova',['Sistema de metas','Planner inteligente','Comunidade/desafio'],['constância estudos concurso','rotina concurso','como estudar todo dia concurso'],82,'Consistência'],
 ],
 'culinaria':[
  ['Produz, mas não sabe precificar','Saber preço, margem e rendimento de cada receita',['Calculadora de ficha técnica','Precificador de receitas','Planilha de produção'],['precificação confeitaria','ficha técnica confeitaria','quanto cobrar bolo'],94,'Margem'],
  ['Sabe fazer, mas não consegue vender','Transformar habilidade em pedidos recorrentes',['Sistema de cardápio + vendas','Campanhas locais','Kit de divulgação'],['como vender doces','clientes confeitaria','pedidos confeitaria whatsapp'],90,'Aquisição'],
 ],
 'beleza':[
  ['Tem habilidade mas agenda instável','Conseguir clientes recorrentes',['Sistema de aquisição local','Campanhas de retorno','Programa de indicação'],['agenda cheia beleza','clientes estética','atrair clientes salão'],93,'Aquisição'],
  ['Cliente não retorna','Aumentar frequência e recompra',['CRM de retorno','Lembretes automáticos','Clube de fidelidade'],['fidelizar clientes salão','cliente voltar estética','recompra beleza'],87,'Retenção'],
 ],
 'pet':[
  ['Cão puxa muito no passeio','Ter passeios tranquilos e controláveis',['Treino passo a passo','Programa guiado','Acompanhamento por vídeo'],['cachorro puxa guia','como passear cachorro sem puxar','adestramento passeio'],88,'Comportamento'],
  ['Tutor não consegue educar em casa','Resolver comportamentos sem depender sempre de treinador',['Programa de treino doméstico','Rotina personalizada','App de acompanhamento'],['adestrar cachorro em casa','cachorro não obedece','treino cachorro'],89,'Comportamento'],
 ],
 'organizacao':[
  ['Dinheiro acaba e não sabe para onde foi','Enxergar gastos e chegar ao fim do mês no controle',['App de registro rápido','Planilha automática','Bot financeiro no WhatsApp'],['não sei onde gasto dinheiro','controle gastos whatsapp','organizar finanças mês'],95,'Controle'],
  ['Tem tarefas demais e esquece coisas','Saber o que fazer agora sem sobrecarga',['Planejador inteligente','Assistente de rotina','Sistema de prioridades'],['organizar rotina','não consigo organizar tarefas','planejamento diário'],86,'Produtividade'],
 ],
}

const GENERIC=[
 ['Não consegue clientes suficientes','Ter demanda previsível',['Sistema de aquisição','Automação de prospecção','Ferramenta de indicação'],['como conseguir clientes','atrair clientes','clientes pelo whatsapp'],92,'Aquisição'],
 ['Perde tempo em tarefa repetitiva','Fazer em minutos o que hoje leva horas',['Automação','Software simples','Templates inteligentes'],['automatizar rotina','ganhar tempo','fazer mais rápido'],82,'Eficiência'],
 ['Não sabe qual decisão tomar','Ter clareza e uma recomendação objetiva',['Calculadora','Diagnóstico interativo','Checklist inteligente'],['como escolher','qual melhor','calculadora'],78,'Clareza'],
 ['Não consegue manter constância','Executar sem depender de motivação',['App de acompanhamento','Desafio guiado','Sistema de lembretes'],['como ter constância','manter rotina','não consigo manter'],76,'Consistência'],
]

function keyFor(q){
 const n=NORM(q)
 if(/manicure|nail/.test(n))return'manicure'
 if(/pequeno|empresa|negocio|empreendedor/.test(n))return'pequenos negocios'
 if(/ingles|idioma/.test(n))return'ingles'
 if(/concurso/.test(n))return'concurso'
 if(/culin|confeit|doce|bolo/.test(n))return'culinaria'
 if(/beleza|salao|estet/.test(n))return'beleza'
 if(/pet|cachorro|cao/.test(n))return'pet'
 if(/organiz|financ|produtiv/.test(n))return'organizacao'
 return null
}
function vehicle(sol){
 const s=NORM(sol.join(' '))
 if(/calculadora|precific|diagnostico/.test(s))return['🔥 Ferramenta/Calculadora','Resultado imediato, pouco esforço do comprador.']
 if(/crm|automacao|app|sistema|bot/.test(s))return['🔥 Software/Sistema','A dor é recorrente; ferramenta tende a entregar valor continuamente.']
 if(/treino|programa|metodo|rotina|cronograma/.test(s))return['🟢 Programa guiado','A solução exige mudança de comportamento e acompanhamento.']
 return['🟢 Kit prático','Entrega operacional é mais atraente do que conteúdo abstrato.']
}
export default function PainSolutionMap(){
 const[q,setQ]=useState(''),[market,setMarket]=useState(''),[inbox,setInbox]=useState([]),[open,setOpen]=useState(0)
 useEffect(()=>{const h=e=>e.data?.type==='OFERTA_RADAR_INBOX'&&setInbox(e.data.payload||[]);window.addEventListener('message',h);window.postMessage({type:'OFERTA_RADAR_REQUEST_INBOX'},'*');return()=>window.removeEventListener('message',h)},[])
 const pains=useMemo(()=>{if(!market)return[];const k=keyFor(market),base=LIB[k]||GENERIC;return base.map((x,i)=>{const [pain,want,solutions,searches,score,cat]=x;const blob=JSON.stringify(inbox).toLowerCase();const hits=searches.reduce((n,s)=>n+(blob.includes(NORM(s).split(' ')[0])?1:0),0);const [format,why]=vehicle(solutions);return{pain,want,solutions,searches,score:Math.min(99,score+Math.min(5,hits)),cat,format,why,hits}})},[market,inbox])
 function go(){if(q.trim()){setMarket(q.trim());setOpen(0)}}
 return <div>
  <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-rose-950/25 via-zinc-900/80 to-zinc-950 p-6 shadow-2xl shadow-black/20">
   <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-rose-400/20 bg-rose-400/10"><BrainCircuit className="h-5 w-5 text-rose-300"/></div><div><h2 className="text-xl font-bold">Mapa de Dores & Soluções</h2><p className="text-[11px] text-zinc-500">comece pelo problema que alguém paga para resolver — não pelo formato do produto</p></div></div>
   <p className="mt-4 max-w-4xl text-sm leading-relaxed text-zinc-400">Digite um público, nicho ou problema. O Radar decompõe <b className="text-zinc-200">dor → resultado desejado → soluções vendáveis → formato de entrega → pesquisas para validar na Meta</b>.</p>
   <div className="mt-5 flex flex-col gap-2 md:flex-row"><div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4"><Search className="h-4 w-4 text-zinc-600"/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Ex.: manicures, pequenos negócios, inglês, confeitaria..." className="w-full bg-transparent py-3.5 text-sm outline-none"/></div><button onClick={go} className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white">Mapear dores</button></div>
   <div className="mt-3 flex flex-wrap gap-1.5">{['manicures','pequenos negócios','inglês','concurso','confeitaria','beleza','pet','organização financeira'].map(x=><button key={x} onClick={()=>{setQ(x);setMarket(x);setOpen(0)}} className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[10px] text-zinc-500 hover:text-zinc-200">{x}</button>)}</div>
  </section>

  {!market&&<div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"><Target className="h-5 w-5 text-rose-300"/><b className="mt-3 block text-sm">1. Encontre a dor</b><p className="mt-2 text-xs text-zinc-500">Problema frequente, caro, urgente ou emocional.</p></div><div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"><Lightbulb className="h-5 w-5 text-amber-300"/><b className="mt-3 block text-sm">2. Venda o resultado</b><p className="mt-2 text-xs text-zinc-500">O comprador quer a mudança, não “um ebook”.</p></div><div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"><Zap className="h-5 w-5 text-emerald-300"/><b className="mt-3 block text-sm">3. Valide no mercado</b><p className="mt-2 text-xs text-zinc-500">Pesquise a linguagem da dor e deixe o Motor de Descoberta coletar evidências.</p></div></div>}

  {market&&<><div className="mt-5 flex items-end justify-between"><div><div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Mapa comercial</div><h3 className="mt-1 text-lg font-bold">{market}</h3></div><div className="text-xs text-zinc-600">{pains.length} dores priorizadas</div></div>
  <div className="mt-3 space-y-3">{pains.map((x,i)=><article key={x.pain} className={`rounded-2xl border ${i===0?'border-rose-400/25 bg-rose-400/[.035]':'border-zinc-800 bg-zinc-900/50'} p-5`}>
   <button onClick={()=>setOpen(open===i?-1:i)} className="flex w-full items-start gap-4 text-left"><div className="rounded-xl bg-zinc-950 px-3 py-2 text-center"><b className="text-xl">{x.score}</b><div className="text-[8px] text-zinc-600">POTENCIAL</div></div><div className="min-w-0 flex-1"><div className="text-[9px] font-bold uppercase tracking-wider text-rose-400">{x.cat}{i===0?' • PRIORIDADE':''}</div><h4 className="mt-1 font-bold">{x.pain}</h4><p className="mt-1 text-xs text-zinc-500"><b className="text-zinc-400">Ela quer:</b> {x.want}</p></div><ChevronDown className={`mt-2 h-4 w-4 text-zinc-600 transition ${open===i?'rotate-180':''}`}/></button>
   {open===i&&<div className="mt-5 border-t border-zinc-800 pt-5"><div className="grid gap-4 lg:grid-cols-3"><div><div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Soluções vendáveis</div><div className="mt-2 space-y-1.5">{x.solutions.map(s=><div key={s} className="rounded-lg bg-zinc-950 px-3 py-2 text-[11px] text-zinc-300">→ {s}</div>)}</div></div><div><div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Formato recomendado</div><div className="mt-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[.04] p-3"><b className="text-xs text-emerald-300">{x.format}</b><p className="mt-2 text-[10px] leading-relaxed text-zinc-500">{x.why}</p></div><div className="mt-2 rounded-xl bg-zinc-950 p-3"><div className="text-[9px] text-zinc-600">NÃO VENDA</div><div className="mt-1 text-[10px] text-zinc-500">“Um ebook sobre {market}”</div><div className="mt-3 text-[9px] text-zinc-600">VENDA</div><div className="mt-1 text-[10px] text-zinc-300">Uma forma mais rápida/simples de chegar a “{x.want}”.</div></div></div><div><div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Pesquisas para validar</div><div className="mt-2 space-y-1.5">{x.searches.map(s=><div key={s} className="flex gap-1"><a href={META(s)} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-blue-500/10 px-3 py-2 text-[10px] text-blue-300">{s}</a><a href={TRENDS(s)} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-800 px-2 py-2 text-[9px] text-emerald-300">T</a></div>)}</div><p className="mt-3 text-[9px] text-zinc-600">Abra uma busca e ative ⚡ Descoberta. O painel recebe os melhores automaticamente.</p></div></div></div>}
  </article>)}</div>
  <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-[10px] leading-relaxed text-zinc-600"><Flame className="mr-1 inline h-3 w-3"/>O potencial é uma priorização heurística para investigação, não volume de vendas. A validação aumenta quando o Radar encontra operações reais atacando a mesma dor.</div></>}
 </div>
}