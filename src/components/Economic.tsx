import React, { useState } from 'react'
import econData from '../data/economicData'
import styles from './Economic.module.css'

export default function Economic(){
  const [year, setYear] = useState(String(econData.years[0]))
  const years = econData.years.map(String)
  const d = econData.data[year]

  // yearly comparison small bar data
  const otherYear = years.find(y=>y!==year) || years[0]
  const comp = econData.data[otherYear]

  return (
    <div className={styles.wrap}>
      <div className={styles.controlsTop}>
        <div className={styles.yearTabs}>
          {years.map(y => <button key={y} className={y===year?styles.tabActive:styles.tab} onClick={()=>setYear(y)}>{y}</button>)}
        </div>
        <div className={styles.loteSelect}>Lote: Lote 2</div>
      </div>

      <div className={styles.topRow}>
        <div className={styles.largeDonut}>
          <svg width="420" height="180" viewBox="0 0 420 180">
            <circle cx="120" cy="90" r="64" stroke="#eee" strokeWidth="28" fill="none" />
            <circle cx="120" cy="90" r="64" stroke="#2f8b58" strokeWidth="28" fill="none"
              strokeDasharray={`${Math.round((d.facturacion / (d.estimacion||1)) * 200)} 400`} strokeLinecap="round" transform="rotate(-90 120 90)" />
            <text x="220" y="98" fontSize="28" fontWeight="700">{(d.facturacion/1000).toLocaleString()} mil€</text>
          </svg>
        </div>

        <div className={styles.sideCards}>
          <div className={styles.cardSmall}>
            <div className={styles.big}>{d.estimacion.toLocaleString()} €</div>
            <div className={styles.muted}>Estimación anual</div>
          </div>
          <div className={styles.cardSmall}>
            <div className={styles.big}>{d.facturacion.toLocaleString()} €</div>
            <div className={styles.muted}>Facturación anual</div>
          </div>
        </div>

        <div className={styles.annualComp}>
          <h4>Facturación total anual</h4>
          <div className={styles.compBars}>
            <div className={styles.compItem}><div className={styles.compBar} style={{width:`${Math.min(100, comp.facturacion/ (d.facturacion||1) * 100)}%`}}></div><div className={styles.compLabel}>{otherYear} <strong>{(comp.facturacion/1000).toLocaleString()} mil €</strong></div></div>
            <div className={styles.compItem}><div className={styles.compBar} style={{width:`${Math.min(100, d.facturacion/ (comp.facturacion||1) * 100)}%`}}></div><div className={styles.compLabel}>{year} <strong>{(d.facturacion/1000).toLocaleString()} mil €</strong></div></div>
          </div>
        </div>
      </div>

      <div className={styles.monthly}>
        <h4>Coste y previsión mensual</h4>
        <div className={styles.barRow}>
          {d.monthlyEstimacion.map((est:number, i:number)=>(
            <div key={i} className={styles.barItem}>
              <div className={styles.barGroup}>
                <div className={styles.barEst} style={{height: `${Math.max(20, est / 1000)}px`}} title={`Estimación: ${est}`} />
                <div className={styles.barFact} style={{height: `${Math.max(20, d.monthlyFacturacion[i] / 1000)}px`}} title={`Facturación: ${d.monthlyFacturacion[i]}`} />
              </div>
              <div className={styles.barLabel}>{['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.table}>
        <h4>Requisitos / Petición</h4>
        <table>
          <thead><tr><th>Requisito</th><th>Petición</th><th style={{textAlign:'right'}}>Facturación</th><th style={{textAlign:'right'}}>Estimación</th></tr></thead>
          <tbody>
            {d.requisites.map((r:any)=> (
              <tr key={r.code}><td>{r.code}</td><td>{r.description}</td><td style={{textAlign:'right'}}>{r.facturacion.toLocaleString()} €</td><td style={{textAlign:'right'}}>{r.estimacion.toLocaleString()} €</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
