export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  try{
    const r=await fetch('https://trends.google.com/trending/rss?geo=BR',{headers:{'user-agent':'Mozilla/5.0 OfertaRadar/1.0'}})
    if(!r.ok) throw new Error(`Google Trends respondeu ${r.status}`)
    const xml=await r.text()
    const items=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0,50).map(m=>{
      const x=m[1]
      const val=(tag)=>((x.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,'i'))||[])[1]||'')
        .replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim()
      return {title:val('title'),traffic:val('ht:approx_traffic'),pubDate:val('pubDate'),link:val('link')}
    }).filter(x=>x.title)
    res.status(200).json({items,updatedAt:new Date().toISOString()})
  }catch(e){res.status(502).json({error:e.message||'Não foi possível carregar tendências.'})}
}