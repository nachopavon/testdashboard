import React, { useState, useRef, useEffect } from 'react'
import styles from './Chat.module.css'
import econData from '../data/economicData'
import ansData from '../data/ansData'

type Hist = { from: 'user'|'bot', text: string }

function findYearInText(text:string){
  const m = text.match(/20\d{2}/)
  if(m) return Number(m[0])
  return null
}

  function answerFromData(q:string){
  const s = q.toLowerCase()
  // economic queries
  if(s.includes('factur') || s.includes('estim') || s.includes('coste')){
    const y = findYearInText(s) || (econData.years[0])
    const yStr = String(y)
    const entry = (econData as any).data[yStr]
    if(entry){
      const totalFact = entry.facturacion || 0
      const totalEst = entry.estimacion || 0
      // month peak
      const months = entry.monthlyFacturacion || []
      let peakIdx = 0
      for(let i=0;i<months.length;i++) if((months[i]||0) > (months[peakIdx]||0)) peakIdx = i
      const monthLabel = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][peakIdx]
      return `Año ${y}: facturación ≈ ${Math.round(totalFact).toLocaleString('es-ES')}€; estimación ≈ ${Math.round(totalEst).toLocaleString('es-ES')}€. Mes pico aproximado: ${monthLabel}.`
    }
    return 'No tengo datos de facturación para ese año.'
  }

  // ANS queries
  if(s.includes('niv') || s.includes('dis') || s.includes('ons') || s.includes('seg') || s.includes('cmu') || s.includes('ans')){
    // if asks about a category, compute average compliance for latest month
    const targetCat = s.includes('niv') ? 'niv' : s.includes('dis') ? 'dis' : s.includes('ons') ? 'ons' : s.includes('seg') ? 'seg' : s.includes('cmu') ? 'cmu' : null
    const months = ansData.months
    const latest = months[months.length-1]
    if(targetCat){
      const list = (ansData as any)[targetCat] as any[]
      const vals = list.map(it => {
        const v = (it.monthly || {})[latest] || 0
        const t = it.target || 0
        return t>0 ? (v / t) : 1
      })
      const avg = Math.round((vals.reduce((s,n)=>s+n,0)/vals.length)*1000)/10
      return `Categoria ${targetCat.toUpperCase()} (mes ${latest}): cumplimiento medio ≈ ${avg}% respecto al objetivo.`
    }
    // general ANS summary: average across all indicators
    const cats = ['niv','dis','ons','seg','cmu']
    const allVals:number[] = []
    cats.forEach(c=>{
      const list = (ansData as any)[c] as any[]
      list.forEach(it=>{ const v=(it.monthly||{})[latest]||0; const t=it.target||0; if(t>0) allVals.push(v/t) })
    })
    if(allVals.length===0) return 'No hay datos ANS disponibles.'
    const avg = Math.round((allVals.reduce((s,n)=>s+n,0)/allVals.length)*1000)/10
    return `Resumen ANS (mes ${latest}): cumplimiento medio ≈ ${avg}% respecto al objetivo.`
  }

  // requisites / REQ info
  if(s.includes('req') || s.includes('requisit')){
    // sum requisites across years
    const years = (econData as any).years || []
    let total = 0
    years.forEach((y:number)=>{
      const d = (econData as any).data[String(y)]
      if(d && Array.isArray(d.requisites)) total += d.requisites.length
    })
    return `Hay aproximadamente ${total} requisitos en los años generados (${years.join(', ')}).`
  }

  return ''
}

export default function Chat(){
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Hist[]>(()=>{
    try{ const raw = localStorage.getItem('td_chat_history'); return raw ? JSON.parse(raw) as Hist[] : [] }catch(e){ return [] }
  })
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    try{ localStorage.setItem('td_chat_history', JSON.stringify(history)) }catch(e){}
  },[history])

  function send(){
    if(!input.trim()) return
    const q = input.trim()
    setHistory(h => [{from:'user', text: q}, ...h])
    setInput('')
    setLoading(true)
    setTimeout(()=>{
      const dataAnswer = answerFromData(q)
      const a = dataAnswer || 'Lo siento, no encuentro datos precisos para esa consulta.'
      setHistory(h => [{from:'bot', text: a}, ...h])
      setLoading(false)
      if(panelRef.current) panelRef.current.scrollTop = 0
    }, 600)
  }

  function clearHistory(){ setHistory([]); try{ localStorage.removeItem('td_chat_history') }catch(e){} }

  function quickExample(example:string){
    const q = example
    // insert user message
    setHistory(h => [{from:'user', text: q}, ...h])
    // then insert bot reply after a short delay to simulate processing
    setTimeout(()=>{
      const a = answerFromData(q) || 'Lo siento, no tengo datos exactos para esa pregunta.'
      setHistory(h => [{from:'bot', text: a}, ...h])
      if(panelRef.current) panelRef.current.scrollTop = 0
    }, 600)
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.logo}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="2" y="2" width="20" height="20" rx="6" fill="var(--accent)"/><path d="M7 12h10M7 8h10M7 16h6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg></div>
        <h2 className={styles.title}>DataSage</h2>
        <div className={styles.headerActions}>
          <button className={styles.clearBtn} onClick={clearHistory} title="Borrar historial">Limpiar</button>
        </div>
      </div>

      <div className={styles.chatWrap}>
        <div className={styles.historyPanel} ref={panelRef} aria-live="polite">
          {history.length === 0 ? (
            <div className={styles.welcome}>
              <p className={styles.welcomeTitle}>Pregunta lo que quieras</p>
              <p className={styles.welcomeSub}>Prueba estos ejemplos:</p>
                  <div className={styles.examples}>
                    {[
                      '¿Cuál es la facturación de 2026?',
                      '¿Cuál fue el mes con mayor facturación en 2026?',
                      '¿Cómo están los indicadores NIV?',
                      'Top 3 indicadores NIV por cumplimiento',
                      '¿Cuántos requisitos hubo en 2027?',
                      '¿Cuál es el objetivo de ANS-01 o NIV-01?',
                      'Resumen de requisitos',
                      'Dame un resumen ANS general'
                    ].map((ex, idx) => (
                      <div key={idx} className={styles.exampleItem}>
                        <button onClick={()=>quickExample(ex)} className={styles.exampleBtn}>{ex}</button>
                      </div>
                    ))}
                  </div>
            </div>
          ) : (
            history.map((h, i) => (
              <div key={i} className={h.from === 'user' ? styles.msgRowUser : styles.msgRowBot}>
                <div className={h.from === 'user' ? styles.msgUser : styles.msgBot}>{h.text}</div>
              </div>
            ))
          )}
        </div>

        <div className={styles.composer} role="region" aria-label="Compositor de mensajes">
          <textarea className={styles.textarea} placeholder="Pregunta lo que quieras" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send() } }} />

          <div className={styles.composerRow}>
            <div className={styles.leftActions}>
              <button className={styles.actionBtn} title="Adjuntar">📎 Adjuntar</button>
              <button className={styles.actionBtn} title="Buscar">🌐 Buscar</button>
            </div>
            <div className={styles.rightActions}>
              <button className={styles.voiceBtn} title="Voz">🔊 Voz</button>
              <button className={styles.sendBtn} onClick={send} disabled={loading} aria-busy={loading}>{loading? 'Pensando...':'Enviar'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
