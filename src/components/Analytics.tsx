import React, { useEffect } from 'react'

type Provider = 'ga4' | 'plausible' | 'umami' | null

interface Props {
  provider?: Provider
  gaMeasurementId?: string
  plausibleDomain?: string
  umamiWebsiteId?: string
  enabled?: boolean
}

function insertScript(src: string, id?: string, inline?: string){
  if(typeof document === 'undefined') return
  if(id && document.getElementById(id)) return
  if(inline){
    const s = document.createElement('script')
    if(id) s.id = id
    s.type = 'text/javascript'
    s.innerHTML = inline
    document.head.appendChild(s)
    return
  }
  const s = document.createElement('script')
  if(id) s.id = id
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

export default function Analytics({ provider = null, gaMeasurementId, plausibleDomain, umamiWebsiteId, enabled = true }: Props){
  useEffect(()=>{
    if(!enabled) return
    if(provider === 'ga4' && gaMeasurementId){
      // GA4 snippet
      insertScript(`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`, 'ga4-js')
      insertScript('', 'ga4-inline', `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaMeasurementId}');`)
    }
    if(provider === 'plausible' && plausibleDomain){
      insertScript(`https://plausible.io/js/plausible.js`, 'plausible-js')
      insertScript('', 'plausible-inline', `window.plausible = window.plausible || function(){(window.plausible.q = window.plausible.q || []).push(arguments)};`)
    }
    if(provider === 'umami' && umamiWebsiteId){
      insertScript(`https://umami.example.com/umami.js`, 'umami-js')
      insertScript('', 'umami-inline', `window.umami = window.umami || function(){(window.umami.q = window.umami.q || []).push(arguments)}; umami('create', '${umamiWebsiteId}');`)
    }
  },[provider, gaMeasurementId, plausibleDomain, umamiWebsiteId, enabled])

  return null
}
