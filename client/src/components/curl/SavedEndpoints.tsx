import { Trash2, FolderOpen } from 'lucide-react'
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-gray-500" />
          已保存的接口
        </h3>
      </div>
      {endpoints.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-sm">暂无保存的接口</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-auto">
          {endpoints.map((ep) => (
            <div
              key={ep.id}
              className="group flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              onClick={() => handleEndpointClick(ep.curlCmd)}
            >
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                {ep.name}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteEndpoint(ep.id)
                }}
                aria-label="删除"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
