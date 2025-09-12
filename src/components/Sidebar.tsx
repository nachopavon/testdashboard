import React, { useEffect, useState } from 'react'
import styles from './Sidebar.module.css'

type Props = {
  view: 'ans'|'econ'|'chat'|'servicios-prestados'|'servicios-pendientes'|'carga-trabajo'
  onChange: (v:'ans'|'econ'|'chat'|'servicios-prestados'|'servicios-pendientes'|'carga-trabajo')=>void
  ansCount?: number
  econCount?: number
  serviciosCount?: number
  pendientesCount?: number
  cargaCount?: number
}

export default function Sidebar({
  view='ans',
  onChange,
  ansCount=0,
  econCount=0,
  serviciosCount=0,
  pendientesCount=0,
  cargaCount=0
}:Props){
  const [collapsed, setCollapsed] = useState(()=>{
    try{ return localStorage.getItem('td_sidebar_collapsed') === '1' }catch(e){ return false }
  })

  useEffect(()=>{ try{ localStorage.setItem('td_sidebar_collapsed', collapsed ? '1' : '0') }catch(e){} }, [collapsed])

  function handleKeyClick(event:React.KeyboardEvent, v:'ans'|'econ'|'chat'|'servicios-prestados'|'servicios-pendientes'|'carga-trabajo'){
    if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); onChange(v) }
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed?styles.collapsed:''}`} aria-label="Navegación principal">
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

        <button
          className={`${styles.navBtn} ${view==='chat'?styles.btnActive:''}`}
          onClick={() => { try{ sessionStorage.setItem('td_show_chat_welcome','1') }catch(e){}; onChange('chat') }}
          onKeyDown={(e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); try{ sessionStorage.setItem('td_show_chat_welcome','1') }catch(e){}; onChange('chat') } }}
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
