import React, { useState, useEffect, useRef } from 'react'
import econData from '../data/economicData'
import styles from './Economic.module.css'

// tiny animated number component (interpolates values)
function AnimatedNumber({ value, duration = 600, format = (n:number)=>String(n) }: { value: number, duration?: number, format?: (n:number)=>string }){
  const [display, setDisplay] = useState(value)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef<number>(value)

  useEffect(()=>{
    const from = fromRef.current
    const to = value
    if(from === to){
      setDisplay(to)
      return
    }
    const start = performance.now()
    startRef.current = start
    const step = (ts:number)=>{
      if(startRef.current === null) return
      const t = Math.min(1, (ts - start) / duration)
      const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t // easeInOut
      const cur = Math.round((from + (to - from) * eased))
      setDisplay(cur)
      if(t < 1){
        rafRef.current = requestAnimationFrame(step)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return ()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current) }
  },[value,duration])

  return <span>{format(display)}</span>
}

export default function Economic(){
  const [year, setYear] = useState(String(econData.years[0]))
  const years = econData.years.map(String)
  const d = econData.data[year]

  // selected month for YTD comparisons (null => show annual)
  const [selectedMonth, setSelectedMonth] = useState<number|null>(null)

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

  // compute YTD totals for selected month (inclusive)
  const selIdx = selectedMonth
  const ytd = selIdx !== null ? {
    est: d.monthlyEstimacion.slice(0, selIdx+1).reduce((s:number,v:number)=>s+v,0),
    fact: d.monthlyFacturacion.slice(0, selIdx+1).reduce((s:number,v:number)=>s+v,0),
    monthsCount: selIdx + 1
  } : null

  const otherData = selIdx !== null && econData.data[otherYear] ? {
    est: econData.data[otherYear].monthlyEstimacion.slice(0, selIdx+1).reduce((s:number,v:number)=>s+v,0),
    fact: econData.data[otherYear].monthlyFacturacion.slice(0, selIdx+1).reduce((s:number,v:number)=>s+v,0)
  } : null

  // helper to compute percent change safely
  const pctChange = (a:number, b:number) => {
    if(b === 0) return a === 0 ? 0 : 100
    return ((a - b) / Math.abs(b)) * 100
  }

  // deterministic percent per year between 85% and 98%
  function pctForYear(yStr:string){
    const y = parseInt(yStr)
    // deterministic formula: maps year -> value in [85,98]
    const offset = (y * 73) % 14 // 0..13
    const pctInt = 85 + offset
    return Math.min(0.98, Math.max(0.85, pctInt / 100))
  }

  // compute per-month percentages with deterministic jitter but preserving total annual facturation
  function perMonthAdjustments(yearStr:string){
    const data = econData.data[yearStr]
    const ests: number[] = data.monthlyEstimacion || []
    const facts: number[] = data.monthlyFacturacion || []
    const totalFact = facts.reduce((s:number,v:number)=>s+v,0)
    const variance = 0.12 // up to ±12% variation
    const weights: number[] = ests.map((_:number,i:number)=>{
      const seed = parseInt(yearStr,10) * 31 + i * 17
      const x = Math.abs(Math.sin(seed) * 10000)
      const frac = x - Math.floor(x)
      const jitter = (frac - 0.5) * 2 * variance // in [-variance, variance]
      return 1 + jitter
    })
    const denom = ests.reduce((s:number,v:number,idx:number)=> s + v * weights[idx], 0) || 1
    const alpha = totalFact / denom
    const pcts: number[] = weights.map((w:number) => alpha * w)
    const capped: number[] = pcts.map((p:number) => Math.max(0.2, Math.min(1.5, p)))
    const adjustedFacts: number[] = ests.map((e:number, idx:number)=> Math.round(e * capped[idx]))
    return {pcts:capped, adjustedFacts}
  }

  // prepare totals per year for an annual overview
  const yearList = econData.years.map(String)
  const yearTotals = yearList.map(y => ({ year: y, fact: econData.data[y]?.facturacion || 0, est: econData.data[y]?.estimacion || 0 }))
  const maxYearFact = Math.max(...yearTotals.map(y=>y.fact), 1)

  // per-month adjustments for the current year
  const perMonthResults = perMonthAdjustments(year)
  const perMonthPcts = perMonthResults.pcts
  const perMonthAdjustedFacts = perMonthResults.adjustedFacts
  const pctForDisplay = selectedMonth !== null ? (perMonthPcts[selectedMonth] || pctForYear(year)) : pctForYear(year)
  const centerFactValue = selectedMonth !== null ? (perMonthAdjustedFacts[selectedMonth] || 0) : d.facturacion

  // pagination for requisites
  const [page, setPage] = useState(1)
  const perPage = 10
  const totalReq = d.requisites.length
  const totalPages = Math.max(1, Math.ceil(totalReq / perPage))
  const pagedReqs = d.requisites.slice((page-1)*perPage, page*perPage)
  // table improvements: search, sorting, rows per page
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'code'|'description'|'facturacion'|'estimacion'>('code')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [rowsPerPage, setRowsPerPage] = useState(perPage)

  const filtered = d.requisites.filter((r:any)=>{
    if(!search) return true
    const s = search.toLowerCase()
    return String(r.code).toLowerCase().includes(s) || String(r.description).toLowerCase().includes(s)
  })

  // if a month is selected, further filter requisites to those assigned to months <= selectedMonth (YTD window)
  const filteredByMonth = selectedMonth !== null ? filtered.filter((r:any)=> typeof r.month === 'number' ? r.month <= selectedMonth : true) : filtered

  const sorted = filteredByMonth.slice().sort((a:any,b:any)=>{
    const dir = sortDir === 'asc' ? 1 : -1
    if(sortBy === 'facturacion' || sortBy === 'estimacion'){
      return (a[sortBy] - b[sortBy]) * dir
    }
    return String(a[sortBy]).localeCompare(String(b[sortBy])) * dir
  })

  const totalReqFiltered = sorted.length
  const totalPagesComputed = Math.max(1, Math.ceil(totalReqFiltered / rowsPerPage))
  const currentPage = Math.min(page, totalPagesComputed)
  const start = (currentPage - 1) * rowsPerPage
  const paged = sorted.slice(start, start + rowsPerPage)

  const totalsAll = sorted.reduce((acc:any, r:any)=>{ acc.fact += r.facturacion; acc.est += r.estimacion; return acc }, {fact:0, est:0})
  const totalsPage = paged.reduce((acc:any, r:any)=>{ acc.fact += r.facturacion; acc.est += r.estimacion; return acc }, {fact:0, est:0})

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
        <div className={styles.largeDonut} role="img" aria-label={`Cumplimiento anual ${year}: ${fmt(d.facturacion)} facturado de ${fmt(d.estimacion)}`}>
          {/* donut shows percent facturado / estimado */}
          {(() => {
            const r = 64
            const circ = 2 * Math.PI * r
            const pct = pctForDisplay
            const dash = Math.round(pct * circ)
            const color = pct >= 0.95 ? 'var(--accent)' : '#2f8b58'
            const pctLabel = Math.round(pct * 1000) / 10
            return (
              <svg width="420" height="180" viewBox="0 0 420 180" aria-hidden>
                <circle className={styles.donutBg} cx="120" cy="90" r={r} stroke="#eee" strokeWidth="28" fill="none" />
                <circle className={styles.donutArc} cx="120" cy="90" r={r} stroke={color} strokeWidth="28" fill="none"
                  strokeDasharray={`${dash} ${Math.round(circ)}`} strokeLinecap="round" transform="rotate(-90 120 90)" />

                {/* group centered at donut center */}
                <g transform="translate(120 90)">
                  {/* percentage vertically centered */}
                  <text x={0} y={0} fontSize="26" fontWeight="700" textAnchor="middle" dominantBaseline="middle" fill="var(--accent)">{pctLabel}%</text>
                  {/* label directly below percentage */}
                  <text x={0} y={20} fontSize="11" fill="var(--accent)" textAnchor="middle" dominantBaseline="hanging">facturado</text>
                  {/* animated amount further below */}
                  <text x={0} y={40} fontSize="14" fontWeight="600" textAnchor="middle" className={styles.centerAmount} dominantBaseline="middle">
                    <AnimatedNumber value={centerFactValue} format={(n)=> (n).toLocaleString('es-ES') + ' €'} />
                  </text>
                </g>
                <text x="240" y="90" fontSize="14" fontWeight="600">{(selectedMonth !== null && ytd) ? (Math.round((ytd.fact/1000))).toLocaleString() : (Math.round((d.facturacion/1000))).toLocaleString()} mil€</text>
              </svg>
            )
          })()}
        </div>

        <div className={styles.sideCards}>
          <div className={styles.cardSmall}>
            <div className={styles.big}>
              {selectedMonth !== null ? (
                <AnimatedNumber value={ytd!.est} format={(n)=>n.toLocaleString('es-ES') + ' €'} />
              ) : (
                <AnimatedNumber value={d.estimacion} format={(n)=>n.toLocaleString('es-ES') + ' €'} />
              )}
            </div>
            <div className={styles.muted}>{selectedMonth !== null ? `Estimación hasta ${months[selectedMonth]}` : 'Estimación anual'}</div>
          </div>
          <div className={styles.cardSmall}>
            <div className={styles.big}>
              {selectedMonth !== null ? (
                <AnimatedNumber value={ytd!.fact} format={(n)=>n.toLocaleString('es-ES') + ' €'} />
              ) : (
                <AnimatedNumber value={d.facturacion} format={(n)=>n.toLocaleString('es-ES') + ' €'} />
              )}
            </div>
            <div className={styles.muted}>{selectedMonth !== null ? `Facturado hasta ${months[selectedMonth]}` : 'Facturación anual'}</div>
            {selectedMonth !== null && otherData && (
              <div style={{fontSize:12, color:'#777', marginTop:6}}>
                <strong>Comparado con {otherYear}:</strong> &nbsp;
                <span style={{color:'#2f8b58'}}>{pctChange(ytd!.fact, otherData.fact).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.annualComp}>
          <h4>Facturación total anual</h4>
          <div className={styles.yearGrid} role="list" aria-label="Facturación anual por año">
            {yearTotals.map(yt => (
              <div key={yt.year} role="listitem" className={styles.yearItem} aria-current={yt.year===year ? 'true' : undefined}>
                <div className={styles.yearBarWrap}>
                  <div className={styles.yearBar} style={{height: `${Math.round((yt.fact / maxYearFact) * 96)}px`, background: yt.year===year ? 'var(--accent)' : 'rgba(0,0,0,0.08)'}} />
                </div>
                <div className={styles.yearLabel}>{yt.year}</div>
                <div className={styles.yearValue}>{(yt.fact).toLocaleString()} €</div>
              </div>
            ))}
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
              <div key={i} className={`${styles.barItem} ${selectedMonth===i?styles.selectedMonth:''}`}
                tabIndex={0}
                onClick={()=>setSelectedMonth(prev => prev===i?null:i)}
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
        <div className={styles.tableControls}>
          <div>
            <label>Buscar: <input value={search} onChange={e=>{setSearch(e.target.value); setPage(1)}} className={styles.searchInput} placeholder="Código o descripción" /></label>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <label>Filas: <select value={rowsPerPage} onChange={e=>{setRowsPerPage(Number(e.target.value)); setPage(1)}} className={styles.selectSmall}><option>5</option><option>10</option><option>20</option></select></label>
            <div className={styles.pager} aria-label="Paginación requisitos">
              <button onClick={()=>setPage(1)} disabled={page===1} className={styles.pagerBtn} aria-label="Primera página">«</button>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className={styles.pagerBtn} aria-label="Página anterior">‹</button>
              <span className={styles.pagerInfo}>Página {currentPage} de {totalPagesComputed}</span>
              <button onClick={()=>setPage(p=>Math.min(totalPagesComputed,p+1))} disabled={page===totalPagesComputed} className={styles.pagerBtn} aria-label="Página siguiente">›</button>
              <button onClick={()=>setPage(totalPagesComputed)} disabled={page===totalPagesComputed} className={styles.pagerBtn} aria-label="Última página">»</button>
            </div>
          </div>
        </div>

        <table aria-describedby="req-desc">
          <caption id="req-desc" style={{display:'none'}}>Lista de requisitos y su facturación/estimación</caption>
          <thead>
            <tr>
              <th onClick={()=>{ setSortBy('code'); setSortDir(s=> s==='asc'?'desc':'asc')}} style={{cursor:'pointer'}}>Requisito</th>
              <th onClick={()=>{ setSortBy('description'); setSortDir(s=> s==='asc'?'desc':'asc')}} style={{cursor:'pointer'}}>Petición</th>
              <th style={{textAlign:'right', cursor:'pointer'}} onClick={()=>{ setSortBy('facturacion'); setSortDir(s=> s==='asc'?'desc':'asc')}}>Facturación</th>
              <th style={{textAlign:'right', cursor:'pointer'}} onClick={()=>{ setSortBy('estimacion'); setSortDir(s=> s==='asc'?'desc':'asc')}}>Estimación</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r:any)=> (
              <tr key={r.code}><td>{r.code}</td><td>{r.description}</td><td style={{textAlign:'right'}}>{r.facturacion.toLocaleString()} €</td><td style={{textAlign:'right'}}>{r.estimacion.toLocaleString()} €</td></tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{textAlign:'right', fontWeight:700}}>Totales (página)</td>
              <td style={{textAlign:'right', fontWeight:700}}>{totalsPage.fact.toLocaleString()} €</td>
              <td style={{textAlign:'right', fontWeight:700}}>{totalsPage.est.toLocaleString()} €</td>
            </tr>
            <tr>
              <td colSpan={2} style={{textAlign:'right', color:'#777'}}>Totales (filtro)</td>
              <td style={{textAlign:'right', color:'#777'}}>{totalsAll.fact.toLocaleString()} €</td>
              <td style={{textAlign:'right', color:'#777'}}>{totalsAll.est.toLocaleString()} €</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
