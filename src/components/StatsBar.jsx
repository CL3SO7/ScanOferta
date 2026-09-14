import { Flame, MessageCircle, ShoppingCart, Video, Radar } from 'lucide-react'

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500"><Icon className="h-3.5 w-3.5" />{label}</div>
    <div className="mt-1 text-xl font-bold text-zinc-100">{value}</div>
  </div>
}

export default function StatsBar({ items }) {
  const hot = items.filter(x => (x.miningScore ?? x.score ?? 0) >= 70).length
  return <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
    <Stat icon={Radar} label="Achados" value={items.length} />
    <Stat icon={Flame} label="Quentes" value={hot} />
    <Stat icon={MessageCircle} label="WhatsApp" value={items.filter(x => x.signals?.whatsapp).length} />
    <Stat icon={ShoppingCart} label="Checkout" value={items.filter(x => x.signals?.checkout).length} />
    <Stat icon={Video} label="VSL/Vídeo" value={items.filter(x => x.signals?.video).length} />
  </div>
}
