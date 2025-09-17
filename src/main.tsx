import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Analytics from './components/Analytics'
import './styles/junta-theme.css'
import './styles/global.css'

const provider = (import.meta.env.VITE_ANALYTICS_PROVIDER || null) as any
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || undefined
const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN || undefined
const umamiId = import.meta.env.VITE_UMAMI_WEBSITE_ID || undefined

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Analytics provider={provider} gaMeasurementId={gaId} plausibleDomain={plausibleDomain} umamiWebsiteId={umamiId} enabled={import.meta.env.PROD} />
    <App />
  </React.StrictMode>
)
