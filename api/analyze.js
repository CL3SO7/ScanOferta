const UA='Mozilla/5.0 (compatible; OfertaRadar/1.0)'
const pats={
 whatsapp:/https?:\/\/(?:wa\.me|api\.whatsapp\.com\/send|web\.whatsapp\.com\/send)[^"' <>)]+/gi,
 checkout:/https?:\/\/[^"' <>)]+(?:kiwify|hotmart|kirvano|asaas|mercadopago)[^"' <>)]+/gi,
 video:/https?:\/\/[^"' <>)]+(?:vturb|pandavideo|youtube|youtu\.be|vimeo)[^"' <>)]+/gi
}
const uniq=a=>[...new Set(a||[])]
const strip=s=>(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
const decode=s=>{try{return decodeURIComponent(s.replace(/&amp;/g,'&'))}catch{return s}}
function meta(html,name){const r=new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,'i');const m=html.match(r);return strip(m?.[1]||m?.[2]||'')}
function tag(html,t){return [...html.matchAll(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`,'gi'))].map(x=>strip(x[1])).filter(Boolean)}
function price(text){return uniq([...text.matchAll(/R\$\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?/g)].map(x=>x[0])).slice(0,8)}
function whatsappMessage(url){try{const u=new URL(decode(url));return decode(u.searchParams.get('text')||'').replace(/\+/g,' ')}catch{return''}}
export default async function handler(req,res){
 res.setHeader('Access-Control-Allow-Origin','*')
 if(req.method==='OPTIONS') return res.status(204).end()
 const raw=String(req.query?.url||'').trim()
 if(!/^https?:\/\//i.test(raw)) return res.status(400).json({error:'Informe uma URL completa começando com http:// ou https://'})
 try{
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),12000)
  const r=await fetch(raw,{redirect:'follow',headers:{'user-agent':UA,'accept':'text/html,application/xhtml+xml'},signal:controller.signal}); clearTimeout(timer)
  if(!r.ok) return res.status(r.status).json({error:`A página respondeu HTTP ${r.status}`})
  const ct=r.headers.get('content-type')||''; if(!ct.includes('text/html')) return res.status(415).json({error:'O destino não retornou uma página HTML.'})
  const html=(await r.text()).slice(0,2500000); const text=strip(html).slice(0,250000)
  const title=strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'')
  const h1=tag(html,'h1').slice(0,5), h2=tag(html,'h2').slice(0,8)
  const links=uniq([...html.matchAll(/href=["']([^"']+)["']/gi)].map(x=>decode(x[1]))).filter(x=>/^https?:\/\//i.test(x))
  const whats=uniq([...(html.match(pats.whatsapp)||[]),...links.filter(x=>/wa\.me|api\.whatsapp\.com/i.test(x))]).slice(0,10)
  const checkouts=uniq([...(html.match(pats.checkout)||[]),...links.filter(x=>/kiwify|hotmart|kirvano|asaas|mercadopago/i.test(x))]).slice(0,10)
  const videos=uniq([...(html.match(pats.video)||[]),...links.filter(x=>/vturb|pandavideo|youtube|youtu\.be|vimeo/i.test(x))]).slice(0,10)
  const tech={
   metaPixel:/fbevents\.js|fbq\s*\(|facebook\.com\/tr/i.test(html),
   googleAnalytics:/googletagmanager|gtag\s*\(|google-analytics/i.test(html),
   utm:/utm_(source|medium|campaign)|fbclid|gclid/i.test(html),
   whatsapp:whats.length>0, checkout:checkouts.length>0, video:videos.length>0,
   vturb:/vturb|converteai/i.test(html), panda:/pandavideo/i.test(html),
   kiwify:/kiwify/i.test(html), hotmart:/hotmart/i.test(html), kirvano:/kirvano/i.test(html)
  }
  const ctas=uniq([...tag(html,'a'),...tag(html,'button')].filter(x=>/compr|quero|garant|começ|acess|saiba|desconto|oferta|agora|checkout|inscrev/i.test(x))).slice(0,12)
  let score=0; if(tech.metaPixel)score+=15;if(tech.googleAnalytics)score+=5;if(tech.utm)score+=10;if(tech.checkout)score+=20;if(tech.video)score+=15;if(tech.whatsapp)score+=15;if(h1.length)score+=5;if(ctas.length)score+=5;if(price(text).length)score+=10
  res.status(200).json({url:raw,finalUrl:r.url,title,description:meta(html,'description')||meta(html,'og:description'),ogImage:meta(html,'og:image'),h1,h2,prices:price(text),ctas,tech,whatsapp:whats.map(url=>({url,message:whatsappMessage(url)})),checkouts,videos,links:links.slice(0,40),score:Math.min(100,score),analyzedAt:new Date().toISOString()})
 }catch(e){res.status(502).json({error:e.name==='AbortError'?'A página demorou demais para responder.':'Não foi possível acessar essa landing page pelo servidor. Ela pode bloquear robôs ou exigir JavaScript.'})}
}