import React from 'react'
import styles from './PanelFilters.module.css'
import type { PeriodKey, AreaKey } from '../data/gcb03Data'

type Props = {
  period: PeriodKey
  area: AreaKey | 'Todas'
  kind: string
  responsible: string
  onChange: (next: Partial<{ period:PeriodKey; area:AreaKey | 'Todas'; kind:string; responsible:string }>)=>void
}

const periods: PeriodKey[] = ['Último mes','Último trimestre','Último año']
const areas: (AreaKey | 'Todas')[] = ['Todas','Vivienda','Territorio','Movilidad']
const kinds = ['Todos','Cambio menor','Cambio mayor','Riesgo','Conocimiento']
const responsibles = ['Todos','Equipo A','Equipo B','Equipo C']

export default function PanelFilters({ period, area, kind, responsible, onChange }:Props){
  return (
    <div className={styles.filtersBar} role="region" aria-label="Filtros del panel">
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="pf-period">Periodo</label>
        <select id="pf-period" className={styles.filterSelect} value={period} onChange={(e)=>onChange({ period: e.target.value as PeriodKey })}>
          {periods.map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="pf-area">Área</label>
        <select id="pf-area" className={styles.filterSelect} value={area} onChange={(e)=>onChange({ area: e.target.value as AreaKey })}>
          {areas.map(a=> <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="pf-kind">Tipo</label>
        <select id="pf-kind" className={styles.filterSelect} value={kind} onChange={(e)=>onChange({ kind: e.target.value })}>
          {kinds.map(k=> <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="pf-resp">Responsable</label>
        <select id="pf-resp" className={styles.filterSelect} value={responsible} onChange={(e)=>onChange({ responsible: e.target.value })}>
          {responsibles.map(r=> <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </div>
  )
}
