import React, { useState } from 'react'
import styles from './AnsDashboard.module.css'
import ansData from '../../data/ansData'
import Card from '../Card'

type Cat = 'niv'|'dis'|'ons'|'seg'|'cmu'

type MetricItem = {
  id: string
  code: string
  title: string
  value: number
  target: number
  unit?: string
}

export default function AnsDashboard({metrics}:{metrics?: MetricItem[]}){
  const [cat, setCat] = useState<Cat>('niv')

  // If external metrics provided (header filters), show those cards
  if(metrics && metrics.length){
    return (
      <div className={styles.root}>
        <div className={styles.grid}>
          {metrics.map((m, idx) => <Card key={m.id} item={m as any} index={idx} />)}
        </div>
      </div>
    )
  }

  const categories = {
    niv: ansData.niv,
    dis: ansData.dis,
    ons: ansData.ons,
    seg: ansData.seg,
    cmu: ansData.cmu
  } as const

  const items = categories[cat]
  const latestMonth = ansData.months[ansData.months.length - 1]

  const cardItems: MetricItem[] = items.map(it => ({
    id: it.id,
    code: it.code,
    title: it.title,
    value: (it.monthly as any)[latestMonth] ?? 0,
    target: it.target ?? 0,
    unit: it.unit
  }))

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <div className={styles.tabs} role="tablist" aria-label="Categorías ANS">
          <button className={`${styles.tab} ${cat === 'niv' ? styles.tabActive : ''}`} onClick={() => setCat('niv')} role="tab" aria-selected={cat === 'niv'}>NIV</button>
          <button className={`${styles.tab} ${cat === 'dis' ? styles.tabActive : ''}`} onClick={() => setCat('dis')} role="tab" aria-selected={cat === 'dis'}>DIS</button>
          <button className={`${styles.tab} ${cat === 'ons' ? styles.tabActive : ''}`} onClick={() => setCat('ons')} role="tab" aria-selected={cat === 'ons'}>ONS</button>
          <button className={`${styles.tab} ${cat === 'seg' ? styles.tabActive : ''}`} onClick={() => setCat('seg')} role="tab" aria-selected={cat === 'seg'}>SEG</button>
          <button className={`${styles.tab} ${cat === 'cmu' ? styles.tabActive : ''}`} onClick={() => setCat('cmu')} role="tab" aria-selected={cat === 'cmu'}>CMU</button>
        </div>
      </div>

      <div className={styles.grid} role="region" aria-live="polite">
        {cardItems.map((it, idx) => <Card key={it.id} item={it as any} index={idx} />)}
      </div>
    </div>
  )
}