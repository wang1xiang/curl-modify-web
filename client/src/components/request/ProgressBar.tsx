import { useAppStore } from '@/store/useAppStore'

export function ProgressBar() {
  const isSending = useAppStore((state) => state.isSending)
  const progress = useAppStore((state) => state.progress)

  if (!isSending && progress.total === 0) return null

  const percentage = progress.total > 0 ? ((progress.current / progress.total) * 100).toFixed(0) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400 font-medium">发送中...</span>
        <span className="text-primary-600 dark:text-primary-400 font-bold">
          {progress.current}/{progress.total}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
