import { useAppStore } from '@/store/useAppStore'
import { Rocket } from 'lucide-react'

export function ProgressBar() {
  const isSending = useAppStore((state) => state.isSending)
  const progress = useAppStore((state) => state.progress)

  if (!isSending && progress.total === 0) return null

  const percentage = progress.total > 0 ? ((progress.current / progress.total) * 100).toFixed(0) : 0

  return (
    <div className="glass-card p-4 space-y-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-30 animate-pulse-slow pointer-events-none"></div>

      <div className="flex items-center justify-between text-sm relative z-10">
        <span className="flex items-center gap-2 text-slate-400 font-medium">
          <Rocket className="w-4 h-4 text-primary-400" />
          发送请求中...
        </span>
        <span className="text-primary-400 font-bold">
          {progress.current}/{progress.total}
        </span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden relative z-10">
        <div
          className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
