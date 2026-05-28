import { Trash2, Hash } from 'lucide-react'
import { useSavedEndpoints } from '@/hooks/useSavedEndpoints'
import { useAppStore } from '@/store/useAppStore'
import { parseCurl } from '@/services/api'

export function SavedEndpoints() {
  const { endpoints, deleteEndpoint } = useSavedEndpoints()
  const setCurlInput = useAppStore((state) => state.setCurlInput)
  const setParsed = useAppStore((state) => state.setParsed)

  const handleEndpointClick = async (curlCmd: string) => {
    setCurlInput(curlCmd)
    try {
      const data = await parseCurl(curlCmd)
      if (data.success && data.parsed) {
        setParsed(data.parsed, data.bodyJson || null)
      }
    } catch (e) {
      console.error('Failed to parse curl:', e)
    }
  }

  return (
    <div className="space-y-3">
      {endpoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 glass-card border-dashed">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Archive Empty</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-auto custom-scrollbar pr-1">
          {endpoints.map((ep) => (
            <div
              key={ep.id}
              className="group flex items-center gap-3 p-3 glass-card cursor-pointer relative overflow-hidden"
              onClick={() => handleEndpointClick(ep.curlCmd)}
            >
              <div className="p-1.5 rounded-lg bg-white/5 text-slate-500 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-colors">
                <Hash className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1 text-xs text-slate-300 truncate font-semibold tracking-tight">
                {ep.name}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteEndpoint(ep.id)
                }}
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500/70" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
