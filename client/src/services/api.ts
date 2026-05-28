import type { ParsedCurl, Modifier, GeneratedRequest } from '@/types'

export interface ParseResponse {
  success: boolean
  parsed?: ParsedCurl
  bodyJson?: Record<string, unknown>
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

export async function parseCurl(curlCmd: string): Promise<ParseResponse> {
  const res = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ curlCmd }),
  })
  return res.json()
}

export async function generateRequests(
  parsed: ParsedCurl,
  modifiers: Record<string, Modifier>,
  headerMods: Record<string, string>,
  count: number
): Promise<GenerateResponse> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parsed, modifiers, headerMods, count }),
  })
  return res.json()
}

export async function sendRequest(curlCmd: string): Promise<SendResponse> {
  const res = await fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ curlCmd }),
  })
  return res.json()
}
