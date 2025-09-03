// economicData.ts - final clean implementation
const years = [2025, 2026, 2027, 2028]

type Requisite = { code: string; description: string; facturacion: number; estimacion: number }

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

  const requisites: Requisite[] = []
  const perReqBase = Math.floor(totalFactCents / reqCount)
  let perReqRem = totalFactCents - perReqBase * reqCount
  for (let i = 0; i < reqCount; i++) {
    const add = perReqRem > 0 ? 1 : 0
    if (perReqRem > 0) perReqRem -= 1
    const factC = perReqBase + add
    const estC = Math.round(factC * (1 + estRate))
    requisites.push({ code: `REQ.${String(i + 1).padStart(2, '0')}`, description: `${templates[i % templates.length]} - alcance ${y}`, facturacion: factC / 100, estimacion: estC / 100 })
  }

  const sumFactCents = requisites.reduce((s, r) => s + Math.round(r.facturacion * 100), 0)
  const diffFact = totalFactCents - sumFactCents
  if (diffFact !== 0 && requisites.length > 0) {
    const last = requisites[requisites.length - 1]
    last.facturacion = Math.round((last.facturacion * 100 + diffFact)) / 100
  }

  const sumEstCents = requisites.reduce((s, r) => s + Math.round(r.estimacion * 100), 0)
  const diffEst = totalEstCents - sumEstCents
  if (diffEst !== 0 && requisites.length > 0) {
    const last = requisites[requisites.length - 1]
    last.estimacion = Math.round((last.estimacion * 100 + diffEst)) / 100
  }

  data[yearKey] = { monthlyFacturacion, monthlyEstimacion, facturacion, estimacion, requisites }
})

export default { years, data }

