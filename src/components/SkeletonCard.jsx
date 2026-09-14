export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
      <div className="aspect-[16/9] animate-pulse bg-zinc-800" />
      <div className="space-y-4 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-800" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-800" />
        <div className="flex gap-2"><div className="h-6 w-24 animate-pulse rounded bg-zinc-800" /><div className="h-6 w-20 animate-pulse rounded bg-zinc-800" /></div>
        <div className="h-10 animate-pulse rounded-xl bg-zinc-800" />
      </div>
    </div>
  )
}
