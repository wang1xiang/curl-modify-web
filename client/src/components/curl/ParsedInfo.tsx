import { useAppStore } from '@/store/useAppStore'
import { Globe, ShieldCheck } from 'lucide-react'

export function ParsedInfo() {
  const parsed = useAppStore((state) => state.parsed)

  if (!parsed) return null

  const getMethodStyle = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'POST':
        return 'bg-primary-500/10 text-primary-400 border-primary-500/20'
      case 'PUT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  return (
    <div className="glass-card p-4 space-y-3 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        <Globe className="w-12 h-12 text-white" />
      </div>
      
      <div className="space-y-3 relative z-10">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getMethodStyle(parsed.method)}`}>
            {parsed.method}
          </span>
          <span className="text-xs font-mono text-slate-400 truncate flex-1 hover:text-slate-200 transition-colors cursor-help" title={parsed.url}>
            {parsed.url}
          </span>
        </div>
        
        <div className="flex items-center gap-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              {Object.keys(parsed.headers || {}).length} Headers
            </span>
          </div>
          {parsed.body && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                Payload Detected
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
