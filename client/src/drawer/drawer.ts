// Drawer Script - 注入到页面中创建抽屉
;(function() {
  // @ts-ignore
  if (window.__curlModifyDrawerInjected) return
  // @ts-ignore
  window.__curlModifyDrawerInjected = true

  // 创建 Shadow DOM 容器
  const host = document.createElement('div')
  host.id = 'curl-modify-host'
  host.style.all = 'initial'
  host.style.position = 'fixed'
  host.style.top = '0'
  host.style.right = '0'
  host.style.width = '1200px'
  host.style.height = '100vh'
  host.style.zIndex = '2147483647'
  host.style.display = 'none'
  document.body.appendChild(host)

  // 创建 Shadow Root
  const shadow = host.attachShadow({ mode: 'open' })

  // 创建抽屉内容
  shadow.innerHTML = `
    <style>
      :host {
        all: initial;
        position: fixed;
        top: 0;
        right: 0;
        width: 1200px;
        height: 100vh;
        z-index: 2147483647;
      }
      .drawer {
        width: 100%;
        height: 100%;
        background: white;
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
        position: relative;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    </style>
    <div class="drawer">
      <iframe src="${chrome.runtime.getURL('popup.html')}"></iframe>
    </div>
  `

  // 创建遮罩层
  const overlay = document.createElement('div')
  overlay.id = 'curl-modify-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2147483646;
    display: none;
  `
  document.body.appendChild(overlay)

  // 点击遮罩关闭抽屉
  overlay.addEventListener('click', () => {
    host.style.display = 'none'
    overlay.style.display = 'none'
  })

  // 打开抽屉函数
  // @ts-ignore
  window.openCurlModifyDrawer = function() {
    host.style.display = 'block'
    overlay.style.display = 'block'
  }

  // 监听消息
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'OPEN_DRAWER') {
      // @ts-ignore
      window.openCurlModifyDrawer()
      sendResponse({ success: true })
    }
    return true
  })
})()
