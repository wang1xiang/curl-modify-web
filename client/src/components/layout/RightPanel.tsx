import { Send, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { RequestSender } from '@/components/request/RequestSender'
import { ProgressBar } from '@/components/request/ProgressBar'

export function RightPanel() {
  const rightExpanded = useAppStore((state) => state.rightExpanded)
  const setRightExpanded = useAppStore((state) => state.setRightExpanded)
  const results = useAppStore((state) => state.results)

  return (
    <div
      className="flex flex-col bg-white dark:bg-gray-900"
      style={{ width: rightExpanded ? '33.333%' : 'auto', minWidth: rightExpanded ? '320px' : 'auto' }}
    >
      <div
        className="panel-header flex items-center justify-between cursor-pointer select-none"
        onClick={() => setRightExpanded(!rightExpanded)}
      >
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-cta-500" />
          {rightExpanded && (
            <h2 className="font-semibold text-gray-900 dark:text-white">
              发送请求
            </h2>
          )}
        </div>
        <ChevronRight
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${rightExpanded ? 'rotate-180' : ''}`}
        />
      </div>
      {rightExpanded && (
        <div className="flex-1 overflow-auto p-5">
          <div className="space-y-6">
            <div className="space-y-4">
              <RequestSender />
              <ProgressBar />
            </div>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      请求 #{result.request.index}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        result.isPreview
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                          : result.result?.success
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : result.result
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {result.isPreview ? '预览' : result.result?.success ? '成功' : result.result ? '失败' : '等待...'}
                    </span>
                  </div>
                  <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-24">
                    {result.request.body}
                  </pre>
                  {result.result && !result.isPreview && (
                    <div className="mt-3">
                      {result.result.success ? (
                        <pre className="text-xs font-mono bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-3 rounded-lg overflow-auto max-h-40 border border-green-200 dark:border-green-900/30">
                          {result.result.stdout}
                        </pre>
                      ) : (
                        <pre className="text-xs font-mono bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-lg overflow-auto max-h-40 border border-red-200 dark:border-red-900/30">
                          {result.result.error}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
