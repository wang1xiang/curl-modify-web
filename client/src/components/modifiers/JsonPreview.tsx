import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { setNestedValue } from '@/utils/json'
import { syntaxHighlight } from '@/utils/syntaxHighlight'

export function JsonPreview() {
  const bodyJson = useAppStore((state) => state.bodyJson)
  const modifiers = useAppStore((state) => state.modifiers)

  const previewHtml = useMemo(() => {
    if (!bodyJson) return ''

    const preview = JSON.parse(JSON.stringify(bodyJson))
    for (const [path, mod] of Object.entries(modifiers)) {
      let value: unknown = mod.spec
      if (mod.type === 'int') {
        const [min, max] = mod.spec.split('-').map(Number)
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

    return syntaxHighlight(JSON.stringify(preview, null, 2))
  }, [bodyJson, modifiers])

  if (!bodyJson) return null

  return (
    <pre
      className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm font-mono overflow-auto max-h-48 border border-gray-800"
      dangerouslySetInnerHTML={{ __html: previewHtml }}
    />
  )
}
