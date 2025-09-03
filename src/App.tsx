import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import HeaderFilters from './components/HeaderFilters'
import Card from './components/Card'
import sampleData, { months as dataMonths, reqs as dataReqs } from './data/sampleData'
import Economic from './components/Economic'
import AnsDashboard from './components/Ans/AnsDashboard'
import styles from './App.module.css'

export default function App(){
  const [filters, setFilters] = useState({ month: dataMonths[3], lote: 'Lote 2', req: dataReqs[0] })
  const [view, setView] = useState<'ans'|'econ'>(()=>{
    try{ const v = localStorage.getItem('td_view'); return (v==='ans'||v==='econ')? v : 'econ' }catch(e){ return 'econ' }
  })

  useEffect(()=>{ try{ localStorage.setItem('td_view', view) }catch(e){} }, [view])

  const metrics = sampleData.data[filters.month][filters.req]

  // counts for sidebar badges
  const econCount = (()=>{
    try{ return (require('./data/economicData').default.years.length || 0) * 12 }catch(e){ return 12 }
  })()
  const ansCount = metrics.length

  return (
    <div className={styles.app}>
      <Sidebar view={view} onChange={setView} ansCount={ansCount} econCount={econCount} />
      <div className={styles.main}>
        {view === 'ans' ? (
          <>
            <HeaderFilters months={dataMonths} reqs={dataReqs} month={filters.month} lote={filters.lote} req={filters.req} onChange={setFilters} />
            <AnsDashboard filters={filters} />
          </>
        ) : (
          <Economic />
        )}
      </div>
    </div>
  )
}
