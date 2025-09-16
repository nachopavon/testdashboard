export type PeriodKey = 'Último mes' | 'Último trimestre' | 'Último año'

export type AreaKey = 'Vivienda' | 'Territorio' | 'Movilidad' | 'Todas'

export interface AdoptionRow { area: AreaKey; percent: number }

export interface TimelineEvent { date: string; text: string; impact?: number }

export interface Gcb03Data {
  satisfaction: number // 0-10
  adoption: AdoptionRow[]
  resistancePct: number // 0-100
  timeline: TimelineEvent[]
}

// Deterministic dataset keyed by period
const base: Record<PeriodKey, Gcb03Data> = {
  'Último mes': {
    satisfaction: 8.6,
    adoption: [ { area: 'Vivienda', percent: 98 }, { area: 'Territorio', percent: 92 }, { area: 'Movilidad', percent: 96 } ],
    resistancePct: 3,
    timeline: [
      { date: '2026-03', text: 'Reducción tiempos tramitación 12%', impact: 9 },
      { date: '2026-07', text: 'Mejora satisfacción equipo 9%', impact: 7 }
    ]
  },
  'Último trimestre': {
    satisfaction: 8.3,
    adoption: [ { area: 'Vivienda', percent: 96 }, { area: 'Territorio', percent: 90 }, { area: 'Movilidad', percent: 94 } ],
    resistancePct: 4,
    timeline: [
      { date: '2026-01', text: 'Piloto ampliado a 2 localidades', impact: 6 },
      { date: '2026-05', text: 'Capacitación a equipos locales', impact: 5 }
    ]
  },
  'Último año': {
    satisfaction: 7.9,
    adoption: [ { area: 'Vivienda', percent: 92 }, { area: 'Territorio', percent: 88 }, { area: 'Movilidad', percent: 90 } ],
    resistancePct: 6,
    timeline: [
      { date: '2025-11', text: 'Migración del sistema legado', impact: 8 },
      { date: '2026-04', text: 'Integración con registro central', impact: 7 }
    ]
  }
}

export default function getGcb03Data(period: PeriodKey) {
  return base[period]
}
