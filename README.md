# Test Dashboard Oferta

Dashboard de ejemplo construido con React + TypeScript y Vite. Sirve como plantilla para visualizar indicadores operativos y de servicio (ANS, ONS, económico, etc.).

## Estructura del repositorio
- `src/` – código de la aplicación (componentes React, estilos CSS Modules, datos de ejemplo).
- `src/components/` – componentes UI (Sidebar, Card, Gauge, AnsDashboard, etc.).
- `src/data/` – módulos con datos sintéticos o reales (por ejemplo `ansData.ts`).
- `public/` – activos públicos y `CNAME` para GitHub Pages.
- `.github/workflows/` – workflow para build y deploy a GitHub Pages.

## Demo local (rápido)

1. Instala dependencias:

```bash
npm install
```

2. Ejecuta en modo desarrollo:

```bash
npm run dev
```

3. Compila para producción:

```bash
npm run build
```

## Tecnologías principales
- React 18 + TypeScript
- Vite (dev server + bundler)
- CSS Modules por componente
- No hay backend por defecto; los datos se sirven desde archivos TS en `src/data`.

## Estructura de datos
Los indicadores siguen una forma común (ver `src/data/ansData.ts`):

```ts
type Indicator = {
  id: string
  code: string
  title: string
  unit?: string
  target?: number
  monthly: Record<string, number>
}
```

- `monthly` usa etiquetas de mes como `'enero de 2026'`.
- `unit` puede ser `%`, `h`, `min`, `n` etc.

## Cómo cambiar los datos de los paneles
### Edición rápida (local)
- Abre `src/data/ansData.ts` y modifica los objetos `Indicator`. Los cambios se reflejan al recargar en `npm run dev`.

### Integración con API real
1. Crea un cliente API en `src/lib/api.ts`.
2. Modifica `src/components/Ans/AnsDashboard.tsx` para obtener datos con `useEffect` y `fetch` (o Axios).
3. Añade manejo de estado (loading / error) y caching si procede.

## Comportamiento importante ya implementado
- El tab `NIV` se muestra siempre primero en `AnsDashboard`.
- Las métricas con unidad `%` se claman a `100` en la UI (implementación en `AnsDashboard` para evitar >100%).
- Hay un sistema básico de eventos (analytics) que dispara `card_click` y `card_tooltip_show`.

## Analytics (visitas)
El repo incluye soporte opcional para analytics:

- `src/components/Analytics.tsx` inyecta scripts para GA4/Plausible/Umami en producción.
- `src/lib/analytics.ts` expone `trackEvent(name, props)` para enviar eventos desde componentes.

Cómo habilitarlo:
1. En tu proveedor de despliegue (Vercel/Netlify/GitHub Actions) establece variables de entorno:
   - `VITE_ANALYTICS_PROVIDER` = `ga4` | `plausible` | `umami`
   - `VITE_GA_MEASUREMENT_ID` = `G-XXXXXXX` (si usas GA4)
   - `VITE_PLAUSIBLE_DOMAIN` = `mi-dominio.com` (si usas Plausible)
   - `VITE_UMAMI_WEBSITE_ID` = `xxxxx` (si usas Umami)
2. El script se cargará automáticamente en producción. Para desarrollo no se inyecta.

> Nota: respeta la normativa de privacidad y añade un banner de consentimiento si es necesario.

## Despliegue
- GitHub Pages: hay un workflow en `.github/workflows/deploy-gh-pages.yml` que construye la app y publica `dist/`.
  - Asegúrate de añadir las variables `VITE_...` como secrets si las necesitas en build.
- Vercel/Netlify: despliegue directo desde el repo. Añade variables de entorno en el panel del proyecto.
- Cloudflare: puedes poner Cloudflare delante del dominio y usar sus servicios de DNS/SSL/analytics si prefieres no usar un proveedor de terceros para métricas.

## Recomendaciones para continuar el trabajo
- Separar la capa de datos (adapters) de la UI: crea `src/lib/adapters/ansAdapter.ts` que transforme la respuesta API a la estructura `Indicator`.
- Añadir tests:
  - Unit tests para `genRange` y `adjustToGoal`.
  - Tests de integración para `AnsDashboard` con datos mock.
- Mejoras de accesibilidad:
  - Añadir navegación por teclado en el tablist (arrow left/right).
  - Asociar `aria-controls` y paneles con `id` únicos.
- Observabilidad:
  - Extender `trackEvent` para más acciones (filtros, exports, page_view).
  - Añadir un panel admin que consulte Plausible/Umami para mostrar visitas.
- Seguridad:
  - Si los datos son sensibles, exponlos mediante endpoints protegidos y no directamente en el cliente.

## Cambios rápidos que puedes querer hacer ahora
- Añadir un nuevo indicador: agrega un objeto `Indicator` en la categoría correspondiente en `src/data/ansData.ts`.
- Forzar que el `NIV` esté siempre primero (ya implementado): esto se controla en `AnsDashboard.tsx`.
- Asegurar que métricas `%` no superen 100 (ya implementado): la lógica clampa a 100 en `AnsDashboard`.

## Archivos importantes
- `src/components/Ans/AnsDashboard.tsx` — pestañas, selección de mes y lógica de ajuste de métricas.
- `src/data/ansData.ts` — definiciones y series de indicadores.
- `src/components/Card.tsx` — visualización de métricas y tooltips.
- `src/lib/analytics.ts` y `src/components/Analytics.tsx` — integración de analytics.
- `.github/workflows/deploy-gh-pages.yml` — workflow para publicar a GitHub Pages.

## Tareas sugeridas (prioritarias)
1. Añadir tests unitarios (vitest/jest) para la lógica de datos.
2. Implementar un banner de consentimiento de cookies.
3. Preparar una pequeña API (serverless) para servir datos reales y sustituir `ansData.ts`.
4. Panel admin que muestre métricas de tráfico (Plausible/Umami) dentro del dashboard.

---

Si quieres, puedo:
- Añadir ejemplos de `fetch` en `AnsDashboard` para sustituir las fuentes locales por una API.
- Implementar el banner de consentimiento y lógica para no cargar analytics hasta que el usuario acepte.
- Crear tests básicos y añadir `vitest` al proyecto.

Dime qué prefieres y lo hago en el siguiente paso.
