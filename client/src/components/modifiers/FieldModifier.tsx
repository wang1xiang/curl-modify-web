import { useAppStore } from '@/store/useAppStore'
import { flattenObject } from '@/utils/json'
import { ModifierOptions } from './ModifierOptions'
import type { Modifier } from '@/types'
import { useState } from 'react'
import { Grid, ChevronDown, MinusCircle } from 'lucide-react'
import { GeminiSelect } from '@/components/ui/GeminiSelect'

export function FieldModifier() {
  const bodyJson = useAppStore((state) => state.bodyJson)
  const modifiers = useAppStore((state) => state.modifiers)
  const setModifier = useAppStore((state) => state.setModifier)
  const removeModifier = useAppStore((state) => state.removeModifier)

  const modifierOptions = [
    { value: 'none', label: '不修改' },
    { value: 'fixed', label: '固定值' },
    { value: 'int', label: '随机整数' },
    { value: 'string', label: '随机字符串' },
    { value: 'date', label: '随机日期' },
    { value: 'phone', label: '随机手机号' },
    { value: 'email', label: '随机邮箱' },
    { value: 'url', label: '随机网址' },
    { value: 'list', label: '列表选择' },
  ]
  // ... 其他逻辑不变，只修改 return 中的 select 部分

  // 数组元素字段的展开状态
  const [expandedArrays, setExpandedArrays] = useState<Set<string>>(new Set())

  const toggleArrayExpand = (path: string) => {
    setExpandedArrays((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

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
      <div className="flex flex-col items-center justify-center py-12 px-4 glass-card border-dashed">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-600">
          <Grid className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-500">暂无解析的 JSON 数据</p>
        <p className="text-xs text-slate-600 mt-1">请解析包含 JSON 请求体的 curl 命令</p>
      </div>
    )
  }

  const fields = flattenObject(jsonObj)

  // 分离数组字段、数组元素字段（如 column[0]、order[0].column）和普通字段
  const arrayFields = fields.filter((f) => f.isArray)
  const arrayElementFields = fields.filter((f) => !f.isArray && f.path.includes('[')) // 如 column[0], order[0].column
  const nonArrayFields = fields.filter((f) => !f.isArray && !f.path.includes('['))

  const handleArrayTypeChange = (path: string, type: 'none' | 'array') => {
    if (type === 'none') {
      removeModifier(path)
    } else {
      const existingMod = modifiers[path]
      // 数组类型使用 'list' 作为标记类型，spec 设为 'array'
      setModifier(path, {
        type: 'list',
        spec: 'array',
        arrayCount: existingMod?.arrayCount || 3,
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
  arrayElementFields.forEach((field) => {
    const parentPath = field.path.match(/^([^\[]+)/)?.[1] || ''
    if (parentPath) {
      if (!arrayElementsMap.has(parentPath)) {
        arrayElementsMap.set(parentPath, [])
      }
      if (!arrayElementsMap.get(parentPath)!.find((f) => f.path === field.path)) {
        arrayElementsMap.get(parentPath)!.push(field)
      }
    }
  })

  // 添加对象数组的嵌套元素（如 order[0].column -> order）
  // 同时确保空数组也能进入渲染列表
  arrayFields.forEach((field) => {
    const parentPath = field.path
    if (!arrayElementsMap.has(parentPath)) {
      arrayElementsMap.set(parentPath, [])
    }
    const elements = arrayElementFields.filter((f) => f.path.startsWith(parentPath + '['))
    elements.forEach((elem) => {
      if (!arrayElementsMap.get(parentPath)!.find((f) => f.path === elem.path)) {
        arrayElementsMap.get(parentPath)!.push(elem)
      }
    })
  })

  return (
    <div className="space-y-4">
      {/* 非数组字段 */}
      {nonArrayFields.map((field) => {
        const modifier = modifiers[field.path]
        return (
          <div key={field.path} className="glass-card p-4 space-y-3 relative group">
            {modifier && modifier.type !== 'none' && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
            )}
            <div className="flex items-center justify-between">
              <code className="text-sm text-slate-300 font-mono tracking-tight">{field.path}</code>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-bold uppercase tracking-wider">
                {field.type}
              </span>
            </div>
            <div className="flex gap-3">
              <GeminiSelect
                options={modifierOptions}
                value={modifier?.type || 'none'}
                onChange={(val) => handleTypeChange(field.path, val as Modifier['type'])}
              />
              {modifier && modifier.type !== 'none' && (
                <button
                  onClick={() => removeModifier(field.path)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-all duration-200"
                  title="移除修改器"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
              )}
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
          <div key={parentPath} className="glass-card p-4 space-y-3 relative group">
            {modifier && modifier.type !== 'none' && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
            )}
            <div className="flex items-center justify-between">
              <code className="text-sm text-slate-300 font-mono tracking-tight flex items-center gap-2">
                {parentPath}
                <span className="px-1.5 py-0.5 text-[10px] bg-primary-500/10 text-primary-400 rounded border border-primary-500/20 font-bold uppercase tracking-wider">
                  数组
                </span>
              </code>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-bold uppercase tracking-wider">
                {elements[0]?.type || 'unknown'}[]
              </span>
            </div>

            {/* 数组级别的控制：不修改 / 动态生成 */}
            <div className="flex gap-3 items-center">
              <select
                className="input-gemini flex-1 !py-2.5 !text-xs !px-4"
                value={modifier ? 'array' : 'none'}
                onChange={(e) =>
                  handleArrayTypeChange(parentPath, e.target.value as 'none' | 'array')
                }
              >
                <option value="none">不修改</option>
                <option value="array">动态数组生成</option>
              </select>
              {modifier && (
                <button
                  onClick={() => removeModifier(parentPath)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-all duration-200"
                  title="移除修改器"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 动态生成数组个数 */}
            {modifier && (
              <div className="flex items-center gap-3 p-3 glass-card">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  生成数量:
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={modifier.arrayCount || 3}
                  onChange={(e) =>
                    handleArrayCountChange(parentPath, parseInt(e.target.value) || 1)
                  }
                  className="input-gemini w-20 !py-2 !px-3 !text-xs"
                />
                <span className="text-xs text-slate-500">个</span>
              </div>
            )}

            {/* 数组元素字段列表 */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <button
                className="w-full flex items-center gap-2 cursor-pointer select-none group/toggle px-1 py-2 rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => toggleArrayExpand(parentPath)}
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${expandedArrays.has(parentPath) ? 'rotate-180 text-primary-400' : ''}`}
                />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  数组元素 ({elements.length})
                </p>
              </button>
              {expandedArrays.has(parentPath) && (
                <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {elements.map((elem) => {
                    const elemModifier = modifiers[elem.path]
                    return (
                      <div key={elem.path} className="glass-card p-3 pl-5 space-y-3 relative group">
                        {elemModifier && elemModifier.type !== 'none' && (
                          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></div>
                        )}
                        <div className="flex items-center justify-between">
                          <code className="text-xs text-slate-400 font-mono tracking-tight">
                            {elem.path}
                          </code>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 font-bold uppercase tracking-wider">
                            {elem.type}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <select
                            className="input-gemini flex-1 !py-2.5 !px-4 !text-xs"
                            value={elemModifier?.type || 'none'}
                            onChange={(e) =>
                              handleTypeChange(elem.path, e.target.value as Modifier['type'])
                            }
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
                            <button
                              onClick={() => removeModifier(elem.path)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-all duration-200"
                              title="移除修改器"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
