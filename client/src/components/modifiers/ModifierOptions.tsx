import type { Modifier } from '@/types'

interface ModifierOptionsProps {
  path: string
  modifier: Modifier
  onChange: (modifier: Modifier) => void
  isArray?: boolean
}

export function ModifierOptions({ modifier, onChange, isArray = false }: ModifierOptionsProps) {
  const handleFixedChange = (value: string) => {
    let parsedValue: string | number | boolean | null = value
    if (/^-?\d+$/.test(value)) parsedValue = parseInt(value, 10)
    else if (/^-?\d+\.\d+$/.test(value)) parsedValue = parseFloat(value)
    else if (value === 'true') parsedValue = true
    else if (value === 'false') parsedValue = false
    else if (value === 'null') parsedValue = null
    onChange({ ...modifier, spec: String(parsedValue) })
  }

  const handleIntChange = (min: string, max: string) => {
    onChange({ ...modifier, spec: `${min}-${max}` })
  }

  const handleStringChange = (len: string, lang: string) => {
    onChange({ ...modifier, spec: `${len}:${lang}` })
  }

  switch (modifier.type) {
    case 'fixed':
      return (
        <input
          type="text"
          className="mod-spec w-full p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder={isArray ? "输入数组元素的固定值..." : "输入固定值..."}
          value={modifier.spec}
          onChange={(e) => handleFixedChange(e.target.value)}
        />
      )

    case 'int': {
      const [min, max] = (modifier.spec || '1-100').split('-')
      return (
        <div className="flex gap-2">
          <input
            type="number"
            className="mod-spec flex-1 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="最小值"
            value={min || '1'}
            onChange={(e) => handleIntChange(e.target.value, max || '100')}
          />
          <input
            type="number"
            className="mod-spec flex-1 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="最大值"
            value={max || '100'}
            onChange={(e) => handleIntChange(min || '1', e.target.value)}
          />
        </div>
      )
    }

    case 'string': {
      const parts = (modifier.spec || '8:mix').split(':')
      const len = parts[0] || '8'
      const lang = parts[1] || 'mix'
      return (
        <div className="flex gap-2">
          <input
            type="number"
            className="mod-spec flex-1 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="长度"
            value={len}
            onChange={(e) => handleStringChange(e.target.value, lang)}
          />
          <select
            className="mod-spec flex-1 p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={lang}
            onChange={(e) => handleStringChange(len, e.target.value)}
          >
            <option value="mix">中英数混合</option>
            <option value="zh">中文</option>
            <option value="en">英文</option>
            <option value="num">数字</option>
          </select>
        </div>
      )
    }

    case 'date':
      return (
        <input
          type="text"
          className="mod-spec w-full p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="日期格式"
          value={modifier.spec || 'YYYY-MM-DD HH:mm:ss'}
          onChange={(e) => onChange({ ...modifier, spec: e.target.value })}
        />
      )

    case 'list':
      return (
        <input
          type="text"
          className="mod-spec w-full p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="用逗号分隔的值..."
          value={modifier.spec}
          onChange={(e) => onChange({ ...modifier, spec: e.target.value })}
        />
      )

    case 'phone':
    case 'email':
    case 'url':
      return (
        <p className="text-xs text-gray-500 dark:text-gray-400">无需配置，自动生成</p>
      )

    default:
      return null
  }
}
