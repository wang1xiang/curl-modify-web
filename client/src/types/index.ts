export interface ParsedCurl {
  method: string
  url: string
  headers: Record<string, string>
  body: string | null
  bodyFormat?: 'json' | 'form-urlencoded'
}

export interface Modifier {
  type: 'none' | 'fixed' | 'int' | 'string' | 'date' | 'phone' | 'email' | 'url' | 'list'
  spec: string
  arrayCount?: number // 数组元素生成数量，仅当字段是数组时使用
}

export interface SavedEndpoint {
  id: number
  name: string
  curlCmd: string
}

export interface GeneratedRequest {
  index: number
  curlCmd: string
  body: string
}

export interface RequestResult {
  success: boolean
  stdout?: string
  stderr?: string
  error?: string
}

export interface AppState {
  // Curl 输入和解析
  curlInput: string
  parsed: ParsedCurl | null
  bodyJson: Record<string, unknown> | null
  modifiers: Record<string, Modifier>
  headerMods: Record<string, string>

  // UI 状态
  headersExpanded: boolean
  leftExpanded: boolean
  rightExpanded: boolean

  // 发送状态
  isSending: boolean
  sendCount: number
  progress: { current: number; total: number }
  results: Array<{ request: GeneratedRequest; result?: RequestResult; isPreview: boolean }>

  // Actions
  setCurlInput: (input: string) => void
  setParsed: (
    parsed: ParsedCurl | null,
    bodyJson: Record<string, unknown> | null,
    bodyFormat: 'json' | 'form-urlencoded'
  ) => void
  setModifier: (path: string, modifier: Modifier) => void
  removeModifier: (path: string) => void
  setHeaderMod: (key: string, value: string) => void
  setHeadersExpanded: (expanded: boolean) => void
  setLeftExpanded: (expanded: boolean) => void
  setRightExpanded: (expanded: boolean) => void
  setIsSending: (sending: boolean) => void
  setSendCount: (count: number) => void
  setProgress: (current: number, total: number) => void
  addResult: (result: {
    request: GeneratedRequest
    result?: RequestResult
    isPreview: boolean
  }) => void
  clearResults: () => void
  reset: () => void
}

export interface SavedEndpointsState {
  endpoints: SavedEndpoint[]
  addEndpoint: (name: string, curlCmd: string) => void
  deleteEndpoint: (id: number) => void
}
