export type Indicator = {
  id: string
  code: string
  title: string
  unit?: string
  target?: number
  monthly: Record<string, number>
}

// months from October 2025 through February 2028 (inclusive)
const months = [
  'octubre de 2025','noviembre de 2025','diciembre de 2025',
  'enero de 2026','febrero de 2026','marzo de 2026','abril de 2026','mayo de 2026','junio de 2026','julio de 2026','agosto de 2026','septiembre de 2026','octubre de 2026','noviembre de 2026','diciembre de 2026',
  'enero de 2027','febrero de 2027','marzo de 2027','abril de 2027','mayo de 2027','junio de 2027','julio de 2027','agosto de 2027','septiembre de 2027','octubre de 2027','noviembre de 2027','diciembre de 2027',
  'enero de 2028','febrero de 2028'
]

function genRange(seed:number, base:number, min:number, max:number, digits = 1): Record<string, number>{
  const rng = (s:number) => {
    // deterministic-ish jitter
    const x = Math.abs(Math.sin((seed + s) / 3) * 10000)
    const frac = x - Math.floor(x)
    const jitter = (frac - 0.5) * ( (max - min) * 0.12 )
    const v = base + jitter
    const clipped = Math.max(min, Math.min(max, Math.round(v * Math.pow(10,digits)) / Math.pow(10,digits)))
    return clipped
  }
  return months.reduce((acc,m,idx)=>{ acc[m] = rng(idx); return acc }, {} as Record<string, number>)
}

// Build indicators according to requested specification

const niv: Indicator[] = [
  { id:'NIV-01', code:'NIV-01', title:'Disponibilidad del servicio', unit:'%', target:99.5, monthly: genRange(11, 99.6, 98.5, 100, 2) },
  { id:'NIV-02', code:'NIV-02', title:'Tiempo medio resolución incidencias', unit:'h', target:4, monthly: genRange(12, 6, 0.5, 12, 1) },
  { id:'NIV-03', code:'NIV-03', title:'Porcentaje cumplimiento SLA', unit:'%', target:95, monthly: genRange(13, 95, 80, 100, 1) },
  { id:'NIV-04', code:'NIV-04', title:'Índice desviación plazos', unit:'%', target:5, monthly: genRange(14, 3, 0, 20, 1) },
  { id:'NIV-05', code:'NIV-05', title:'Tasa resolución primer contacto', unit:'%', target:70, monthly: genRange(15, 72, 40, 95, 1) },
  { id:'NIV-06', code:'NIV-06', title:'Satisfacción usuario final', unit:'escala', target:8, monthly: genRange(16, 8.1, 6, 9.8, 1) },
  { id:'NIV-07', code:'NIV-07', title:'Tiempo respuesta sistemas críticos', unit:'s', target:2, monthly: genRange(17, 1.8, 0.5, 3.5, 1) },
  { id:'NIV-08', code:'NIV-08', title:'Disponibilidad horario laboral', unit:'%', target:99.8, monthly: genRange(18, 99.85, 99, 100, 2) },
  { id:'NIV-09', code:'NIV-09', title:'Cumplimiento ventanas mantenimiento', unit:'%', target:100, monthly: genRange(19, 99.9, 95, 100, 2) },
  { id:'NIV-10', code:'NIV-10', title:'Índice calidad entregas', unit:'%', target:95, monthly: genRange(20, 95, 80, 100, 1) }
]

const dis: Indicator[] = [
  { id:'DIS-01', code:'DIS-01', title:'Disponibilidad infraestructura', unit:'%', target:99.9, monthly: genRange(21, 99.9, 95, 100, 2) },
  { id:'DIS-02', code:'DIS-02', title:'Éxito despliegues CI/CD', unit:'%', target:95, monthly: genRange(22, 96, 70, 100, 1) },
  { id:'DIS-03', code:'DIS-03', title:'Tiempo medio despliegue', unit:'min', target:30, monthly: genRange(23, 28, 5, 90, 0) },
  { id:'DIS-04', code:'DIS-04', title:'Rollback exitosos', unit:'%', target:100, monthly: genRange(24, 99.5, 90, 100, 1) },
  { id:'DIS-05', code:'DIS-05', title:'Integridad datos post-despliegue', unit:'%', target:100, monthly: genRange(25, 99.8, 95, 100, 2) },
  { id:'DIS-06', code:'DIS-06', title:'Cobertura pruebas automatizadas', unit:'%', target:80, monthly: genRange(26, 78, 40, 100, 1) },
  { id:'DIS-07', code:'DIS-07', title:'Disponibilidad entornos desarrollo', unit:'%', target:98, monthly: genRange(27, 98.5, 90, 100, 2) }
]

const ges: Indicator[] = [
  { id:'GES-01', code:'GES-01', title:'Tiempo análisis impacto (AIM)', unit:'h', target:24, monthly: genRange(31, 18, 2, 72, 0) },
  { id:'GES-02', code:'GES-02', title:'Precisión estimaciones', unit:'%', target:10, monthly: genRange(32, 9, 2, 20, 1) },
  { id:'GES-03', code:'GES-03', title:'Cumplimiento capacidad base', unit:'%', target:100, monthly: genRange(33, 95, 60, 100, 1) },
  { id:'GES-04', code:'GES-04', title:'Peticiones atendidas plazo', unit:'%', target:90, monthly: genRange(34, 92, 60, 100, 1) },
  { id:'GES-05', code:'GES-05', title:'Grandes evolutivos en plazo', unit:'%', target:95, monthly: genRange(35, 94, 50, 100, 1) },
  { id:'GES-06', code:'GES-06', title:'Demos mensuales realizadas', unit:'n', target:100, monthly: genRange(36, 1, 0, 2, 0) },
  { id:'GES-07', code:'GES-07', title:'Actualización base conocimiento', unit:'n/mes', target:10, monthly: genRange(37, 9, 0, 20, 0) },
  { id:'GES-08', code:'GES-08', title:'Eficiencia gestión demanda', unit:'%', target:85, monthly: genRange(38, 84, 50, 100, 1) }
]

const seg: Indicator[] = [
  { id:'SEG-01', code:'SEG-01', title:'Cumplimiento ENS', unit:'%', target:100, monthly: genRange(41, 99.9, 90, 100, 2) },
  { id:'SEG-02', code:'SEG-02', title:'Vulnerabilidades críticas resueltas', unit:'h', target:24, monthly: genRange(42, 12, 1, 72, 0) },
  { id:'SEG-03', code:'SEG-03', title:'Auditorías seguridad completadas', unit:'%', target:100, monthly: genRange(43, 100, 0, 100, 0) },
  { id:'SEG-04', code:'SEG-04', title:'Incidentes seguridad', unit:'n/mes', target:2, monthly: genRange(44, 1.5, 0, 6, 0) },
  { id:'SEG-05', code:'SEG-05', title:'Cumplimiento RGPD', unit:'%', target:100, monthly: genRange(45, 99.9, 90, 100, 1) },
  { id:'SEG-06', code:'SEG-06', title:'Pruebas seguridad automatizadas', unit:'%', target:95, monthly: genRange(46, 93, 50, 100, 1) }
]

const cal: Indicator[] = [
  { id:'CAL-01', code:'CAL-01', title:'Cobertura pruebas unitarias', unit:'%', target:70, monthly: genRange(51, 68, 30, 100, 1) },
  { id:'CAL-02', code:'CAL-02', title:'Defectos producción', unit:'n/release', target:3, monthly: genRange(52, 2, 0, 8, 0) },
  { id:'CAL-03', code:'CAL-03', title:'Tiempo resolución defectos', unit:'h', target:48, monthly: genRange(53, 24, 1, 120, 0) },
  { id:'CAL-04', code:'CAL-04', title:'Código sin deuda técnica crítica', unit:'%', target:90, monthly: genRange(54, 88, 50, 100, 1) },
  { id:'CAL-05', code:'CAL-05', title:'Revisiones código completadas', unit:'%', target:100, monthly: genRange(55, 98, 60, 100, 1) },
  { id:'CAL-06', code:'CAL-06', title:'Cumplimiento estándares desarrollo', unit:'%', target:95, monthly: genRange(56, 94, 60, 100, 1) },
  { id:'CAL-07', code:'CAL-07', title:'Accesibilidad WCAG 2.1', unit:'%', target:100, monthly: genRange(57, 98, 60, 100, 1) }
]

const inn: Indicator[] = [
  { id:'INN-01', code:'INN-01', title:'Propuestas mejora implementadas', unit:'n/trimestre', target:3, monthly: genRange(61, 2, 0, 6, 0) },
  { id:'INN-02', code:'INN-02', title:'Ahorro tiempo IA/automatización', unit:'%', target:30, monthly: genRange(62, 25, 0, 60, 1) },
  { id:'INN-03', code:'INN-03', title:'Reutilización componentes', unit:'%', target:60, monthly: genRange(63, 55, 10, 100, 1) },
  { id:'INN-04', code:'INN-04', title:'Adopción herramientas DevSecOps', unit:'%', target:100, monthly: genRange(64, 90, 40, 100, 1) },
  { id:'INN-05', code:'INN-05', title:'Transferencia conocimiento', unit:'sesiones/mes', target:2, monthly: genRange(65, 1, 0, 6, 0) }
]

const val: Indicator[] = [
  { id:'VAL-01', code:'VAL-01', title:'Reducción esfuerzo documentación IA', unit:'%', target:50, monthly: genRange(71, 40, 0, 100, 1) },
  { id:'VAL-02', code:'VAL-02', title:'Precisión análisis predictivo', unit:'%', target:85, monthly: genRange(72, 80, 40, 100, 1) },
  { id:'VAL-03', code:'VAL-03', title:'Integración herramientas corporativas', unit:'%', target:100, monthly: genRange(73, 95, 40, 100, 1) },
  { id:'VAL-04', code:'VAL-04', title:'Cumplimiento sostenibilidad', unit:'%', target:90, monthly: genRange(74, 88, 40, 100, 1) },
  { id:'VAL-05', code:'VAL-05', title:'Madurez procesos CI/CD', unit:'nivel', target:4, monthly: genRange(75, 3, 1, 5, 0) }
]

export type AnsData = {
  months: string[]
  niv: Indicator[]
  dis: Indicator[]
  ges: Indicator[]
  seg: Indicator[]
  cal: Indicator[]
  inn: Indicator[]
  val: Indicator[]
  ons?: Indicator[]
}

// Build ONS indicators (grouped by GOB, NEG, TEC)
const ons: Indicator[] = [
  { id:'ONS_GOB-01', code:'ONS_GOB-01', title:'Capacidad del servicio', unit:'h', target:0, monthly: genRange(81, 1200, 800, 1600, 0) },
  { id:'ONS_GOB-02', code:'ONS_GOB-02', title:'Desviación de la capacidad', unit:'%', target:5, monthly: genRange(82, 1.5, -10, 15, 1) },
  { id:'ONS_GOB-03', code:'ONS_GOB-03', title:'Backlog de trabajo', unit:'n', target:0, monthly: genRange(83, 120, 20, 300, 0) },
  { id:'ONS_GOB-04', code:'ONS_GOB-04', title:'Peticiones pendientes de estimación', unit:'n', target:0, monthly: genRange(84, 25, 0, 150, 0) },
  { id:'ONS_GOB-05', code:'ONS_GOB-05', title:'Volumen de trabajo pendiente de aprobación', unit:'n', target:0, monthly: genRange(85, 40, 0, 200, 0) },

  { id:'ONS_NEG-01', code:'ONS_NEG-01', title:'Número de procedimientos publicados', unit:'n', target:0, monthly: genRange(86, 2, 0, 8, 0) },
  { id:'ONS_NEG-02', code:'ONS_NEG-02', title:'Número de actuaciones publicadas', unit:'n', target:0, monthly: genRange(87, 3, 0, 10, 0) },
  { id:'ONS_NEG-03', code:'ONS_NEG-03', title:'Número de expedientes gestionados', unit:'n', target:0, monthly: genRange(88, 450, 50, 1200, 0) },
  { id:'ONS_NEG-04', code:'ONS_NEG-04', title:'Tiempo de gestión de expedientes', unit:'h', target:0, monthly: genRange(89, 4, 0.5, 48, 1) },
  { id:'ONS_NEG-05', code:'ONS_NEG-05', title:'Número de usuarios únicos', unit:'n', target:0, monthly: genRange(90, 12000, 1000, 40000, 0) },

  { id:'ONS_TEC-01', code:'ONS_TEC-01', title:'Prevención de deuda técnica', unit:'n/trimestre', target:3, monthly: genRange(91, 2, 0, 6, 0) },
  { id:'ONS_TEC-02', code:'ONS_TEC-02', title:'Automatización de procesos', unit:'n/trimestre', target:3, monthly: genRange(92, 2, 0, 6, 0) },
  { id:'ONS_TEC-03', code:'ONS_TEC-03', title:'Iniciativas de uso de IA', unit:'n', target:0, monthly: genRange(93, 1, 0, 6, 0) },
  { id:'ONS_TEC-04', code:'ONS_TEC-04', title:'Auditorías de cumplimiento de estándares', unit:'n', target:0, monthly: genRange(94, 1, 0, 6, 0) }
]

const ansData: AnsData = { months, niv, dis, ges, seg, cal, inn, val, ons }

export default ansData
