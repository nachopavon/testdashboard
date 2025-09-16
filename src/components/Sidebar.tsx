import React, { useEffect, useState } from 'react'
import styles from './Sidebar.module.css'

type ViewKey = 'ans'|'econ'|'chat'|'demanda'|'servicios-prestados'|'servicios-pendientes'|'carga-trabajo'|'gcb-03'|'gpr-04'|'gco-05'|'capacidad'
type Props = {
  view: ViewKey
  onChange: (v:ViewKey)=>void
  ansCount?: number
  econCount?: number
  serviciosCount?: number
  pendientesCount?: number
  cargaCount?: number
  gcbCount?: number
  gprCount?: number
  gcoCount?: number
  capacidadCount?: number
  chatCount?: number
}

export default function Sidebar({
  view='ans',
  onChange,
  ansCount=0,
  econCount=0,
  serviciosCount=0,
  pendientesCount=0,
  cargaCount=0
  ,gcbCount=0,gprCount=0,gcoCount=0,capacidadCount=0,chatCount=0
}:Props){
  const [collapsed, setCollapsed] = useState(()=>{
    try{ return localStorage.getItem('td_sidebar_collapsed') === '1' }catch{ return false }
  })

  useEffect(()=>{ try{ localStorage.setItem('td_sidebar_collapsed', collapsed ? '1' : '0') }catch{ /* ignore */ } }, [collapsed])

  // instrumentation: log computed background to help detect runtime mutations
  useEffect(()=>{
    try{
      const el = document.querySelector('aside[aria-label="Navegación principal"]') as HTMLElement | null
      if(!el) return
      const cs = getComputedStyle(el)
      // log background properties (background & background-image) when view changes
      // this helps detect if any component modifies CSS variables or inline styles at runtime
      // eslint-disable-next-line no-console
      console.debug('[td-debug] sidebar background:', { view, background: cs.background, backgroundImage: cs.backgroundImage })
    }catch(e){ /* ignore */ }
  }, [view])

  // Dev-only: observe mutations on the aside and wrap setProperty to capture stacks for relevant changes
  useEffect(()=>{
    if(typeof window === 'undefined') return
    try{
      const isProd = (process && (process.env as any)?.NODE_ENV) === 'production'
      if(isProd) return
    }catch(e){ /* ignore */ }

    let origSetProperty: ((name: string, value: string, priority?: string) => void) | undefined
    let patched = false
    const el = document.querySelector('aside[aria-label="Navegación principal"]') as HTMLElement | null
    if(el){
      const mo = new MutationObserver((records)=>{
        for(const r of records){
          try{
            if(r.type === 'attributes'){
              const attr = r.attributeName
              const val = attr ? el.getAttribute(attr) : null
              // capture a stack to help find the origin
              const stack = (new Error()).stack || ''
              // eslint-disable-next-line no-console
              console.warn('[td-debug] aside mutation', { attribute: attr, value: val, computedBackground: getComputedStyle(el).background, stack: stack.split('\n').slice(2,8).join('\n') })
            }
          }catch(e){/* ignore */}
        }
      })
      try{ mo.observe(el, { attributes: true, attributeFilter: ['style','class'] }) }catch(e){/* ignore */}

      // wrapper for setProperty that only logs relevant names (nav vars or background)
      try{
        const proto = (CSSStyleDeclaration as any).prototype as any
        if(proto && !((window as any).__td_setProperty_orig)){
          origSetProperty = proto.setProperty
          (window as any).__td_setProperty_orig = origSetProperty
          proto.setProperty = function(name: string, value: string, priority?: string){
            try{
              if(typeof name === 'string' && (name.indexOf('--nav') !== -1 || name.indexOf('background') !== -1)){
                const stack = (new Error()).stack || ''
                // eslint-disable-next-line no-console
                console.warn('[td-debug] setProperty (sidebar-watch) called:', { name, value, priority, stack: stack.split('\n').slice(2,8).join('\n') })
              }
            }catch(e){/* ignore */}
            return origSetProperty.apply(this, arguments as any)
          }
          patched = true
        }
      }catch(e){ /* ignore */ }

      return ()=>{
        try{ mo.disconnect() }catch(e){}
        if(patched){
          try{
            const proto = (CSSStyleDeclaration as any).prototype as any
            const orig = (window as any).__td_setProperty_orig
            if(proto && orig) proto.setProperty = orig
            delete (window as any).__td_setProperty_orig
          }catch(e){/* ignore */}
        }
      }
    }
  }, [])

  function handleKeyClick(event:React.KeyboardEvent, v: ViewKey){
    if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); onChange(v) }
  }

  return (
    <aside
        className={`${styles.sidebar} ${collapsed?styles.collapsed:''}`}
        aria-label="Navegación principal"
        // defensive inline style: ensures sidebar background cannot be overridden by runtime CSS variable changes
        style={{ background: 'linear-gradient(180deg, #2f8b58, #0b5fa5)' }}
      >
      <div className={styles.topRow}>
        <div className={styles.logo} title="Cuadro de Mandos Unificado">Cuadro de Mandos Unificado</div>
        <button className={styles.collapseBtn} aria-label={collapsed? 'Abrir menú':'Cerrar menú'} onClick={()=>setCollapsed(c=>!c)}>{collapsed? '›':'‹'}</button>
      </div>

      <nav className={styles.nav} role="navigation" aria-label="Secciones">
        <button
          className={`${styles.navBtn} ${view==='econ'?styles.btnActive:''}`}
          onClick={()=>onChange('econ')}
          onKeyDown={(e)=>handleKeyClick(e,'econ')}
          aria-pressed={view==='econ'}
          title="Seguimiento económico"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 13h4v8H3zM10 7h4v14h-4zM17 3h4v18h-4z" fill="currentColor" />
          </svg>
          <span className={styles.label}>Seguimiento económico</span>
          <span className={styles.badge} aria-hidden>{econCount}</span>
        </button>

        
        <button
          className={`${styles.navBtn} ${view==='ans'?styles.btnActive:''}`}
          onClick={()=>onChange('ans')}
          onKeyDown={(e)=>handleKeyClick(e,'ans')}
          aria-pressed={view==='ans'}
          title="Seguimiento ANS"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2l3 6h6l-5 4 2 8-6-4-6 4 2-8-5-4h6z" fill="currentColor" />
          </svg>
          <span className={styles.label}>Seguimiento ANS</span>
          <span className={styles.badge} aria-hidden>{ansCount}</span>
        </button>

        <button
          className={`${styles.navBtn} ${view==='servicios-prestados'?styles.btnActive:''}`}
          onClick={()=>onChange('servicios-prestados')}
          onKeyDown={(e)=>handleKeyClick(e,'servicios-prestados')}
          aria-pressed={view==='servicios-prestados'}
          title="Servicios Prestados"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>Servicios Prestados</span>
          <span className={styles.badge} aria-hidden>{serviciosCount}</span>
        </button>

        <button
          className={`${styles.navBtn} ${view==='servicios-pendientes'?styles.btnActive:''}`}
          onClick={()=>onChange('servicios-pendientes')}
          onKeyDown={(e)=>handleKeyClick(e,'servicios-pendientes')}
          aria-pressed={view==='servicios-pendientes'}
          title="Servicios Pendientes"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>Servicios Pendientes</span>
          <span className={styles.badge} aria-hidden>{pendientesCount}</span>
        </button>

        <button
          className={`${styles.navBtn} ${view==='carga-trabajo'?styles.btnActive:''}`}
          onClick={()=>onChange('carga-trabajo')}
          onKeyDown={(e)=>handleKeyClick(e,'carga-trabajo')}
          aria-pressed={view==='carga-trabajo'}
          title="Carga de Trabajo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M16 4h.01M16 20h.01M12 4h.01M12 20h.01M8 4h.01M8 20h.01M4 8v.01M4 12v.01M4 16v.01M20 8v.01M20 12v.01M20 16v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>Carga de Trabajo</span>
          <span className={styles.badge} aria-hidden>{cargaCount}</span>
        </button>

        {/* New management dashboards */}
        <button
          className={`${styles.navBtn} ${view==='gcb-03'?styles.btnActive:''}`}
          onClick={()=>onChange('gcb-03')}
          onKeyDown={(e)=>handleKeyClick(e,'gcb-03')}
          aria-pressed={view==='gcb-03'}
          title="Gestión del Cambio"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2v6l4 2-4 2v6l-4-2v-6L8 10l4-2V2z" fill="currentColor" />
          </svg>
          <span className={styles.label}>Gestión Cambio GCB</span>
          <span className={styles.badge} aria-hidden>{gcbCount}</span>
        </button>

        <button
          className={`${styles.navBtn} ${view==='gpr-04'?styles.btnActive:''}`}
          onClick={()=>onChange('gpr-04')}
          onKeyDown={(e)=>handleKeyClick(e,'gpr-04')}
          aria-pressed={view==='gpr-04'}
          title="Gestión Problemas y Riesgos"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 13h4v8H3zM10 7h4v14h-4zM17 3h4v18h-4z" fill="currentColor" />
          </svg>
          <span className={styles.label}>Gestión Problemas y Riesgos GPR</span>
          <span className={styles.badge} aria-hidden>{gprCount}</span>
        </button>

        <button
          className={`${styles.navBtn} ${view==='gco-05'?styles.btnActive:''}`}
          onClick={()=>onChange('gco-05')}
          onKeyDown={(e)=>handleKeyClick(e,'gco-05')}
          aria-pressed={view==='gco-05'}
          title="Gestión Conocimiento"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>Gestion Conocimiento GCO</span>
          <span className={styles.badge} aria-hidden>{gcoCount}</span>
        </button>
        <button
          className={`${styles.navBtn} ${view==='capacidad'?styles.btnActive:''}`}
          onClick={()=>onChange('capacidad')}
          onKeyDown={(e)=>handleKeyClick(e,'capacidad')}
          aria-pressed={view==='capacidad'}
          title="Gestión Capacidad"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 12h18M6 6v12M18 6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>Gestión Capacidad</span>
          <span className={styles.badge} aria-hidden>{capacidadCount}</span>
        </button>
        <button
          className={`${styles.navBtn} ${view==='demanda'?styles.btnActive:''}`}
          onClick={()=>onChange('demanda')}
          onKeyDown={(e)=>handleKeyClick(e,'demanda')}
          aria-pressed={view==='demanda'}
          title="Gestión Demanda"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 12h18M6 6v12M18 6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.label}>Gestión Demanda</span>
          <span className={styles.badge} aria-hidden>0</span>
        </button>
        <button
          className={`${styles.navBtn} ${view==='chat'?styles.btnActive:''}`}
          onClick={() => { try{ sessionStorage.setItem('td_show_chat_welcome','1'); window.dispatchEvent(new CustomEvent('td:show-chat-welcome')) }catch{ /* ignore */ } onChange('chat') }}
          onKeyDown={(e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); try{ sessionStorage.setItem('td_show_chat_welcome','1'); window.dispatchEvent(new CustomEvent('td:show-chat-welcome')) }catch{ /* ignore */ } onChange('chat') } }}
          aria-pressed={view==='chat'}
          title="Chat sobre datos"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 4h16v12H7l-3 3V4z" fill="currentColor" />
          </svg>
          <span className={styles.label}>Chat datos</span>
        </button>
        
      </nav>

      <div className={styles.footer}>Junta de Andalucía</div>
    </aside>
  )
}
