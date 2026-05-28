import { Terminal, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <header className="panel-header border-b sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Curl 修改工具
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              现代化 API 请求测试工具
            </p>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus-ring"
          aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-gray-300 hover:text-yellow-400 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 hover:text-primary-600 transition-colors" />
          )}
        </button>
      </div>
    </header>
  )
}
