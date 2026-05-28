import { ChevronDown, Layers } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export function HeaderEditor() {
  const parsed = useAppStore((state) => state.parsed)
  const headerMods = useAppStore((state) => state.headerMods)
  const headersExpanded = useAppStore((state) => state.headersExpanded)
  const setHeadersExpanded = useAppStore((state) => state.setHeadersExpanded)
  const setHeaderMod = useAppStore((state) => state.setHeaderMod)

  if (!parsed || !parsed.headers) return null

  return (
    <div className="space-y-3">
      <button
        onClick={() => setHeadersExpanded(!headersExpanded)}
        className="w-full flex items-center justify-between p-3 glass-card group transition-all duration-300"
      >
        <span className="flex items-center gap-3 text-xs font-bold text-slate-300 tracking-tight">
          <div className="p-1.5 rounded-lg bg-white/5 text-slate-500 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-colors">
            <Layers className="w-3.5 h-3.5" />
          </div>
          请求头配置
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${headersExpanded ? 'rotate-180 text-primary-400' : ''}`}
        />
      </button>
      {headersExpanded && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {Object.entries(headerMods).map(([key, value]) => (
            <div key={key} className="flex gap-2 group/item">
              <div className="flex-1">
                <input
                  type="text"
                  readOnly
                  className="w-full px-3 py-2 text-[11px] font-mono border border-white/5 rounded-lg bg-white/5 text-slate-500 cursor-default"
                  value={key}
                />
              </div>
              <div className="flex-[2]">
                <input
                  type="text"
                  className="input-gemini !py-2 !text-[11px] !px-3"
                  placeholder="值..."
                  value={value}
                  onChange={(e) => setHeaderMod(key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
