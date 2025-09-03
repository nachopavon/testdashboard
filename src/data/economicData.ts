// economicData.ts - final clean implementation
const years = [2025, 2026, 2027, 2028]

type Requisite = { code: string; description: string; facturacion: number; estimacion: number; month?: number }

const templates = [
  'Soporte operativo y resolución de incidencias críticas',
  'Mantenimiento correctivo y parches urgentes',
  'Mantenimiento evolutivo y mejoras funcionales',
  'Desarrollo de módulos y nuevas funcionalidades',
  'Gestión de despliegues y automatización CI/CD',
  'Monitorización, alertas y operaciones (SRE)',
  'Documentación, formación y transferencia de conocimiento',
  'Pruebas, QA y automatización de regresión',
  'Integración con sistemas externos y APIs',
  'Optimización de rendimiento e infraestructura'
]

const totalsByYear: Record<number, number> = {
  2025: 220871.34,
  2026: 2429584.77,
  2027: 2429584.77,
  2028: 220871.34
}

const estRate = 0.12
const maxReqPerBigYear = 55
const minReqPerSmallYear = 5

const data: Record<string, any> = {}
const maxTotal = Math.max(...Object.values(totalsByYear))

years.forEach((y) => {
  const yearKey = String(y)
  const totalFact = totalsByYear[y] || 0

  const totalFactCents = Math.round(totalFact * 100)
  const baseMonth = Math.floor(totalFactCents / 12)
  let rem = totalFactCents - baseMonth * 12
  const monthlyFacturacion = Array.from({ length: 12 }, () => {
    const add = rem > 0 ? 1 : 0
    if (rem > 0) rem -= 1
    return (baseMonth + add) / 100
  })

  const totalEstCents = Math.round(totalFactCents * (1 + estRate))
  const baseEst = Math.floor(totalEstCents / 12)
  let remE = totalEstCents - baseEst * 12
  const monthlyEstimacion = Array.from({ length: 12 }, () => {
    const add = remE > 0 ? 1 : 0
    if (remE > 0) remE -= 1
    return (baseEst + add) / 100
  })

  const facturacion = Math.round(monthlyFacturacion.reduce((a: number, b: number) => a + b, 0) * 100) / 100
  const estimacion = Math.round(monthlyEstimacion.reduce((a: number, b: number) => a + b, 0) * 100) / 100

  const proportion = maxTotal > 0 ? totalFact / maxTotal : 1
  let reqCount = Math.max(minReqPerSmallYear, Math.round(proportion * maxReqPerBigYear))
  reqCount = Math.min(reqCount, maxReqPerBigYear)
  if (reqCount < 1) reqCount = 1

  // Generate weighted, non-linear amounts per REQ so values vary but still sum to annual totals
  const requisites: Requisite[] = []
  // deterministic weights per index to create variety
  const weights = Array.from({ length: reqCount }, (_, i) => {
    // mix index and year to vary weights: results in 1..10
    return 1 + ((i * 37 + y) % 10)
  })
  const weightSum = weights.reduce((s, w) => s + w, 0)

  // allocate facturacion cents proportionally to weights
  let allocatedFactCents = 0
  const factCentsByReq: number[] = weights.map((w, i) => {
    const v = Math.floor((totalFactCents * w) / weightSum)
    allocatedFactCents += v
    return v
  })
  // distribute remaining cents due to flooring
  let remainingFact = totalFactCents - allocatedFactCents
  for (let i = 0; remainingFact > 0; i = (i + 1) % reqCount) {
    factCentsByReq[i] += 1
    remainingFact -= 1
  }

  // build requisites with estimations derived from facturacion base per REQ
  let allocatedEstCents = 0
  const estCentsByReq: number[] = []
  for (let i = 0; i < reqCount; i++) {
    const f = factCentsByReq[i]
    const est = Math.round(f * (1 + estRate))
    estCentsByReq.push(est)
    allocatedEstCents += est
  }

  // adjust est cents to match totalEstCents (distribute diff)
  let remainingEst = totalEstCents - allocatedEstCents
  for (let i = 0; remainingEst > 0 && reqCount > 0; i = (i + 1) % reqCount) {
    estCentsByReq[i] += 1
    remainingEst -= 1
  }
  for (let i = 0; remainingEst < 0 && reqCount > 0; i = (i + 1) % reqCount) {
    // remove one cent from items > 0 until fixed
    if (estCentsByReq[i] > 0) { estCentsByReq[i] -= 1; remainingEst += 1 }
  }

  // assign each requisite to a month index (0..11) based on cumulative monthly facturación
  const monthlyFactCents = monthlyFacturacion.map(m => Math.round(m * 100))
  const cumMonths: number[] = monthlyFactCents.reduce((acc: number[], v: number) => {
    const last = acc.length ? acc[acc.length - 1] : 0
    acc.push(last + v)
    return acc
  }, [])
  let runningAllocated = 0
  for (let i = 0; i < reqCount; i++) {
    const factC = factCentsByReq[i]
    const estC = estCentsByReq[i]
    const assignPoint = runningAllocated
    let monthIdx = cumMonths.findIndex(c => c > assignPoint)
    if (monthIdx === -1) monthIdx = 11
    runningAllocated += factC
    requisites.push({ code: `REQ.${String(i + 1).padStart(2, '0')}`, description: `${templates[i % templates.length]} - alcance ${y}`, facturacion: factC / 100, estimacion: estC / 100, month: monthIdx })
  }

  data[yearKey] = { monthlyFacturacion, monthlyEstimacion, facturacion, estimacion, requisites }
})

export default { years, data }

