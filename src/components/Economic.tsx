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

  const [tooltip, setTooltip] = useState<{x:number;y:number;html:string}|null>(null)
  const gridRef = useRef<HTMLDivElement|null>(null)

  // visible series state (legend interactive)
  const [showEst, setShowEst] = useState(true)
  const [showFact, setShowFact] = useState(true)

  // yearly comparison small bar data
  const otherYear = years.find(y=>y!==year) || years[0]
  const comp = econData.data[otherYear]

  // export helpers (CSV / JSON)
  function download(filename:string, content:string, mime='text/plain'){
    const blob = new Blob([content], {type:mime + ';charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function exportCSV(){
    const rows = [['mes','prevision','coste']]
    d.monthlyEstimacion.forEach((est:number,i:number)=>{
      const fact = d.monthlyFacturacion[i]||0
      rows.push([months[i], String(est), String(fact)])
    })
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    download(`economia_${year}.csv`, csv, 'text/csv')
  }

  function exportJSON(){
    const payload = {year, months: months.map((m,i)=>({mes:m, prevision:d.monthlyEstimacion[i]||0, coste:d.monthlyFacturacion[i]||0})), totals:{estimacion:d.estimacion, facturacion:d.facturacion}}
    download(`economia_${year}.json`, JSON.stringify(payload, null, 2), 'application/json')
  }

  // helper to format numbers
  const fmt = (n:number)=> n.toLocaleString('es-ES') + ' €'

  return (
    <div className={styles.wrap}>
      <div className={styles.controlsTop}>
        <div className={styles.yearTabs}>
          {years.map(y => <button key={y} aria-pressed={y===year} className={y===year?styles.tabActive:styles.tab} onClick={()=>setYear(y)}>{y}</button>)}
        </div>

        <div className={styles.rightControls}>
          <div className={styles.loteSelect}>Lote: Lote 2</div>
          <div className={styles.exportGroup}>
            <button className={styles.exportBtn} onClick={exportCSV} aria-label="Exportar datos CSV">Exportar CSV</button>
            <button className={styles.exportBtn} onClick={exportJSON} aria-label="Exportar datos JSON">Exportar JSON</button>
          </div>
        </div>
      </div>

      <div className={styles.topRow}>
        <div className={styles.largeDonut} role="img" aria-label={`Facturación ${fmt(d.facturacion)} de ${year}`}>
          <svg width="420" height="180" viewBox="0 0 420 180" aria-hidden>
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
        <div className={styles.legend} role="toolbar" aria-label="Leyenda de series">
          <button className={`${styles.legendItem} ${showEst?styles.legendOn:styles.legendOff}`} onClick={()=>setShowEst(s=>!s)} aria-pressed={showEst} aria-label="Alternar Previsión">
            <span className={styles.legendBoxEst}></span>
            <span>Previsión</span>
          </button>
          <button className={`${styles.legendItem} ${showFact?styles.legendOn:styles.legendOff}`} onClick={()=>setShowFact(s=>!s)} aria-pressed={showFact} aria-label="Alternar Coste">
            <span className={styles.legendBoxFact}></span>
            <span>Coste</span>
          </button>
        </div>
  <div className={styles.monthlyGrid} ref={gridRef}>
            <div className={styles.verticalAxis} aria-hidden>
              {Array.from({length:4}).map((_,i)=>{
                const val = Math.round((maxMonthly/4)*(4-i))
                const label = `${Math.round(val/1000).toLocaleString('es-ES')} mil €`
                return <div key={i} className={styles.axisTick} style={{top:`${(i/(4-1))*100}%`}}><span className={styles.axisLabel}>{label}</span></div>
              })}
            </div>
            <div className={styles.gridLines} aria-hidden>
              {Array.from({length:4}).map((_,i)=>{
                const topPct = (i/(4-1))*100
                return <div key={i} className={styles.gridLine} style={{top:`${topPct}%`}} />
              })}
            </div>
          <div className={styles.barRow}>
          {d.monthlyEstimacion.map((est:number, i:number)=>{
            const fact = d.monthlyFacturacion[i] || 0
            const hEst = Math.max(12, Math.round((est / maxMonthly) * maxBarHeight))
            const hFact = Math.max(12, Math.round((fact / maxMonthly) * maxBarHeight))
            return (
              <div key={i} className={styles.barItem}
                tabIndex={0}
                onFocus={(e)=>{
                  const target = e.currentTarget as HTMLElement
                  const grid = gridRef.current
                  if(grid && target){
                    const gridRect = grid.getBoundingClientRect()
                    const targetRect = target.getBoundingClientRect()
                    const left = targetRect.left - gridRect.left + (targetRect.width/2)
                    const top = targetRect.top - gridRect.top - 8
                    setTooltip({x: Math.round(left), y: Math.round(top), html:`<strong>${months[i]}</strong><br/>Previsión: ${est.toLocaleString()} €<br/>Coste: ${fact.toLocaleString()} €`})
                  }
                }}
                onBlur={()=>setTooltip(null)}
                onMouseEnter={(e)=>{
                  const target = e.currentTarget as HTMLElement
                  const grid = gridRef.current
                  if(grid && target){
                    const gridRect = grid.getBoundingClientRect()
                    const targetRect = target.getBoundingClientRect()
                    const left = targetRect.left - gridRect.left + (targetRect.width/2)
                    const top = targetRect.top - gridRect.top - 8
                    setTooltip({x: Math.round(left), y: Math.round(top), html:`<strong>${months[i]}</strong><br/>Previsión: ${est.toLocaleString()} €<br/>Coste: ${fact.toLocaleString()} €`})
                  }
                }}
                onMouseLeave={()=>setTooltip(null)}>
                <div className={styles.barValues} aria-hidden>
                  <span className={styles.barValueEst}>{est.toLocaleString()} €</span>
                  <span className={styles.barValueFact}>{fact.toLocaleString()} €</span>
                </div>
                <div className={styles.barGroup} aria-hidden>
                  <div className={styles.barEst} style={{height: `${hEst}px`, ['--target-height' as any]: `${hEst}px`, animationDelay: `${i*70}ms`, opacity: showEst?1:0.12}} />
                  <div className={styles.barFact} style={{height: `${hFact}px`, ['--target-height' as any]: `${hFact}px`, animationDelay: `${i*70}ms`, opacity: showFact?1:0.12}} />
                </div>
                <div className={styles.barLabel}>{months[i]}</div>
              </div>
            )
          })}
          </div>
          {tooltip && <div className={styles.tooltip} role="status" aria-live="polite" dangerouslySetInnerHTML={{__html:tooltip.html}} style={{left:tooltip.x, top:tooltip.y, opacity:1}} />}
        </div>
      </div>

      <div className={styles.table}>
        <h4>Requisitos / Petición</h4>
        <table aria-describedby="req-desc">
          <caption id="req-desc" style={{display:'none'}}>Lista de requisitos y su facturación/estimación</caption>
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
