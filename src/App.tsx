import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import HeaderFilters from './components/HeaderFilters'
import Card from './components/Card'
import sampleData, { months as dataMonths, reqs as dataReqs } from './data/sampleData'
import Economic from './components/Economic'
import AnsDashboard from './components/Ans/AnsDashboard'
import Chat from './components/Chat'
import ServiciosPrestados from './components/ServiciosPrestados'
import ServiciosPendientes from './components/ServiciosPendientes'
import CargaTrabajo from './components/CargaTrabajo'
import styles from './App.module.css'

export default function App(){
  const [filters, setFilters] = useState({ month: dataMonths[3], lote: 'Lote 2', req: dataReqs[0] })
  const [view, setView] = useState<'ans'|'econ'|'chat'|'servicios-prestados'|'servicios-pendientes'|'carga-trabajo'>(() => {
    try {
      const v = localStorage.getItem('td_view');
      return (['ans','econ','chat','servicios-prestados','servicios-pendientes','carga-trabajo'] as const).includes(v as any) ? v as any : 'econ';
    } catch(e) {
      return 'econ';
    }
  })

  useEffect(()=>{ try{ localStorage.setItem('td_view', view) }catch(e){} }, [view])

  const metrics = sampleData.data[filters.month][filters.req]

  // counts for sidebar badges
  const econCount = (()=>{
    try{ return (require('./data/economicData').default.years.length || 0) * 12 }catch(e){ return 12 }
  })()
  const ansCount = metrics.length
  const serviciosCount = 24 // placeholder
  const pendientesCount = 6 // placeholder
  const cargaCount = 6 // placeholder

  return (
    <div className={styles.app}>
      <Sidebar
        view={view}
        onChange={setView}
        ansCount={ansCount}
        econCount={econCount}
        serviciosCount={serviciosCount}
        pendientesCount={pendientesCount}
        cargaCount={cargaCount}
      />
      <div className={styles.main}>
        {view === 'ans' ? (
          <>
            <HeaderFilters months={dataMonths} reqs={dataReqs} month={filters.month} lote={filters.lote} req={filters.req} onChange={setFilters} />
            <AnsDashboard filters={filters} />
          </>
        ) : view === 'econ' ? (
          <Economic />
        ) : view === 'chat' ? (
          <Chat />
        ) : view === 'servicios-prestados' ? (
          <ServiciosPrestados />
        ) : view === 'servicios-pendientes' ? (
          <ServiciosPendientes />
        ) : view === 'carga-trabajo' ? (
          <CargaTrabajo />
        ) : null}
      </div>
    </div>
  )
}
