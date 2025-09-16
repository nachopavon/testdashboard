
    import React, { useState, useEffect } from 'react'
    import Sidebar from './components/Sidebar'
    import HeaderFilters from './components/HeaderFilters'
    import sampleData, { months as dataMonths, reqs as dataReqs } from './data/sampleData'
    import Economic from './components/Economic'
    import AnsDashboard from './components/Ans/AnsDashboard'
    import Chat from './components/Chat'
    import ServiciosPrestados from './components/ServiciosPrestados'
    import ServiciosPendientes from './components/ServiciosPendientes'
    import CargaTrabajo from './components/CargaTrabajo'
    import Gcb03 from './components/Gcb03'
    import Gpr04 from './components/Gpr04'
    import Gco05 from './components/Gco05'
    import Capacidad from './components/Capacidad'
    import Demanda from './components/Demanda'
    import econData from './data/economicData'
    import styles from './App.module.css'

    export default function App(){
      const [filters, setFilters] = useState({ month: dataMonths[0], lote: 'Lote 2', req: dataReqs[0] })
  const [view, setView] = useState<'ans'|'econ'|'chat'|'demanda'|'servicios-prestados'|'servicios-pendientes'|'carga-trabajo'|'gcb-03'|'gpr-04'|'gco-05'|'capacidad'>(() => {
        try {
          const v = localStorage.getItem('td_view');
          const validViews: readonly string[] = ['ans','econ','chat','demanda','servicios-prestados','servicios-pendientes','carga-trabajo','gcb-03','gpr-04','gco-05'];
          return validViews.includes(v || '') ? v as 'ans'|'econ'|'chat'|'servicios-prestados'|'servicios-pendientes'|'carga-trabajo'|'gcb-03'|'gpr-04'|'gco-05' : 'econ';
        } catch {
          return 'econ';
        }
      })

      useEffect(()=>{ try{ localStorage.setItem('td_view', view) }catch{ /* ignore */ } }, [view])

      // Dev-only global instrumentation: watch for mutations to <html> and <body>, and wrap setProperty/appendChild
      useEffect(()=>{
        if(typeof window === 'undefined') return
        try{
          // only run instrumentation on local/dev hosts to reduce noise
          const hn = typeof location !== 'undefined' ? (location.hostname || '') : ''
          if(hn && !(hn === 'localhost' || hn === '127.0.0.1' || hn.endsWith('.local'))) return
        }catch(e){ /* ignore */ }

        // wrap setProperty to catch global CSS variable changes
        const proto = (CSSStyleDeclaration as any).prototype as any
        const origSet = proto && proto.setProperty
        if(origSet && !(window as any).__td_global_setProperty_orig){
          (window as any).__td_global_setProperty_orig = origSet
          proto.setProperty = function(name: string, value: string, priority?: string){
            try{
              if(typeof name === 'string' && (name.indexOf('--nav') !== -1 || name.indexOf('background') !== -1 || name.indexOf('--target-height')!==-1)){
                const stack = (new Error()).stack || ''
                // eslint-disable-next-line no-console
                console.warn('[td-global] setProperty', { name, value, stack: stack.split('\n').slice(2,8).join('\n') })
              }
            }catch(e){}
            return origSet.apply(this, arguments as any)
          }
        }

        // observe attribute changes on <html> and <body>
        const roots: (Element | null)[] = [document.documentElement, document.body]
        const observers: MutationObserver[] = []
        try{
          for(const r of roots){
            if(!r) continue
            const mo = new MutationObserver((recs)=>{
              for(const rec of recs){
                try{
                  if(rec.type === 'attributes'){
                    const name = rec.attributeName
                    const val = name ? (r.getAttribute(name) || '') : ''
                    const stack = (new Error()).stack || ''
                    // eslint-disable-next-line no-console
                    console.warn('[td-global] attr-change', { node: r.nodeName, attribute: name, value: val, stack: stack.split('\n').slice(2,8).join('\n') })
                  } else if(rec.type === 'childList'){
                    // log added/removed nodes count
                    const stack = (new Error()).stack || ''
                    // eslint-disable-next-line no-console
                    console.warn('[td-global] childList change', { node: r.nodeName, added: rec.addedNodes.length, removed: rec.removedNodes.length, stack: stack.split('\n').slice(2,8).join('\n') })
                  }
                }catch(e){/* ignore */}
              }
            })
            mo.observe(r, { attributes: true, childList: true, subtree: false, attributeOldValue: true })
            observers.push(mo)
          }
        }catch(e){/* ignore */}

        // wrap appendChild to detect nodes appended to body
        const origAppend = Node.prototype.appendChild
        if(!(window as any).__td_orig_appendChild){
          (window as any).__td_orig_appendChild = origAppend
          Node.prototype.appendChild = function<T extends Node>(this: Node, newChild: T): T{
            try{
              if(this === document.body || this === document.documentElement){
                const stack = (new Error()).stack || ''
                // eslint-disable-next-line no-console
                console.warn('[td-global] appendChild to', this.nodeName, { node: newChild && (newChild as any).nodeName, stack: stack.split('\n').slice(2,8).join('\n') })
              }
            }catch(e){}
            return (window as any).__td_orig_appendChild.apply(this, arguments as any)
          }
        }

        return ()=>{
          try{
            if((window as any).__td_global_setProperty_orig){
              const proto2 = (CSSStyleDeclaration as any).prototype as any
              proto2.setProperty = (window as any).__td_global_setProperty_orig
              delete (window as any).__td_global_setProperty_orig
            }
          }catch(e){}
          try{ observers.forEach(o=>o.disconnect()) }catch(e){}
          try{ if((window as any).__td_orig_appendChild){ Node.prototype.appendChild = (window as any).__td_orig_appendChild; delete (window as any).__td_orig_appendChild } }catch(e){}
        }
      }, [])

  const metrics = sampleData.data[filters.month][filters.req]


      // counts for sidebar badges
      const econCount = (econData.years?.length || 0) * 12
      const ansCount = metrics.length
      const serviciosCount = 24 // placeholder
      const pendientesCount = 6 // placeholder
      const cargaCount = 6 // placeholder
  const gcbCount = 3 // placeholder
  const gprCount = 5 // placeholder
  const gcoCount = 2 // placeholder
  const capacidadCount = 1 // placeholder
  const chatCount = 0

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
            gcbCount={gcbCount}
            gprCount={gprCount}
            gcoCount={gcoCount}
            capacidadCount={capacidadCount}
            chatCount={chatCount}
          />
          <div className={styles.main}>
            {view === 'ans' ? (
              <>
                <HeaderFilters months={dataMonths} reqs={dataReqs} month={filters.month} lote={filters.lote} req={filters.req} onChange={setFilters} />
                <AnsDashboard filters={filters} />
              </>
            ) : view === 'econ' ? (
              <Economic />
            ) : view === 'demanda' ? (
              <Demanda />
            ) : view === 'chat' ? (
              <Chat />
            ) : view === 'servicios-prestados' ? (
              <ServiciosPrestados />
            ) : view === 'servicios-pendientes' ? (
              <ServiciosPendientes />
            ) : view === 'carga-trabajo' ? (
              <CargaTrabajo />
            ) : view === 'gcb-03' ? (
              <Gcb03 />
            ) : view === 'gpr-04' ? (
              <Gpr04 />
            ) : view === 'gco-05' ? (
              <Gco05 />
            ) : view === 'capacidad' ? (
              <Capacidad />
            ) : null}
          </div>
        </div>
      )}
