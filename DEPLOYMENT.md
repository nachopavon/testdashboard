# Despliegue y Analytics

Instrucciones para desplegar con dominio propio y habilitar analítica.

## Activar el componente Analytics

Este repo incluye `src/components/Analytics.tsx` que puede cargar GA4, Plausible o Umami en producción.

Variables de entorno (en su proveedor de hosting):

- `VITE_ANALYTICS_PROVIDER`: `ga4` | `plausible` | `umami`
- `VITE_GA_MEASUREMENT_ID`: p. ej. `G-XXXXXXX` (para GA4)
- `VITE_PLAUSIBLE_DOMAIN`: dominio registrado en Plausible
- `VITE_UMAMI_WEBSITE_ID`: id del sitio en Umami

El script se monta sólo en producción (`import.meta.env.PROD`).

## Despliegue con dominio personalizado

- GitHub Pages: coloca tu dominio en `public/CNAME` y activa Pages desde la rama `main`.
- Vercel/Netlify: configura dominio en el panel, apunta el DNS (Cloudflare o registrar) y añade variables de entorno.

## Opciones de analítica

- GA4: integrado mediante `VITE_GA_MEASUREMENT_ID`.
- Plausible: ligero y respetuoso con la privacidad.
- Umami: self-hosted, requiere servidor.

## Siguientes mejoras posibles

- Enviar eventos desde `Card` y otros componentes al provider seleccionado.
- Implementar un panel admin que use la API de Plausible/Umami para mostrar visitas.
- Añadir `NO_TRACK` para respetar modos de privacidad.
