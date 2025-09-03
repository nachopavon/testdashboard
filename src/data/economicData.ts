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

  // determine active months per year: 2025 -> Oct(9)..Dec(11), 2026/2027 -> all months, 2028 -> Jan(0)..Feb(1)
  let activeIdxs: number[]
  if (y === 2025) activeIdxs = [9,10,11]
  else if (y === 2028) activeIdxs = [0,1]
  else activeIdxs = Array.from({length:12}, (_,i)=>i)

  // distribute totalFactCents across active months evenly (in cents), remainder spread to first active months
  const activeCount = activeIdxs.length || 1
  const baseActive = Math.floor(totalFactCents / activeCount)
  let remActive = totalFactCents - baseActive * activeCount
  const monthlyFactCentsByActive = Array.from({length:12}, ()=>0)
  for (let j=0;j<activeCount;j++){
    const idx = activeIdxs[j]
    const add = remActive > 0 ? 1 : 0
    if (remActive > 0) remActive -= 1
    monthlyFactCentsByActive[idx] = baseActive + add
  }
  // convert to euros for `monthlyFacturacion` (temporary)
  const monthlyFacturacion = monthlyFactCentsByActive.map(c => c / 100)

  // Adjust monthly distribution with deterministic per-month weights so each month varies
  // but the annual total remains the same (work in cents to avoid float errors)
  const monthlyFactCentsInit = monthlyFacturacion.map(m => Math.round(m * 100))
  // create deterministic jitter weights per month
  const variance = 0.12
  const monthWeights = monthlyFactCentsInit.map((_, i) => {
    const seed = y * 37 + i * 19
    const x = Math.abs(Math.sin(seed) * 10000)
    const frac = x - Math.floor(x)
    const jitter = (frac - 0.5) * 2 * variance
    return 1 + jitter
  })
  const denomMonths = monthlyFactCentsInit.reduce((s, v, idx) => s + v * monthWeights[idx], 0) || 1
  const alphaMonths = totalFactCents / denomMonths
  const monthFactors = monthWeights.map(w => alphaMonths * w)
  const cappedFactors = monthFactors.map(f => Math.max(0.2, Math.min(1.5, f)))
  let adjustedMonthlyFactCents = monthlyFactCentsInit.map((v, idx) => Math.round(v * cappedFactors[idx]))
  // distribute any remaining cents to match totalFactCents
  let allocated = adjustedMonthlyFactCents.reduce((s, v) => s + v, 0)
  let remaining = totalFactCents - allocated
  for (let i = 0; remaining > 0; i = (i + 1) % 12) { adjustedMonthlyFactCents[i] += 1; remaining -= 1 }
  for (let i = 0; remaining < 0; i = (i + 1) % 12) { if (adjustedMonthlyFactCents[i] > 0) { adjustedMonthlyFactCents[i] -= 1; remaining += 1 } }
  // replace monthlyFacturacion with adjusted values (euros)
  const monthlyFacturacionAdjusted = adjustedMonthlyFactCents.map(c => c / 100)

  const totalEstCents = Math.round(totalFactCents * (1 + estRate))
  // derive monthly estimacion from adjusted monthly facturación proportionally, then normalize to match totalEstCents
  let monthlyEstCents = adjustedMonthlyFactCents.map(c => Math.round(c * (1 + estRate)))
  // adjust to exact totalEstCents
  let estAllocated = monthlyEstCents.reduce((s, v) => s + v, 0)
  let estRemaining = totalEstCents - estAllocated
  for (let i = 0; estRemaining > 0; i = (i + 1) % 12) { monthlyEstCents[i] += 1; estRemaining -= 1 }
  for (let i = 0; estRemaining < 0; i = (i + 1) % 12) { if (monthlyEstCents[i] > 0) { monthlyEstCents[i] -= 1; estRemaining += 1 } }
  const monthlyEstimacion = monthlyEstCents.map(c => c / 100)

  const facturacion = Math.round(monthlyFacturacionAdjusted.reduce((a: number, b: number) => a + b, 0) * 100) / 100
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
  const monthlyFactCents = adjustedMonthlyFactCents
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

  data[yearKey] = { monthlyFacturacion: monthlyFacturacionAdjusted, monthlyEstimacion, facturacion, estimacion, requisites }
})

export default { years, data }

