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

---

## Etapa 3 · Motor de expedientes

### D-027 · Expedientes escritos en TypeScript y compilados a JSON
`case.ts` se comprueba con el compilador mientras se escribe (autocompletado
de campos, errores de forma al momento) y `scripts/build-content.ts` lo
convierte en `case.json`, calcula huellas de los recursos y valida. El
contenido sigue siendo datos: no hay lógica de caso en código.

### D-028 · Motor puro y separado de la interfaz
`packages/core/src/engine`: examinar, advertir detalles, preguntar,
relacionar piezas, señalar contradicciones, pedir pistas, acusar, cerrar por
tiempo. Funciones puras probadas sin navegador; la interfaz solo las invoca.

### D-029 · Pruebas visuales dibujadas como lo haría la policía
Sin presupuesto de arte, las evidencias gráficas del primer caso son
piezas que en la ficción también son dibujos o esquemas: un croquis
policial y una hoja de contactos con fotogramas esquemáticos, generados por
código (SVG, pocos KB). Los retratos son siluetas de ficha generadas por
código y lo dicen: no fingen ser fotografías. La producción de retratos e
imágenes realistas queda para la Etapa 8 (ver STATUS).

### D-030 · Relacionar piezas
Una deducción se reconoce si las piezas elegidas incluyen todas las suyas y
sobra como mucho una. Así no hace falta acertar la combinación exacta, pero
seleccionarlo todo no funciona.

### D-031 · La acusación puntúa una vez por expediente
Los puntos de acusación y de descubrimientos se cobran solo la primera vez
(`rewardedKeys`). Repetir un caso resuelto no suma; perder no impide cobrar
más tarde lo que no se cobró.

### D-032 · Cronología con versiones falsas
Las declaraciones de los sospechosos generan fichas de cronología que pueden
ser falsas. Si el jugador las coloca sin marcarlas como dudosas, restan
precisión. La hora de cada ficha es visible: la dificultad está en saber
qué es cierto, no en adivinar el orden.

### D-033 · Navegación del expediente como separadores de archivador
Carril izquierdo con las cinco secciones, libreta, contradicción, pistas y
acusación siempre a mano; reloj arriba. Sin cabecera convencional. Cabe en
un iPhone en horizontal con objetivos táctiles de 44 pt.

---

## Etapa 4 · Cronómetros, reapertura y offline

### D-034 · Tapar no es pausar
El reloj se puede tapar (tocándolo) para ocultar el expediente, pero nunca
se detiene: así lo pide el diseño y así se le dice al jugador.

### D-035 · Lo descubierto se cobra también al agotarse el tiempo
Antes, cerrar por tiempo daba 0 puntos. Ahora se cobran los descubrimientos
(una sola vez), nunca la acusación. Motivo: sin esto, un jugador que agota
el tiempo en su primer caso no podría pagar nunca una reapertura.

### D-036 · Qué conserva una reapertura
Evidencias, detalles, hechos, fichas de cronología, deducciones, tablero,
cronología del jugador y notas. Se reinician preguntas, contradicciones,
secretos y marcas: hay que volver a interrogar. Encaja con «se mantienen
las evidencias y notas» sin regalar la resolución.

### D-037 · Descargas con verificación y caché compartida
El gestor de descargas escribe en la misma Cache Storage que consulta el
service worker (CacheFirst para recursos, NetworkFirst para JSON). Las URLs
de recursos llevan la huella del contenido (`?v=`) para que una corrección
publicada no conviva con una copia antigua. El armazón de la app no
precachea `content/`.

### D-038 · Precarga de diarios
Se descargan por adelantado los diarios de los próximos 7 días cuando hay
conexión, de modo que el desbloqueo diario no depende de tenerla.

---

## Etapas 5 y 6 · Perfil local y cooperativo sin servidor

### D-039 · La placa de la mesa abre la ficha del investigador
El perfil no tenía objeto propio en la mesa; la placa de latón con el rango
y el número es su sitio natural.

### D-040 · Retrato: silueta o foto, siempre local
La foto se recorta y reduce en el dispositivo (240 × 288, JPEG) y se
muestra virada al tono del archivo. No sale del dispositivo salvo en las
copias que exporte el jugador.

### D-041 · Compartir es explícito y por categorías
En el cooperativo nada se sincroniza solo: cada jugador decide qué pone
sobre la mesa o qué incluye en un informe. Es lo que da sentido a la
información dividida y evita que el reparto sea decorativo.

### D-042 · Formato DL1 con firma de partida
Los códigos se comprimen y se firman con una clave aleatoria de 256 bits
que viaja en la invitación. La firma detecta mezclas de partidas y errores
al copiar; no protege frente a quien tenga la invitación (no se pretende).

### D-043 · El reloj de la pareja empieza cuando el invitado dice «Preparado»
El anfitrión alinea su reloj al importar el código de aceptación. Así ambos
tienen el mismo límite sin servidor, a costa de que el anfitrión pierda el
tiempo que tarde en recibir el código.

### D-044 · Mesa compartida: se puntúa una vez, con lo que sabe el equipo
Las dos carpetas se cierran con la misma acusación, pero los puntos se
calculan una sola vez sobre el conocimiento unido, para no duplicar mérito
en el mismo perfil.

### D-045 · Una acción propia nunca entrega una pieza del compañero
En información dividida, si una pregunta o un detalle de A desbloquearía una
evidencia de B, A no la recibe: tendrá que pedírsela. El contenido debe
diseñarse con esto en cuenta; el validador avisa si un papel puede resolver
solo.

---

## Etapa 7 · Progresión y personalización

### D-046 · La primera reapertura de cada expediente es gratuita
Decisión del usuario para evitar que alguien sin puntos quede atascado. Las
siguientes reaperturas cuestan 150 / 300 / 500 según dificultad. Se guarda
el contador `reopens` en el registro del caso (al fusionar copias gana el
mayor). Se mantiene D-035 (lo descubierto se cobra al agotarse el tiempo),
también por decisión del usuario.

### D-047 · Estadísticas calculadas, nunca acumuladas
Se recalculan a partir de investigaciones y registros guardados. No pueden
desincronizarse y una copia importada las recompone sola. En la mesa
compartida se cuenta una vez por partida (`coopSessionId`).

### D-048 · Los rangos usan todos sus criterios
Antes la placa solo miraba el mérito. Ahora cuentan mérito, actas
impecables, precisión del culpable en las últimas 20 acusaciones y casos
resueltos por dificultad, tal como se definieron en la Etapa 1. La ficha
muestra cuánto falta en cada criterio.

### D-049 · Los logros dan puntos gastables, no mérito
El mérito (y por tanto el rango) solo sale de resolver casos. Los premios
de logros van al saldo, que se gasta en reabrir casos y en piezas de la
oficina. 28 logros, 5 de ellos secretos (no muestran nombre ni condición).

### D-050 · Piezas de oficina: puntos, logros o rangos
Las de puntos se compran (Lámpara → Oficina, transacción atómica); las de
logros y rangos se conceden solas al conseguirlos. Las bloqueadas se ven
con su condición; nunca se pueden equipar.

### D-051 · Clasificación solo entre amigos, por tarjetas
Sin servidor no hay clasificación global ni verificable. Cada fila es la
última tarjeta de investigador que te pasaron (código DL1); se sustituye
solo por una más reciente, la tuya no se puede añadir y la pantalla dice
que son datos declarados. Viaja en las copias de seguridad.

### D-052 · Avisos de progresión en una sola capa
Logros, ascensos y piezas nuevas se anuncian con una tira mecanografiada
en la parte superior, sea cual sea la pantalla, de una en una; se retiran
solas a los 5 s y no interceptan toques (nunca tapan un botón del juego;
todo queda consultable en la máquina de escribir). Al arrancar se reevalúan los logros globales (útil tras
importar una copia); los de cierre (detalles, contradicciones, preguntas)
solo al cerrar, porque necesitan el expediente.

### D-053 · Carga diferida por pantallas
La mesa va en el paquete inicial; el resto de pantallas se descargan al
abrirlas y el service worker las precachea. El JS inicial pasa de 199 KB a
~166 KB comprimidos.

---

## Etapa 8 · Contenido, optimización y publicación

### D-054 · Contenido: calidad por encima de cantidad
El objetivo final (2000 individuales, 500 diarios, 500 cooperativos) no se
genera de golpe, como pedía el encargo. En esta etapa se añaden dos
expedientes completos y probados (diario nº 2 y el primer cooperativo de
expediente compartido) y se deja documentado el proceso para producir el
resto por tandas (`docs/CONTENT_PIPELINE.md`). Cada expediente nuevo debe
pasar el validador y tener una prueba de partida completa.

### D-055 · Siluetas fijadas por el autor
Mientras no haya retratos ilustrados, cada personaje lleva un campo
opcional `look` (pelo, gafas, barba) que fija su silueta. Antes salía de un
hash del id y podía dar siluetas incoherentes con el personaje.

### D-056 · Expediente compartido en un solo iPhone: entrega en mano
En la mesa compartida sin papeles, quien propone la acusación no puede
firmarla: la pantalla pide pasar el iPhone y que el compañero la revise y
la firme o la rechace. No se puede verificar quién toca la pantalla (igual
que en el pase de turno); el paso existe para que la firma sea un acto del
otro jugador.

### D-057 · Pantallas de arranque en JPEG y fuera del precache
11 tamaños de iPhone en horizontal, generados con `npm run splash`. En PNG
ocupaban 6,5 MB por los degradados; en JPEG, 460 KB. iOS las descarga al
instalar la app, así que no se precachean.

### D-058 · Publicación desde `main`
El entorno `github-pages` rechazó desplegar desde la rama de desarrollo.
Por decisión del usuario se publica desde `main`: el trabajo se hace en la
rama de desarrollo y cada versión verificada se sube también a `main`, lo
que dispara la publicación automática (compilación, pruebas y despliegue).

### D-059 · Las actualizaciones se instalan solas
Por petición del usuario, una edición nueva publicada se instala sin
preguntar. Para no interrumpir una investigación, si el jugador está
dentro de un expediente se espera a que vuelva a la mesa (un aviso breve
lo indica). La app busca ediciones nuevas al volver a primer plano y cada
media hora, porque iOS apenas lo hace en una app instalada. Sustituye al
aviso con «Actualizar / Más tarde».

---

## Rediseño visual (Visual Masterplan)

### D-060 · Todo el archivo se guarda solo en el dispositivo
Petición del usuario: ningún expediente se descarga a mano. Al arrancar, al
volver la conexión, al volver a la app y tras cada actualización se
descargan y verifican (SHA-256) todos los expedientes del catálogo, los
diarios próximos primero. Si iOS borra algo, se detecta y se vuelve a
guardar solo. Desaparecen los botones de descarga; solo queda el estado.
Con 3000 casos el archivo completo rondará los cientos de MB: habrá que
vigilar el límite de almacenamiento de Safari cuando el catálogo crezca.

### D-061 · El despacho es una escena 3D real (three.js), dibujada en el iPhone
Para llegar a «el escritorio es el menú» con profundidad, luz y sombras de
verdad, la mesa se dibuja con WebGL (three.js, ~150 KB comprimidos, en un
fragmento aparte). Todo es procedural: geometría, materiales y texturas se
generan en el dispositivo (madera, cuero, papel, corcho, latón,
fotografías); no se descarga ningún modelo ni imagen de terceros (las
bibliotecas CC0 tampoco son accesibles desde el entorno de desarrollo).
- Luz: foco de la lámpara con sombras suaves, resplandor de la pantalla,
  luna fría, reflejos de entorno procedurales en el metal.
- Interacción: tocar abre el objeto con su animación propia (la carpeta se
  levanta y se abre, la hoja del calendario pasa, el cajón del archivador
  sale, el auricular se levanta, el carro se desplaza, la libreta se abre);
  mantener pulsado muestra el nombre sin abrir; la cadenita enciende y
  apaga la lámpara. Sin rótulos permanentes.
- Movimiento: polvo en el haz de luz, respiración leve de la cámara,
  parallax arrastrando el dedo o con el giroscopio (permiso pedido desde
  Ajustes → Luz, nunca al abrir la app).
- Rendimiento: render bajo demanda, media cadencia en reposo, pausa en
  segundo plano, escena compartida entre visitas. «Reducir movimiento»
  quita el polvo, la deriva y el parallax.
- Alternativa: Ajustes → Luz → Gráficos ligeros (2D), o automática si el
  dispositivo no tiene WebGL o pierde el contexto.
- Accesibilidad: cada objeto tiene un botón equivalente para VoiceOver y
  teclado.

### D-062 · Objetos nuevos en la mesa: archivador y corcho
El archivador abre el archivo personal (nueva pantalla con cuatro cajones:
resueltos, cerrados, fallidos y reabribles). El corcho lleva al tablero de
la investigación en curso más reciente; si no hay ninguna, lo dice.

### D-063 · La ficha previa muestra la dificultad
El encargo del rediseño pide que la ficha de presentación del caso incluya
la dificultad y que se pueda filtrar por ella. Sustituye a la regla
anterior (la dificultad solo se veía tras abrir el caso). Al ser una
instrucción explícita del usuario, se aplica.

### D-064 · La biblioteca rompe el precinto desde la ficha
La ficha de presentación ya avisa de que el reloj empieza al abrir, así que
su botón «Romper el precinto» abre la investigación directamente, sin
pasar por la portada precintada (que sigue existiendo para enlaces
directos). Lo mismo desde el calendario.

### D-065 · El expediente es una carpeta abierta sobre la mesa
Sin barra lateral permanente: las cinco secciones son los separadores de
cartulina de la carpeta; las herramientas son objetos (libreta, lupa para
contradicciones, sobre de pistas, sello de lacre para acusar) y el
cronómetro es un reloj de bolsillo. La tensión sube por fases (10 min,
5 min, último minuto con latido rojo en los bordes) y el cierre por tiempo
tiene su secuencia con sello. Los descubrimientos importantes (evidencia,
contradicción, deducción, secreto) oscurecen un instante la mesa y la
pieza se acerca con su sello, sin bloquear la interacción. Nada de esto
toca el cálculo del tiempo.

### D-066 · Margen de 5 s antes de avisar de un reloj que retrocede
Falso positivo encontrado al revisar capturas: la interfaz refresca su
«ahora» cada segundo y las acciones guardan la hora exacta, así que en
partidas normales aparecía el aviso. El cálculo sigue usando el mayor
instante visto; solo el aviso tiene margen.

### D-067 · Música generativa
El ajuste de volumen de música existía sin música. Ahora suena un jazz
nocturno compuesto en tiempo real con Web Audio (acordes, contrabajo,
escobillas y vibráfono con eco), sin archivos ni licencias, con su propio
volumen (a cero, silencio) e independiente de efectos y ambiente. Solo
empieza tras el primer toque (exigencia de iOS) y se suspende en segundo
plano.

### D-068 · Evidencias con aspecto según su tipo
Informes y declaraciones con clip y pauta, fotografías como polaroid,
cartas a mano, recortes de prensa rasgados, objetos en bolsa de pruebas
precintada, planos en papel cuadriculado. Las nuevas sin leer laten
suavemente.

### D-069 · El despacho pasa a ser fotorrealista (render de Blender)
Con objetos generados en tiempo real no se llegaba a la calidad de la foto
de referencia. Por decisión del usuario, la mesa se renderiza con Blender
(Cycles) usando recursos CC0 de Poly Haven y modelos propios, con cámara
cenital como la referencia. La app muestra la imagen y mantiene el menú:
zonas táctiles con la forma exacta de cada objeto (calculada en Blender),
recorte del objeto que se levanta al abrirlo con la cámara acercándose,
lámpara encendida y apagada (dos renders), halo y polvo en la luz, y
textos vivos pintados en perspectiva (fecha del calendario, hoja de la
máquina, placa). Mantener pulsada la lámpara la enciende o apaga.
Sustituye a la escena three.js de D-061 (se retira: pesaba ~150 KB y
quedaba lejos de la referencia). La mesa 2D sigue como gráficos ligeros.
Las piezas de oficina (D-050) tienen versión fotográfica desde D-073.

### D-070 · Las pantallas 2D usan la misma mesa como fondo
El fondo de biblioteca, calendario, archivo y expediente es el render del
despacho, desenfocado y en penumbra, y la madera y el cuero son texturas
reales (Poly Haven, CC0) en lugar de degradados.

### D-071 · Retratos y fotografías de los expedientes, generados en local
Los personajes inventados tienen retrato y las pruebas clave, fotografía.
Se generan en el propio entorno de desarrollo, en CPU, con un modelo de
imagen de pesos abiertos: Realistic Vision 5.1 (Stable Diffusion 1.5,
licencia CreativeML OpenRAIL-M, que permite este uso) con el VAE
sd-vae-ft-mse (MIT). No hay servicio de pago ni API externa, y la app no
ejecuta ningún modelo: recibe imágenes WebP normales dentro del
expediente, verificadas por SHA-256 y descargadas con él (D-037 y la descarga
automática del archivo completo). Cada imagen tiene una semilla fija derivada de su
id, así que se puede regenerar idéntica (`scripts/portraits/`).

El soporte respeta la época: Londres 1987, copia en gelatina de plata;
Viena 1888, copia a la albúmina sobre cartón de estudio; Nueva Atenas
2096, registro digital; Roma 64 d. C. y Sevilla 1588 no tienen fotografía,
así que los retratos son pintura (encáustica de estilo El Fayum y óleo del
Siglo de Oro). Los objetos romanos se muestran como «Reconstrucción del
archivo: no es una imagen de época», dicho en el pie. Por petición del
usuario, todos los retratos se entregan en blanco y negro, como copias
antiguas del archivo: lo importante es que se vea a una persona, no el
hiperrealismo.

Se probó antes un retrato 3D con MakeHuman (CC0) en Blender: se descartó
porque parecían maniquíes, y el usuario pidió personas que parezcan reales.

Las descripciones solo hablan de rasgos inventados (edad, pelo, ropa,
gesto); ningún retrato se basa en una persona real.

### D-072 · Las imágenes no adelantan pistas
Las fotografías ilustran lo que el texto de la evidencia ya dice a simple
vista y nunca un detalle oculto de la lupa (la sangre del candelabro, el
desgarrón de la manga, el lacre del delfín, la inscripción del violín…).
Encontrar sigue siendo cosa del jugador.

### D-073 · Las piezas de oficina, en el despacho fotorrealista
Cada pieza se renderiza con la misma escena y la misma luz
(`scripts/desk-render/variants.py`): las mesas, como imagen completa
(encendida y apagada); la lámpara, el teléfono, la máquina y la libreta,
como un recuadro del render con el material cambiado, que encaja al píxel
sobre la base y funde 10 px de borde; los adornos (taza de café, lupa,
instantáneas, placa), como piezas con su propia sombra sobre la mesa. La
imagen base ya no lleva la taza ni la lupa: «Mesa despejada» es de verdad
una mesa sin adorno. El recorte que se levanta al abrir un objeto también
tiene su versión personalizada. En la mesa fotográfica, «Flexo de latón» es
la lámpara de banquero con pantalla de latón pulido (la mesa 2D mantiene
la campana).

### D-074 · Hoja de servicio sin barras de progreso
El perfil es una hoja de servicio: cartera de cuero con la credencial y una
placa de latón con el rango; los requisitos del siguiente rango son sellos
que se entintan al cumplirse; los logros son insignias en una vitrina de
terciopelo (huecos vacíos los pendientes y «?» los secretos). Tocar una
insignia lee su placa.

### D-075 · El corcho reconoce las deducciones ya establecidas
Si un hilo une dos tarjetas de evidencia que forman parte de una deducción
ya establecida, el hilo se vuelve de latón, se tensa con una animación y
lleva una etiqueta con la deducción; al tenderlo, un sello «Deducción» lo
celebra. El corcho no establece deducciones nuevas: la mecánica sigue en
Evidencias → Relacionar (sin cambiar puntuaciones ni fallos). Las tarjetas
de personas y pruebas llevan su foto clavada.

### D-076 · Visor de fotografías, ajustes y sala en pareja
Cualquier foto de un documento o retrato se abre en un visor a pantalla
completa: pellizcar o la rueda amplían, arrastrar mueve, doble toque
alterna 1×/2,5× y dos botones giran la copia de 90 en 90°. Ajustes tiene
aspecto propio (cuadro de nogal con interruptores de palanca y placa
esmaltada atornillada). La sala en pareja muestra dos puestos de trabajo
(A · Archivo y B · Calle) unidos por el cable del teléfono, y dice con
claridad que no hay conexión en tiempo real: se intercambian códigos.
