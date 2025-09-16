import React, { useMemo, useState } from 'react'
import styles from './Gcb03.module.css'
import PanelFilters from './PanelFilters'
import getGcb03Data, { PeriodKey, AreaKey } from '../data/gcb03Data'
import SmallGauge from './SmallGauge'

type Filters = { period: PeriodKey; area: AreaKey | 'Todas'; kind: string; responsible: string }

export default function Gcb03(): JSX.Element {
  const [filters, setFilters] = useState<Filters>({ period: 'Último mes', area: 'Todas', kind: 'Todos', responsible: 'Todos' })
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)

  const data = useMemo(()=> getGcb03Data(filters.period), [filters.period])

  // gauge: map 0-10 into degrees for arc (0 -> 0deg, 10 -> 180deg)
  const gaugePct = Math.max(0, Math.min(10, data.satisfaction)) / 10
  const gaugeAngle = 180 * gaugePct

  // helper: polar to cartesian on a center
  const polarToCartesian = (cx:number, cy:number, radius:number, angleInDegrees:number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return { x: cx + (radius * Math.cos(angleInRadians)), y: cy + (radius * Math.sin(angleInRadians)) }
  }

  const describeArc = (cx:number, cy:number, radius:number, startAngle:number, endAngle:number) => {
    const start = polarToCartesian(cx, cy, radius, endAngle)
    const end = polarToCartesian(cx, cy, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  }

  // knob position on semicircle (0..1 -> 180..0 degrees)
  const knobAngle = 180 - (gaugePct * 180)
  const knobPos = polarToCartesian(100, 100, 78, knobAngle)

  // optionally filter adoption rows by area
  const adoptionRows = filters.area === 'Todas' ? data.adoption : data.adoption.filter(r=> r.area === filters.area)

  const [tooltip, setTooltip] = useState<{ x:number; y:number; content: string } | null>(null)
  const showTooltip = (ev: React.MouseEvent, content: string) => {
    const targ = ev.currentTarget as HTMLElement
    const rect = targ.getBoundingClientRect()
    setTooltip({ x: rect.left + rect.width/2, y: rect.top - 8, content })
  }
  const hideTooltip = () => setTooltip(null)

  return (
    <div className={`${styles.page} panelContainer`}>
      <h2>GESTIÓN DEL CAMBIO (GCB-03)</h2>

      <PanelFilters period={filters.period} area={filters.area} kind={filters.kind} responsible={filters.responsible} onChange={(next)=>setFilters(prev=>({ ...prev, ...next }))} />

      <section className={styles.row}>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Satisfacción Comunicación</h3>
          <div className={styles.gaugeWrap}>
            <div className={styles.smallGaugeWrap}>
              <SmallGauge value={data.satisfaction} target={8} />
              <div className={styles.gaugeCenter}
                role="button"
                tabIndex={0}
                onMouseEnter={(e)=> showTooltip(e, `Satisfacción: ${data.satisfaction.toFixed(1)} / 10`)}
                onMouseLeave={hideTooltip}
                onFocus={(e)=> showTooltip(e as any, `Satisfacción: ${data.satisfaction.toFixed(1)} / 10`)}
                onBlur={hideTooltip}
                aria-label={`Satisfacción ${data.satisfaction.toFixed(1)} de 10`}
              >
                <div className={styles.gaugeLabel}>{data.satisfaction.toFixed(1)}</div>
                <div className={styles.gaugeSub}>/10</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Adopción por área</h3>
          <div className={styles.stackBar} role="list" aria-label="Adopción por área">
            {adoptionRows.map(a=> (
              <div key={a.area} className={styles.stackRow} role="listitem">
                <div className={styles.stackLabel}>{a.area}</div>
                <div className={styles.stackBarBg} aria-hidden>
                  <div
                    className={styles.stackBarFill}
                    style={{ width: `${a.percent}%` }}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={(e)=> showTooltip(e, `${a.area}: ${a.percent}% adopción`)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e)=> showTooltip(e as any, `${a.area}: ${a.percent}% adopción`)}
                    onBlur={hideTooltip}
                    aria-label={`${a.percent} por ciento`}
                  />
                </div>
                <div className={styles.stackVal} aria-label={`${a.percent} por ciento`}>{a.percent}%</div>
              </div>
            ))}
          </div>
        </div>

        {tooltip && (
          <div className={styles.tooltip} style={{ position: 'fixed', left: tooltip.x, top: tooltip.y }} role="status">{tooltip.content}</div>
        )}

        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Ratio usuarios reacios</h3>
          <div className={styles.semaforo} role="img" aria-label={`Ratio de usuarios reacios ${data.resistancePct} por ciento`}>
            <div className={data.resistancePct <=5 ? styles.green : data.resistancePct <=10 ? styles.yellow : styles.red} aria-hidden></div>
            <div className={styles.semaforoLabel}>{data.resistancePct}%</div>
          </div>
        </div>
      </section>

      <section className={styles.card} aria-labelledby="gcb-repercusiones">
        <h3 id="gcb-repercusiones" className={styles.sectionTitle}>Repercusiones positivas (timeline)</h3>
        <ul className={styles.timeline} role="list">
          {data.timeline.map((r, idx)=> (
            <li key={r.date} className={styles.timelineItem} role="listitem">
              <button className={styles.timelineBtn} onClick={()=> setSelectedEvent(idx)} aria-pressed={selectedEvent===idx} aria-label={`Evento ${r.date}: ${r.text}`}>
                <div className={styles.timelineDate}>{r.date}</div>
                <div className={styles.timelineText}>{r.text}</div>
              </button>
            </li>
          ))}
        </ul>

        {selectedEvent !== null && (
          <div className={styles.eventDetail} role="region" aria-live="polite">
            <strong>{data.timeline[selectedEvent].date}</strong>
            <p>{data.timeline[selectedEvent].text}</p>
            {data.timeline[selectedEvent].impact !== undefined && <p>Impacto estimado: {data.timeline[selectedEvent].impact}/10</p>}
          </div>
        )}
      </section>
    </div>
  )
}
