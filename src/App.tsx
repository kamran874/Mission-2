import { useState } from 'react'
import { BottomNav, type Page } from './components/BottomNav'
import { Control } from './pages/Control'
import { Devices } from './pages/Devices'
import { Timer } from './pages/Timer'

export default function App() {
  const [page, setPage] = useState<Page>('control')

  return (
    <div className="safe-top flex min-h-screen flex-col bg-[color:var(--color-bg)] pb-20">
      <main className="flex-1">
        {page === 'control' && <Control />}
        {page === 'timer' && <Timer />}
        {page === 'devices' && <Devices />}
      </main>
      <BottomNav page={page} onChange={setPage} />
    </div>
  )
}
