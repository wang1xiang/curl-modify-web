import type { Modifier } from '@/types'
import { GeminiSelect } from '@/components/ui/GeminiSelect'

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

  const langOptions = [
    { value: 'mix', label: '中英数混合' },
    { value: 'zh', label: '中文' },
    { value: 'en', label: '英文' },
    { value: 'num', label: '数字' },
  ]

  return (
    <div className="pt-3 mt-3 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">配置</h3>
      </div>
      
      <div className="space-y-2">
        {(() => {
          switch (modifier.type) {
            case 'fixed':
              return (
                <input
                  type="text"
                  className="input-gemini !py-2.5 !text-xs !px-4"
                  placeholder={isArray ? "数组元素的固定值..." : "固定值..."}
                  value={modifier.spec}
                  onChange={(e) => handleFixedChange(e.target.value)}
                />
              )

            case 'int': {
              const [min, max] = (modifier.spec || '1-100').split('-')
              return (
                <div className="flex gap-3">
                  <input
                    type="number"
                    className="input-gemini flex-1 !py-2.5 !text-xs !px-4"
                    placeholder="最小值"
                    value={min || '1'}
                    onChange={(e) => handleIntChange(e.target.value, max || '100')}
                  />
                  <input
                    type="number"
                    className="input-gemini flex-1 !py-2.5 !text-xs !px-4"
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
                <div className="flex gap-3">
                  <input
                    type="number"
                    className="input-gemini flex-1 !py-2.5 !text-xs !px-4"
                    placeholder="长度"
                    value={len}
                    onChange={(e) => handleStringChange(e.target.value, lang)}
                  />
                  <div className="flex-[2]">
                    <GeminiSelect
                        options={langOptions}
                        value={lang}
                        onChange={(val) => handleStringChange(len, val)}
                    />
                  </div>
                </div>
              )
            }

            case 'date':
              return (
                <input
                  type="text"
                  className="input-gemini !py-2.5 !text-xs !px-4"
                  placeholder="日期格式 (YYYY-MM-DD HH:mm:ss)"
                  value={modifier.spec || 'YYYY-MM-DD HH:mm:ss'}
                  onChange={(e) => onChange({ ...modifier, spec: e.target.value })}
                />
              )

            case 'list':
              return (
                <input
                  type="text"
                  className="input-gemini !py-2.5 !text-xs !px-4"
                  placeholder="逗号分隔的值 (例如: A,B,C)"
                  value={modifier.spec}
                  onChange={(e) => onChange({ ...modifier, spec: e.target.value })}
                />
              )

            case 'phone':
            case 'email':
            case 'url':
              return (
                <p className="text-xs text-slate-500 font-medium px-1.5 py-2">
                  自动生成，无需配置。
                </p>
              )

            default:
              return null
          }
        })()}
      </div>
    </div>
  )
}
