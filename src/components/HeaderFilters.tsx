import React from 'react'
import styles from './HeaderFilters.module.css'

type Props = {
  months: string[]
  reqs: string[]
  month: string
  lote: string
  req: string
  onChange: (state:{month:string, lote:string, req:string})=>void
}

export default function HeaderFilters({months, reqs, month, lote, req, onChange}:Props){
  return (
    <header className={styles.header}>
      <div className={styles.controls}>
        <select className={styles.select} value={month} onChange={e=>onChange({month:e.target.value, lote, req})}>
          {months.map(m=> <option key={m} value={m}>{m}</option>)}
        </select>
        <select className={styles.select} value={lote} onChange={e=>onChange({month, lote:e.target.value, req})}>
          <option value="Lote 2">Lote 2</option>
        </select>
        <select className={styles.select} value={req} onChange={e=>onChange({month, lote, req:e.target.value})}>
          {reqs.map(r=> <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </header>
  )
}
