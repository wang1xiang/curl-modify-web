/// <reference types="chrome" />

// Background Service Worker for Curl 修改工具 Extension

// 点击扩展图标时，在当前页面注入抽屉
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return

  // 注入抽屉脚本
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['drawer.js'],
  })

  // 然后发送消息打开抽屉
  setTimeout(async () => {
    await chrome.tabs.sendMessage(tab.id!, { type: 'OPEN_DRAWER' })
  }, 500)
})

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

  // 提取 URL（第一个非选项参数，通常是 curl 命令后的第一个 URL 字符串）
  // 处理格式：curl 'URL' -X POST ...  或  curl -X POST 'URL' ...
  let urlValue = ''

  // 方法 1: 先尝试匹配 curl 后紧跟的 URL（排除 -X 等选项）
  // 匹配 curl 后面第一个以 http 开头的引号内容
  const urlMatch1 = curlCmd.match(/curl\s+['"]?(https?:\/\/[^'"\s]+)['"]?/)
  if (urlMatch1) {
    urlValue = urlMatch1[1]
  }

  // 方法 2: 尝试匹配 -X METHOD 之后的 URL
  if (!urlValue) {
    const urlMatch2 = curlCmd.match(/-X\s+\w+\s+['"]?(https?:\/\/[^'"\s]+)['"]?/)
    if (urlMatch2) {
      urlValue = urlMatch2[1]
    }
  }

  // 方法 3: 尝试匹配第一个出现的 http URL（任何位置）
  if (!urlValue) {
    const urlMatch3 = curlCmd.match(/['"]?(https?:\/\/[^'"\s]+)['"]?/)
    if (urlMatch3) {
      urlValue = urlMatch3[1]
    }
  }

  result.url = urlValue

  // 提取 headers
  const headerMatches = curlCmd.matchAll(/-H\s+['"]([^:]+):\s*([^'"]+)['"]/g)
  for (const match of headerMatches) {
    result.headers[match[1].trim()] = match[2].trim()
  }

  // 提取 body（支持 -d, --data, --data-raw, --data-binary 等多种形式）
  const bodyMatch = curlCmd.match(/-d\s+['"](.+)['"]/)
    || curlCmd.match(/--data\s+['"](.+)['"]/)
    || curlCmd.match(/--data-raw\s+['"](.+)['"]/)
    || curlCmd.match(/--data-binary\s+['"](.+)['"]/)
  if (bodyMatch) {
    result.body = bodyMatch[1]
    // 如果有 body 但没有显式指定 method，默认为 POST
    if (!methodMatch) {
      result.method = 'POST'
    }
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
      // 处理 spec 为空的情况，使用默认值 1-100
      const specParts = (specStr || '1-100').split('-')
      const min = parseInt(specParts[0]) || 1
      const max = parseInt(specParts[1]) || 100
      return Math.floor(Math.random() * (max - min + 1)) + min
    }

    case 'string': {
      // 处理 spec 为空的情况，使用默认值 8:mix
      const specParts = (specStr || '8:mix').split(':')
      const length = parseInt(specParts[0]) || 8
      const lang = specParts[1] || 'mix'
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
      // 如果是数组标记，返回空字符串（数组本身由 GENERATE_REQUESTS 处理）
      if (specStr === 'array') return ''
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

        // 分离数组修改器和普通修改器
        const arrayModifiers: Record<string, { type: string; spec: string; arrayCount?: number }> = {}
        const normalModifiers: Record<string, { type: string; spec: string; arrayCount?: number }> = {}
        const arrayElementModifiers: Record<string, { type: string; spec: string; arrayCount?: number }> = {}

        for (const [path, mod] of Object.entries(modifiers as Record<string, { type: string; spec: string; arrayCount?: number }>)) {
          if (path.includes('[')) {
            // 数组元素修改器，如 order[0].column
            arrayElementModifiers[path] = mod
          } else if (mod.spec === 'array' && mod.arrayCount && mod.arrayCount > 0) {
            // 数组修改器（spec 为 'array' 且有 arrayCount）
            arrayModifiers[path] = mod
          } else {
            // 普通修改器
            normalModifiers[path] = mod
          }
        }

        for (let i = 0; i < count; i++) {
          let bodyObj = parsed.body ? JSON.parse(parsed.body) : {}

          // 1. 先应用普通修改器
          for (const [path, mod] of Object.entries(normalModifiers)) {
            const value = generateValue(mod)
            setNestedValue(bodyObj, path, value)
          }

          // 2. 处理数组修改器（生成数组）
          for (const [arrayPath, arrayMod] of Object.entries(arrayModifiers)) {
            const arrayCount = arrayMod.arrayCount || 3

            // 收集该数组的元素修改器，并区分是对象数组还是简单数组
            const elementMods: Record<string, { type: string; spec: string }> = {}
            let hasNestedFields = false

            for (const [elemPath, elemMod] of Object.entries(arrayElementModifiers)) {
              if (elemPath.startsWith(arrayPath + '[')) {
                // 提取内部路径
                // order[0].column -> column (对象数组)
                // column[0] -> 空 (简单数组)
                const restPath = elemPath.replace(arrayPath + '[0]', '')
                const innerPath = restPath.startsWith('.') ? restPath.slice(1) : ''

                if (innerPath) {
                  hasNestedFields = true
                }
                elementMods[innerPath || 'value'] = elemMod
              }
            }

            // 生成数组
            const arrayValue = []
            for (let j = 0; j < arrayCount; j++) {
              if (hasNestedFields && Object.keys(elementMods).length > 0) {
                // 对象数组：为每个元素生成对象
                const obj: Record<string, unknown> = {}
                for (const [innerPath, elemMod] of Object.entries(elementMods)) {
                  if (innerPath === 'value') continue // 跳过简单数组的 value 键
                  obj[innerPath] = generateValue(elemMod)
                }
                arrayValue.push(obj)
              } else {
                // 简单数组：直接生成值
                const elemMod = elementMods['value']
                if (elemMod) {
                  arrayValue.push(generateValue(elemMod))
                } else {
                  arrayValue.push(generateValue(arrayMod))
                }
              }
            }
            setNestedValue(bodyObj, arrayPath, arrayValue)
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
      (async () => {
        try {
          const parsed = parseCurlCommand(request.curlCmd)

          if (!parsed.url) {
            throw new Error('URL 为空，请检查 curl 命令格式')
          }

          if (!parsed.url.startsWith('http://') && !parsed.url.startsWith('https://')) {
            throw new Error('无效的 URL 协议：' + parsed.url)
          }

          const fetchOptions: RequestInit = {
            method: parsed.method,
            headers: parsed.headers,
          }

          if (parsed.body) {
            fetchOptions.body = parsed.body
          }

          const response = await fetch(parsed.url, fetchOptions)
          const text = await response.text()
          sendResponse({
            success: true,
            stdout: text,
          })
        } catch (err) {
          sendResponse({
            success: false,
            error: String(err),
          })
        }
      })()
      return true
    }
  }
})
