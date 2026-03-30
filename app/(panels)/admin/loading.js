import { RouteLoading } from '@/components/loading/RouteLoading'

export default function AdminSegmentLoading() {
  return (
    <div className="min-h-[min(75vh,640px)] flex w-full items-center justify-center rounded-2xl border border-zinc-200/80 bg-white/80">
      <RouteLoading />
    </div>
  )
}
