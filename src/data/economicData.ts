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

  // Generar 55 requisitos realistas para mantenimiento y desarrollo
  const templates = [
    'Soporte operativo 24/7: atención y resolución de incidentes críticos',
    'Mantenimiento correctivo: resolución de fallos y parches urgentes',
    'Mantenimiento evolutivo: cambios menores y mejoras continuas',
    'Desarrollo de nuevas funcionalidades según roadmap',
    'Gestión de despliegues y versionado (CI/CD)',
    'Monitorización, alertas y operaciones (SRE/ops)',
    'Documentación, capacitación y transferencia de conocimiento',
    'Pruebas, QA y automatización de regresión',
    'Integración con sistemas externos (catastro, padrón)',
    'Optimización y refactorización de módulos legacy',
    'Adaptación a normativa de accesibilidad y privacidad',
    'Automatización de procesos batch y migración de datos',
    'Implementación de cache y mejoras de rendimiento',
    'Implementación de API para intercambio con terceros',
    'Reportes KPI y cuadros de mando para seguimiento',
    'Gestión de backups y recuperación ante desastres',
    'Soporte en pruebas de aceptación (UAT) y homologación',
    'Formación y talleres para equipos internos',
    'Seguridad: corrección de vulnerabilidades y hardening',
    'Integración con sede electrónica y firma digital',
    'Desarrollo de asistente de entrada de datos y formularios',
    'Mejora en gestión documental y almacenamiento',
    'Ajustes de permisos y control de accesos por rol',
    'Automatización de generación de certificados y credenciales',
    'Implementación de notificaciones y sistema de alertas',
    'Soporte en despliegues multi-entorno',
    'Análisis y corrección de inconsistencias en datos históricos',
    'Optimización de consultas y tiempos de respuesta',
    'Análisis de seguridad y pruebas de penetración',
    'Evolutivos para cumplimiento normativo',
    'Desarrollo de integraciones móviles/UX responsive',
    'Migración a nuevas versiones de frameworks',
    'Asesoría técnica y revisión arquitectónica',
    'Configuración y ajustes de monitorización de infra',
    'Soporte remoto en ventanas de mantenimiento',
    'Consolidación de logs y trazabilidad',
    'Refactor y modularización para mantenibilidad',
    'Implementación de pruebas de carga y escalado',
    'Generación de informes ad-hoc para dirección',
    'Mejora en accesibilidad y localización',
    'Gestión de incidencias y seguimiento SLA',
    'Implementación de analítica y telemetría',
    'Adaptación de exportes e informes a nuevos formatos',
    'Homologación con proveedores y APIs externas',
    'Soporte en integración con pasarelas de pago',
    'Mecanismos de auditoría y cumplimiento legal',
    'Mejoras en encriptación y gestión de claves',
    'Monitorización de costes y optimización cloud',
    'Desarrollo de herramientas internas para productividad'
  ]

  const requisites: Requisite[] = Array.from({length:55}, (_,i)=>{
    const code = `REQ.${String(i+1).padStart(2,'0')}`
    const template = templates[i % templates.length]
    const description = `${template} - alcance estimado para el año ${y}`
    const factor = 1000 + (i % 11) * 250 + yi * 4000
    const facturacion = Math.round(base(i) * (1 + (i % 7) * 0.02) + factor)
    const estimacion = Math.round(facturacion * (1 + 0.12 + (i % 5) * 0.02))
    return { code, description, facturacion, estimacion }
  })

  data[yearKey] = { monthlyFacturacion, monthlyEstimacion, facturacion, estimacion, requisites }
})

export default { years, data }
