const years = [2025, 2026]

type Requisite = { code: string; description: string; facturacion: number; estimacion: number }

// generador simple para tener cifras consistentes y editables
function base(n:number){ return Math.round((n + 1) * 1000 + (n % 7) * 1234) }

const data: Record<string, any> = {}

years.forEach((y, yi) => {
  const yearKey = String(y)
  const monthlyBase = 40 + yi * 10

  // monthly facturación (en euros)
  const monthlyFacturacion = Array.from({length:12}, (_,m) => Math.round((monthlyBase + (m % 5) * 5 + yi*3 + (m%3)*2) * 1000))

  // monthly estimación (en euros) ligeramente superior al facturado
  const monthlyEstimacion = monthlyFacturacion.map((v, idx) => Math.round(v * (1 + ((idx % 4) * 0.03 + (yi?0.08:0.02)))))

  const facturacion = monthlyFacturacion.reduce((a,b)=>a+b,0)
  const estimacion = monthlyEstimacion.reduce((a,b)=>a+b,0)

  const requisites: Requisite[] = Array.from({length:8}, (_,i)=>({
    code: `REQ.0${i+1}`,
    description: `Petición de ejemplo ${i+1} para el año ${y}`,
    facturacion: Math.round(base(i) * (1 + yi*0.08)),
    estimacion: Math.round(base(i) * (1.15 + yi*0.08))
  }))

  data[yearKey] = { monthlyFacturacion, monthlyEstimacion, facturacion, estimacion, requisites }
})

export default { years, data }
