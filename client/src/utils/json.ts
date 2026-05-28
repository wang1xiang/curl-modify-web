export function flattenObject(obj: Record<string, unknown>, prefix = ''): Array<{ path: string; value: unknown; type: string; isArray?: boolean }> {
  const result: Array<{ path: string; value: unknown; type: string; isArray?: boolean }> = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result.push(...flattenObject(value as Record<string, unknown>, path))
    } else if (Array.isArray(value)) {
      // 数组类型，提取数组元素类型
      const arrayType = value.length > 0 ? typeof value[0] : 'unknown'
      result.push({ path, value, type: arrayType, isArray: true })
      // 如果数组元素是对象，展开它们
      if (arrayType === 'object') {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            const nested = flattenObject(item as Record<string, unknown>, `${path}[${index}]`)
            result.push(...nested)
          }
        })
      } else if (value.length > 0) {
        // 对于非对象数组（如字符串数组、数字数组），只展示第一个元素作为示例
        result.push({ path: `${path}[0]`, value: value[0], type: arrayType, isArray: false })
      }
    } else {
      result.push({ path, value, type: typeof value })
    }
  }
  return result
}

export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) current[parts[i]] = {}
    current = current[parts[i]] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
}

// 生成数组值
export function generateArrayValue(generateFn: () => unknown, count: number): unknown[] {
  const result: unknown[] = []
  for (let i = 0; i < count; i++) {
    result.push(generateFn())
  }
  return result
}
