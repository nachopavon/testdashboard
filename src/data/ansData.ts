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

// const niv: Indicator[] = [
  // { id:'NIV-01', code:'NIV-01', title:'Incumplimiento de plazos de respuesta en servicios de prestación continua', unit:'n', target:0, monthly: genRange(11, 3, 0, 20, 0) },
  // { id:'NIV-02', code:'NIV-02', title:'Grado de cumplimiento de la planificación en servicios planificados', unit:'%', target:100, monthly: genRange(12, 92, 50, 100, 1) },
  // { id:'NIV-03', code:'NIV-03', title:'Grado de cumplimiento de tiempos de resolución a peticiones de servicios de soporte y consulta', unit:'%', target:95, monthly: genRange(13, 90, 50, 100, 1) },
  // { id:'NIV-04', code:'NIV-04', title:'Grado de cumplimiento de plazos por proyecto', unit:'%', target:95, monthly: genRange(14, 88, 40, 100, 1) },
  // { id:'NIV-05', code:'NIV-05', title:'Porcentaje de falsos defectos detectados en un servicio', unit:'%', target:0, monthly: genRange(15, 4, 0, 30, 1) },
  // { id:'NIV-06', code:'NIV-06', title:'Número de defectos graves no detectados', unit:'n', target:0, monthly: genRange(16, 1, 0, 10, 0) },
  // { id:'NIV-07', code:'NIV-07', title:'Número de defectos leves no detectados', unit:'n', target:0, monthly: genRange(17, 5, 0, 30, 0) },
  // { id:'NIV-08', code:'NIV-08', title:'Grado de implantaciones fallidas con marcha atrás', unit:'%', target:0, monthly: genRange(18, 1.2, 0, 10, 1) },
  // { id:'NIV-09', code:'NIV-09', title:'Indicador de rotación del equipo (trimestral)', unit:'%', target:0, monthly: genRange(19, 2.5, 0, 10, 1) }
// NIV — Indicadores de servicio (objetivos = valor ofertado en ANS)
const niv: Indicator[] = [
  // Incumplimiento plazos respuesta (≤ 3%) -> % 
  { id:'NIV-01', code:'NIV-01', title:'Incumplimiento de plazos de respuesta en servicios de prestación continua', unit:'%', target:3, monthly: genRange(11, 2.2, 0, 6, 1) },
  // Cumplimiento planificación (≥ 97%) -> %
  { id:'NIV-02', code:'NIV-02', title:'Grado de cumplimiento de la planificación en servicios planificados', unit:'%', target:97, monthly: genRange(12, 98, 90, 100, 1) },
  // Cumplimiento tiempos resolución soporte (≥ 97%) -> %
  { id:'NIV-03', code:'NIV-03', title:'Grado de cumplimiento de tiempos de resolución a peticiones de servicios de soporte y consulta', unit:'%', target:97, monthly: genRange(13, 98, 90, 100, 1) },
  // Cumplimiento plazos por proyecto (≥ 97%) -> %
  { id:'NIV-04', code:'NIV-04', title:'Grado de cumplimiento de plazos por proyecto', unit:'%', target:97, monthly: genRange(14, 98, 85, 100, 1) },
  // Falsos defectos (≤ 3%) -> %
  { id:'NIV-05', code:'NIV-05', title:'Porcentaje de falsos defectos detectados en un servicio', unit:'%', target:3, monthly: genRange(15, 2.2, 0, 8, 1) },
  // Defectos graves no detectados (≤ 1) -> n
  { id:'NIV-06', code:'NIV-06', title:'Número de defectos graves no detectados', unit:'n', target:1, monthly: genRange(16, 0.7, 0, 3, 0) },
  // Defectos leves no detectados (≤ 2) -> n
  { id:'NIV-07', code:'NIV-07', title:'Número de defectos leves no detectados', unit:'n', target:2, monthly: genRange(17, 1.4, 0, 6, 0) },
  // Implantaciones fallidas con rollback (≤ 3%) -> %
  { id:'NIV-08', code:'NIV-08', title:'Grado de implantaciones fallidas con marcha atrás', unit:'%', target:3, monthly: genRange(18, 2.0, 0, 7, 1) },
  // Rotación del equipo (trimestral) (≤ 8%) -> %
  { id:'NIV-09', code:'NIV-09', title:'Indicador de rotación del equipo (trimestral)', unit:'%', target:8, monthly: genRange(19, 6.0, 0, 12, 1) }
]

// DIS — Disponibilidad del servicio (objetivos = valor ofertado en ANS)
const dis: Indicator[] = [
  { id:'DIS_01', code:'DIS_01', title:'Plazo de inicio', unit:'días', target:15, monthly: genRange(21, 12, 5, 30, 0) },
  { id:'DIS_02', code:'DIS_02', title:'Plazo de adquisición', unit:'días', target:14, monthly: genRange(22, 12, 7, 30, 0) },
  { id:'DIS_03', code:'DIS_03', title:'Preaviso de baja en el equipo de trabajo', unit:'días', target:5, monthly: genRange(23, 4, 1, 14, 0) },
  { id:'DIS_04', code:'DIS_04', title:'Plazo de sustitución a petición del adjudicatario', unit:'días', target:10, monthly: genRange(24, 8, 3, 21, 0) },
  { id:'DIS_05', code:'DIS_05', title:'Plazo de sustitución a petición de la dirección técnica', unit:'días', target:14, monthly: genRange(25, 11, 4, 21, 0) },
  { id:'DIS_06', code:'DIS_06', title:'Número de sustituciones', unit:'n', target:4, monthly: genRange(26, 3, 0, 8, 0) },
  { id:'DIS_07', code:'DIS_07', title:'Plazo de incorporación de técnicos adicionales', unit:'días', target:14, monthly: genRange(27, 12, 5, 30, 0) },
  { id:'DIS_08', code:'DIS_08', title:'Plazo de salida de técnicos', unit:'días', target:10, monthly: genRange(28, 8, 3, 20, 0) },
  // En el pliego se mide como “% de horas de trabajo indisponibles” (≤10%)
  { id:'DIS_09', code:'DIS_09', title:'Indisponibilidad del servicio', unit:'%', target:10, monthly: genRange(29, 6.5, 0, 20, 1) }
]

// GES — (sin cambios explícitos en ANS; mantenemos tus valores)
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

// SEG — Gestión de seguridad (porcentuales según ANS)
const seg: Indicator[] = [
  { id:'SEG-01', code:'SEG-01', title:'% de vulnerabilidades críticas detectadas antes de producción', unit:'%', target:99, monthly: genRange(41, 99.4, 90, 100, 1) },
  { id:'SEG-02', code:'SEG-02', title:'% de vulnerabilidades no críticas detectadas antes de producción', unit:'%', target:95, monthly: genRange(42, 96.0, 85, 100, 1) },
  // “98% ≤ 8h”: medimos el % de incidentes resueltos en ≤ 8h
  { id:'SEG-03', code:'SEG-03', title:'% incidentes de seguridad resueltos en ≤ 8h (producción)', unit:'%', target:98, monthly: genRange(43, 98.5, 85, 100, 1) },
  { id:'SEG-04', code:'SEG-04', title:'% de no conformidades detectadas en auditorías ENS', unit:'%', target:5, monthly: genRange(44, 3.0, 0, 10, 1) },
  // “90% ≤ 3h”: % de no conformidades planificadas en ≤ 3h
  { id:'SEG-05', code:'SEG-05', title:'% de no conformidades ENS planificadas en ≤ 3h', unit:'%', target:90, monthly: genRange(45, 92.0, 70, 100, 1) }
]

// CAL — (sin cambios, fuera del bloque ANS aportado)
const cal: Indicator[] = [
  { id:'CAL-01', code:'CAL-01', title:'Cobertura pruebas unitarias', unit:'%', target:70, monthly: genRange(51, 68, 30, 100, 1) },
  { id:'CAL-02', code:'CAL-02', title:'Defectos producción', unit:'n/release', target:3, monthly: genRange(52, 2, 0, 8, 0) },
  { id:'CAL-03', code:'CAL-03', title:'Tiempo resolución defectos', unit:'h', target:48, monthly: genRange(53, 24, 1, 120, 0) },
  { id:'CAL-04', code:'CAL-04', title:'Código sin deuda técnica crítica', unit:'%', target:90, monthly: genRange(54, 88, 50, 100, 1) },
  { id:'CAL-05', code:'CAL-05', title:'Revisiones código completadas', unit:'%', target:100, monthly: genRange(55, 98, 60, 100, 1) },
  { id:'CAL-06', code:'CAL-06', title:'Cumplimiento estándares desarrollo', unit:'%', target:95, monthly: genRange(56, 94, 60, 100, 1) },
  { id:'CAL-07', code:'CAL-07', title:'Accesibilidad WCAG 2.1', unit:'%', target:100, monthly: genRange(57, 98, 60, 100, 1) }
]

// HOR — Indicadores existentes (sin objetivo numérico en ANS; se mantienen)
const hor: Indicator[] = [
  { id:'HOR-01', code:'HOR-01', title:'Tiempo de Evaluación', unit:'días', target:0, monthly: genRange(81, 5, 0, 30, 0) },
  { id:'HOR-02', code:'HOR-02', title:'Tiempo de Planificación', unit:'días', target:0, monthly: genRange(82, 10, 0, 60, 0) },
  { id:'HOR-03', code:'HOR-03', title:'Numero de Iteraciones en la Evaluación', unit:'n', target:0, monthly: genRange(83, 2, 0, 10, 0) },
  { id:'HOR-04', code:'HOR-04', title:'Número de Ajustes de la Planificación', unit:'n', target:0, monthly: genRange(84, 1, 0, 8, 0) },
  { id:'HOR-05', code:'HOR-05', title:'Retraso en la Ejecución respecto al plazo de Ejecución acordado', unit:'días', target:0, monthly: genRange(85, 3, 0, 30, 0) },
  { id:'HOR-06', code:'HOR-06', title:'Número de subsanaciones de errores sobre los resultados de la petición de servicio', unit:'n', target:0, monthly: genRange(86, 1, 0, 10, 0) }
]

// S2N — Indicadores existentes (sin objetivo numérico en ANS; se mantienen)
const s2n: Indicator[] = [
  { id:'S2N-01', code:'S2N-01', title:'Soporte 2N Nuevos por Periodo', unit:'n', target:0, monthly: genRange(91, 20, 0, 200, 0) },
  { id:'S2N-02', code:'S2N-02', title:'Soporte 2N Resueltos por Periodo', unit:'n', target:0, monthly: genRange(92, 18, 0, 200, 0) },
  { id:'S2N-03', code:'S2N-03', title:'Soporte 2N Demanda & Efectividad', unit:'%', target:0, monthly: genRange(93, 85, 40, 100, 1) },
  { id:'S2N-04', code:'S2N-04', title:'Soporte 2N En vuelo por Prioridad', unit:'n', target:0, monthly: genRange(94, 5, 0, 80, 0) },
  { id:'S2N-05', code:'S2N-05', title:'Soporte 2N En vuelo por Equipo asignado', unit:'n', target:0, monthly: genRange(95, 3, 0, 60, 0) },
  { id:'S2N-06', code:'S2N-06', title:'Soporte 2N Rezagados por Equipo asignado', unit:'n', target:0, monthly: genRange(96, 2, 0, 40, 0) }
]

// GIS — Datos espaciales (porcentuales según ANS)
const gis: Indicator[] = [
  { id:'GIS-01', code:'GIS-01', title:'Porcentaje de datos necesarios presentes en SIGC', unit:'%', target:95, monthly: genRange(101, 97, 80, 100, 1) },
  { id:'GIS-02', code:'GIS-02', title:'Nivel de calidad de los datos geoespaciales', unit:'%', target:95, monthly: genRange(102, 96, 80, 100, 1) },
  { id:'GIS-03', code:'GIS-03', title:'Existencia de metadatos para los conjuntos de datos espaciales', unit:'%', target:100, monthly: genRange(103, 100, 90, 100, 1) },
  { id:'GIS-04', code:'GIS-04', title:'Grado de conformidad de metadatos de conjuntos y servicios geoespaciales', unit:'%', target:95, monthly: genRange(104, 96, 80, 100, 1) },
  { id:'GIS-05', code:'GIS-05', title:'Porcentaje de datos actualizados', unit:'%', target:95, monthly: genRange(105, 96, 70, 100, 1) }
]

// AUT — Automatización (porcentuales según ANS)
const aut: Indicator[] = [
  { id:'AUT-01', code:'AUT-01', title:'Tasa de automatización de pruebas', unit:'%', target:95, monthly: genRange(111, 96, 80, 100, 1) },
  { id:'AUT-02', code:'AUT-02', title:'Tasa de éxito de la automatización', unit:'%', target:95, monthly: genRange(112, 96, 70, 100, 1) },
  { id:'AUT-03', code:'AUT-03', title:'Tasa de automatización de documentación', unit:'%', target:95, monthly: genRange(113, 96, 60, 100, 1) },
  { id:'AUT-04', code:'AUT-04', title:'Eficiencia de robots', unit:'%', target:60, monthly: genRange(114, 72, 40, 100, 1) },
  { id:'AUT-05', code:'AUT-05', title:'Reducción de errores por Automatización', unit:'%', target:95, monthly: genRange(115, 96, 70, 100, 1) }
]

// IND — Industrialización (según ANS)
const ind: Indicator[] = [
  { id:'IND-01', code:'IND-01', title:'Tasa de adopción de herramientas de DevOps', unit:'%', target:95, monthly: genRange(121, 96, 70, 100, 1) },
  { id:'IND-02', code:'IND-02', title:'Frecuencia de despliegues', unit:'n/mes', target:1, monthly: genRange(122, 6, 1, 24, 0) }
]

// --- Exported data structure ---
export type AnsData = {
  months: string[]
  niv: Indicator[]
  dis: Indicator[]
  ges: Indicator[]
  seg: Indicator[]
  cal: Indicator[]
  ons?: Indicator[]
  hor?: Indicator[]
  s2n?: Indicator[]
  gis?: Indicator[]
  aut?: Indicator[]
  ind?: Indicator[]
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

const ansData: AnsData = { months, niv, dis, ges, seg, cal, ons, hor, s2n, gis, aut, ind }

export default ansData
