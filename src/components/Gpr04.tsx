
import React, { useState } from 'react'
import styles from './Gpr04.module.css'
import PanelFilters from './PanelFilters'
import type { PeriodKey, AreaKey } from '../data/gcb03Data'

const risksByPeriod = {
  'Último mes': [
    { id: 'R-001', prob: 0.82, impact: 0.72, status: 'Mitigado', title: 'Riesgo integración', desc: 'Riesgo por incompatibilidades de API entre módulos.', area: 'Vivienda', kind: 'Cambio mayor', responsible: 'Equipo A' },
    { id: 'R-002', prob: 0.45, impact: 0.88, status: 'Vigilancia', title: 'Riesgo operativo', desc: 'Posible impacto en operación por falta de recursos.', area: 'Territorio', kind: 'Riesgo', responsible: 'Equipo B' },
    { id: 'R-003', prob: 0.25, impact: 0.33, status: 'Controlado', title: 'Riesgo documentación', desc: 'Falta de documentación en repositorio interno.', area: 'Movilidad', kind: 'Conocimiento', responsible: 'Equipo C' }
  ],
  'Último trimestre': [
    { id: 'R-001', prob: 0.78, impact: 0.7, status: 'Mitigado', title: 'Riesgo integración', desc: 'Tendencia estable en integración.', area: 'Vivienda', kind: 'Cambio mayor', responsible: 'Equipo A' },
    { id: 'R-002', prob: 0.5, impact: 0.85, status: 'Vigilancia', title: 'Riesgo operativo', desc: 'Aumento en incidentes operativos.', area: 'Territorio', kind: 'Riesgo', responsible: 'Equipo B' },
    { id: 'R-004', prob: 0.35, impact: 0.4, status: 'Controlado', title: 'Riesgo seguridad', desc: 'Vulnerabilidad parcheada recientemente.', area: 'Movilidad', kind: 'Riesgo', responsible: 'Equipo C' }
  ],
  'Último año': [
    { id: 'R-005', prob: 0.6, impact: 0.8, status: 'Vigilancia', title: 'Riesgo adopción', desc: 'Resistencia al cambio en usuarios.', area: 'Vivienda', kind: 'Cambio menor', responsible: 'Equipo A' },
    { id: 'R-006', prob: 0.3, impact: 0.5, status: 'Controlado', title: 'Riesgo coste', desc: 'Desviación presupuestaria contenida.', area: 'Territorio', kind: 'Riesgo', responsible: 'Equipo B' }
  ]
}


export default function Gpr04(){
  const [filters, setFilters] = useState<{ period: PeriodKey; area: AreaKey | 'Todas'; kind: string; responsible: string }>({ period: 'Último mes', area: 'Todas', kind: 'Todos', responsible: 'Todos' })
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x:number; y:number } | null>(null)
  const contingenciaOk = 0.94
  const resolucion = 0.97
  const mitigados = 0.96
  
  const currentRisks = (risksByPeriod as any)[filters.period] || []
  const filteredRisks = currentRisks.filter((r:any) => {
    if(filters.area !== 'Todas' && r.area !== filters.area) return false
    if(filters.kind !== 'Todos' && r.kind !== filters.kind) return false
    if(filters.responsible !== 'Todos' && r.responsible !== filters.responsible) return false
    return true
  })

  return (
    <div className={styles.page}>
      <h2>GESTIÓN PROBLEMAS Y RIESGOS (GPR-04)</h2>

      <PanelFilters period={filters.period} area={filters.area} kind={filters.kind} responsible={filters.responsible} onChange={(next)=>setFilters(prev=>({...prev,...next}))} />

      <section className={styles.row}>
        <div className={styles.card}>
          <h3>Matriz de Riesgo</h3>
          <div className={styles.matrixWrap}>
            <svg viewBox="0 0 200 200" className={styles.matrix} role="img" aria-label="Matriz de riesgo probabilidad vs impacto">
              <title>Matriz de riesgo</title>
              <rect x="0" y="0" width="200" height="200" fill="#fff" stroke="#eee" />
              {/* grid lines */}
              <line x1="0" y1="100" x2="200" y2="100" stroke="#f3f4f6" />
              <line x1="100" y1="0" x2="100" y2="200" stroke="#f3f4f6" />
              {filteredRisks.map((r: any, i: number)=> {
                const cx = 50 + r.prob*100
                const cy = 150 - r.impact*100
                const severity = r.prob * r.impact
                const radius = 6 + severity * 22
                const isSelected = selected === r.id

                // color scale: green (low) -> yellow (mid) -> red (high)
                const color = severity < 0.25 ? '#16a34a' : severity < 0.5 ? '#f59e0b' : '#ef4444'
                const stroke = severity < 0.25 ? '#0f766e' : severity < 0.5 ? '#b45309' : '#7f1d1d'

                return (
                  <g key={r.id} transform={`translate(0,0)`}> 
                    <circle
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                      aria-describedby={`desc-${r.id}`}
                      onClick={()=> setSelected(r.id)}
                      onKeyDown={(e)=> { if(e.key === 'Enter' || e.key === ' ') setSelected(r.id) }}
                      onMouseEnter={(ev)=> { setHovered(r.id); setTooltipPos({ x: (ev.nativeEvent as MouseEvent).offsetX, y: (ev.nativeEvent as MouseEvent).offsetY }) }}
                      onMouseMove={(ev)=> { setTooltipPos({ x: (ev.nativeEvent as MouseEvent).offsetX, y: (ev.nativeEvent as MouseEvent).offsetY }) }}
                      onMouseLeave={()=> { setHovered(null); setTooltipPos(null) }}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={color}
                      opacity={0.95}
                      stroke={stroke}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <title>{r.title}</title>
                  </g>
                )
              })}
            
            </svg>

            {/* tooltip container positioned over svg */}
            {hovered && tooltipPos && (
              <div className={styles.tooltip} style={{ left: tooltipPos.x + 8, top: tooltipPos.y + 8 }} role="status">
                {(() => {
                  const rr = currentRisks.find((x:any) => x.id === hovered)!
                  return (
                    <>
                      <strong>{rr.title}</strong>
                      <div className={styles.statusMeta}>{(rr.prob*100).toFixed(0)}% · Impacto {(rr.impact*100).toFixed(0)}%</div>
                    </>
                  )
                })()}
              </div>
            )}

            <div className={styles.matrixLegend} aria-hidden>
              <div><strong>Probabilidad ↑</strong></div>
              <div><strong>Impacto →</strong></div>
            </div>

            {/* hidden descriptions for screen readers */}
            <div style={{ display: 'none' }}>
              {currentRisks.map((r:any)=> <div id={`desc-${r.id}`} key={`desc-${r.id}`}>{r.title} — {r.desc}</div>)}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Funnel de resolución</h3>
          <div className={styles.funnel} aria-hidden>
            <div className={styles.funnelStep} style={{ width: '100%' }}>Incidencias recibidas</div>
            <div className={styles.funnelStep} style={{ width: '70%' }}>Analizadas</div>
            <div className={styles.funnelStep} style={{ width: '45%' }}>Resueltas</div>
            <div className={styles.funnelStep} style={{ width: '30%' }}>Cerradas</div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Estado riesgos</h3>
          <div className={styles.statusGrid}>
            {filteredRisks.map((r:any)=> (
              <div key={r.id} className={`${styles.statusCard} ${selected===r.id?styles.selected:''}`} role="group" aria-label={`Riesgo ${r.id}`} onClick={()=> setSelected(r.id)} tabIndex={0} onKeyDown={(e)=> { if(e.key==='Enter') setSelected(r.id) }}>
                <div className={styles.statusId}>{r.id}</div>
                <div className={styles.statusMeta}>Prob: {(r.prob*100).toFixed(0)}% Impact: {(r.impact*100).toFixed(0)}%</div>
                <div className={styles.statusLabel}>{r.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3>Lista de riesgos ({filteredRisks.length})</h3>
          <ul className={styles.riskList}>
            {filteredRisks.map((r:any)=> (
              <li key={r.id} className={styles.riskListItem} onClick={()=> setSelected(r.id)} tabIndex={0} onKeyDown={(e)=> { if(e.key==='Enter') setSelected(r.id) }}>
                <div className={styles.statusId}>{r.id}</div>
                <div>
                  <div><strong>{r.title}</strong></div>
                  <div className={styles.statusMeta}>{r.area} • {r.kind} • {r.responsible}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Detail panel */}
        <aside className={styles.detailCard} aria-live="polite">
          {selected ? (
            (()=>{
              const r = currentRisks.find((rr:any)=> rr.id===selected)!
              return (
                <div>
                  <h3>Detalle {r.id}</h3>
                  <div className={styles.statusMeta}><strong>{r.title}</strong></div>
                  <p>{r.desc}</p>
                  <div className={styles.statusMeta}>Probabilidad: {(r.prob*100).toFixed(0)}%</div>
                  <div className={styles.statusMeta}>Impacto: {(r.impact*100).toFixed(0)}%</div>
                  <div className={styles.statusLabel}>Estado: {r.status}</div>
                </div>
              )
            })()
          ) : (
            <div><em>Selecciona un riesgo en la matriz o en la lista para ver detalles.</em></div>
          )}
        </aside>
      </section>

      <section className={styles.metricsRow} aria-live="polite">
        <div className={styles.metric}>% Riesgos con contingencia: <strong>{(contingenciaOk*100).toFixed(0)}%</strong></div>
        <div className={styles.metric}>Tasa resolución problemas: <strong>{(resolucion*100).toFixed(0)}%</strong></div>
        <div className={styles.metric}>% Riesgos mitigados: <strong>{(mitigados*100).toFixed(0)}%</strong></div>
      </section>
    </div>
  )
}
