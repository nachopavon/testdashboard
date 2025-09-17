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
  { id:'NIV-01', code:'NIV-01', title:'Incumplimiento de plazos de respuesta en servicios de prestación continua', unit:'n', target:0, monthly: genRange(11, 3, 0, 20, 0) },
  { id:'NIV-02', code:'NIV-02', title:'Grado de cumplimiento de la planificación en servicios planificados', unit:'%', target:100, monthly: genRange(12, 92, 50, 100, 1) },
  { id:'NIV-03', code:'NIV-03', title:'Grado de cumplimiento de tiempos de resolución a peticiones de servicios de soporte y consulta', unit:'%', target:95, monthly: genRange(13, 90, 50, 100, 1) },
  { id:'NIV-04', code:'NIV-04', title:'Grado de cumplimiento de plazos por proyecto', unit:'%', target:95, monthly: genRange(14, 88, 40, 100, 1) },
  { id:'NIV-05', code:'NIV-05', title:'Porcentaje de falsos defectos detectados en un servicio', unit:'%', target:0, monthly: genRange(15, 4, 0, 30, 1) },
  { id:'NIV-06', code:'NIV-06', title:'Número de defectos graves no detectados', unit:'n', target:0, monthly: genRange(16, 1, 0, 10, 0) },
  { id:'NIV-07', code:'NIV-07', title:'Número de defectos leves no detectados', unit:'n', target:0, monthly: genRange(17, 5, 0, 30, 0) },
  { id:'NIV-08', code:'NIV-08', title:'Grado de implantaciones fallidas con marcha atrás', unit:'%', target:0, monthly: genRange(18, 1.2, 0, 10, 1) },
  { id:'NIV-09', code:'NIV-09', title:'Indicador de rotación del equipo (trimestral)', unit:'%', target:0, monthly: genRange(19, 2.5, 0, 10, 1) }
]

const dis: Indicator[] = [
  { id:'DIS_01', code:'DIS_01', title:'Plazo de inicio', unit:'días', target:0, monthly: genRange(21, 7, 0, 30, 0) },
  { id:'DIS_02', code:'DIS_02', title:'Plazo de adquisición', unit:'días', target:0, monthly: genRange(22, 15, 0, 60, 0) },
  { id:'DIS_03', code:'DIS_03', title:'Preaviso de baja en el equipo de trabajo', unit:'días', target:0, monthly: genRange(23, 30, 0, 120, 0) },
  { id:'DIS_04', code:'DIS_04', title:'Plazo de sustitución a petición del adjudicatario', unit:'días', target:0, monthly: genRange(24, 5, 0, 30, 0) },
  { id:'DIS_05', code:'DIS_05', title:'Plazo de sustitución a petición de la dirección técnica', unit:'días', target:0, monthly: genRange(25, 3, 0, 20, 0) },
  { id:'DIS_06', code:'DIS_06', title:'Número de sustituciones', unit:'n', target:0, monthly: genRange(26, 2, 0, 20, 0) },
  { id:'DIS_07', code:'DIS_07', title:'Plazo de incorporación de técnicos adicionales', unit:'días', target:0, monthly: genRange(27, 14, 0, 60, 0) },
  { id:'DIS_08', code:'DIS_08', title:'Plazo de salida de técnicos', unit:'días', target:0, monthly: genRange(28, 7, 0, 60, 0) },
  { id:'DIS_09', code:'DIS_09', title:'Indisponibilidad del servicio', unit:'h', target:0, monthly: genRange(29, 2, 0, 48, 0) }
]

// Keep GES as-is (Gestión existía previamente)
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
  { id:'SEG-01', code:'SEG-01', title:'Número de vulnerabilidades críticas de seguridad detectadas previas al entorno de producción', unit:'n', target:0, monthly: genRange(41, 0.5, 0, 5, 0) },
  { id:'SEG-02', code:'SEG-02', title:'Número de vulnerabilidades no críticas de seguridad detectadas previas al entorno de producción', unit:'n', target:0, monthly: genRange(42, 2, 0, 15, 0) },
  { id:'SEG-03', code:'SEG-03', title:'Tiempo de resolución de incidentes relacionados con la seguridad en producción', unit:'h', target:24, monthly: genRange(43, 12, 1, 72, 0) },
  { id:'SEG-04', code:'SEG-04', title:'Número de no conformidades detectadas en auditorías del ENS', unit:'n', target:0, monthly: genRange(44, 0.2, 0, 5, 0) },
  { id:'SEG-05', code:'SEG-05', title:'Tiempo de planificación de no conformidades resueltas en auditorías del ENS', unit:'días', target:0, monthly: genRange(45, 30, 0, 180, 0) }
]

// Keep CAL/INN/VAL as before
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

// New categories per user request
const hor: Indicator[] = [
  { id:'HOR-01', code:'HOR-01', title:'Tiempo de Evaluación', unit:'días', target:0, monthly: genRange(81, 5, 0, 30, 0) },
  { id:'HOR-02', code:'HOR-02', title:'Tiempo de Planificación', unit:'días', target:0, monthly: genRange(82, 10, 0, 60, 0) },
  { id:'HOR-03', code:'HOR-03', title:'Numero de Iteraciones en la Evaluación', unit:'n', target:0, monthly: genRange(83, 2, 0, 10, 0) },
  { id:'HOR-04', code:'HOR-04', title:'Número de Ajustes de la Planificación', unit:'n', target:0, monthly: genRange(84, 1, 0, 8, 0) },
  { id:'HOR-05', code:'HOR-05', title:'Retraso en la Ejecución respecto al plazo de Ejecución acordado', unit:'días', target:0, monthly: genRange(85, 3, 0, 30, 0) },
  { id:'HOR-06', code:'HOR-06', title:'Número de subsanaciones de errores sobre los resultados de la petición de servicio', unit:'n', target:0, monthly: genRange(86, 1, 0, 10, 0) }
]

const s2n: Indicator[] = [
  { id:'S2N-01', code:'S2N-01', title:'Soporte 2N Nuevos por Periodo', unit:'n', target:0, monthly: genRange(91, 20, 0, 200, 0) },
  { id:'S2N-02', code:'S2N-02', title:'Soporte 2N Resueltos por Periodo', unit:'n', target:0, monthly: genRange(92, 18, 0, 200, 0) },
  { id:'S2N-03', code:'S2N-03', title:'Soporte 2N Demanda & Efectividad', unit:'%', target:0, monthly: genRange(93, 85, 40, 100, 1) },
  { id:'S2N-04', code:'S2N-04', title:'Soporte 2N En vuelo por Prioridad', unit:'n', target:0, monthly: genRange(94, 5, 0, 80, 0) },
  { id:'S2N-05', code:'S2N-05', title:'Soporte 2N En vuelo por Equipo asignado', unit:'n', target:0, monthly: genRange(95, 3, 0, 60, 0) },
  { id:'S2N-06', code:'S2N-06', title:'Soporte 2N Rezagados por Equipo asignado', unit:'n', target:0, monthly: genRange(96, 2, 0, 40, 0) }
]

const gis: Indicator[] = [
  { id:'GIS-01', code:'GIS-01', title:'Porcentaje de datos necesarios que están presentes en la base de datos SIGC', unit:'%', target:100, monthly: genRange(101, 88, 40, 100, 1) },
  { id:'GIS-02', code:'GIS-02', title:'Nivel de calidad de los datos geoespaciales', unit:'%', target:100, monthly: genRange(102, 85, 40, 100, 1) },
  { id:'GIS-03', code:'GIS-03', title:'Existencia de metadatos para los conjuntos de datos espaciales', unit:'%', target:100, monthly: genRange(103, 90, 40, 100, 1) },
  { id:'GIS-04', code:'GIS-04', title:'Grado de conformidad de los metadatos para los conjuntos y los servicios de datos geoespaciales', unit:'%', target:100, monthly: genRange(104, 88, 40, 100, 1) },
  { id:'GIS-05', code:'GIS-05', title:'Porcentaje de datos actualizados', unit:'%', target:100, monthly: genRange(105, 75, 20, 100, 1) }
]

const aut: Indicator[] = [
  { id:'AUT-01', code:'AUT-01', title:'Tasa de automatización de pruebas', unit:'%', target:0, monthly: genRange(111, 40, 0, 100, 1) },
  { id:'AUT-02', code:'AUT-02', title:'Tasa de éxito de la automatización', unit:'%', target:0, monthly: genRange(112, 85, 0, 100, 1) },
  { id:'AUT-03', code:'AUT-03', title:'Tasa de automatización de documentación', unit:'%', target:0, monthly: genRange(113, 30, 0, 100, 1) },
  { id:'AUT-04', code:'AUT-04', title:'Eficiencia de robots', unit:'%', target:0, monthly: genRange(114, 60, 0, 100, 1) },
  { id:'AUT-05', code:'AUT-05', title:'Reducción de errores por Automatización', unit:'%', target:0, monthly: genRange(115, 25, 0, 100, 1) }
]

const ind: Indicator[] = [
  { id:'IND-01', code:'IND-01', title:'Tasa de adopción de herramientas de DevOps', unit:'%', target:0, monthly: genRange(121, 50, 0, 100, 1) },
  { id:'IND-02', code:'IND-02', title:'Frecuencia de despliegues', unit:'n/mes', target:0, monthly: genRange(122, 8, 0, 30, 0) }
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

const ansData: AnsData = { months, niv, dis, ges, seg, cal, inn, val, ons, hor, s2n, gis, aut, ind }

export default ansData
