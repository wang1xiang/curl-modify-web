import { Settings2, Eye } from 'lucide-react'
import { HeaderEditor } from '@/components/modifiers/HeaderEditor'
import { FieldModifier } from '@/components/modifiers/FieldModifier'
import { JsonPreview } from '@/components/modifiers/JsonPreview'

export function MiddlePanel() {
  return (
    <div className="flex-1 border-r border-white/5 flex flex-col glass-panel min-w-[360px]">
      <div className="panel-header-gemini">
        <h2 className="font-bold text-slate-100 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-accent-500/10 rounded-xl text-accent-400">
            <Settings2 className="w-5 h-5" />
          </div>
          修改器 <span className="text-slate-500 font-medium">引擎</span>
        </h2>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-8">
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">HTTP 请求头</h3>
          </div>
          <HeaderEditor />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-accent-500 rounded-full"></div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payload 转换</h3>
          </div>
          <FieldModifier />
        </section>

        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">实时预览</h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
              <Eye className="w-3 h-3" />
              实时
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-primary-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative">
              <JsonPreview />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
