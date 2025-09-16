import type { PeriodKey } from './gcb03Data'

export type DemandaData = {
  total: number
  plannedPct: number
  unplannedPct: number
  byType: { strategic: number; operational: number; internal: number; proactive: number }
  series: number[]
}

function baseForPeriod(period: PeriodKey): DemandaData {
  if(period === 'Último año'){
    return {
      total: 12480,
      plannedPct: 62,
      unplannedPct: 38,
      byType: { strategic: 8, operational: 64, internal: 18, proactive: 10 },
      series: [980, 1020, 1100, 980, 1040, 1080, 1120, 1000, 980, 1060, 1100, 1080]
    }
  }
  if(period === 'Último trimestre'){
    return {
      total: 3120,
      plannedPct: 60,
      unplannedPct: 40,
      byType: { strategic: 7, operational: 66, internal: 17, proactive: 10 },
      series: [1000, 1020, 980, 1100]
    }
  }
  // último mes
  return {
    total: 980,
    plannedPct: 58,
    unplannedPct: 42,
    byType: { strategic: 6, operational: 68, internal: 16, proactive: 10 },
    series: [320, 330, 330]
  }
}

export function adjustByFilters(base: DemandaData, opts?: { area?: string; kind?: string; responsible?: string }): DemandaData {
  let total = base.total
  let planned = base.plannedPct
  let unplanned = base.unplannedPct
  const byType = { ...base.byType }

  if(opts?.area === 'Movilidad') { total = Math.round(total * 0.92); planned -= 2; unplanned += 2; byType.operational += 2 }
  if(opts?.area === 'Vivienda') { total = Math.round(total * 1.06); planned += 3; unplanned -= 3; byType.proactive += 1 }
  if(opts?.kind === 'Cambio mayor') { total = Math.round(total * 1.04); byType.strategic += 1 }
  if(opts?.responsible === 'Equipo A') { planned += 2; byType.operational += 1 }

  planned = Math.max(0, Math.min(100, Math.round(planned)))
  unplanned = Math.max(0, Math.min(100, Math.round(unplanned)))

  const series = base.series.map(v=> Math.max(0, Math.round(v * (total / base.total))))

  return { total, plannedPct: planned, unplannedPct: unplanned, byType, series }
}

export default function getDemandaData(period: PeriodKey){
  return baseForPeriod(period)
}
