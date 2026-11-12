# Registro de decisiones

Formato: contexto → decisión → consecuencias. Las marcadas **(pendiente de
confirmar)** necesitan tu visto bueno antes de su etapa.

### D-001 · Monorepo con núcleo compartido
Cliente y servidor deben aplicar las mismas reglas (tiempo, diarios,
condiciones, puntos). → npm workspaces con `@deadline/core` (TS puro, sin
dependencias de navegador) y `apps/web`. El servidor se añadirá como `apps/server`.

### D-002 · React 19 + TypeScript estricto + Vite 8 + vite-plugin-pwa
Stack pedido; versiones estables actuales. TypeScript 7 (compilador nativo).
Consecuencia: `typescript-eslint` aún no soporta TS 7, así que **no hay
ESLint** por ahora; la calidad se apoya en `tsc` estricto
(`noUncheckedIndexedAccess`, `verbatimModuleSyntax`…) y en pruebas.

### D-003 · Estilos: CSS Modules + tokens globales
Sin framework de utilidades: la identidad visual (papel, madera, sellos,
luz) necesita CSS propio. Tokens en `styles/tokens.css`; las preferencias
del usuario (escala de texto, luz, movimiento) se aplican como variables CSS.

### D-004 · Tipografías autoalojadas
Cormorant Garamond (titulares), Courier Prime (documentos mecanografiados),
IBM Plex Sans Condensed (controles, cabe bien en horizontal), Caveat
(anotaciones a mano). Vía `@fontsource`, solo subconjunto latino, precacheadas
para offline. Sin peticiones a terceros.

### D-005 · Contenido como datos + lenguaje de condiciones
Los casos son JSON validados con zod; la lógica dependiente del conocimiento
del jugador se expresa con condiciones/efectos declarativos. Permite validar
estáticamente y simular la resolubilidad de cada caso.

### D-006 · Tiempo dentro de la ficción en minutos relativos al incidente
Funciona igual en el año 64 que en 2096 y evita problemas de calendarios
antiguos. Cada evento lleva además un texto de época.

### D-007 · Acusación con hipótesis de motivo y método que se desbloquean
Para evaluar por criterios (no por texto libre) sin convertirlo en un test
de opciones: las hipótesis aparecen cuando el jugador tiene base para
formularlas, e incluyen hipótesis plausibles pero erróneas. La prueba
definitiva es una evidencia que el jugador ha obtenido.

### D-008 · Cronómetro por marcas de tiempo absolutas
`deadlineAt` fijo; restante = `deadlineAt − ahora`; `lastObservedAt` impide
"devolver" tiempo retrasando el reloj; desfase con servidor estimado tipo NTP.
En cooperativo el servidor fija `startedAt` y `deadlineAt`.

### D-009 · Diarios por día civil local + reconciliación con servidor
Índice = días civiles desde el inicio del calendario (aritmética UTC sobre
Y-M-D, inmune al horario de verano). Nunca se re-bloquea un diario. El
servidor recorta desbloqueos por encima del día civil de UTC+14 en su
instante (máximo legítimo en cualquier huso). La fecha de inicio del
calendario se fijará al lanzar.

### D-010 · IndexedDB para datos, Cache Storage para recursos
Ver `docs/ARCHITECTURE.md`. Verificación por bytes + SHA-256 antes de marcar
un caso como offline.

### D-011 · Actualizaciones de la app a elección del usuario
`registerType: 'prompt'`: nunca se recarga la app en mitad de una
investigación.

### D-012 · Backend propio TS + PostgreSQL — **SUSTITUIDA por D-016**
Propuesta archivada en `docs/BACKEND.md` para una posible versión futura.

### D-013 · "Precargados" para los 500 diarios — **resuelta por D-016/D-018**
Interpretación propuesta: los 500 diarios están escritos, validados y
publicados de antemano en paquetes de contenido; la app descarga el texto
de los próximos días por adelantado (p. ej. 30 días) para que el desbloqueo
diario no necesite conexión, y las imágenes por caso. Incluir los 500
completos con imágenes dentro de la app ocuparía cientos de MB y iOS podría
desalojarlos. Nada se genera a diario.

### D-014 · Soluciones en el dispositivo **(a decidir en Etapa 3)**
Actualización (D-016): sin servidor no hay revalidación ni custodia de
soluciones cooperativas. Se mantiene la idea de guardar la solución como
resúmenes con sal para que no se lea por accidente; leer el código publicado
seguirá siendo posible para quien lo busque.

El modo individual offline necesita evaluar la acusación sin servidor, así
que la solución debe estar en el dispositivo. Propuesta: guardar la
solución como resúmenes con sal (el cliente comprueba sin leerla en claro),
el servidor revalida al sincronizar (es quien concede puntos), y en
cooperativo la solución **nunca** llega al cliente antes de acusar. Leer el
JSON solo permitiría hacerse trampas a uno mismo; la clasificación es entre
amigos.

### D-015 · Dificultad en el catálogo pero oculta antes de abrir
El filtro "Dificultad" del archivo solo actúa sobre casos ya abiertos o
resueltos, para respetar que la dificultad no se muestra antes de empezar.

---

## Estrategia local-first (cambio de producto)

### D-016 · Primera versión sin servidor ni costes recurrentes
Requisito del producto: compartir DEADLINE con un grupo reducido sin pagar
infraestructura. → Aplicación estática local-first: todo el estado en
IndexedDB, sin cuentas, sin servidor, sin servicios externos. Detalle y
limitaciones en `LOCAL_FIRST.md`.

### D-017 · Distribución por GitHub Pages con GitHub Actions
Repositorio público → Pages gratuito, HTTPS incluido, actualizaciones con
cada publicación. Compilación con `DEADLINE_BASE=/Deadline/` y `404.html`
como respaldo de rutas. Ver `DISTRIBUTION.md`. Riesgo principal: el límite
de ≈ 1 GB del sitio frente a 3 000 casos con imágenes.

### D-018 · Calendario diario por jugador
El día 1 de cada jugador es el de su primer arranque (no hay fecha común
sin servidor). El registro vive en IndexedDB y viaja con las copias.

### D-019 · Perfil local
Número de investigador `DL-00000-X` generado en el dispositivo con letra de
control (detecta erratas al copiarlo). Alias opcional para el cooperativo.
Sin contraseñas: no hay nada que proteger en un servidor.

### D-020 · Copias de seguridad exportables
Archivo JSON versionado con SHA-256; importar con fusión (sin duplicar
recompensas) o reemplazo. Se prepara de antemano para que iOS permita abrir
la hoja de compartir dentro del gesto del usuario.

### D-021 · Cooperativo sin servidor: mesa compartida y correspondencia
Ver `COOP.md`. No se simula tiempo real.

### D-022 · Sonido sintetizado en el dispositivo
Efectos (papel, teclas, timbre, interruptor, sello) y ambientes (lluvia,
ciudad de noche) generados con Web Audio: sin archivos, sin descargas ni
licencias. La música por época queda para cuando haya piezas; mientras,
no hay control de música (no se muestra un control sin efecto).

### D-023 · Hápticos como mejora progresiva
Vibration API donde existe; en iOS 18+ el "tic" del interruptor del sistema
(`<input type="checkbox" switch>`). Sin soporte, silencio. [verificar en iPhone]

### D-024 · La mesa se dibuja con código, no con imágenes
Objetos en SVG/CSS y madera generada en un `<canvas>` del dispositivo:
nítidos en cualquier pantalla, personalizables por material y casi sin peso
de descarga (importante para el límite de tamaño de GitHub Pages).

### D-025 · No pintar hasta leer los ajustes
La app espera a leer los ajustes de IndexedDB (milisegundos) antes de pintar,
para que la mesa no aparezca un instante con valores por defecto.

### D-026 · Ambiente "radio" retirado del esquema de ajustes
Se eliminó la opción `radio` (no publicada) porque no hay forma de
sintetizarla con calidad; los ajustes antiguos se normalizan solos.
