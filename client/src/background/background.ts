/// <reference types="chrome" />

// Background Service Worker for Curl 修改工具 Extension

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
  }
})
