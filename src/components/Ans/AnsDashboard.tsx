import React, { useState, useEffect, useMemo } from 'react'
import styles from './AnsDashboard.module.css'
import ansData from '../../data/ansData'
import sampleData from '../../data/sampleData'
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

type Filters = { month?: string; lote?: string; req?: string }

export default function AnsDashboard({metrics, filters}:{metrics?: MetricItem[], filters?: Filters}){
  const [cat, setCat] = useState<Cat>('niv')

  const months = ansData.months
  const yearMap = useMemo(()=>{
    const m: Record<string,string[]> = {}
    months.forEach(label=>{
      const match = label.match(/(\d{4})$/)
      const y = match ? match[1] : '0000'
      if(!m[y]) m[y] = []
      m[y].push(label)
    })
    return m
  },[months])

  const years = Object.keys(yearMap).map(Number).sort((a,b)=>a-b)

  // default selected month/year (prefer filter.month when present)
  const defaultMonth = filters?.month && months.includes(filters.month) ? filters.month : months[months.length-1]
  const defaultYear = Number((defaultMonth.match(/(\d{4})$/) || [])[0] || years[years.length-1])
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth)
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear)

  // if filters.month changes, reflect in selector
  useEffect(()=>{
    if(filters?.month && months.includes(filters.month)){
      setSelectedMonth(filters.month)
      const y = Number((filters.month.match(/(\d{4})$/) || [])[0])
      if(!Number.isNaN(y)) setSelectedYear(y)
    }
  },[filters?.month, months])

  // ensure selectedMonth belongs to selectedYear
  useEffect(()=>{
    const list = yearMap[String(selectedYear)] || []
    if(!list.includes(selectedMonth) && list.length) setSelectedMonth(list[0])
  },[selectedYear, selectedMonth, yearMap])

  // build base items from ansData for the selected month and category
  function buildFromAns(monthLabel: string, category: Cat){
    const categories = {
      niv: ansData.niv,
      dis: ansData.dis,
      ons: ansData.ons,
      seg: ansData.seg,
      cmu: ansData.cmu
    } as const
    const items = categories[category]
    return items.map(it => ({ id: it.id, code: it.code, title: it.title, value: (it.monthly as any)[monthLabel] ?? 0, target: it.target ?? 0, unit: it.unit })) as MetricItem[]
  }

  // if a specific req is selected in the header filters and sampleData has it for the month, use that
  const externalMetrics = useMemo(()=>{
    if(!filters?.req) return null
    const fm = filters.month
    if(!fm) return null
    const m = (sampleData as any).data[fm]
    if(!m) return null
    const list = m[filters.req as string]
    if(!list) return null
    return list.map((lm:any)=>({ id: lm.id, code: lm.code, title: lm.title, value: lm.value, target: lm.target || 0, unit: lm.unit })) as MetricItem[]
  },[filters?.req, filters?.month])

  // adjust values to try to reach 90% compliance
  function adjustToGoal(items: MetricItem[], goal = 0.9){
    if(!items || items.length === 0) return items
    const compliances = items.map(it => it.target > 0 ? (it.value / it.target) : 1)
    const met = compliances.filter(c => c >= goal).length
    const need = Math.max(0, Math.ceil(items.length * goal) - met)
    if(need <= 0) return items

    const out = items.map(it => ({ ...it }))
    // gentle global multiplier based on average compliance
    const avg = compliances.reduce((s,c)=>s+c,0)/compliances.length
    const globalMult = 1 + Math.min(0.2, Math.max(0, (goal - avg) * 0.8))
    out.forEach(o=>{ o.value = Math.round(Math.min((o.target || 100) * 1.05, o.value * globalMult) * 10) / 10 })

    // promote closest-to-target items until need satisfied
    const byDiff = out.map((it, idx)=>({idx, diff: (it.target>0? (it.target - it.value):0)})).sort((a,b)=>a.diff - b.diff)
    let promoted = 0
    for(const e of byDiff){
      if(promoted >= need) break
      const i = e.idx
      const it = out[i]
      if(it.target <= 0) continue
      const neededVal = Math.round(it.target * goal * 10)/10
      if(it.value < neededVal){ it.value = Math.min(Math.round(it.target * 1.02 * 10)/10, neededVal); promoted += 1 }
    }
    return out
  }

  const baseItems = externalMetrics && externalMetrics.length ? externalMetrics : buildFromAns(selectedMonth, cat)
  const cardItems = adjustToGoal(baseItems, 0.9)

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