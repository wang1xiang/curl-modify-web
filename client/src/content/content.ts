/// <reference types="chrome" />

// Content Script for Curl 修改工具 Extension
// 注入到所有页面，提供快捷操作
import './content.css'

// 创建浮动按钮
function createFloatingButton() {
  const button = document.createElement('button')
  button.id = 'curl-tool-float-btn'
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  `
  button.title = 'Curl 修改工具'
  document.body.appendChild(button)

  button.addEventListener('click', () => {
    togglePanel()
  })

  return button
}

// 创建侧边面板
function createPanel() {
  const panel = document.createElement('div')
  panel.id = 'curl-tool-panel'
  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span>Curl 修改工具</span>
      </div>
      <button class="panel-close" id="curl-panel-close">&times;</button>
    </div>
    <div class="panel-content">
      <div class="quick-actions">
        <button id="curl-copy-fetch" class="quick-btn">
          📋 复制 Fetch
        </button>
        <button id="curl-copy-curl" class="quick-btn">
          📄 复制 Curl
        </button>
        <button id="curl-open-full" class="quick-btn">
          🚀 打开完整版
        </button>
      </div>
      <div class="network-list" id="curl-network-list">
        <p class="empty-state">暂无网络请求</p>
      </div>
    </div>
  `
  document.body.appendChild(panel)

  // 关闭按钮
  panel.querySelector('#curl-panel-close')?.addEventListener('click', () => {
    panel.classList.remove('visible')
  })

  // 复制 Fetch 按钮
  panel.querySelector('#curl-copy-fetch')?.addEventListener('click', () => {
    copySelectedRequest('fetch')
  })

  // 复制 Curl 按钮
  panel.querySelector('#curl-copy-curl')?.addEventListener('click', () => {
    copySelectedRequest('curl')
  })

  // 打开完整版按钮
  panel.querySelector('#curl-open-full')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_FULL_APP' })
  })

  return panel
}

// 切换面板显示
function togglePanel() {
  let panel = document.getElementById('curl-tool-panel')
  if (!panel) {
    panel = createPanel()
  }
  panel.classList.toggle('visible')
}

// 监听网络请求
const originalFetch = window.fetch
const originalXhrOpen = XMLHttpRequest.prototype.open
const originalXhrSend = XMLHttpRequest.prototype.send

interface CapturedRequest {
  url: string
  method: string
  headers?: Record<string, string>
  body?: string
  timestamp: number
}

let capturedRequests: CapturedRequest[] = []

// 扩展 XMLHttpRequest 接口以存储方法信息
interface XMLHttpRequestWithMethod extends XMLHttpRequest {
  _method?: string
  _url?: string
}

// 拦截 fetch
window.fetch = function (...args) {
  const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url
  const method = args[1]?.method || 'GET'
  const headers = args[1]?.headers || {}

  capturedRequests.push({
    url: String(url),
    method,
    headers: headers as Record<string, string>,
    timestamp: Date.now(),
  })

  updateNetworkList()
  return originalFetch.apply(this, args)
}

// 拦截 XHR
XMLHttpRequest.prototype.open = function (
  method: string,
  url: string | URL
) {
  ;(this as XMLHttpRequestWithMethod)._method = method
  ;(this as XMLHttpRequestWithMethod)._url = String(url)
  return originalXhrOpen.apply(this, arguments as unknown as Parameters<typeof originalXhrOpen>)
}

XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
  const xhr = this as XMLHttpRequestWithMethod
  if (xhr._method && xhr._url) {
    capturedRequests.push({
      url: xhr._url,
      method: xhr._method,
      headers: {},
      body: body as string,
      timestamp: Date.now(),
    })
    updateNetworkList()
  }
  return originalXhrSend.apply(this, arguments as unknown as Parameters<typeof originalXhrSend>)
}

// 更新网络请求列表
function updateNetworkList() {
  const listEl = document.getElementById('curl-network-list')
  if (!listEl) return

  if (capturedRequests.length === 0) {
    listEl.innerHTML = '<p class="empty-state">暂无网络请求</p>'
    return
  }

  listEl.innerHTML = capturedRequests
    .slice(-10)
    .reverse()
    .map((req) => `
      <div class="network-item" data-url="${req.url}">
        <span class="method ${req.method.toLowerCase()}">${req.method}</span>
        <span class="url">${truncateUrl(req.url)}</span>
      </div>
    `)
    .join('')

  // 点击复制
  listEl.querySelectorAll('.network-item').forEach((item) => {
    item.addEventListener('click', () => {
      const url = item.getAttribute('data-url')
      const req = capturedRequests.find((r) => r.url === url)
      if (req) {
        copyAsCurl(req)
      }
    })
  })
}

// 复制为 Curl
function copyAsCurl(req: CapturedRequest) {
  let curl = `curl -X ${req.method} "${req.url}"`

  if (req.headers) {
    Object.entries(req.headers).forEach(([key, value]) => {
      curl += ` -H "${key}: ${value}"`
    })
  }

  if (req.body) {
    curl += ` -d '${JSON.stringify(req.body)}'`
  }

  navigator.clipboard.writeText(curl)

  showToast('已复制为 Curl 命令！')
}

// 复制选中的请求
function copySelectedRequest(type: 'fetch' | 'curl') {
  if (capturedRequests.length === 0) {
    showToast('暂无请求可复制')
    return
  }

  const lastReq = capturedRequests[capturedRequests.length - 1]

  if (type === 'curl') {
    copyAsCurl(lastReq)
  } else {
    const fetchCode = `fetch("${lastReq.url}", {
  method: "${lastReq.method}",
  headers: ${JSON.stringify(lastReq.headers || {}, null, 2)}${lastReq.body ? `,
  body: JSON.stringify(${lastReq.body})` : ''}
})`
    navigator.clipboard.writeText(fetchCode)
    showToast('已复制为 Fetch 代码！')
  }
}

// 截断 URL 显示
function truncateUrl(url: string, maxLen = 40) {
  if (url.length <= maxLen) return url
  return url.slice(0, maxLen - 3) + '...'
}

// 显示 Toast 提示
function showToast(message: string) {
  const toast = document.createElement('div')
  toast.className = 'curl-toast'
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('show')
  }, 10)

  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  createFloatingButton()
})

// 如果 DOM 已经加载完成，立即创建按钮
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => {
    createFloatingButton()
  }, 1000)
}
