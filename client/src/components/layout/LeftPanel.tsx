import { FileText, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { CurlInput } from '@/components/curl/CurlInput'
import { SavedEndpoints } from '@/components/curl/SavedEndpoints'
import { ParsedInfo } from '@/components/curl/ParsedInfo'

export function LeftPanel() {
  const leftExpanded = useAppStore((state) => state.leftExpanded)
  const setLeftExpanded = useAppStore((state) => state.setLeftExpanded)

  return (
    <div
      className="border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900"
      style={{ width: leftExpanded ? '33.333%' : 'auto', minWidth: leftExpanded ? '320px' : 'auto' }}
    >
      <div
        className="panel-header flex items-center justify-between cursor-pointer select-none"
        onClick={() => setLeftExpanded(!leftExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          {leftExpanded && (
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Curl 命令
            </h2>
          )}
        </div>
        <ChevronRight
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${leftExpanded ? '' : 'rotate-180'}`}
        />
      </div>
      {leftExpanded && (
        <div className="flex-1 overflow-auto p-5 space-y-6">
          <SavedEndpoints />
          <div className="space-y-4">
            <CurlInput />
            <ParsedInfo />
          </div>
        </div>
      )}
    </div>
  )
}
