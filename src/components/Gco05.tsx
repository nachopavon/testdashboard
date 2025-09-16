import React, { useMemo, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Gco05.module.css'
import PanelFilters from './PanelFilters'
import type { PeriodKey, AreaKey } from '../data/gcb03Data'
import getGco05Data from '../data/gco05Data'

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

export default function Gco05(): React.ReactElement {
  const [filters, setFilters] = useState<{ period: PeriodKey; area: AreaKey | 'Todas'; kind: string; responsible: string }>({ period: 'Último mes', area: 'Todas', kind: 'Todos', responsible: 'Todos' })
  const data = useMemo(()=> getGco05Data(filters.period), [filters.period])
  const [hoverNode, setHoverNode] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x:number; y:number; content: React.ReactNode; id: string; targetId?: string } | null>(null)
  const [anim, setAnim] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const wrapperRef = useRef<HTMLDivElement|null>(null)

  const trendPath = sparklinePath(data.trend, 240, 48)

  // helper to show tooltip at mouse position (portal)
  const showTooltip = (ev: React.SyntheticEvent, content: React.ReactNode, targetId?: string) => {
    const target = ev.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = rect.left + rect.width/2
    const y = rect.top - 8
    const id = `gco-tooltip-${Date.now()}`
    setTooltip({ x, y, content, id, targetId })
  }
  const hideTooltip = () => setTooltip(null)

  // trigger animation on filter changes like Capacidad
  useEffect(()=>{
    setAnim(true)
    setDrawn(false)
    const t1 = setTimeout(()=> setDrawn(true), 60)
    const t2 = setTimeout(()=> setAnim(false), 420)
    return ()=>{ clearTimeout(t1); clearTimeout(t2) }
  }, [filters.period, filters.area, filters.kind, filters.responsible])

  // ensure drawn on mount
  useEffect(()=>{ const id = setTimeout(()=> setDrawn(true), 80); return ()=> clearTimeout(id) }, [])

  return (
    <div className={`${styles.page} panelContainer`}>
      <div className={styles.container}>
        <h2>GESTIÓN CONOCIMIENTO (GCO-05)</h2>

        <PanelFilters period={filters.period} area={filters.area} kind={filters.kind} responsible={filters.responsible} onChange={(next) => setFilters(prev => ({ ...prev, ...next }))} />

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Completitud Base Conocimiento</h3>
            <div className={styles.bigStat} aria-live="polite">{data.completeness}%</div>
          </div>

          <div className={styles.card}>
            <h3>Tiempo medio acceso</h3>
            <div className={styles.bigStat}>{data.accessTime} min</div>
          </div>

          <div className={styles.card}>
            <h3>Uso herramientas</h3>
            <div className={styles.usageRow}>
              {Object.entries(data.usage).map(([k,v])=> <div key={k}>{k}: <strong>{v}</strong></div>)}
            </div>
          </div>
        </div>

        <section className={styles.heatmap} aria-label="Heatmap de visitas por área">
          <h3 className={styles.sectionTitle}>Heatmap Áreas</h3>
          <div className={styles.heatRows}>
            {data.heatmap.map((row, i) => (
              <div key={row.area} className={styles.heatRow} role="listitem">
                <div className={styles.heatLabel}>{row.area}</div>
                <div className={styles.heatBar}>
                  {row.values.map((v, idx)=> (
                    <div
                      key={idx}
                      className={styles.heatCell}
                      style={{ width: `${100/row.values.length}%`, background: `linear-gradient(90deg, rgba(255,255,255,0), rgba(249,115,22,${v/100}))` }}
                      aria-label={`${v}%`}
                      role="button"
                      tabIndex={0}
                      onMouseEnter={(e)=> showTooltip(e, `${row.area} — ${v}% visitas`)}
                      onMouseMove={(e)=> showTooltip(e, `${row.area} — ${v}% visitas`)}
                      onMouseLeave={hideTooltip}
                      onFocus={(e)=> showTooltip(e as any, `${row.area} — ${v}% visitas`)}
                      onBlur={hideTooltip}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card} style={{marginTop:18}}>
          <h3 className={styles.sectionTitle}>Tendencia completitud</h3>
          <div style={{position:'relative'}} ref={wrapperRef}>
            <div className={styles.chartLegend} aria-hidden>
              <div className={styles.chartLegendItem}><span className={styles.legendSwatch} style={{background:'#3b82f6'}}></span>Completitud</div>
            </div>
            <svg viewBox="0 0 800 260" className={`${styles.chartSvg} ${anim?styles.anim:''}`} preserveAspectRatio="xMidYMid meet">
              <rect width="100%" height="100%" fill="transparent" />
              {Array.from({length:5}).map((_,i)=>{ const y = 40 + i*40; return <line key={i} x1={40} x2={760} y1={y} y2={y} stroke="#eef2f7" /> })}
              <text x="12" y="18" fontSize="12" fill="#666">Completitud (%)</text>
              {(() => {
                const vals = data.trend
                if(vals.length === 0) return null
                const max = Math.max(...vals)
                const yMax = Math.max(10, Math.ceil(max/10)*10)
                const pts = vals.map((v,i)=>{ const x = 40 + (i/(vals.length-1))*720; const y = 220 - (v / yMax) * 180; return `${x},${y}` }).join(' ')
                return <polyline className={`${styles.chartLine} ${drawn?styles.drawn:''}`} fill="none" stroke="#3b82f6" strokeWidth={3} points={pts} />
              })()}

              {(() => {
                const max = Math.max(...data.trend)
                const yMax = Math.max(10, Math.ceil(max/10)*10)
                return Array.from({length:6}).map((_,i)=>{ const val = Math.round((i/5)*yMax); const y = 220 - (val / yMax) * 180; return <g key={i}><line x1={28} x2={36} y1={y} y2={y} stroke="#94a3b8" /><text x={8} y={y+4} fontSize={11} fill="#666">{val}</text></g> })
              })()}

              {data.trend.map((v,i)=>{
                const len = data.trend.length
                const x = 40 + (i/(len-1)) * 720
                const max = Math.max(...data.trend)
                const yMax = Math.max(10, Math.ceil(max/10)*10)
                const y = 220 - (v / yMax) * 180
                const content = (<div className={styles.tooltipRich}><strong>{`Periodo ${i+1}`}</strong><div className="row"><span>Completitud</span><span>{v}%</span></div></div>)
                return (
                  <g key={`pt-${i}`}>
                    <circle id={`gco-pt-${i}`} cx={x} cy={y} r={9} fill="#3b82f6" opacity={0.001} role="button" tabIndex={0}
                      aria-describedby={tooltip && tooltip.targetId === `gco-pt-${i}` ? tooltip.id : undefined}
                      onMouseEnter={(e)=> showTooltip(e, content, `gco-pt-${i}`)} onMouseLeave={hideTooltip} onFocus={(e)=> showTooltip(e as any, content, `gco-pt-${i}`)} onBlur={hideTooltip} />
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
        </section>

        <section className={styles.card} style={{marginTop:18}}>
          <h3 className={styles.sectionTitle}>Network de flujos</h3>
          <div className={styles.networkWrap}>
            <svg viewBox="0 0 300 140" className={styles.network} role="img" aria-label="Diagrama de red de conocimiento">
              <title>Red de conocimiento</title>
              {data.network.links.map((l, i)=>{
                const s = data.network.nodes.find(n=>n.id===l.source)!
                const t = data.network.nodes.find(n=>n.id===l.target)!
                // simple placement by index
                const si = data.network.nodes.indexOf(s)
                const ti = data.network.nodes.indexOf(t)
                const sx = 40 + si*80
                const sy = 70 + (si%2?-30:30)
                const tx = 40 + ti*80
                const ty = 70 + (ti%2?-30:30)
                return <line key={i} x1={sx} y1={sy} x2={tx} y2={ty} stroke="#cbd5e1" strokeWidth={Math.max(1, (l.value ?? 1)/2)} />
              })}
              {data.network.nodes.map((n, i)=>{
                const x = 40 + i*80
                const y = 70 + (i%2?-30:30)
                return (
                  <g key={n.id} transform={`translate(${x},${y})`} onMouseEnter={()=> setHoverNode(n.id)} onMouseLeave={()=> setHoverNode(null)}>
                    <circle r={14} fill={hoverNode===n.id? '#2563eb' : '#60a5fa'}
                      role="button" tabIndex={0}
                      onFocus={()=> setHoverNode(n.id)} onBlur={()=> setHoverNode(null)}
                      onMouseEnter={(e)=> showTooltip(e, `${n.label}`)} onMouseLeave={hideTooltip}
                    />
                    <text x={20} y={6} fontSize={12}>{n.label}</text>
                  </g>
                )
              })}
            </svg>
            {hoverNode && <div className={styles.tooltipNetwork}>Nodo: {data.network.nodes.find(n=>n.id===hoverNode)!.label}</div>}
            {tooltip && (
              <div className={styles.tooltip} style={{ position: 'fixed', left: tooltip.x, top: tooltip.y }} role="status">
                {tooltip.content}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}