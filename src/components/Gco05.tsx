import React, { useMemo, useState } from 'react'
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
  const [tooltip, setTooltip] = useState<{ x:number; y:number; content: string } | null>(null)

  const trendPath = sparklinePath(data.trend, 240, 48)

  // helper to show tooltip at mouse position
  const showTooltip = (ev: React.MouseEvent, content: string) => {
    const target = ev.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    setTooltip({ x: rect.left + rect.width/2, y: rect.top - 8, content })
  }

  const hideTooltip = () => setTooltip(null)

  return (
    <div className={styles.page}>
      <h2>GESTIÓN CONOCIMIENTO (GCO-05)</h2>

      <PanelFilters period={filters.period} area={filters.area} kind={filters.kind} responsible={filters.responsible} onChange={(next) => setFilters(prev => ({ ...prev, ...next }))} />

      <section className={styles.row}>
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
      </section>

      <section className={styles.heatmap} aria-label="Heatmap de visitas por área">
        <h3>Heatmap Áreas</h3>
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

      <section className={styles.card}>
        <h3>Tendencia completitud</h3>
        <svg width="240" height="48" viewBox="0 0 240 48" className={styles.spark} aria-label="Tendencia completitud">
          <path d={trendPath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {/* small invisible circles to capture hover for tooltip */}
          {data.trend.map((v, i)=>{
            const len = data.trend.length
            const x = (i/(len-1)) * 240
            const max = Math.max(...data.trend)
            const min = Math.min(...data.trend)
            const y = 48 - ((v - min)/(max - min || 1)) * 48
            return <circle key={i} cx={x} cy={y} r={8} fill="transparent" onMouseEnter={(e)=> showTooltip(e, `Periodo ${i+1}: ${v}%`)} onMouseLeave={hideTooltip} onFocus={(e)=> showTooltip(e as any, `Periodo ${i+1}: ${v}%`)} onBlur={hideTooltip} tabIndex={0} />
          })}
        </svg>
      </section>

      <section className={styles.card}>
        <h3>Network de flujos</h3>
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
  )
}