import { Play, Eye } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { generateRequests, sendRequest } from '@/services/api'

export function RequestSender() {
  const parsed = useAppStore((state) => state.parsed)
  const bodyJson = useAppStore((state) => state.bodyJson)
  const modifiers = useAppStore((state) => state.modifiers)
  const headerMods = useAppStore((state) => state.headerMods)
  const sendCount = useAppStore((state) => state.sendCount)
  const isSending = useAppStore((state) => state.isSending)
  const setSendCount = useAppStore((state) => state.setSendCount)
  const setIsSending = useAppStore((state) => state.setIsSending)
  const setProgress = useAppStore((state) => state.setProgress)
  const addResult = useAppStore((state) => state.addResult)
  const clearResults = useAppStore((state) => state.clearResults)

  const handleGenerateAndSend = async (previewOnly: boolean) => {
    if (!parsed) return

    // 使用 bodyJson 而不是 parsed.body，以支持在预览中直接编辑
    const bodyToUse = bodyJson ? JSON.stringify(bodyJson) : parsed.body

    clearResults()
    setIsSending(true)
    setProgress(0, sendCount)

    try {
      // 传入 bodyToUse 给生成逻辑
      const genData = await generateRequests({ ...parsed, body: bodyToUse }, modifiers, headerMods, sendCount)
      if (!genData.success || !genData.requests) {
        throw new Error(genData.error || '生成请求失败')
      }

      for (let i = 0; i < genData.requests.length; i++) {
        const req = genData.requests[i]
        setProgress(i + 1, sendCount)

        if (previewOnly) {
          addResult({ request: req, isPreview: true })
        } else {
          try {
            const sendData = await sendRequest(req.curlCmd)
            addResult({
              request: req,
              result: sendData,
              isPreview: false,
            })
          } catch (e) {
            addResult({
              request: req,
              result: { success: false, error: String(e) },
              isPreview: false,
            })
          }
        }

        await new Promise((r) => setTimeout(r, 100))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          发送次数
        </label>
        <input
          type="number"
          value={sendCount}
          min="1"
          onChange={(e) => setSendCount(parseInt(e.target.value) || 1)}
          className="input-field"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => handleGenerateAndSend(true)}
          disabled={!parsed || isSending}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-5 h-5" />
          预览
        </button>
        <button
          onClick={() => handleGenerateAndSend(false)}
          disabled={!parsed || isSending}
          className="btn-cta flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5" />
          {isSending ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  )
}
