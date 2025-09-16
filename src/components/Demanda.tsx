import React, { useMemo, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './Demanda.module.css'
import PanelFilters from './PanelFilters'
import type { PeriodKey, AreaKey } from '../data/gcb03Data'
import getDemandaData, { adjustByFilters } from '../data/demandaData'

export default function Demanda(): JSX.Element {
  const [filters, setFilters] = useState<{ period: PeriodKey; area: AreaKey | 'Todas'; kind: string; responsible: string }>({ period: 'Último mes', area: 'Todas', kind: 'Todos', responsible: 'Todos' })
  const data = useMemo(()=> getDemandaData(filters.period), [filters.period])
  const [tooltip, setTooltip] = useState<{ x:number; y:number; content: React.ReactNode; id: string; targetId?: string } | null>(null)
  const [anim, setAnim] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const wrapperRef = useRef<HTMLDivElement|null>(null)

  const adjusted = useMemo(()=> adjustByFilters(data, { area: filters.area === 'Todas' ? undefined : filters.area, kind: filters.kind === 'Todos' ? undefined : filters.kind, responsible: filters.responsible === 'Todos' ? undefined : filters.responsible }), [data, filters])

  useEffect(()=>{ setAnim(true); setDrawn(false); const t1 = setTimeout(()=> setDrawn(true), 60); const t2 = setTimeout(()=> setAnim(false), 420); return ()=>{ clearTimeout(t1); clearTimeout(t2) } }, [filters.period, filters.area, filters.kind, filters.responsible])
  useEffect(()=>{ const id = setTimeout(()=> setDrawn(true), 80); return ()=> clearTimeout(id) }, [])

  const showTooltip = (ev: React.SyntheticEvent, content: React.ReactNode, targetId?: string) => {
    const target = ev.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = rect.left + rect.width/2
    const y = rect.top - 8
    const id = `dem-tooltip-${Date.now()}`
    setTooltip({ x, y, content, id, targetId })
  }
  const hideTooltip = () => setTooltip(null)

  useEffect(()=>{ const onKey = (e: KeyboardEvent) => { if(e.key === 'Escape') hideTooltip() }; window.addEventListener('keydown', onKey); return ()=> window.removeEventListener('keydown', onKey) }, [])

  return (
    <div className={`${styles.page} panelContainer`}>
      <div className={styles.container}>
        <h2 style={{textAlign:'center'}}>GESTIÓN DEMANDA</h2>

        <PanelFilters period={filters.period} area={filters.area} kind={filters.kind} responsible={filters.responsible} onChange={(next)=> setFilters(prev=> ({ ...prev, ...next }))} />

        <div className={styles.bigChart}>
          <h3>Volumen y clasificación</h3>
          <div style={{position:'relative'}} ref={wrapperRef}>
            <div className={styles.chartLegend} aria-hidden>
              <div className={styles.chartLegendItem}><span className={styles.legendSwatch} style={{background:'#2563eb'}}></span>Planificada</div>
              <div className={styles.chartLegendItem}><span className={styles.legendSwatch} style={{background:'#94a3b8'}}></span>No planificada</div>
            </div>
            <svg viewBox="0 0 800 260" className={`${styles.chartSvg} ${anim?styles.anim:''}`} preserveAspectRatio="xMidYMid meet">
              <rect width="100%" height="100%" fill="transparent" />
              {/* grid */}
              {Array.from({length:5}).map((_,i)=>{ const y = 40 + i*40; return <line key={i} x1={40} x2={760} y1={y} y2={y} stroke="#eef2f7" /> })}
              <text x="12" y="18" fontSize="12" fill="#666">Volumen (peticiones)</text>
              {/* X labels */}
              {adjusted.series.map((_,i)=>{ const len = adjusted.series.length; const x = 40 + (i/(len-1))*720; return <text key={i} x={x} y={245} fontSize={11} fill="#666" textAnchor="middle">{`P${i+1}`}</text> })}
              {(() => {
                const vals = adjusted.series
                if(vals.length === 0) return null
                const max = Math.max(...vals)
                const yMax = Math.max(10, Math.ceil(max/10)*10)
                const pts = vals.map((v,i)=>{ const x = 40 + (i/(vals.length-1))*720; const y = 220 - (v / yMax) * 180; return `${x},${y}` }).join(' ')
                return <polyline className={`${styles.chartLine} ${drawn?styles.drawn:''}`} fill="none" stroke="#2563eb" strokeWidth={3} points={pts} />
              })()}

              {/* Y ticks */}
              {(() => {
                const max = Math.max(...adjusted.series)
                const yMax = Math.max(10, Math.ceil(max/10)*10)
                return Array.from({length:6}).map((_,i)=>{ const val = Math.round((i/5)*yMax); const y = 220 - (val / yMax) * 180; return <g key={i}><line x1={28} x2={36} y1={y} y2={y} stroke="#94a3b8" /><text x={8} y={y+4} fontSize={11} fill="#666">{val}</text></g> })
              })()}

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
            <h3 className={styles.sectionTitle}>Total peticiones</h3>
            <div className={styles.bigStat} aria-live="polite">{adjusted.total}</div>
            <div className={styles.smallNote}>Número total de peticiones recibidas en el periodo seleccionado</div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Planificada vs No planificada</h3>
            <div className={styles.metricRow}>
              <div>
                <div className={styles.metricEmph} aria-live="polite">{adjusted.plannedPct}%</div>
                <div className={styles.smallNote}>Planificada</div>
              </div>
              <div style={{flex:1}}>
                <div className={styles.barWrap} aria-hidden>
                  <div className={`${styles.barFill} ${anim?styles.anim:''}`} style={{ width: `${adjusted.plannedPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Clasificación por tipología</h3>
            <div className={styles.grid} style={{gridTemplateColumns:'1fr'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><div>Estratégicas</div><div>{adjusted.byType.strategic}%</div></div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><div>Operativas</div><div>{adjusted.byType.operational}%</div></div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><div>Internas</div><div>{adjusted.byType.internal}%</div></div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><div>Proactivas</div><div>{adjusted.byType.proactive}%</div></div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Evolución</h3>
            <svg width={260} height={48} viewBox="0 0 260 48" className={styles.spark} aria-label="Evolución demanda">
              {adjusted.series.map((v,i)=>{
                const len = adjusted.series.length
                const x = (i/(len-1)) * 260
                const max = Math.max(...adjusted.series)
                const min = Math.min(...adjusted.series)
                const y = 48 - ((v - min)/(max - min || 1)) * 48
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={6}
                    className={styles.point}
                    fill="transparent"
                    onMouseEnter={(e)=> showTooltip(e, <div><strong>{v}</strong><div className={styles.smallNote}>peticiones</div></div>)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e)=> showTooltip(e as any, <div><strong>{v}</strong><div className={styles.smallNote}>peticiones</div></div>)}
                    onBlur={hideTooltip}
                    tabIndex={0}
                  />
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
