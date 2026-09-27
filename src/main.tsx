import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AcProvider } from './store.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AcProvider>
      <App />
    </AcProvider>
  </StrictMode>,
)
