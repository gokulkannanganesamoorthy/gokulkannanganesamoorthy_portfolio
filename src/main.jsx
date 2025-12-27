import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SfxProvider } from './context/SfxContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SfxProvider>
      <App />
    </SfxProvider>
  </StrictMode>,
)
