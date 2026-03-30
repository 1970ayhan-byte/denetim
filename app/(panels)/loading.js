import { RouteLoading } from '@/components/loading/RouteLoading'

export default function PanelsLoading() {
  return (
    <div className="min-h-screen bg-zinc-100 flex items-stretch">
      <RouteLoading fullScreen className="flex-1" />
    </div>
  )
}
