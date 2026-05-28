import { Send, ChevronRight, Activity } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { RequestSender } from '@/components/request/RequestSender'
import { ProgressBar } from '@/components/request/ProgressBar'

export function RightPanel() {
  const rightExpanded = useAppStore((state) => state.rightExpanded)
  const setRightExpanded = useAppStore((state) => state.setRightExpanded)
  const results = useAppStore((state) => state.results)

  return (
    <div
      className={`relative border-l border-white/5 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] glass-panel ${
        rightExpanded ? 'w-1/3 min-w-[360px]' : 'w-16 min-w-[64px]'
      }`}
    >
      <div
        className="panel-header-gemini flex items-center justify-between cursor-pointer select-none group"
        onClick={() => setRightExpanded(!rightExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-all duration-300 ${rightExpanded ? 'bg-primary-500/10 text-primary-400' : 'bg-transparent text-slate-400 group-hover:bg-white/5'}`}>
            <Send className="w-5 h-5" />
          </div>
          {rightExpanded && (
            <h2 className="font-bold text-slate-100 tracking-tight">
              执行 <span className="text-slate-500 font-medium">控制台</span>
            </h2>
          )}
        </div>
        <div className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${!rightExpanded ? 'hidden' : ''}`}>
          <ChevronRight
            className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${rightExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {!rightExpanded && (
        <div className="flex-1 flex flex-col items-center py-6 gap-6 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary-400 cursor-pointer transition-colors" title="执行结果">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      )}

      {rightExpanded && (
        <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">控制区</h3>
            </div>
            <div className="space-y-4">
              <RequestSender />
              <ProgressBar />
            </div>
          </section>

          <section className="space-y-6 pt-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-4 bg-accent-500 rounded-full"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">请求日志</h3>
            </div>
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 glass-card border-dashed">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-600">
                    <Activity className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">暂无请求记录</p>
                  <p className="text-xs text-slate-600 mt-1">执行 curl 命令后查看结果</p>
                </div>
              ) : (
                results.map((result, index) => (
                  <div
                    key={index}
                    className="glass-card p-4 space-y-4 overflow-hidden relative group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-500/50"></div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                          请求 #{result.request.index}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          result.isPreview
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : result.result?.success
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : result.result
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {result.isPreview ? '预览' : result.result?.success ? '成功' : result.result ? '失败' : '等待中...'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">负载</div>
                      <pre className="text-[11px] font-mono text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-white/5 overflow-auto max-h-24 custom-scrollbar">
                        {result.request.body}
                      </pre>
                    </div>

                    {result.result && !result.isPreview && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">响应</div>
                        {result.result.success ? (
                          <pre className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 overflow-auto max-h-40 custom-scrollbar">
                            {result.result.stdout}
                          </pre>
                        ) : (
                          <pre className="text-[11px] font-mono text-rose-400/90 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 overflow-auto max-h-40 custom-scrollbar">
                            {result.result.error}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
