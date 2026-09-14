export default function ScoreBadge({ score }) {
  const cls = score >= 70
    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
    : score >= 40
      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
      : 'border-zinc-700 bg-zinc-800 text-zinc-300'

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${cls}`}>
      Score {score}/100
    </span>
  )
}
