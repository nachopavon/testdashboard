import React from 'react'
import styles from './Sidebar.module.css'

type Props = {
  view: 'ans'|'econ'
  onChange: (v:'ans'|'econ')=>void
}

export default function Sidebar({view='ans', onChange}:Props){
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>SEGUIMIENTO CONTRATO</div>
      <nav className={styles.nav}>
        <button className={view==='ans'?styles.btnActive:styles.btn} onClick={()=>onChange('ans')}>Seguimiento ANS</button>
        <button className={view==='econ'?styles.btnActive:styles.btn} onClick={()=>onChange('econ')}>Seguimiento económico</button>
      </nav>
      <div className={styles.footer}>Junta de Andalucía</div>
    </aside>
  )
}
