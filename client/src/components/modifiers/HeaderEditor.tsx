import { ChevronDown, Layers } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export function HeaderEditor() {
  const parsed = useAppStore((state) => state.parsed)
  const headerMods = useAppStore((state) => state.headerMods)
  const headersExpanded = useAppStore((state) => state.headersExpanded)
  const setHeadersExpanded = useAppStore((state) => state.setHeadersExpanded)
  const setHeaderMod = useAppStore((state) => state.setHeaderMod)

  if (!parsed || !parsed.headers) return null

  return (
    <div className="space-y-3">
      <button
        onClick={() => setHeadersExpanded(!headersExpanded)}
        className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
      >
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-500" />
          Headers
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${headersExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {headersExpanded && (
        <div className="space-y-2">
          {Object.entries(headerMods).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <input
                type="text"
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium"
                value={key}
              />
              <input
                type="text"
                className="flex-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-ring"
                value={value}
                onChange={(e) => setHeaderMod(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
