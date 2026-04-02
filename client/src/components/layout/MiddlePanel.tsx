import { Settings2 } from 'lucide-react'
import { HeaderEditor } from '@/components/modifiers/HeaderEditor'
import { FieldModifier } from '@/components/modifiers/FieldModifier'
import { JsonPreview } from '@/components/modifiers/JsonPreview'

export function MiddlePanel() {
  return (
    <div className="flex-1 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 min-w-[320px]">
      <div className="panel-header">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary-500" />
          字段修改
        </h2>
      </div>
      <div className="flex-1 overflow-auto p-5 space-y-6">
        <HeaderEditor />
        <div className="space-y-4">
          <FieldModifier />
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              修改预览
            </h3>
            <JsonPreview />
          </div>
        </div>
      </div>
    </div>
  )
}
