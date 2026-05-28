import { Play, Eye, Repeat } from 'lucide-react'
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
      const genData = await generateRequests(
        { ...parsed, body: bodyToUse },
        modifiers,
        headerMods,
        sendCount
      )
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
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="flex items-center gap-2 px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <Repeat className="w-3.5 h-3.5" />
          执行次数
        </label>
        <input
          type="number"
          value={sendCount}
          min="1"
          max="50"
          onChange={(e) => setSendCount(parseInt(e.target.value) || 1)}
          className="input-gemini !py-2.5 !text-xs !px-4"
          disabled={isSending}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => handleGenerateAndSend(true)}
          disabled={!parsed || isSending}
          className="btn-ghost flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          仅预览
        </button>
        <button
          onClick={() => handleGenerateAndSend(false)}
          disabled={!parsed || isSending}
          className="btn-gemini flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          {isSending ? '执行中...' : '发送请求'}
        </button>
      </div>
    </div>
  )
}
