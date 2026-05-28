import { Header } from './components/layout/Header'
import { LeftPanel } from './components/layout/LeftPanel'
import { MiddlePanel } from './components/layout/MiddlePanel'
import { RightPanel } from './components/layout/RightPanel'
import { useTheme } from './hooks/useTheme'

function App() {
  useTheme()

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 relative overflow-hidden transition-colors">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-500/5 rounded-full blur-[120px] animate-blob animation-delay-4000 pointer-events-none"></div>

      <Header />
      <main className="flex-1 flex overflow-hidden relative z-10">
        <LeftPanel />
        <MiddlePanel />
        <RightPanel />
      </main>
    </div>
  )
}

export default App
