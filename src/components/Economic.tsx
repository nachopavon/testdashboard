import React, { useState } from 'react'
import econData from '../data/economicData'
import styles from './Economic.module.css'
import { useRef } from 'react'

export default function Economic(){
  const [year, setYear] = useState(String(econData.years[0]))
  const years = econData.years.map(String)
  const d = econData.data[year]

  // normalize monthly bars: compute max of both series to scale heights
  const estArr = d.monthlyEstimacion || []
  const factArr = d.monthlyFacturacion || []
  const maxMonthly = Math.max(...estArr, ...factArr, 1)
  const maxBarHeight = 120 // px
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

  const [tooltip, setTooltip] = useState<{x:number;y:number;text:string}|null>(null)
  const gridRef = useRef<HTMLDivElement|null>(null)

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
        <div className={styles.legend}>
          <div className={styles.legendItem}><span className={styles.legendBoxEst}></span> Previsión</div>
          <div className={styles.legendItem}><span className={styles.legendBoxFact}></span> Coste</div>
        </div>
  <div className={styles.monthlyGrid} ref={gridRef}>
          <div className={styles.verticalAxis}>
            {Array.from({length:4}).map((_,i)=>{
              const val = Math.round((maxMonthly/4)*(4-i))
              return <div key={i} className={styles.axisTick}><span className={styles.axisLabel}>{val.toLocaleString()}</span></div>
            })}
          </div>
          <div className={styles.barRow}>
          {d.monthlyEstimacion.map((est:number, i:number)=>{
            const fact = d.monthlyFacturacion[i] || 0
            const hEst = Math.max(12, Math.round((est / maxMonthly) * maxBarHeight))
            const hFact = Math.max(12, Math.round((fact / maxMonthly) * maxBarHeight))
            return (
              <div key={i} className={styles.barItem}
                onMouseEnter={(e)=>{
                  const target = e.currentTarget as HTMLElement
                  const grid = gridRef.current
                  if(grid && target){
                    const gridRect = grid.getBoundingClientRect()
                    const targetRect = target.getBoundingClientRect()
                    const left = targetRect.left - gridRect.left + (targetRect.width/2)
                    // place slightly above the element
                    const top = targetRect.top - gridRect.top - 8
                    setTooltip({x: Math.round(left), y: Math.round(top), text:`Previsión ${est.toLocaleString()} € · Coste ${fact.toLocaleString()} €`})
                  } else {
                    setTooltip({x:0,y:0,text:`Previsión ${est.toLocaleString()} € · Coste ${fact.toLocaleString()} €`})
                  }
                }}
                onMouseLeave={()=>setTooltip(null)}>
                <div className={styles.barValues}>
                  <span className={styles.barValueEst}>{est.toLocaleString()} €</span>
                  <span className={styles.barValueFact}>{fact.toLocaleString()} €</span>
                </div>
                <div className={styles.barGroup}>
                  <div className={styles.barEst} style={{height: `${hEst}px`}} />
                  <div className={styles.barFact} style={{height: `${hFact}px`}} />
                </div>
                <div className={styles.barLabel}>{months[i]}</div>
              </div>
            )
          })}
          </div>
          {tooltip && <div className={styles.tooltip} style={{left:tooltip.x, top:tooltip.y}}>{tooltip.text}</div>}
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
