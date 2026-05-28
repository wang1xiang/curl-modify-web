import { useAppStore } from '@/store/useAppStore'
import { flattenObject } from '@/utils/json'
import { ModifierOptions } from './ModifierOptions'
import type { Modifier } from '@/types'
import { useState } from 'react'

export function FieldModifier() {
  const bodyJson = useAppStore((state) => state.bodyJson)
  const modifiers = useAppStore((state) => state.modifiers)
  const setModifier = useAppStore((state) => state.setModifier)
  const removeModifier = useAppStore((state) => state.removeModifier)

  // 数组元素字段的展开状态
  const [expandedArrays, setExpandedArrays] = useState<Set<string>>(new Set())

  const toggleArrayExpand = (path: string) => {
    setExpandedArrays(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  console.log('FieldModifier bodyJson:', bodyJson, 'type:', typeof bodyJson)

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

  console.log('FieldModifier jsonObj:', jsonObj)

  if (!jsonObj) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <p className="text-sm">请先解析 curl 命令...</p>
      </div>
    )
  }

  const fields = flattenObject(jsonObj)

  // 分离数组字段、数组元素字段（如 column[0]、order[0].column）和普通字段
  const arrayFields = fields.filter(f => f.isArray)
  const arrayElementFields = fields.filter(f => !f.isArray && f.path.includes('[')) // 如 column[0], order[0].column
  const nonArrayFields = fields.filter(f => !f.isArray && !f.path.includes('['))

  const handleArrayTypeChange = (path: string, type: 'none' | 'array') => {
    if (type === 'none') {
      removeModifier(path)
    } else {
      const existingMod = modifiers[path]
      // 数组类型使用 'list' 作为标记类型，spec 设为 'array'
      setModifier(path, {
        type: 'list',
        spec: 'array',
        arrayCount: existingMod?.arrayCount || 3
      })
    }
  }

  const handleArrayCountChange = (path: string, count: number) => {
    const existingMod = modifiers[path]
    if (existingMod) {
      setModifier(path, { ...existingMod, arrayCount: count })
    }
  }

  const handleTypeChange = (path: string, type: Modifier['type']) => {
    if (type === 'none') {
      removeModifier(path)
    } else {
      setModifier(path, { type, spec: '' })
    }
  }

  // 按父路径分组数组元素（包括对象数组和简单类型数组）
  const arrayElementsMap = new Map<string, typeof fields>()

  // 添加对象数组元素（如 order[0].column）
  arrayElementFields.forEach(field => {
    const parentPath = field.path.match(/^([^\[]+)/)?.[1] || ''
    if (parentPath) {
      if (!arrayElementsMap.has(parentPath)) {
        arrayElementsMap.set(parentPath, [])
      }
      if (!arrayElementsMap.get(parentPath)!.find(f => f.path === field.path)) {
        arrayElementsMap.get(parentPath)!.push(field)
      }
    }
  })

  // 添加对象数组的嵌套元素（如 order[0].column -> order）
  arrayFields.forEach(field => {
    const parentPath = field.path
    const elements = arrayElementFields.filter(f => f.path.startsWith(parentPath + '['))
    if (elements.length > 0) {
      if (!arrayElementsMap.has(parentPath)) {
        arrayElementsMap.set(parentPath, [])
      }
      elements.forEach(elem => {
        if (!arrayElementsMap.get(parentPath)!.find(f => f.path === elem.path)) {
          arrayElementsMap.get(parentPath)!.push(elem)
        }
      })
    }
  })

  return (
    <div className="space-y-4">
      {/* 非数组字段 */}
      {nonArrayFields.map((field) => {
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

      {/* 数组字段 - 父字段 */}
      {Array.from(arrayElementsMap.keys()).map((parentPath) => {
        const elements = arrayElementsMap.get(parentPath)!
        const modifier = modifiers[parentPath]
        return (
          <div
            key={parentPath}
            className="card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <code className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {parentPath}
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  数组
                </span>
              </code>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                {elements[0]?.type || 'unknown'}[]
              </span>
            </div>

            {/* 数组级别的控制：不修改 / 动态生成 */}
            <div className="flex gap-2 items-center">
              <select
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-ring"
                value={modifier ? 'array' : 'none'}
                onChange={(e) => handleArrayTypeChange(parentPath, e.target.value as 'none' | 'array')}
              >
                <option value="none">不修改</option>
                <option value="array">动态生成数组</option>
              </select>
            </div>

            {/* 动态生成数组个数 */}
            {modifier && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <label className="text-xs text-gray-500 dark:text-gray-400">生成数量:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={modifier.arrayCount || 3}
                  onChange={(e) => handleArrayCountChange(parentPath, parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <span className="text-xs text-gray-400">个元素</span>
              </div>
            )}

            {/* 数组元素字段列表 */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => toggleArrayExpand(parentPath)}
              >
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    expandedArrays.has(parentPath) ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  数组元素字段 ({elements.length} 个)
                </p>
              </div>
              {expandedArrays.has(parentPath) && (
                <div className="space-y-2 mt-2">
                  {elements.map((elem) => {
                    const elemModifier = modifiers[elem.path]
                    return (
                      <div
                        key={elem.path}
                        className="p-2 pl-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {elem.path}
                          </code>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {elem.type}
                          </span>
                        </div>
                        <select
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-ring"
                          value={elemModifier?.type || 'none'}
                          onChange={(e) => handleTypeChange(elem.path, e.target.value as Modifier['type'])}
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
                        {elemModifier && elemModifier.type !== 'none' && (
                          <div className="mt-2">
                            <ModifierOptions
                              path={elem.path}
                              modifier={elemModifier}
                              onChange={(mod) => setModifier(elem.path, mod)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
