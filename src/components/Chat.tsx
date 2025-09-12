import React, { useState, useRef, useEffect } from 'react'
import styles from './Chat.module.css'
import econData from '../data/economicData'
import ansData from '../data/ansData'
import { servicesEvolution, profiles } from '../data/serviciosPrestadosData'
import { pendingServicesByMonth, pendingStatsByMonth } from '../data/serviciosPendientesData'
import { workloadData, profileWorkload } from '../data/cargaTrabajoData'

type Hist = { from: 'user'|'bot', text: string }

function findYearInText(text:string){
  const m = text.match(/20\d{2}/)
  if(m) return Number(m[0])
  return null
}

// helper: normalize text (remove diacritics, punctuation, extra spaces)
function normalizeText(t:string){
  try{
    return t
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[¿?¡!.,:\/\\\-()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }catch(e){
    return t.toLowerCase().replace(/[¿?¡!.,:\/\\\-()]/g,' ').replace(/\s+/g,' ').trim()
  }
}

  function answerFromData(q:string){
  const s = q.toLowerCase()
  const exactKey = s.trim()
  

  // Exact mappings for the card texts (lowercased)
  const exactMap: Record<string, ()=>string> = {
    '¿cuántos servicios hay este mes?': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      return `En ${latestMonth.month}: ${latestMonth.servicesCount} servicios.`
    },
    '¿cuántas horas totales?': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      return `En ${latestMonth.month}: ${latestMonth.totalHours} horas totales de servicios prestados.`
    },
    'perfil gp - servicios': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      const d = (latestMonth.byProfile as any).GP
      return `Perfil GP en ${latestMonth.month}: ${d.services} servicios, ${d.hours} horas.`
    },
    'perfil an - servicios': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      const d = (latestMonth.byProfile as any).AN
      return `Perfil AN en ${latestMonth.month}: ${d.services} servicios, ${d.hours} horas.`
    },
    'perfil as - servicios': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      const d = (latestMonth.byProfile as any).AS
      return `Perfil AS en ${latestMonth.month}: ${d.services} servicios, ${d.hours} horas.`
    },
    'perfil ars - servicios': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      const d = (latestMonth.byProfile as any).ARS
      return `Perfil ARS en ${latestMonth.month}: ${d.services} servicios, ${d.hours} horas.`
    },
    'perfil de - servicios': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      const d = (latestMonth.byProfile as any).DE
      return `Perfil DE en ${latestMonth.month}: ${d.services} servicios, ${d.hours} horas.`
    },
    'perfil cd - servicios': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      const d = (latestMonth.byProfile as any).CD
      return `Perfil CD en ${latestMonth.month}: ${d.services} servicios, ${d.hours} horas.`
    },
    'perfil gp - horas': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      const d = (latestMonth.byProfile as any).GP
      return `Perfil GP en ${latestMonth.month}: ${d.hours} horas.`
    },
    'perfil de - horas': () => {
      const latestMonth = servicesEvolution[servicesEvolution.length - 1]
      const d = (latestMonth.byProfile as any).DE
      return `Perfil DE en ${latestMonth.month}: ${d.hours} horas.`
    },

    // Pendientes
    '¿cuántos pendientes hay?': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { total: 0 }
      return `En ${latest}: ${stats.total} servicios pendientes.`
    },
    'por estado': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { byStatus: {} }
      const statusSummary = Object.entries((stats as any).byStatus).map(([k,v])=>`${k}: ${v}`).join(', ')
      return `Estado de servicios pendientes en ${latest}: ${statusSummary}.`
    },
    'perfil gp - pendientes': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { byProfile: {} }
      return `Perfil GP en ${latest}: ${((stats as any).byProfile.GP || 0)} servicios pendientes.`
    },
    'perfil an - pendientes': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { byProfile: {} }
      return `Perfil AN en ${latest}: ${((stats as any).byProfile.AN || 0)} servicios pendientes.`
    },
    'perfil as - pendientes': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { byProfile: {} }
      return `Perfil AS en ${latest}: ${((stats as any).byProfile.AS || 0)} servicios pendientes.`
    },
    'perfil de - pendientes': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { byProfile: {} }
      return `Perfil DE en ${latest}: ${((stats as any).byProfile.DE || 0)} servicios pendientes.`
    },
    'horas estimadas totales': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { totalEstimatedHours: 0 }
      return `Horas estimadas totales en ${latest}: ${stats.totalEstimatedHours} horas.`
    },
    'en progreso': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { byStatus: {} }
      return `En progreso en ${latest}: ${((stats as any).byStatus['En Progreso'] || 0)} servicios.`
    },
    'bloqueados': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { byStatus: {} }
      return `Bloqueados en ${latest}: ${((stats as any).byStatus['Bloqueado'] || 0)} servicios.`
    },
    'en revisión': () => {
      const latest = Object.keys(pendingServicesByMonth).pop() || ''
      const stats = pendingStatsByMonth[latest] || { byStatus: {} }
      return `En revisión en ${latest}: ${((stats as any).byStatus['Revisión'] || 0)} servicios.`
    },

    // Carga de trabajo
    '¿cuál es la carga total?': () => {
      const latestData = workloadData[workloadData.length - 1]
      return `Carga total en ${latestData.month}: ${latestData.totalHours} horas (suma estimada).`
    },
    'utilización promedio': () => {
      const latestData = workloadData[workloadData.length - 1]
      const avg = Math.round(Object.values(latestData.utilization).reduce((s,n)=>s+n,0) / Object.values(latestData.utilization).length)
      return `Utilización promedio en ${latestData.month}: ${avg}%.`
    },
    'perfil gp - utilización': () => {
      const p = profileWorkload.find(p=>p.profile==='GP')
      const d = p ? p.data[p.data.length-1] : null
      return d ? `GP en ${d.month}: ${d.utilization}% de utilización, ${d.hours} horas.` : 'No hay datos GP.'
    },
    'perfil an - utilización': () => {
      const p = profileWorkload.find(p=>p.profile==='AN')
      const d = p ? p.data[p.data.length-1] : null
      return d ? `AN en ${d.month}: ${d.utilization}% de utilización, ${d.hours} horas.` : 'No hay datos AN.'
    },
    'perfil as - utilización': () => {
      const p = profileWorkload.find(p=>p.profile==='AS')
      const d = p ? p.data[p.data.length-1] : null
      return d ? `AS en ${d.month}: ${d.utilization}% de utilización, ${d.hours} horas.` : 'No hay datos AS.'
    },
    'perfil ars - utilización': () => {
      const p = profileWorkload.find(p=>p.profile==='ARS')
      const d = p ? p.data[p.data.length-1] : null
      return d ? `ARS en ${d.month}: ${d.utilization}% de utilización, ${d.hours} horas.` : 'No hay datos ARS.'
    },
    'perfil de - utilización': () => {
      const p = profileWorkload.find(p=>p.profile==='DE')
      const d = p ? p.data[p.data.length-1] : null
      return d ? `DE en ${d.month}: ${d.utilization}% de utilización, ${d.hours} horas.` : 'No hay datos DE.'
    },
    'perfil cd - utilización': () => {
      const p = profileWorkload.find(p=>p.profile==='CD')
      const d = p ? p.data[p.data.length-1] : null
      return d ? `CD en ${d.month}: ${d.utilization}% de utilización, ${d.hours} horas.` : 'No hay datos CD.'
    },
    'horas perfil de': () => {
      const p = profileWorkload.find(p=>p.profile==='DE')
      const d = p ? p.data[p.data.length-1] : null
      return d ? `DE en ${d.month}: ${d.hours} horas.` : 'No hay datos DE.'
    },
    'horas perfil gp': () => {
      const p = profileWorkload.find(p=>p.profile==='GP')
      const d = p ? p.data[p.data.length-1] : null
      return d ? `GP en ${d.month}: ${d.hours} horas.` : 'No hay datos GP.'
    },

    // Facturación & ANS
    'facturación 2026': () => {
      const y = 2026
      const entry = (econData as any).data[String(y)]
      if(!entry) return `No hay datos de facturación para ${y}.`
      return `Aproximadamente ${Math.round(entry.facturacion).toLocaleString('es-ES')}€ de facturación en ${y}.`
    },
    'facturación 2027': () => {
      const y = 2027
      const entry = (econData as any).data[String(y)]
      if(!entry) return `No hay datos de facturación para ${y}.`
      return `Aproximadamente ${Math.round(entry.facturacion).toLocaleString('es-ES')}€ de facturación en ${y}.`
    },
    'indicadores niv': () => {
      return `Indicadores NIV: ${((ansData as any).niv || []).length} indicadores disponibles.`
    },
    'indicadores dis': () => {
      return `Indicadores DIS: ${((ansData as any).dis || []).length} indicadores disponibles.`
    },
    'indicadores ons': () => {
      return `Indicadores ONS: ${((ansData as any).ons || []).length} indicadores disponibles.`
    },
    'indicadores seg': () => {
      return `Indicadores SEG: ${((ansData as any).seg || []).length} indicadores disponibles.`
    },
    'indicadores cmu': () => {
      return `Indicadores CMU: ${((ansData as any).cmu || []).length} indicadores disponibles.`
    },
    'resumen ans': () => {
      const months = ansData.months
      const latest = months[months.length-1]
      return `Resumen ANS (mes ${latest}): consulta rápida generada.`
    },
    'requisitos 2026': () => {
      const y = 2026; const entry = (econData as any).data[String(y)]
      const count = entry && Array.isArray(entry.requisites) ? entry.requisites.length : 0
      return `Aproximadamente ${count} requisitos en ${y}.`
    },
    'requisitos 2027': () => {
      const y = 2027; const entry = (econData as any).data[String(y)]
      const count = entry && Array.isArray(entry.requisites) ? entry.requisites.length : 0
      return `Aproximadamente ${count} requisitos en ${y}.`
    },
    'mes pico facturación': () => {
      const years = (econData as any).years || []
      const y = years[0] || 2026
      const entry = (econData as any).data[String(y)]
      if(!entry) return 'No hay datos de facturación.'
      const months = entry.monthlyFacturacion || []
      let peakIdx = 0; for(let i=0;i<months.length;i++) if((months[i]||0) > (months[peakIdx]||0)) peakIdx = i
      const monthLabel = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][peakIdx]
      return `Mes pico de facturación en ${y}: ${monthLabel}.`
    },
    'top indicadores niv': () => {
      // reuse ANS top logic
      const list = (ansData as any).niv || []
      if(list.length===0) return 'No hay indicadores NIV.'
      const latest = ansData.months[ansData.months.length-1]
      const vals = list.map((it:any)=>{ const v=(it.monthly||{})[latest]||0; const t=it.target||0; return t>0? v/t:1 })
      const indicators = list.map((it:any, idx:number)=>({ name: it.name || `Indicador ${idx+1}`, compliance: vals[idx]*100 })).sort((a:any,b:any)=>b.compliance-a.compliance).slice(0,3)
      return `Top NIV: ${indicators.map((i:any)=>`${i.name}: ${i.compliance.toFixed(1)}%`).join(', ')}.`
    }
  }

  // try exact match first
  if(exactMap[exactKey]){
    try{ return exactMap[exactKey]() }catch(e){ /* fallthrough to fuzzy matching */ }
  }

  // try normalized exact match (robust against punctuation/accents)
  const normalizedExactMap: Record<string, ()=>string> = {}
  Object.keys(exactMap).forEach(k=>{ normalizedExactMap[normalizeText(k)] = exactMap[k] })
  const nk = normalizeText(q)
  if(normalizedExactMap[nk]){
    try{ return normalizedExactMap[nk]() }catch(e){}
  }
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
      
      if(s.includes('mes pico') || s.includes('mayor facturación') || s.includes('pico facturación')){
        return `Mes con mayor facturación en ${y}: ${monthLabel} con ${Math.round(months[peakIdx] || 0).toLocaleString('es-ES')}€.`
      }
      
      return `Año ${y}: facturación ≈ ${Math.round(totalFact).toLocaleString('es-ES')}€; estimación ≈ ${Math.round(totalEst).toLocaleString('es-ES')}€.`
    }
    return 'No tengo datos de facturación para ese año.'
  }

  // ANS queries
  if(s.includes('niv') || s.includes('dis') || s.includes('ons') || s.includes('seg') || s.includes('cmu') || s.includes('ans') || s.includes('indicador')){
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
      
      if(s.includes('top') || s.includes('mejor') || s.includes('mejores')){
        // Find top performing indicators
        const indicators = list.map((it, idx) => ({
          name: it.name || `Indicador ${idx + 1}`,
          compliance: vals[idx] * 100
        })).sort((a, b) => b.compliance - a.compliance).slice(0, 3)
        
        const topList = indicators.map(ind => `${ind.name}: ${ind.compliance.toFixed(1)}%`).join(', ')
        return `Top 3 indicadores ${targetCat.toUpperCase()}: ${topList}.`
      }
      
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

  // Servicios Prestados queries
  if(s.includes('servicio') && (s.includes('prestado') || s.includes('realizado') || s.includes('completado'))){
    const latestMonth = servicesEvolution[servicesEvolution.length - 1]
    const totalServices = latestMonth.servicesCount
    const totalHours = latestMonth.totalHours
    
    if(s.includes('horas') || s.includes('tiempo')){
      return `En ${latestMonth.month}: ${totalHours} horas totales de servicios prestados. Perfil con más horas: DE (${latestMonth.byProfile.DE.hours}h).`
    }
    
    if(s.includes('perfil') || s.includes('gp') || s.includes('an') || s.includes('as') || s.includes('ars') || s.includes('de') || s.includes('cd')){
      const profileQueries = ['gp', 'an', 'as', 'ars', 'de', 'cd']
      const mentionedProfile = profileQueries.find(p => s.includes(p))
      if(mentionedProfile){
        const profile = mentionedProfile.toUpperCase()
        const profileData = latestMonth.byProfile[profile as keyof typeof latestMonth.byProfile]
        return `Perfil ${profile} en ${latestMonth.month}: ${profileData.services} servicios, ${profileData.hours} horas.`
      }
    }
    
    return `En ${latestMonth.month}: ${totalServices} servicios prestados totales, ${totalHours} horas trabajadas.`
  }

  // Servicios Pendientes queries
  if(s.includes('servicio') && (s.includes('pendiente') || s.includes('espera') || s.includes('cola'))){
    const latestMonth = Object.keys(pendingServicesByMonth)[Object.keys(pendingServicesByMonth).length - 1]
    const pendingServices = pendingServicesByMonth[latestMonth] || []
    const stats = pendingStatsByMonth[latestMonth] || { total: 0, byStatus: {}, byProfile: {}, totalEstimatedHours: 0 }
    
    // Specific status queries
    if(s.includes('progreso') || s.includes('en progreso') || s.includes('progreso') || s.includes('🔄') || s.includes('en progreso')){
      const inProgressCount = (stats.byStatus as any)['En Progreso'] || 0
      return `Servicios en progreso en ${latestMonth}: ${inProgressCount} servicios.`
    }
    
    if(s.includes('bloqueado') || s.includes('bloqueados') || s.includes('🚫') || s.includes('bloqueado')){
      const blockedCount = (stats.byStatus as any)['Bloqueado'] || 0
      return `Servicios bloqueados en ${latestMonth}: ${blockedCount} servicios.`
    }
    
    if(s.includes('revisión') || s.includes('en revisión') || s.includes('✅') || s.includes('revisión')){
      const reviewCount = (stats.byStatus as any)['Revisión'] || 0
      return `Servicios en revisión en ${latestMonth}: ${reviewCount} servicios.`
    }
    
    if(s.includes('estado') || s.includes('status') || s.includes('📊') || s.includes('por estado')){
      const statusSummary = Object.entries(stats.byStatus).map(([status, count]) => `${status}: ${count}`).join(', ')
      return `Servicios pendientes en ${latestMonth}: ${statusSummary}.`
    }
    
    if(s.includes('horas') || s.includes('estimad') || s.includes('tiempo') || s.includes('⏱️') || s.includes('horas estimadas totales')){
      return `Servicios pendientes en ${latestMonth}: ${stats.totalEstimatedHours} horas estimadas totales.`
    }
    
    if(s.includes('perfil') || s.includes('gp') || s.includes('an') || s.includes('as') || s.includes('ars') || s.includes('de') || s.includes('cd')){
      const profileQueries = ['gp', 'an', 'as', 'ars', 'de', 'cd']
      const mentionedProfile = profileQueries.find(p => s.includes(p))
      if(mentionedProfile){
        const profile = mentionedProfile.toUpperCase()
        const profileCount = (stats.byProfile as any)[profile] || 0
        return `Perfil ${profile} en ${latestMonth}: ${profileCount} servicios pendientes.`
      }
    }
    
    return `En ${latestMonth}: ${stats.total} servicios pendientes, ${stats.totalEstimatedHours} horas estimadas.`
  }

  // Carga de Trabajo queries
  if((s.includes('carga') && s.includes('trabajo')) || s.includes('utilización') || s.includes('ocupación') || s.includes('capacidad') || s.includes('💼') || s.includes('carga de trabajo') || s.includes('📈') || s.includes('⏱️') || s.includes('👔') || s.includes('📊') || s.includes('💻') || s.includes('🏗️') || s.includes('👨‍💻') || s.includes('🎯') || s.includes('utilización promedio') || s.includes('utilización media') || s.includes('utilización general') || s.includes('horas trabajadas totales') || s.includes('horas totales trabajadas') || s.includes('gp (gestor de proyecto)') || s.includes('an (analista de negocio)') || s.includes('as (analista de sistemas)') || s.includes('ars (arquitecto de sistemas)') || s.includes('de (desarrollador)') || s.includes('cd (consultor digital)')){
    const latestData = workloadData[workloadData.length - 1]
    const totalHours = latestData.totalHours
    const avgUtilization = Math.round(
      Object.values(latestData.utilization).reduce((sum, u) => sum + u, 0) / Object.values(latestData.utilization).length
    )
    
    // Specific profile queries
    if(s.includes('gp') || s.includes('gestor') || s.includes('proyecto') || s.includes('👔') || s.includes('gp (gestor de proyecto)')){
      const profileData = profileWorkload.find(p => p.profile === 'GP')
      if(profileData){
        const latestProfileData = profileData.data[profileData.data.length - 1]
        return `GP en ${latestData.month}: ${latestProfileData.utilization}% de utilización, ${latestProfileData.hours} horas trabajadas de 160 disponibles.`
      }
    }
    
    if(s.includes('an') || s.includes('analista') || s.includes('negocio') || s.includes('📊') || s.includes('an (analista de negocio)')){
      const profileData = profileWorkload.find(p => p.profile === 'AN')
      if(profileData){
        const latestProfileData = profileData.data[profileData.data.length - 1]
        return `AN en ${latestData.month}: ${latestProfileData.utilization}% de utilización, ${latestProfileData.hours} horas trabajadas de 160 disponibles.`
      }
    }
    
    if(s.includes('as') || s.includes('sistemas') || s.includes('analista sistemas') || s.includes('💻') || s.includes('as (analista de sistemas)')){
      const profileData = profileWorkload.find(p => p.profile === 'AS')
      if(profileData){
        const latestProfileData = profileData.data[profileData.data.length - 1]
        return `AS en ${latestData.month}: ${latestProfileData.utilization}% de utilización, ${latestProfileData.hours} horas trabajadas de 160 disponibles.`
      }
    }
    
    if(s.includes('ars') || s.includes('arquitecto') || s.includes('arquitecto sistemas') || s.includes('🏗️') || s.includes('ars (arquitecto de sistemas)')){
      const profileData = profileWorkload.find(p => p.profile === 'ARS')
      if(profileData){
        const latestProfileData = profileData.data[profileData.data.length - 1]
        return `ARS en ${latestData.month}: ${latestProfileData.utilization}% de utilización, ${latestProfileData.hours} horas trabajadas de 160 disponibles.`
      }
    }
    
    if(s.includes('de') || s.includes('desarrollador') || s.includes('developer') || s.includes('👨‍💻') || s.includes('de (desarrollador)')){
      const profileData = profileWorkload.find(p => p.profile === 'DE')
      if(profileData){
        const latestProfileData = profileData.data[profileData.data.length - 1]
        return `DE en ${latestData.month}: ${latestProfileData.utilization}% de utilización, ${latestProfileData.hours} horas trabajadas de 160 disponibles.`
      }
    }
    
    if(s.includes('cd') || s.includes('consultor') || s.includes('digital') || s.includes('🎯') || s.includes('cd (consultor digital)')){
      const profileData = profileWorkload.find(p => p.profile === 'CD')
      if(profileData){
        const latestProfileData = profileData.data[profileData.data.length - 1]
        return `CD en ${latestData.month}: ${latestProfileData.utilization}% de utilización, ${latestProfileData.hours} horas trabajadas de 160 disponibles.`
      }
    }
    
    if(s.includes('promedio') || s.includes('media') || s.includes('general') || s.includes('📈') || s.includes('utilización promedio') || s.includes('utilización media') || s.includes('utilización general')){
      return `Utilización promedio en ${latestData.month}: ${avgUtilization}%.`
    }
    
    if(s.includes('horas') || s.includes('trabajadas') || s.includes('⏱️') || s.includes('horas trabajadas totales') || s.includes('horas totales trabajadas') || s.includes('tiempo') || s.includes('capacidad') || s.includes('💼') || s.includes('carga de trabajo') || s.includes('ocupación') || s.includes('carga') && s.includes('trabajo')){
      const totalHoursWorked = Object.values(latestData.utilization).reduce((sum, u) => sum + u, 0) * 160 / 100 // Assuming 160 hours per month per profile
      return `Horas trabajadas totales en ${latestData.month}: ${Math.round(totalHoursWorked)} horas.`
    }
    
    // General overview
    const profileSummary = Object.entries(latestData.utilization).map(([profile, util]) => `${profile}: ${util}%`).join(', ')
    return `Carga de trabajo en ${latestData.month}: ${profileSummary}.`
  }

  return ''
}

// Produce a slightly more elaborate IA-like response combining the brief data answer
function enhanceResponse(question:string, shortAnswer:string){
  const q = question.trim()
  if(!shortAnswer || shortAnswer.trim() === '') return 'Lo siento, no tengo información precisa para responder eso en este momento.'

  // Simple heuristics to expand responses
  const lower = shortAnswer.toLowerCase()
  let core = shortAnswer
  let visual = ''

  // Servicios prestados: añadir contexto y sugerencias
  if(lower.includes('servicios')){
    const latest = servicesEvolution[servicesEvolution.length - 1]
    const evoVals = servicesEvolution.map(m=>m.servicesCount)
    visual = sparkline(evoVals)
    core = `${shortAnswer} En detalle, en ${latest.month} hubo ${latest.servicesCount} servicios con ${latest.totalHours}h totales. Los perfiles con más actividad fueron: ${Object.entries(latest.byProfile).sort((a:any,b:any)=> (b[1].services||0)-(a[1].services||0)).slice(0,3).map(([k,v])=>`${k} (${v.services} servicios)`).join(', ')}. Puedo mostrar la evolución por mes o filtrar por perfil si quieres.`
  }

  // Horas totales o métricas de tiempo
  if(lower.includes('horas')){
    const latest = servicesEvolution[servicesEvolution.length - 1]
    core = `${shortAnswer} Esa cifra corresponde al mes de ${latest.month}. Si necesitas, puedo desglosar las horas por perfil o comparar con meses anteriores para ver tendencias.`
  }

  // Servicios pendientes: dar resumen y top estados
  if(lower.includes('pendientes') || lower.includes('bloquead') || lower.includes('en revisión')){
    const lm = Object.keys(pendingStatsByMonth).pop() || ''
    const stats = pendingStatsByMonth[lm] || { total:0, byStatus:{}, totalEstimatedHours:0 }
    const topStates = Object.entries((stats as any).byStatus).sort((a:any,b:any)=>b[1]-a[1]).slice(0,3).map(([s,c])=>`${s} (${c})`).join(', ')
    const statusLines = Object.entries((stats as any).byStatus).map(([s,c])=>`${s.padEnd(12)} | ${String(c).padStart(3)}`).join('\n')
    core = `${shortAnswer} Al cierre de ${lm}: ${stats.total} pendientes, ${stats.totalEstimatedHours}h estimadas. Estados principales: ${topStates}. Puedo listar los pendientes filtrando por estado o perfil.`
    visual = statusLines
  }

  // Carga de trabajo / utilización
  if(lower.includes('utilización') || lower.includes('carga') || lower.includes('ocupación')){
    const latest = workloadData[workloadData.length-1]
    const avg = Math.round(Object.values(latest.utilization).reduce((s,n)=>s+n,0)/Object.values(latest.utilization).length)
    const over = Object.entries(latest.utilization).filter(([,v])=>v > avg+10).map(([p])=>p)
    const bars = Object.entries(latest.utilization).map(([p,v])=>`${p.padEnd(3)} ${bar(v,100)} ${v}%`).join('\n')
    core = `${shortAnswer} En ${latest.month} la utilización media fue ${avg}%. Perfiles con sobreutilización: ${over.length? over.join(', '): 'ninguno claramente destacado'}. Puedo ofrecer proyecciones o un desglose por perfil.`
    visual = bars
  }

  // Facturación y ANS: añadir contexto y next steps
  if(lower.includes('facturación') || lower.includes('estimación')){
    const years = (econData as any).years || []
    const y = years[0] || Object.keys((econData as any).data)[0]
    const entry = (econData as any).data[String(y)] || {}
    const mf = entry.monthlyFacturacion || []
    const spark = mf.length? sparkline(mf) : ''
    core = `${shortAnswer} Si quieres puedo mostrar la serie mensual completa, comparar con la estimación anual o detectar meses atípicos.`
    visual = spark
  }

  if(lower.includes('ans') || lower.includes('indicador') || lower.includes('niv') || lower.includes('dis')){
    core = `${shortAnswer} Puedo desglosar por indicador, mostrar el top de cumplimiento o generar un ranking por cumplimiento respecto al objetivo.`
  }

  // Fallback: añadir una pregunta de seguimiento
  if(!core || core.trim()==='') core = `${shortAnswer} ¿Te interesa un desglose por perfil, por mes o por estado? Puedo prepararlo.`

  return `${core}${visual ? '\n\n' + visual : ''}`
}

// Small ASCII/symbol helpers
function sparkline(values:number[]){
  if(!values || values.length===0) return ''
  const blocks = ['▁','▂','▃','▄','▅','▆','▇','█']
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values.map(v => blocks[Math.floor((v - min) / range * (blocks.length - 1))]).join('')
}

function bar(value:number, max:number){
  const total = 8
  const filled = Math.round((value / (max || value || 1)) * total)
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, total - filled))
}


export default function Chat(){
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Hist[]>(()=>{
    try{ 
      const raw = localStorage.getItem('td_chat_history'); 
      const saved = raw ? JSON.parse(raw) as Hist[] : []
      // Si no hay historial guardado, mostrar ejemplos
      if(saved.length === 0){
        return [
          {from: 'bot', text: '¡Hola! Puedo ayudarte con información sobre facturación, ANS, servicios prestados, servicios pendientes y carga de trabajo. Haz clic en cualquiera de estas preguntas de ejemplo:'},
          {from: 'bot', text: '• "¿Cuántos servicios prestados hay este mes?"'},
          {from: 'bot', text: '• "¿Cuál es la carga de trabajo del perfil DE?"'},
          {from: 'bot', text: '• "¿Cuántos servicios pendientes hay?"'},
          {from: 'bot', text: '• "¿Cuál es la facturación de 2026?"'}
        ]
      }
      return saved
    }catch(e){ 
      return [
        {from: 'bot', text: '¡Hola! Puedo ayudarte con información sobre facturación, ANS, servicios prestados, servicios pendientes y carga de trabajo. Haz clic en cualquiera de estas preguntas de ejemplo:'},
        {from: 'bot', text: '• "¿Cuántos servicios prestados hay este mes?"'},
        {from: 'bot', text: '• "¿Cuál es la carga de trabajo del perfil DE?"'},
        {from: 'bot', text: '• "¿Cuántos servicios pendientes hay?"'},
        {from: 'bot', text: '• "¿Cuál es la facturación de 2026?"'}
      ]
    }
  })
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    try{ localStorage.setItem('td_chat_history', JSON.stringify(history)) }catch(e){}
  },[history])

  // show welcome cards if sidebar requested it
  useEffect(()=>{
    try{
      const flag = sessionStorage.getItem('td_show_chat_welcome')
      if(flag === '1'){
        setHistory([])
        sessionStorage.removeItem('td_show_chat_welcome')
      }
    }catch(e){}
  }, [])

  // also listen to a window event dispatched by Sidebar when user clicks chat option
  useEffect(()=>{
    const handler = () => { try{ setHistory([]); sessionStorage.removeItem('td_show_chat_welcome') }catch(e){} }
    window.addEventListener('td_show_chat_welcome', handler)
    return ()=> window.removeEventListener('td_show_chat_welcome', handler)
  }, [])

  function send(){
    if(!input.trim()) return
    const q = input.trim()
    setHistory(h => [{from:'user', text: q}, ...h])
    setInput('')
    setLoading(true)
    setTimeout(()=>{
  const dataAnswer = answerFromData(q)
  let a = dataAnswer || 'Lo siento, no encuentro datos precisos para esa consulta.'
  try{ a = enhanceResponse(q, a) }catch(e){}
  setHistory(h => [{from:'bot', text: a}, ...h])
      setLoading(false)
      if(panelRef.current) panelRef.current.scrollTop = 0
    }, 600)
  }

  function clearHistory(){ setHistory([]); try{ localStorage.removeItem('td_chat_history') }catch(e){} }

  function quickExample(example:string){
    if(loading) return // prevent multiple clicks while processing
    
    const q = example
    setLoading(true)
    
    // insert user message
    setHistory(h => [{from:'user', text: q}, ...h])
    
    // then insert bot reply after a short delay to simulate processing
    setTimeout(()=>{
      // Try multiple variants to maximize chance of matching the map
      const variants: string[] = []
      variants.push(q)
      variants.push(q.toLowerCase())
      // strip punctuation
      variants.push(q.replace(/[¿?¡!.,:;\-()\/\\]/g,' '))
      // remove accents (simple replacements)
      const deAccent = (s:string)=>s.replace(/[áàäâ]/g,'a').replace(/[éèëê]/g,'e').replace(/[íìïî]/g,'i').replace(/[óòöô]/g,'o').replace(/[úùüû]/g,'u')
      variants.push(deAccent(q))
      variants.push(deAccent(q.toLowerCase()).replace(/\s+/g,' ').trim())

      let a: string | null = null
      for(const v of variants){
        const tryA = answerFromData(v)
        if(tryA && tryA.trim() !== ''){ a = tryA; break }
      }
  if(!a) a = 'Lo siento, no tengo datos exactos para esa pregunta.'
  try{ a = enhanceResponse(q, a) }catch(e){}
  setHistory(h => [{from:'bot', text: a}, ...h])
      setLoading(false)
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
              <p className={styles.welcomeTitle}>Pregunta lo que quieras sobre tus datos</p>
              <p className={styles.welcomeSub}>Haz clic en cualquiera de estas tarjetas para obtener respuestas instantáneas:</p>
              
              {/* Servicios Prestados */}
              <div className={styles.categorySection}>
                <h4 className={styles.categoryTitle}>📊 Servicios Prestados</h4>
                <div className={styles.cardsGrid}>
                  {[
                    { text: '¿Cuántos servicios hay este mes?', icon: '📈' },
                    { text: '¿Cuántas horas totales?', icon: '⏱️' },
                    { text: 'Perfil GP - servicios', icon: '👤' },
                    { text: 'Perfil AN - servicios', icon: '👥' },
                    { text: 'Perfil AS - servicios', icon: '🔧' },
                    { text: 'Perfil ARS - servicios', icon: '🏗️' },
                    { text: 'Perfil DE - servicios', icon: '💻' },
                    { text: 'Perfil CD - servicios', icon: '🎨' },
                    { text: 'Perfil GP - horas', icon: '📊' },
                    { text: 'Perfil DE - horas', icon: '�' }
                  ].map((card, idx) => (
                    <button 
                      key={`servicios-${idx}`} 
                      className={styles.questionCard}
                      onClick={() => quickExample(card.text)}
                      disabled={loading}
                    >
                      <span className={styles.cardIcon}>{card.icon}</span>
                      <span className={styles.cardText}>{card.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Servicios Pendientes */}
              <div className={styles.categorySection}>
                <h4 className={styles.categoryTitle}>⏳ Servicios Pendientes</h4>
                <div className={styles.cardsGrid}>
                  {[
                    { text: '¿Cuántos pendientes hay?', icon: '📋' },
                    { text: 'Por estado', icon: '📊' },
                    { text: 'Perfil GP - pendientes', icon: '👤' },
                    { text: 'Perfil AN - pendientes', icon: '👥' },
                    { text: 'Perfil AS - pendientes', icon: '🔧' },
                    { text: 'Perfil DE - pendientes', icon: '💻' },
                    { text: 'Horas estimadas totales', icon: '⏱️' },
                    { text: 'En progreso', icon: '🔄' },
                    { text: 'Bloqueados', icon: '🚫' },
                    { text: 'En revisión', icon: '✅' }
                  ].map((card, idx) => (
                    <button 
                      key={`pendientes-${idx}`} 
                      className={styles.questionCard}
                      onClick={() => quickExample(card.text)}
                      disabled={loading}
                    >
                      <span className={styles.cardIcon}>{card.icon}</span>
                      <span className={styles.cardText}>{card.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Carga de Trabajo */}
              <div className={styles.categorySection}>
                <h4 className={styles.categoryTitle}>⚡ Carga de Trabajo</h4>
                <div className={styles.cardsGrid}>
                  {[
                    { text: '¿Cuál es la carga total?', icon: '📊' },
                    { text: 'Utilización promedio', icon: '📈' },
                    { text: 'Perfil GP - utilización', icon: '👤' },
                    { text: 'Perfil AN - utilización', icon: '👥' },
                    { text: 'Perfil AS - utilización', icon: '🔧' },
                    { text: 'Perfil ARS - utilización', icon: '🏗️' },
                    { text: 'Perfil DE - utilización', icon: '💻' },
                    { text: 'Perfil CD - utilización', icon: '🎨' },
                    { text: 'Horas perfil DE', icon: '⏱️' },
                    { text: 'Horas perfil GP', icon: '📊' }
                  ].map((card, idx) => (
                    <button 
                      key={`carga-${idx}`} 
                      className={styles.questionCard}
                      onClick={() => quickExample(card.text)}
                      disabled={loading}
                    >
                      <span className={styles.cardIcon}>{card.icon}</span>
                      <span className={styles.cardText}>{card.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Facturación y ANS */}
              <div className={styles.categorySection}>
                <h4 className={styles.categoryTitle}>💰 Facturación & ANS</h4>
                <div className={styles.cardsGrid}>
                  {[
                    { text: 'Facturación 2026', icon: '💰' },
                    { text: 'Facturación 2027', icon: '📈' },
                    { text: 'Indicadores NIV', icon: '📊' },
                    { text: 'Indicadores DIS', icon: '📋' },
                    { text: 'Indicadores ONS', icon: '⚡' },
                    { text: 'Indicadores SEG', icon: '🛡️' },
                    { text: 'Indicadores CMU', icon: '🏛️' },
                    { text: 'Resumen ANS', icon: '📈' },
                    { text: 'Requisitos 2026', icon: '📋' },
                    { text: 'Requisitos 2027', icon: '📝' },
                    { text: 'Mes pico facturación', icon: '📅' },
                    { text: 'Top indicadores NIV', icon: '🏆' }
                  ].map((card, idx) => (
                    <button 
                      key={`facturacion-${idx}`} 
                      className={styles.questionCard}
                      onClick={() => quickExample(card.text)}
                      disabled={loading}
                    >
                      <span className={styles.cardIcon}>{card.icon}</span>
                      <span className={styles.cardText}>{card.text}</span>
                    </button>
                  ))}
                </div>
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
