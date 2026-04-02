/// <reference types="chrome" />
import { Terminal, Sun, Moon, FolderOpen, Save, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'

// 简化版 Popup 组件 - 完整功能在新标签页中打开
export default function Popup() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [curlInput, setCurlInput] = useState('')

  const openFullApp = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setCurlInput(text)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
  }

  const handleSave = () => {
    if (!curlInput.trim()) {
      alert('请先粘贴 curl 命令')
      return
    }
    const name = prompt('请输入接口名称（例如：更新用户信息）：')
    if (name && name.trim()) {
      chrome.storage.local.get({ savedEndpoints: [] }, (result) => {
        const endpoints = result.savedEndpoints as Array<{ id: number; name: string; curlCmd: string }>
        endpoints.push({ id: Date.now(), name: name.trim(), curlCmd: curlInput })
        chrome.storage.local.set({ savedEndpoints: endpoints }, () => {
          alert('保存成功！')
          setCurlInput('')
        })
      })
    }
  }

  return (
    <div className={`w-[400px] min-h-[500px] flex flex-col ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                Curl 修改工具
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                API 请求测试神器
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openFullApp}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-primary-600 dark:text-primary-400"
              title="打开完整版"
            >
              完整版
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-gray-300" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 overflow-auto">
        <div className="space-y-4">
          {/* 快捷操作 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePasteFromClipboard}
              className="btn-secondary text-sm py-2"
            >
              📋 粘贴 Curl
            </button>
            <button
              onClick={openFullApp}
              className="btn-secondary text-sm py-2"
            >
              🚀 打开完整版
            </button>
          </div>

          {/* Curl 输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Curl 命令
            </label>
            <textarea
              className="input-field h-32 font-mono text-sm resize-none"
              placeholder="在此粘贴 curl 命令..."
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
            />
          </div>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            className="btn-cta w-full flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存接口
          </button>

          {/* 已保存的接口列表 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                已保存的接口
              </span>
            </div>
            <SavedEndpointsList onSelect={setCurlInput} />
          </div>
        </div>
      </div>
    </div>
  )
}

// 已保存接口列表组件
function SavedEndpointsList({ onSelect }: { onSelect: (curl: string) => void }) {
  const [endpoints, setEndpoints] = useState<Array<{ id: number; name: string; curlCmd: string }>>([])

  useEffect(() => {
    chrome.storage.local.get({ savedEndpoints: [] }, (result) => {
      setEndpoints(result.savedEndpoints as Array<{ id: number; name: string; curlCmd: string }>)
    })
  }, [])

  const handleDelete = (id: number) => {
    chrome.storage.local.get({ savedEndpoints: [] }, (result) => {
      const endpoints = result.savedEndpoints as Array<{ id: number; name: string; curlCmd: string }>
      const filteredEndpoints = endpoints.filter((e) => e.id !== id)
      chrome.storage.local.set({ savedEndpoints: filteredEndpoints }, () => {
        setEndpoints(filteredEndpoints)
      })
    })
  }

  const handleSelect = (curlCmd: string) => {
    onSelect(curlCmd)
  }

  if (endpoints.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <p className="text-sm">暂无保存的接口</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-48 overflow-auto">
      {endpoints.map((ep) => (
        <div
          key={ep.id}
          className="group flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
          onClick={() => handleSelect(ep.curlCmd)}
        >
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
            {ep.name}
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(ep.id)
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ))}
    </div>
  )
}
