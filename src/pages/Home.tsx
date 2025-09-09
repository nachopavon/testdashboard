import React from 'react'
import styles from './Home.module.css'

export default function Home(){
  return (
    <div className={styles.page}>
      <aside className={styles.leftCol}>
        <div className={styles.panel}> 
          <h3 className={styles.panelTitle}>Panel Principal</h3>
          <nav className={styles.sideNav}>
            <button className={styles.navItem}>Nueva Estimación</button>
            <button className={styles.navItem}>Servicios Externos</button>
            <button className={styles.navItem}>Base de Conocimiento</button>
            <button className={styles.navItem}>Informes y Analytics</button>
            <button className={styles.navItem}>Configuración</button>
          </nav>
          <div className={styles.searchWrap}>
            <input placeholder="Buscar órdenes, proyectos..." className={styles.search} />
          </div>
        </div>
      </aside>

      <main className={styles.mainCol}>
        <div className={styles.headerCards}>
          <div className={styles.headerCard}>Nueva Estimación</div>
          <div className={styles.headerCard}>Gestionar Servicios</div>
          <div className={styles.headerCard}>Consultar Histórico</div>
        </div>

        <div className={styles.summaryRow}>
          <div className={styles.stat}> <div className={styles.statVal}>147</div> <div className={styles.statLabel}>SERVICIOS TOTALES</div> </div>
          <div className={styles.stat}> <div className={styles.statVal}>28</div> <div className={styles.statLabel}>EN PROGRESO</div> </div>
          <div className={styles.stat}> <div className={styles.statVal}>112</div> <div className={styles.statLabel}>COMPLETADOS</div> </div>
          <div className={styles.stat}> <div className={styles.statVal}>7</div> <div className={styles.statLabel}>EN EVALUACIÓN</div> </div>
        </div>

        <section className={styles.listPanel}>
          <h3 className={styles.listTitle}>Servicios Externos - Consejería de Fomento, Articulación del Territorio y Vivienda</h3>
          <ul className={styles.itemList}>
            <li className={styles.item}><strong>SE.530363</strong> - Modificación catálogos microservicios - <span className={styles.badgeInfo}>EN EVALUACIÓN</span></li>
            <li className={styles.item}><strong>SE.542496</strong> - GESFIN - Mejora importación rechazos y avisos ficheros PIN - <span className={styles.badgeWarn}>PTE. EVALUACIÓN</span></li>
            <li className={styles.item}><strong>SE.528147</strong> - Mejora conectividad rural - <span className={styles.badgeOk}>COMPLETADA</span></li>
            <li className={styles.item}><strong>SE.548521</strong> - Adaptación accesibilidad edificios públicos - <span className={styles.badgeWarn}>PENDIENTE</span></li>
            <li className={styles.item}><strong>SE.547203</strong> - Articulación transporte metropolitano - <span className={styles.badgeInfo}>EN PROGRESO</span></li>
          </ul>
        </section>
      </main>
    </div>
  )
}
