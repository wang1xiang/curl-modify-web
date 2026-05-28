import { Header } from './components/layout/Header'
import { LeftPanel } from './components/layout/LeftPanel'
import { MiddlePanel } from './components/layout/MiddlePanel'
import { RightPanel } from './components/layout/RightPanel'
import { useTheme } from './hooks/useTheme'

function App() {
  useTheme() // 初始化主题

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <MiddlePanel />
        <RightPanel />
      </div>
    </div>
  )
}

export default App
