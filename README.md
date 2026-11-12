# DEADLINE — Timeless Crime Archive

Aplicación detectivesca premium para iPhone (PWA, orientación horizontal).
El jugador investiga expedientes criminales de todas las épocas: lee, examina
evidencias, interroga, reconstruye la cronología, conecta pistas en el tablero
y formula una acusación.

> Estado: **Etapa 1 — Arquitectura y estructura** (ver [`docs/STATUS.md`](docs/STATUS.md)).

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

## Probar en un iPhone

1. `npm run build && npm run preview` en un equipo de la misma red.
2. En el iPhone, abrir `http://<ip-del-equipo>:4173` en Safari.
3. Compartir → *Añadir a pantalla de inicio* y abrir desde el icono.
4. Ir a *Diagnóstico técnico del dispositivo* y anotar los valores.

Nota: el service worker solo funciona en `localhost` o con HTTPS. Para probar
el modo offline en un iPhone hace falta servir la build por HTTPS (p. ej. un
despliegue de previsualización). Ver [`docs/IOS_PWA.md`](docs/IOS_PWA.md).

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Backend: comparativa y propuesta](docs/BACKEND.md)
- [Formato de expedientes](docs/CASE_FORMAT.md)
- [Limitaciones de iOS PWA](docs/IOS_PWA.md)
- [Registro de decisiones](docs/DECISIONS.md)
- [Estado del proyecto](docs/STATUS.md)
