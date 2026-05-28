import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { setNestedValue } from '@/utils/json'

export function JsonPreview() {
  const bodyJson = useAppStore((state) => state.bodyJson)
  const modifiers = useAppStore((state) => state.modifiers)
  const parsed = useAppStore((state) => state.parsed)
  const [editableJson, setEditableJson] = useState<string>('')
  const [jsonError, setJsonError] = useState<string>('')

  // 初始化 editableJson
  useMemo(() => {
    if (!bodyJson) return
    try {
      const preview = JSON.parse(JSON.stringify(bodyJson))

      // 分离数组修改器和元素修改器
      const arrayMods: Record<string, typeof modifiers[0]> = {}
      const elementMods: Record<string, typeof modifiers[0]> = {}

      for (const [path, mod] of Object.entries(modifiers)) {
        if (path.includes('[')) {
          elementMods[path] = mod
        } else if (mod.spec === 'array') {
          arrayMods[path] = mod
        }
      }

      // 1. 先应用普通修改器（非数组）
      for (const [path, mod] of Object.entries(modifiers)) {
        if (path.includes('[') || mod.spec === 'array') continue

        let value: unknown = mod.spec
        if (mod.type === 'int') {
          const [min, max] = (mod.spec || '1-100').split('-').map(Number)
          value = Math.floor((min + max) / 2)
        } else if (mod.type === 'string') {
          const parts = (mod.spec || '8:mix').split(':')
          const lang = parts[1] || 'mix'
          if (lang === 'zh') {
            value = '测试字符串'
          } else if (lang === 'en') {
            value = 'TestStr'
          } else if (lang === 'num') {
            value = '123456'
          } else {
            value = 'Abc123'
          }
        } else if (mod.type === 'date') {
          value = new Date().toISOString().slice(0, 19).replace('T', ' ')
        } else if (mod.type === 'list') {
          value = mod.spec.split(',')[0] || ''
        } else if (mod.type === 'phone') {
          value = '13800138000'
        } else if (mod.type === 'email') {
          value = 'example@gmail.com'
        } else if (mod.type === 'url') {
          value = 'https://example.com'
        }
        setNestedValue(preview, path, value)
      }

      // 2. 处理数组修改器
      for (const [arrayPath, arrayMod] of Object.entries(arrayMods)) {
        const arrayCount = arrayMod.arrayCount || 3

        // 收集该数组的元素修改器，并区分是对象数组还是简单数组
        const elemModsForThisArray: Record<string, typeof modifiers[0]> = {}
        let hasNestedFields = false

        for (const [elemPath, elemMod] of Object.entries(elementMods)) {
          if (elemPath.startsWith(arrayPath + '[')) {
            // 提取内部路径
            // order[0].column -> column (对象数组)
            // column[0] -> 空 (简单数组，元素就是值本身)
            const restPath = elemPath.replace(arrayPath + '[0]', '')
            const innerPath = restPath.startsWith('.') ? restPath.slice(1) : ''

            if (innerPath) {
              hasNestedFields = true
            }
            elemModsForThisArray[innerPath || 'value'] = elemMod
          }
        }

        // 生成数组
        const arrayValue: unknown[] = []
        for (let i = 0; i < arrayCount; i++) {
          if (hasNestedFields) {
            // 对象数组：为每个元素生成对象
            const obj: Record<string, unknown> = {}
            for (const [innerPath, elemMod] of Object.entries(elemModsForThisArray)) {
              if (innerPath === 'value') continue // 跳过简单数组的 value 键

              let value: unknown
              if (elemMod.type === 'int') {
                const [min, max] = (elemMod.spec || '1-100').split('-').map(Number)
                value = Math.floor((min + max) / 2)
              } else if (elemMod.type === 'string') {
                const parts = (elemMod.spec || '8:mix').split(':')
                const lang = parts[1] || 'mix'
                if (lang === 'zh') {
                  value = '测试字符串'
                } else if (lang === 'en') {
                  value = 'TestStr'
                } else if (lang === 'num') {
                  value = '123456'
                } else {
                  value = 'Abc123'
                }
              } else if (elemMod.type === 'list') {
                value = elemMod.spec.split(',')[0] || ''
              } else {
                value = elemMod.spec
              }
              obj[innerPath] = value
            }
            arrayValue.push(obj)
          } else {
            // 简单数组：直接生成值
            const elemMod = elemModsForThisArray['value']
            if (elemMod) {
              let value: unknown
              if (elemMod.type === 'int') {
                const [min, max] = (elemMod.spec || '1-100').split('-').map(Number)
                value = Math.floor((min + max) / 2)
              } else if (elemMod.type === 'string') {
                const parts = (elemMod.spec || '8:mix').split(':')
                const lang = parts[1] || 'mix'
                if (lang === 'zh') {
                  value = '测试字符串'
                } else if (lang === 'en') {
                  value = 'TestStr'
                } else if (lang === 'num') {
                  value = '123456'
                } else {
                  value = 'Abc123'
                }
              } else if (elemMod.type === 'list') {
                value = elemMod.spec.split(',')[0] || ''
              } else {
                value = elemMod.spec
              }
              arrayValue.push(value)
            } else {
              arrayValue.push(arrayMod.spec)
            }
          }
        }
        setNestedValue(preview, arrayPath, arrayValue)
      }

      setEditableJson(JSON.stringify(preview, null, 2))
      setJsonError('')
    } catch (e) {
      setJsonError('生成预览失败：' + String(e))
    }
  }, [bodyJson, modifiers])

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setEditableJson(newValue)
    try {
      JSON.parse(newValue)
      setJsonError('')
      // 更新 bodyJson
      if (parsed) {
        useAppStore.getState().setParsed(parsed, JSON.parse(newValue))
      }
    } catch (err) {
      setJsonError((err as Error).message)
    }
  }

  if (!bodyJson) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          JSON 预览与编辑
        </label>
        {jsonError ? (
          <span className="text-xs text-red-500 dark:text-red-400 font-medium">JSON 格式错误</span>
        ) : (
          <span className="text-xs text-green-500 dark:text-green-400 font-medium">JSON 格式正确</span>
        )}
      </div>
      <textarea
        className={`w-full h-96 font-mono text-sm p-4 rounded-xl border bg-gray-900 text-gray-100 resize-y focus-ring ${
          jsonError ? 'border-red-500 dark:border-red-600' : 'border-gray-800'
        }`}
        value={editableJson}
        onChange={handleJsonChange}
        spellCheck={false}
      />
      {jsonError && (
        <p className="text-xs text-red-500 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-900/30">
          {jsonError}
        </p>
      )}
    </div>
  )
}
