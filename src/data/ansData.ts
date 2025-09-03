type Indicator = {
  id: string
  code: string
  title: string
  unit?: string
  target?: number
  monthly: { [month:string]: number }
}

const months = [
  'enero de 2025','febrero de 2025','marzo de 2025','abril de 2025','mayo de 2025','junio de 2025',
  'julio de 2025','agosto de 2025','septiembre de 2025','octubre de 2025','noviembre de 2025','diciembre de 2025'
]

function genSeries(seed:number, base:number){
  return months.reduce((acc,m,idx)=>{ acc[m] = Math.max(0, Math.min(100, Math.round((base + Math.sin((seed+idx)/3)*6 + ((seed+idx)%4))*10)/10)); return acc }, {} as any)
}

// NIV indicators (NIV-01..NIV-09) - availability / uptime style
const niv: Indicator[] = Array.from({length:9}).map((_,i)=>({
  id: `NIV-${String(i+1).padStart(2,'0')}`,
  code: `NIV-${String(i+1).padStart(2,'0')}`,
  title: ['Disponibilidad del servicio','Tiempo medio restauración','Porcentaje SLA atendido','Tasa de fallos críticos','Tasa de errores','Satisfacción usuario','Disponibilidad redes','Latencia media','Disponibilidad autenticación'][i] || `NIV ${i+1}`,
  unit: '%',
  target: 95 - Math.floor(i/3)*5,
  monthly: genSeries(10+i, 93 - (i%3)*2)
}))

// DIS indicators (DIS-01..DIS-06) - despliegue / disponibilidad infra
const dis: Indicator[] = Array.from({length:6}).map((_,i)=>({
  id: `DIS-${String(i+1).padStart(2,'0')}`,
  code: `DIS-${String(i+1).padStart(2,'0')}`,
  title: ['Disponibilidad infra','Integridad de datos','Backup completado','Capacidad sobrante','Sincronización servicios','Errores de despliegue'][i] || `DIS ${i+1}`,
  unit: '%',
  target: 98 - (i%2),
  monthly: genSeries(50+i, 96 - (i%3))
}))

// ONS indicators (ONS-01..ONS-05) - onboarding / operativa
const ons: Indicator[] = Array.from({length:5}).map((_,i)=>({
  id: `ONS-${String(i+1).padStart(2,'0')}`,
  code: `ONS-${String(i+1).padStart(2,'0')}`,
  title: ['Tareas onboarding','Usuarios activos','Altas pendientes','Tiempos configuración','Conectividad inicial'][i] || `ONS ${i+1}`,
  unit: '%',
  target: 90,
  monthly: genSeries(70+i, 88 - (i%4))
}))

// SEG indicators (SEG-01..SEG-06) - seguridad
const seg: Indicator[] = Array.from({length:6}).map((_,i)=>({
  id: `SEG-${String(i+1).padStart(2,'0')}`,
  code: `SEG-${String(i+1).padStart(2,'0')}`,
  title: ['Vulnerabilidades resueltas','Parcheo','Incidencias seguridad','Accesos rechazados','Auditorías completadas','Cumplimiento'][i] || `SEG ${i+1}`,
  unit: i===2? '%' : '%',
  target: i===2? 5 : 95,
  monthly: genSeries(90+i, 92 - (i%3))
}))

// CMU indicators (CMU-01..CMU-04) - continuidad / mantenimiento / uso compartido
const cmu: Indicator[] = Array.from({length:4}).map((_,i)=>({
  id: `CMU-${String(i+1).padStart(2,'0')}`,
  code: `CMU-${String(i+1).padStart(2,'0')}`,
  title: ['Tareas mantenimiento','Rendimiento medio','Incidentes tratados','Horas soporte'][i] || `CMU ${i+1}`,
  unit: i===3? 'h' : '%',
  target: i===3? 40 : 90,
  monthly: genSeries(120+i, i===3? 35 : 85)
}))

export default { months, niv, dis, ons, seg, cmu }
