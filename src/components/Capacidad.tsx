import React, { useMemo, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Capacidad.module.css'
import PanelFilters from './PanelFilters'
import type { PeriodKey, AreaKey } from '../data/gcb03Data'
import getCapacidadData, { adjustByFilters } from '../data/capacidadData'

function sparklinePath(values:number[], w=200, h=40){
  if(values.length===0) return ''
  const max = Math.max(...values)
  const min = Math.min(...values)
  const len = values.length
  return values.map((v,i)=>{
    const x = (i/(len-1)) * w
    const y = h - ((v - min)/(max - min || 1)) * h
    return `${i===0?'M':'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')
}

export default function Capacidad(): React.ReactElement {
  const [filters, setFilters] = useState<{ period: PeriodKey; area: AreaKey | 'Todas'; kind: string; responsible: string }>({ period: 'Último mes', area: 'Todas', kind: 'Todos', responsible: 'Todos' })
  const data = useMemo(()=> getCapacidadData(filters.period), [filters.period])
  const [tooltip, setTooltip] = useState<{ x:number; y:number; content: React.ReactNode; id: string; targetId?: string } | null>(null)
  const [tooltipTarget, setTooltipTarget] = useState<string | null>(null)
  const [anim, setAnim] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const wrapperRef = useRef<HTMLDivElement|null>(null)

  // recompute adjusted data when filters change
  const adjusted = useMemo(()=> adjustByFilters(data, { area: filters.area === 'Todas' ? undefined : filters.area, kind: filters.kind === 'Todos' ? undefined : filters.kind, responsible: filters.responsible === 'Todos' ? undefined : filters.responsible }), [data, filters])

  // trigger animation when filters change
  // trigger a small lift animation and start the stroke draw on filter changes
  useEffect(()=>{
    setAnim(true)
    setDrawn(false)
    const t1 = setTimeout(()=> setDrawn(true), 60)
    const t2 = setTimeout(()=> setAnim(false), 420)
    return ()=>{ clearTimeout(t1); clearTimeout(t2) }
  }, [filters.period, filters.area, filters.kind, filters.responsible])

  // ensure the stroke is drawn at first mount
  useEffect(()=>{
    const id = setTimeout(()=> setDrawn(true), 80)
    return ()=> clearTimeout(id)
  }, [])

  const trendPath = sparklinePath(adjusted.predicted.map((p,i)=> Math.round((p + (adjusted.actual[i] ?? p))/2)), 260, 48)

  const showTooltip = (ev: React.SyntheticEvent, content: React.ReactNode, targetId?: string) => {
    const target = ev.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    // position in viewport coordinates (we'll render in a portal)
    const x = rect.left + rect.width/2
    const y = rect.top - 8
    const id = `cap-tooltip-${Date.now()}`
    setTooltip({ x, y, content, id, targetId })
    setTooltipTarget(targetId || null)
  }
  const hideTooltip = () => setTooltip(null)

  // hide tooltip on Escape for keyboard users
  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => { if(e.key === 'Escape') hideTooltip() }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={`${styles.page} panelContainer`}>
      <div className={styles.container}>
        <h2 style={{textAlign:'center'}}>GESTIÓN CAPACIDAD</h2>

        <PanelFilters period={filters.period} area={filters.area} kind={filters.kind} responsible={filters.responsible} onChange={(next)=> setFilters(prev=> ({ ...prev, ...next }))} />

        <div className={styles.bigChart}>
          <h3>Evolución demanda: Previsto vs Real</h3>
          <div style={{position:'relative'}} ref={wrapperRef}>
            <div className={styles.chartLegend} aria-hidden>
              <div className={styles.chartLegendItem}><span className={styles.legendSwatch} style={{background:'#2563eb'}}></span>Real</div>
              <div className={styles.chartLegendItem}><span className={styles.legendSwatch} style={{background:'#94a3b8'}}></span>Previsto</div>
            </div>
            <svg viewBox="0 0 800 260" className={`${styles.chartSvg} ${anim?styles.anim:''}`} preserveAspectRatio="xMidYMid meet" aria-hidden={false} role="img">
              <rect width="100%" height="100%" fill="transparent" />
              {/* grid lines */}
              {Array.from({length:5}).map((_,i)=>{
                const y = 40 + i*40
                return <line key={i} x1={40} x2={760} y1={y} y2={y} stroke="#eef2f7" />
              })}
              {/* axes labels */}
              <text x="12" y="18" fontSize="12" fill="#666">Demanda (%)</text>
              {/* X labels */}
              {(() => {
                const len = adjusted.actual.length
                // generate labels based on period
                const labels: string[] = []
                if(filters.period === 'Último año'){
                  const fmt = new Intl.DateTimeFormat('es', { month: 'short' })
                  for(let j=0;j<len;j++){
                    const d = new Date()
                    d.setMonth(d.getMonth() - (len - 1 - j))
                    labels.push(fmt.format(d))
                  }
                } else {
                  // semanas/periodos
                  for(let j=0;j<len;j++) labels.push(`S${j+1}`)
                }
                return labels.map((lab,i)=>{
                  const x = 40 + (i/(len-1)) * 720
                  return <text key={`xl-${i}`} x={x} y={245} fontSize={11} fill="#666" textAnchor="middle">{lab}</text>
                })
              })()}
              {/* predicted line */}
              {(() => {
                const maxVal = Math.max(...adjusted.predicted, ...adjusted.actual)
                const yMax = Math.max(20, Math.ceil(maxVal/10)*10)
                const pts = adjusted.predicted.map((v,i)=>{
                  const x = 40 + (i/(adjusted.predicted.length-1))*(720)
                  const y = 220 - (v / yMax) * 180
                  return `${x},${y}`
                }).join(' ')
                return <polyline className={`${styles.chartLine} ${drawn? styles.drawn : ''}`} fill="none" stroke="#94a3b8" strokeWidth={2} points={pts} strokeDasharray="6 4" />
              })()}
              {/* actual line */}
              {(() => {
                const maxVal = Math.max(...adjusted.predicted, ...adjusted.actual)
                const yMax = Math.max(20, Math.ceil(maxVal/10)*10)
                const pts = adjusted.actual.map((v,i)=>{
                  const x = 40 + (i/(adjusted.actual.length-1))*(720)
                  const y = 220 - (v / yMax) * 180
                  return `${x},${y}`
                }).join(' ')
                return <polyline className={`${styles.chartLine} ${drawn? styles.drawn : ''}`} fill="none" stroke="#2563eb" strokeWidth={3} points={pts} />
              })()}
                {/* Y ticks (dynamic) */}
              {(() => {
                const maxVal = Math.max(...adjusted.predicted, ...adjusted.actual)
                const yMax = Math.max(20, Math.ceil(maxVal/10)*10)
                const ticks = 6
                return Array.from({length:ticks}).map((_,i)=>{
                  const val = Math.round((i/(ticks-1)) * yMax)
                  const y = 220 - (val / yMax) * 180
                  return <g key={`yt-${i}`}><line x1={28} x2={36} y1={y} y2={y} stroke="#94a3b8" /><text x={8} y={y+4} fontSize={11} fill="#666">{val}%</text></g>
                })
              })()}

              {/* interactive points */}
              {adjusted.actual.map((v,i)=>{
                const len = adjusted.actual.length
                const x = 40 + (i/(len-1)) * 720
                const maxVal = Math.max(...adjusted.actual, ...adjusted.predicted)
                const yMax = Math.max(20, Math.ceil(maxVal/10)*10)
                const y = 220 - (v / yMax) * 180
                const content = (
                  <div className={styles.tooltipRich}><strong>{`Periodo ${i+1}`}</strong><div className="row"><span>Real</span><span>{v}%</span></div><div className="row"><span>Previsto</span><span>{adjusted.predicted[i] ?? '-'}%</span></div></div>
                )
                return (
                  <g key={`pt-${i}`}> 
                    <circle id={`pt-${i}`} cx={x} cy={y} r={9} fill="#2563eb" opacity={0.001} role="button" tabIndex={0}
                      aria-describedby={tooltip && tooltip.targetId === `pt-${i}` ? tooltip.id : undefined}
                      onMouseEnter={(e)=> showTooltip(e, content, `pt-${i}`)} onMouseLeave={hideTooltip} onFocus={(e)=> showTooltip(e as any, content, `pt-${i}`)} onBlur={hideTooltip} />
                    <title>{`Real ${v}%`}</title>
                  </g>
                )
              })}
            </svg>
            {tooltip && createPortal(
              <div id={tooltip.id} className={styles.tooltipRich} role="dialog" aria-live="polite" style={{ position: 'fixed', left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)', zIndex: 9999 }}>
                {tooltip.content}
              </div>,
              document.body
            )}
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Índice de utilización</h3>
            <div className={styles.metricRow}>
              <div>
                <div className={styles.metricEmph} aria-live="polite">{adjusted.utilizationPct}%</div>
                <div className={styles.smallNote}>Horas consumidas / horas disponibles</div>
              </div>
              <div style={{flex:1}}>
                <div className={styles.barWrap} aria-hidden>
                  <div className={`${styles.barFill} ${anim?styles.anim:''}`} style={{ width: `${adjusted.utilizationPct}%` }} role="button" tabIndex={0}
                    onMouseEnter={(e)=> showTooltip(e, `Utilización: ${adjusted.utilizationPct}%`)} onMouseLeave={hideTooltip} onFocus={(e)=> showTooltip(e as any, `Utilización: ${adjusted.utilizationPct}%`)} onBlur={hideTooltip} />
                </div>
              </div>
            </div>
          </div>
          

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Demanda atendida</h3>
            <div className={styles.metricRow}>
              <div>
                <div className={styles.statPct}>{adjusted.demandServedPct}%</div>
                <div className={styles.smallNote}>Porcentaje de demanda atendida vs solicitada</div>
              </div>
              <div style={{flex:1}}>
                <div className={styles.barWrap} aria-hidden>
                  <div className={`${styles.barFill} ${anim?styles.anim:''}`} style={{ width: `${adjusted.demandServedPct}%`, background: 'linear-gradient(90deg,#34d399,#10b981)' }} role="button" tabIndex={0}
                    onMouseEnter={(e)=> showTooltip(e, `Demanda atendida: ${adjusted.demandServedPct}%`)} onMouseLeave={hideTooltip} onFocus={(e)=> showTooltip(e as any, `Demanda atendida: ${adjusted.demandServedPct}%`)} onBlur={hideTooltip} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Peticiones rechazadas</h3>
            <div className={styles.bigStat} aria-live="polite">{adjusted.rejectedCount}</div>
            <div className={styles.smallNote}>Número de peticiones rechazadas por falta de capacidad</div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Efectividad predicción: Real vs Previsto</h3>
            <svg width={260} height={48} viewBox="0 0 260 48" className={styles.spark} aria-label="Efectividad predicción">
              <path d={trendPath} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {data.actual.map((v,i)=>{
                const len = data.actual.length
                const x = (i/(len-1)) * 260
                const max = Math.max(...data.actual, ...data.predicted)
                const min = Math.min(...data.actual, ...data.predicted)
                const y = 48 - ((v - min)/(max - min || 1)) * 48
                return <circle key={i} cx={x} cy={y} r={6} fill="transparent" onMouseEnter={(e)=> showTooltip(e, `Real ${v}%`) } onMouseLeave={hideTooltip} onFocus={(e)=> showTooltip(e as any, `Real ${v}%`)} onBlur={hideTooltip} tabIndex={0} />
              })}
            </svg>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Índice desborde (&gt;15% carga)</h3>
            <div className={styles.bigStat}>{adjusted.overflowPct}%</div>
            <div className={styles.smallNote}>Peticiones que superan el 15% de la carga media</div>
          </div>
        </div>

        {tooltip && (
          <div className={styles.tooltip} role="status" style={{ left: tooltip.x, top: tooltip.y }}>{tooltip.content}</div>
        )}
      </div>
    </div>
  )
}
