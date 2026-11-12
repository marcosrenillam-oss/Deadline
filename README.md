# DEADLINE — Timeless Crime Archive

Aplicación detectivesca premium para iPhone (PWA, orientación horizontal).
El jugador investiga expedientes criminales de todas las épocas: lee, examina
evidencias, interroga, reconstruye la cronología, conecta pistas en el tablero
y formula una acusación.

> Estado: **Etapa 2 — The Detective's Desk** completada (ver [`docs/STATUS.md`](docs/STATUS.md)).
>
> Versión **local-first**: sin servidor, sin cuentas y sin costes
> recurrentes. Se publica gratis en GitHub Pages y todo el progreso vive en
> el dispositivo, con copias exportables. Ver [`docs/LOCAL_FIRST.md`](docs/LOCAL_FIRST.md).

## Estructura

```
packages/core   Modelo de datos, lenguaje de condiciones, validador de
                expedientes y reglas puras (cronómetro, diarios, rangos,
                puntos, sincronización). Compartido por cliente y servidor.
apps/web        PWA React + TypeScript + Vite.
content/cases   Expedientes (un directorio por caso: case.json + recursos).
scripts         Herramientas (generación de iconos…).
docs            Arquitectura, decisiones, formato de casos, notas iOS, estado.
```

## Comandos

```bash
npm install
npm run dev               # servidor de desarrollo (http://localhost:5173, accesible en la red local)
npm run typecheck         # TypeScript estricto en todos los paquetes
npm test                  # pruebas unitarias (core + web)
npm run build             # build de producción + service worker
npm run test:e2e          # prueba de humo en Chromium emulando iPhone 15 (requiere build)
npm run validate:content  # valida todos los expedientes de content/cases
npm run icons             # regenera los iconos PWA
```

Requiere Node 22+.

## Publicar y probar en un iPhone

La forma recomendada es GitHub Pages (gratuito, HTTPS): ver
[`docs/DISTRIBUTION.md`](docs/DISTRIBUTION.md). Una vez publicado:

1. En el iPhone, abrir `https://marcosrenillam-oss.github.io/Deadline/` en Safari.
2. Compartir → *Añadir a pantalla de inicio* y abrir desde el icono.
3. Lámpara → Archivo personal: exportar una copia de vez en cuando.
4. `/Deadline/diagnostico` muestra el diagnóstico técnico del dispositivo.

Para pruebas rápidas en la red local: `npm run build && npm run preview` y
abrir `http://<ip-del-equipo>:4173` (sin HTTPS no hay modo offline).

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Local-first: qué cambió y limitaciones](docs/LOCAL_FIRST.md)
- [Distribución gratuita (GitHub Pages)](docs/DISTRIBUTION.md)
- [Cooperativo sin servidor](docs/COOP.md)
- [Backend (propuesta archivada)](docs/BACKEND.md)
- [Formato de expedientes](docs/CASE_FORMAT.md)
- [Limitaciones de iOS PWA](docs/IOS_PWA.md)
- [Registro de decisiones](docs/DECISIONS.md)
- [Estado del proyecto](docs/STATUS.md)
