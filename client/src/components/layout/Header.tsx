import { Terminal, Sun, Moon, Zap } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <header className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-white dark:bg-bg-primary-dark sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary-500 rounded-xl">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-text-primary-light dark:text-white flex items-center gap-2">
                Curl <span className="text-primary-500">修改器</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                专业版
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-border-light dark:border-border-dark mr-2">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-[11px] font-semibold text-text-secondary-light dark:text-slate-300">快速拦截已开启</span>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-border-light dark:border-border-dark hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300"
            aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-slate-400 hover:text-yellow-500 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 hover:text-primary-600 transition-colors" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
