import { Play, Save, Code } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useSavedEndpoints } from '@/hooks/useSavedEndpoints'
import { parseCurl } from '@/services/api'

export function CurlInput() {
  const curlInput = useAppStore((state) => state.curlInput)
  const setCurlInput = useAppStore((state) => state.setCurlInput)
  const setParsed = useAppStore((state) => state.setParsed)
  const { addEndpoint } = useSavedEndpoints()

  const handleParse = async () => {
    if (!curlInput.trim()) return
    try {
      const data = await parseCurl(curlInput)
      if (data.success && data.parsed) {
        setParsed(data.parsed, data.bodyJson || null)
      }
    } catch (e) {
      console.error('解析失败:', e)
    }
  }

  const handleSave = () => {
    if (!curlInput.trim()) {
      alert('请先粘贴 curl 命令')
      return
    }
    const name = prompt('请输入接口名称:')
    if (name && name.trim()) {
      addEndpoint(name.trim(), curlInput)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <Code className="w-3.5 h-3.5" />
            原始 Curl 命令
          </label>
        </div>
        <textarea
          className="input-gemini h-40 font-mono text-xs resize-none custom-scrollbar"
          placeholder="在此粘贴 curl 命令..."
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleParse}
          className="btn-gemini flex-[2] flex items-center justify-center gap-2 py-2 text-sm"
        >
          <Play className="w-4 h-4" />
          解析命令
        </button>
        <button
          onClick={handleSave}
          className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2 text-sm"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>
    </div>
  )
}
