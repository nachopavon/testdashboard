type EventProps = { [k:string]: any }

type Provider = 'ga4'|'plausible'|'umami'|null

const provider = (import.meta.env.VITE_ANALYTICS_PROVIDER || null) as Provider
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || undefined
const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN || undefined
const umamiId = import.meta.env.VITE_UMAMI_WEBSITE_ID || undefined

export function init(){
  // No-op here; the Analytics component already injects provider scripts at head.
}

export function trackEvent(name: string, props: EventProps = {}){
  try{
    if(!import.meta.env.PROD) return // only track in production
    if(provider === 'ga4' && typeof (window as any).gtag === 'function'){
      ;(window as any).gtag('event', name, props)
      return
    }
    if(provider === 'plausible' && typeof (window as any).plausible === 'function'){
      ;(window as any).plausible(name, { props })
      return
    }
    if(provider === 'umami' && typeof (window as any).umami === 'function'){
      ;(window as any).umami(name, props)
      return
    }
  }catch(e){
    // swallow errors to avoid breaking app
    console.debug('[analytics] trackEvent error', e)
  }
}

export default { init, trackEvent }
