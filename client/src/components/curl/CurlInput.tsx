import { Play, Save } from 'lucide-react'
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
      console.log('Parse result:', data)
      if (data.success && data.parsed) {
        console.log('bodyJson type:', typeof data.bodyJson, 'value:', data.bodyJson)
        setParsed(data.parsed, data.bodyJson || null)
      }
    } catch (e) {
      console.error('Failed to parse curl:', e)
    }
  }

  const handleSave = () => {
    if (!curlInput.trim()) {
      alert('请先粘贴 curl 命令')
      return
    }
    const name = prompt('请输入接口名称（例如：更新用户信息）：')
    if (name && name.trim()) {
      addEndpoint(name.trim(), curlInput)
      alert('保存成功！')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          粘贴 curl 命令
        </label>
        <textarea
          className="input-field h-48 font-mono text-sm resize-none"
          placeholder="在此粘贴 curl 命令..."
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleParse}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          解析
        </button>
        <button
          onClick={handleSave}
          className="btn-cta flex-1 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          保存
        </button>
      </div>
    </div>
  )
}
