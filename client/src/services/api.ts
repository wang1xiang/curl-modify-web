import type { ParsedCurl, Modifier, GeneratedRequest } from '@/types'

export interface ParseResponse {
  success: boolean
  parsed?: ParsedCurl
  bodyJson?: Record<string, unknown>
  bodyFormat?: 'json' | 'form-urlencoded'
  error?: string
}

export interface GenerateResponse {
  success: boolean
  requests?: GeneratedRequest[]
  error?: string
}

export interface SendResponse {
  success: boolean
  stdout?: string
  stderr?: string
  error?: string
}

// 解析 Curl 命令 - 在扩展环境中使用 background 脚本处理
export async function parseCurl(curlCmd: string): Promise<ParseResponse> {
  // 检查是否在扩展环境中
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'PARSE_CURL', curlCmd }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message })
        } else {
          resolve(response)
        }
      })
    })
  }

  // 普通 Web 环境
  const res = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ curlCmd }),
  })
  return res.json()
}

// 生成请求
export async function generateRequests(
  parsed: ParsedCurl,
  modifiers: Record<string, Modifier>,
  headerMods: Record<string, string>,
  count: number
): Promise<GenerateResponse> {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'GENERATE_REQUESTS', parsed, modifiers, headerMods, count },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message })
          } else {
            resolve(response)
          }
        }
      )
    })
  }

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parsed, modifiers, headerMods, count }),
  })
  return res.json()
}

// 发送请求
export async function sendRequest(curlCmd: string): Promise<SendResponse> {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'SEND_REQUEST', curlCmd }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message })
        } else {
          resolve(response)
        }
      })
    })
  }

  const res = await fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ curlCmd }),
  })
  return res.json()
}
