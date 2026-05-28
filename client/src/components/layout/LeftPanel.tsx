import { FileText, ChevronRight, Hash } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { CurlInput } from '@/components/curl/CurlInput'
import { SavedEndpoints } from '@/components/curl/SavedEndpoints'
import { ParsedInfo } from '@/components/curl/ParsedInfo'

export function LeftPanel() {
  const leftExpanded = useAppStore((state) => state.leftExpanded)
  const setLeftExpanded = useAppStore((state) => state.setLeftExpanded)

  return (
    <div
      className={`relative border-r border-white/5 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] glass-panel ${
        leftExpanded ? 'w-1/3 min-w-[360px]' : 'w-16 min-w-[64px]'
      }`}
    >
      <div
        className="panel-header-gemini flex items-center justify-between cursor-pointer select-none group"
        onClick={() => setLeftExpanded(!leftExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-all duration-300 ${leftExpanded ? 'bg-primary-500/10 text-primary-400' : 'bg-transparent text-slate-400 group-hover:bg-white/5'}`}>
            <FileText className="w-5 h-5" />
          </div>
          {leftExpanded && (
            <h2 className="font-bold text-slate-100 tracking-tight">
              Curl <span className="text-slate-500 font-medium">输入</span>
            </h2>
          )}
        </div>
        <div className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${!leftExpanded ? 'hidden' : ''}`}>
          <ChevronRight
            className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${leftExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      
      {!leftExpanded && (
        <div className="flex-1 flex flex-col items-center py-6 gap-6 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary-400 cursor-pointer transition-colors" title="已保存的接口">
            <Hash className="w-4 h-4" />
          </div>
        </div>
      )}

      {leftExpanded && (
        <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">仓库</h3>
            </div>
            <SavedEndpoints />
          </section>
          
          <section className="space-y-6 pt-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-4 bg-accent-500 rounded-full"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">解析引擎</h3>
            </div>
            <div className="space-y-4">
              <CurlInput />
              <ParsedInfo />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
