export const months = [
  'enero de 2026', 'febrero de 2026', 'marzo de 2026', 'abril de 2026', 'mayo de 2026', 'junio de 2026',
  'julio de 2026', 'agosto de 2026', 'septiembre de 2026', 'octubre de 2026', 'noviembre de 2026', 'diciembre de 2026'
]

export const reqs = ['REQ.01','REQ.02','REQ.03','REQ.04','REQ.05','REQ.06','REQ.07','REQ.08']

type Metric = {
  id: string
  code: string
  title: string
  value: number
  target: number
  unit?: string
}

// Base metric definitions (codes/titles/targets)
const baseMetrics: Omit<Metric,'value'|'id'>[] = [
  { code: 'ANS_DES-01', title: 'Tiempo de resolución en incidencias críticas', target: 95, unit: '%' },
  { code: 'ANS_DES-02', title: 'Tiempo de resolución en incidencias no críticas', target: 95, unit: '%' },
  { code: 'ANS_DES-03', title: 'Número de incidencias reabiertas', target: 5, unit: '%' },
  { code: 'ANS_DES-04', title: 'Tiempo de resolución en peticiones simples', target: 95, unit: '%' },
  { code: 'ANS_DES-05', title: 'Tiempo planificado en peticiones complejas', target: 95, unit: '%' },
  { code: 'ANS_DES-06', title: 'Tiempo de resolución en peticiones complejas', target: 75, unit: '%' },
  { code: 'ANS_DES-07', title: 'Tiempo planificado en proyectos', target: 75, unit: '%' },
  { code: 'ANS_DES-08', title: 'Tiempo de resolución en proyectos', target: 75, unit: '%' }
]

// Generate deterministic sample values per month/req using simple math
function genValue(monthIndex:number, reqIndex:number, metricIndex:number, target:number){
  // base around target with some variation
  const base = target
  const variation = ((metricIndex + 1) * 3 + (reqIndex + 1) * 2 + monthIndex) % 12
  const sign = ((metricIndex + reqIndex + monthIndex) % 2 === 0) ? 1 : -1
  const value = Math.max(0, Math.min(100, Math.round((base + sign * variation + Math.random() * 2) * 10) / 10))
  return value
}

type DataTree = {
  [month:string]: {
    [req:string]: Metric[]
  }
}

const data: DataTree = {}

months.forEach((m, mi) => {
  data[m] = {}
  reqs.forEach((r, ri) => {
    data[m][r] = baseMetrics.map((bm, idx) => ({
      id: `${m}-${r}-${bm.code}`,
      code: bm.code,
      title: bm.title,
      target: bm.target,
      unit: bm.unit,
      value: genValue(mi, ri, idx, bm.target)
    }))
  })
})

export default { months, reqs, data }
