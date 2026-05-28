export function flattenObject(obj: Record<string, unknown>, prefix = ''): Array<{ path: string; value: unknown; type: string }> {
  const result: Array<{ path: string; value: unknown; type: string }> = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result.push(...flattenObject(value as Record<string, unknown>, path))
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
