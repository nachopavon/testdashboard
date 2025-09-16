import type { PeriodKey } from './gcb03Data'

export type CapacidadData = {
  utilizationPct: number // horas consumidas / horas disponibles (0-100)
  demandServedPct: number // % demanda atendida
  rejectedCount: number
  predicted: number[] // serie de demanda prevista (%)
  actual: number[] // serie de demanda real (%)
  overflowPct: number // % peticiones que superan 15% de la carga media
}

export function adjustByFilters(base: CapacidadData, opts?: { area?: string; kind?: string; responsible?: string }): CapacidadData {
  // simple deterministic modifiers: area 'Vivienda' slightly higher utilization, kind/responsible small deltas
  let util = base.utilizationPct
  let served = base.demandServedPct
  let rejected = base.rejectedCount
  let overflow = base.overflowPct

  if(opts?.area === 'Vivienda') { util += 4; served += 2; rejected = Math.max(0, rejected - 1); overflow -= 0.5 }
  if(opts?.area === 'Movilidad') { util -= 3; served -= 2; rejected += 1; overflow += 0.4 }
  if(opts?.kind === 'Cambio mayor') { util += 2; rejected += 2 }
  if(opts?.responsible === 'Equipo A') { served += 2; rejected = Math.max(0, rejected - 1) }

  // clamp values
  util = Math.max(0, Math.min(100, Math.round(util)))
  served = Math.max(0, Math.min(100, Math.round(served)))
  overflow = Math.max(0, Math.round(overflow*10)/10)

  return { ...base, utilizationPct: util, demandServedPct: served, rejectedCount: Math.round(rejected), overflowPct: overflow }
}

export default function getCapacidadData(period: PeriodKey): CapacidadData {
  // deterministic values per period
  if (period === 'Último trimestre') {
    return {
      utilizationPct: 78,
      demandServedPct: 91,
      rejectedCount: 12,
      predicted: [70, 75, 74, 76, 78, 80, 79, 81],
      actual:    [72, 74, 76, 78, 79, 82, 78, 80],
      overflowPct: 6.5
    }
  }

  if (period === 'Último año') {
    return {
      utilizationPct: 69,
      demandServedPct: 87,
      rejectedCount: 48,
      predicted: [60, 63, 65, 67, 70, 72, 68, 69, 71, 73, 74, 75],
      actual:    [62, 64, 66, 66, 69, 71, 69, 68, 70, 72, 73, 74],
      overflowPct: 8.2
    }
  }

  // Último mes (default)
  return {
    utilizationPct: 82,
    demandServedPct: 94,
    rejectedCount: 4,
    predicted: [78, 80, 81, 82, 83, 82],
    actual:    [79, 81, 82, 83, 84, 83],
    overflowPct: 4.1
  }
}
