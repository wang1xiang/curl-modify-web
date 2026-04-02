import { useAppStore } from '@/store/useAppStore'
import { flattenObject } from '@/utils/json'
import { ModifierOptions } from './ModifierOptions'
import type { Modifier } from '@/types'

export function FieldModifier() {
  const bodyJson = useAppStore((state) => state.bodyJson)
  const modifiers = useAppStore((state) => state.modifiers)
  const setModifier = useAppStore((state) => state.setModifier)
  const removeModifier = useAppStore((state) => state.removeModifier)

  // 处理 bodyJson 可能是字符串的情况
  let jsonObj: Record<string, unknown> | null = null
  if (bodyJson) {
    if (typeof bodyJson === 'string') {
      try {
        jsonObj = JSON.parse(bodyJson)
      } catch {
        jsonObj = null
      }
    } else if (typeof bodyJson === 'object' && bodyJson !== null) {
      jsonObj = bodyJson as Record<string, unknown>
    }
  }

  if (!jsonObj) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <p className="text-sm">请先解析 curl 命令...</p>
      </div>
    )
  }

  const fields = flattenObject(jsonObj)

  const handleTypeChange = (path: string, type: Modifier['type']) => {
    if (type === 'none') {
      removeModifier(path)
    } else {
      setModifier(path, { type, spec: '' })
    }
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const modifier = modifiers[field.path]
        return (
          <div
            key={field.path}
            className="card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <code className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {field.path}
              </code>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                {field.type}
              </span>
            </div>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-ring"
                value={modifier?.type || 'none'}
                onChange={(e) => handleTypeChange(field.path, e.target.value as Modifier['type'])}
              >
                <option value="none">不修改</option>
                <option value="fixed">固定值</option>
                <option value="int">随机整数</option>
                <option value="string">随机字符串</option>
                <option value="date">随机日期</option>
                <option value="phone">随机手机号</option>
                <option value="email">随机邮箱</option>
                <option value="url">随机网址</option>
                <option value="list">列表选择</option>
              </select>
            </div>
            {modifier && modifier.type !== 'none' && (
              <ModifierOptions
                path={field.path}
                modifier={modifier}
                onChange={(mod) => setModifier(field.path, mod)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
