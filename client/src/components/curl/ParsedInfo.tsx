import { useAppStore } from '@/store/useAppStore'

export function ParsedInfo() {
  const parsed = useAppStore((state) => state.parsed)

  if (!parsed) return null

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="card p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${getMethodColor(parsed.method)}`}>
            {parsed.method}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
            {parsed.url}
          </span>
        </div>
        {parsed.headers && Object.keys(parsed.headers).length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Object.keys(parsed.headers).length} 个 Headers
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
