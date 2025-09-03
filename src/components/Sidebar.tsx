import React, { useEffect, useState } from 'react'
import styles from './Sidebar.module.css'

type Props = {
  view: 'ans'|'econ'
  onChange: (v:'ans'|'econ')=>void
  ansCount?: number
  econCount?: number
}

export default function Sidebar({view='ans', onChange, ansCount=0, econCount=0}:Props){
  const [collapsed, setCollapsed] = useState(()=>{
    try{ return localStorage.getItem('td_sidebar_collapsed') === '1' }catch(e){ return false }
  })

  useEffect(()=>{ try{ localStorage.setItem('td_sidebar_collapsed', collapsed ? '1' : '0') }catch(e){} }, [collapsed])

  function handleKeyClick(event:React.KeyboardEvent, v:'ans'|'econ'){
    if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); onChange(v) }
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed?styles.collapsed:''}`} aria-label="Navegación principal">
      <div className={styles.topRow}>
        <div className={styles.logo} title="Seguimiento del contrato">SEGUIMIENTO CONTRATO</div>
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
      </nav>

      <div className={styles.footer}>Junta de Andalucía</div>
    </aside>
  )
}
