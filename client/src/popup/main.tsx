import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.tsx'
import '../index.css'

// 设置 popup 窗口样式 - 必须在渲染前设置
const rootElement = document.getElementById('root')
if (rootElement) {
  rootElement.style.width = '100%'
  rootElement.style.height = '100%'
}

// 直接在 popup 中打开完整版应用
ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <div style={{ width: '100%', height: '100%' }}>
      <App />
    </div>
  </React.StrictMode>
)
