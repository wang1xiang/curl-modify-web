/// <reference types="chrome" />

// Background Service Worker for Curl 修改工具 Extension

// 简单的 curl 命令解析器
function parseCurlCommand(curlCmd: string): { method: string; url: string; headers: Record<string, string>; body?: string } {
  const result: { method: string; url: string; headers: Record<string, string>; body?: string } = {
    method: 'GET',
    url: '',
    headers: {},
  }

  // 提取 method
  const methodMatch = curlCmd.match(/-X\s+(\w+)/)
  if (methodMatch) {
    result.method = methodMatch[1]
  }

  // 提取 URL（第一个非选项参数）
  const urlMatch = curlCmd.match(/curl\s+['"]([^'"]+)['"]/) || curlCmd.match(/curl\s+(\S+)/)
  if (urlMatch) {
    result.url = urlMatch[1].replace(/^['"]|['"]$/g, '')
  }

  // 提取 headers
  const headerMatches = curlCmd.matchAll(/-H\s+['"]([^:]+):\s*([^'"]+)['"]/g)
  for (const match of headerMatches) {
    result.headers[match[1].trim()] = match[2].trim()
  }

  // 提取 body
  const bodyMatch = curlCmd.match(/-d\s+['"](.+)['"]/) || curlCmd.match(/--data\s+['"](.+)['"]/)
  if (bodyMatch) {
    result.body = bodyMatch[1]
  }

  return result
}

// 生成请求体
function generateValue(spec: { type: string; spec: string }): unknown {
  const { type, spec: specStr } = spec

  switch (type) {
    case 'fixed':
      return specStr

    case 'int': {
      const [min, max] = specStr.split('-').map(Number)
      return Math.floor(Math.random() * (max - min + 1)) + min
    }

    case 'string': {
      const parts = specStr.split(':')
      const length = parseInt(parts[0]) || 8
      const lang = parts[1] || 'mix'
      const chars = {
        zh: '测试字符串',
        en: 'TestString',
        num: '12345678',
        mix: 'Abc12345',
      }
      return (chars as Record<string, string>)[lang]?.slice(0, length) || 'Abc12345'
    }

    case 'date': {
      const now = new Date()
      return now.toISOString().slice(0, 19).replace('T', ' ')
    }

    case 'phone':
      return '13800138000'

    case 'email':
      return 'test@example.com'

    case 'url':
      return 'https://example.com'

    case 'list':
      return specStr.split(',')[0] || ''

    default:
      return specStr
  }
}

// 设置嵌套值
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) current[parts[i]] = {}
    current = current[parts[i]] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
}

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  // 初始化存储
  chrome.storage.local.set({
    savedEndpoints: [],
    settings: {
      darkMode: false,
      defaultCount: 1,
    },
  })

  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'copyAsCurl',
    title: '复制为 Curl 命令',
    contexts: ['link', 'selection'],
  })

  chrome.contextMenus.create({
    id: 'sendWithCurlTool',
    title: '使用 Curl 修改工具发送',
    contexts: ['selection'],
  })
})

// 右键菜单点击处理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'copyAsCurl' && info.linkUrl) {
    await chrome.scripting.executeScript({
      target: { tabId: tab!.id! },
      func: copyLinkAsCurl,
      args: [info.linkUrl],
    })
  } else if (info.menuItemId === 'sendWithCurlTool' && info.selectionText) {
    // 打开 popup 并传入选中的文本
    await chrome.storage.local.set({ pendingCurl: info.selectionText })
    await chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 450,
      height: 600,
    })
  }
})

// 复制链接为 Curl 的函数（在页面上下文中执行）
function copyLinkAsCurl(url: string) {
  const curlCmd = `curl -X GET "${url}" -H "Accept: application/json"`
  navigator.clipboard.writeText(curlCmd).then(() => {
    console.log('Curl command copied to clipboard')
  }).catch((err) => {
    console.error('Failed to copy:', err)
  })
}

// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.type) {
    case 'GET_CURL_DATA':
      chrome.storage.local.get(['savedEndpoints', 'settings'], (result) => {
        sendResponse(result)
      })
      return true

    case 'SAVE_CURL':
      chrome.storage.local.get({ savedEndpoints: [] }, (result) => {
        const endpoints = result.savedEndpoints as Array<{ id: number; name: string; curlCmd: string }>
        endpoints.push({
          id: Date.now(),
          name: request.name,
          curlCmd: request.curlCmd,
        })
        chrome.storage.local.set({ savedEndpoints: endpoints }, () => {
          sendResponse({ success: true })
        })
      })
      return true

    case 'DELETE_CURL':
      chrome.storage.local.get({ savedEndpoints: [] }, (result) => {
        const endpoints = result.savedEndpoints as Array<{ id: number }>
        const filteredEndpoints = endpoints.filter((e) => e.id !== request.id)
        chrome.storage.local.set({ savedEndpoints: filteredEndpoints }, () => {
          sendResponse({ success: true })
        })
      })
      return true

    case 'OPEN_FULL_APP':
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
      return true

    case 'PARSE_CURL': {
      try {
        const parsed = parseCurlCommand(request.curlCmd)
        let bodyJson: Record<string, unknown> | null = null
        if (parsed.body) {
          try {
            bodyJson = JSON.parse(parsed.body)
          } catch {
            // 如果解析失败，尝试将字符串作为值
            bodyJson = { value: parsed.body }
          }
        }
        sendResponse({
          success: true,
          parsed,
          bodyJson,
        })
      } catch (e) {
        sendResponse({
          success: false,
          error: String(e),
        })
      }
      return true
    }

    case 'GENERATE_REQUESTS': {
      try {
        const { parsed, modifiers, headerMods, count } = request
        const requests = []

        for (let i = 0; i < count; i++) {
          let bodyObj = parsed.body ? JSON.parse(parsed.body) : {}

          // 应用修改器
          for (const [path, mod] of Object.entries(modifiers as Record<string, { type: string; spec: string }>)) {
            const value = generateValue(mod)
            setNestedValue(bodyObj, path, value)
          }

          const bodyStr = JSON.stringify(bodyObj)
          let curlCmd = `curl -X ${parsed.method} "${parsed.url}"`

          // 添加 headers
          const headers = { ...parsed.headers, ...headerMods }
          for (const [key, value] of Object.entries(headers)) {
            curlCmd += ` -H "${key}: ${value}"`
          }

          // 添加 body
          if (bodyStr && bodyStr !== '{}') {
            curlCmd += ` -d '${bodyStr.replace(/'/g, "'\\''")}'`
          }

          requests.push({
            index: i + 1,
            curlCmd,
            body: bodyStr,
          })
        }

        sendResponse({ success: true, requests })
      } catch (e) {
        sendResponse({
          success: false,
          error: String(e),
        })
      }
      return true
    }

    case 'SEND_REQUEST': {
      try {
        const parsed = parseCurlCommand(request.curlCmd)

        const fetchOptions: RequestInit = {
          method: parsed.method,
          headers: parsed.headers,
        }

        if (parsed.body) {
          fetchOptions.body = parsed.body
        }

        fetch(parsed.url, fetchOptions)
          .then((res) => res.text())
          .then((text) => {
            sendResponse({
              success: true,
              stdout: text,
            })
          })
          .catch((err) => {
            sendResponse({
              success: false,
              error: String(err),
            })
          })

        return true // 保持通道开放以进行异步响应
      } catch (e) {
        sendResponse({
          success: false,
          error: String(e),
        })
        return true
      }
    }
  }
})
