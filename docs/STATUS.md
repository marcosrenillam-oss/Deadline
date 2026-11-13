# Estado del proyecto

Última actualización: Etapa 8 (cierre del plan de 8 etapas).

## Etapas

| Etapa | Estado |
|---|---|
| 1 · Arquitectura y estructura | Completada; adaptada a local-first (ver `LOCAL_FIRST.md`) |
| 2 · The Detective's Desk | **Completada** (pendiente de prueba en iPhone físico) |
| 3 · Motor de expedientes | **Completada** con un expediente completo (pendiente de prueba en iPhone físico) |
| 4 · Cronómetros, guardado y offline | **Completada** |
| 5 · ~~Cuentas y backend~~ → Perfil local y copias | **Completada**: perfil local, alias, retrato, tarjeta de investigador, copias |
| 6 · Cooperativo sin servidor | **Completada**: mesa compartida y correspondencia por códigos (pendiente de prueba con dos iPhone reales) |
| 7 · Progresión y personalización | **Completada**: estadísticas, rangos completos, 28 logros, piezas desbloqueables, historial, clasificación entre amigos |
| 8 · Contenido, optimización y pruebas | **Completada** dentro de lo que se puede hacer sin iPhone físico ni acceso a la configuración del repositorio (ver «No probado todavía») |

## Implementado y probado

### Etapa 1
- Monorepo, TypeScript estricto, esquema y validador de expedientes,
  condiciones, cronómetro, calendario diario, rangos, ajustes, IndexedDB,
  PWA con armazón offline, zonas seguras, aviso de giro, diagnóstico.

### Cambio a local-first
- IndexedDB v2 (almacén `profile`) con migración desde v1.
- Perfil local con número de investigador y letra de control.
- Calendario diario que empieza el día del primer arranque.
- **Archivo personal**: exportar (hoja de compartir o descarga), importar
  con vista previa, fusionar o reemplazar, suma SHA-256, aviso de copia
  antigua, estado del almacenamiento y solicitud de persistencia.
- Publicación en GitHub Pages: subruta configurable, `404.html`,
  `.nojekyll`, flujo de GitHub Actions (**preparado; requiere que lo actives**).

### Etapa 2 · The Detective's Desk
- Mesa cenital a pantalla completa: madera generada en el dispositivo, vade
  de cuero, luz de lámpara con caída cinematográfica y polvo en el haz.
- Seis objetos interactivos que son el menú: carpeta (archivo), calendario
  (diario), teléfono (pareja), máquina de escribir (historial), lámpara
  (ajustes), libreta (notas). Respuesta al toque, animación propia de cada
  objeto al abrirse (la carpeta se abre, la hoja se arranca, el auricular se
  levanta, el carro se desplaza, la libreta se abre, la lámpara parpadea),
  sonido y háptico.
- Datos reales sobre la mesa: fecha y diario del día en el calendario,
  actividad y estado de conexión en la hoja de la máquina, nº de notas en
  la libreta, rango y nº de investigador en la placa.
- Cadenita de la lámpara: enciende/apaga la luz de la oficina (persistente).
- Nota de bienvenida opcional (sin tutorial obligatorio) que se puede retirar
  y volver a poner.
- Ajustes completos (Lámpara): luz, sonido (efectos y ambiente sintetizados),
  tacto, lectura, oficina, archivo personal.
- Personalización inicial: mesa (3), lámpara (2), teléfono (2), máquina (2),
  libreta (2), objeto personal (3). Cambia materiales, nunca la composición.
- Escalado a cualquier pantalla horizontal con unidades de contenedor,
  respetando zonas seguras.

### Etapa 3 · Motor de expedientes
- Motor puro: examinar, detalles ocultos (texto e imagen), interrogar con
  respuestas condicionadas, relacionar piezas, señalar contradicciones,
  pistas en tres niveles con límite y penalización, acusación por criterios,
  finales alternativos, cronología comparada, cierre por tiempo, puntuación
  sin recompensas duplicadas.
- Compilador de contenido (`npm run content`): recursos generados, huellas
  SHA-256, validación y publicación del catálogo.
- **DL-I-0001 «Revelado en negro»** (Londres, 1987; detective): víctima,
  4 sospechosos y 1 testigo, 16 evidencias, 23 detalles ocultos, 6
  deducciones, 5 contradicciones, 4 secretos, 4 interrogatorios ramificados
  (36 preguntas), 15 eventos de cronología (3 falsos), 4 líneas de pista, 4
  objetivos (1 oculto) y 7 finales. Validado: 0 errores, 0 avisos.
- Interfaz: biblioteca con búsqueda y filtros; portada precintada (la
  dificultad no se ve hasta abrir); expediente; evidencias con lupa, zoom,
  destacar/descartar, asociar y relacionar; personas con ficha, relaciones,
  secretos y declaraciones; interrogatorios por temas con transcripción;
  cronología ordenable con fichas, anotaciones, vínculos y marcas de duda;
  tablero de corcho (añadir, mover, conectar con hilo, quitar, zoom,
  desplazar); libreta dentro del caso y en el escritorio; herramienta de
  contradicciones; pistas; acta de acusación; informe final completo; modo
  archivo tras cerrar con lo omitido marcado.
- Puntos al perfil local al resolver.

### Etapa 4 · Cronómetros, cierre, reapertura, guardado y offline
- Cronómetro por marcas de tiempo con avisos a 10, 5 y 1 minuto, aviso si
  el reloj del dispositivo retrocede y registro cada 30 s del instante más
  tardío visto (retrasar el reloj no devuelve tiempo aunque no se juegue).
- Tocar el reloj **tapa** el expediente; el tiempo sigue corriendo.
- Cierre automático al agotarse el tiempo: se cobran los descubrimientos (no
  la acusación) y el expediente queda en modo archivo.
- **Reapertura** pagando puntos (150 / 300 / 500 según dificultad), en una
  transacción: reloj nuevo; se conservan evidencias, detalles, hechos,
  fichas, deducciones, tablero, cronología y notas; las conversaciones se
  reinician. Historial de intentos por expediente.
- Guardado inmediato de cada acción; los cambios rápidos (arrastrar en el
  tablero) se agrupan y se fuerzan al ocultar o cerrar la app. Aviso si una
  escritura falla.
- **Descarga verificada** por expediente: huella del JSON contra el
  catálogo, tamaño y SHA-256 de cada recurso, reintentos con espera,
  reanudación, Cache Storage compartida con el service worker, URLs con
  huella de versión. «Disponible sin conexión» solo con todo verificado.
- Al arrancar se comprueba lo descargado (iOS puede borrarlo) y se
  precargan los diarios de los próximos 7 días. Comprobación a fondo desde
  Ajustes → Archivo.
- Se pide almacenamiento persistente al descargar el primer expediente.
- **Calendario**: caso del día, días anteriores, progreso de los 500,
  fecha de desbloqueo; los diarios pasados entran en la biblioteca.
- **DL-D-0001 «Cenizas en el Celio»** (Roma, 64 d. C.; inspirado en hechos
  reales, con hechos documentados, hipótesis y recreación separados y
  fuentes citadas): 3 sospechosos y 2 testigos, 9 evidencias, 3
  deducciones, 3 contradicciones, 3 interrogatorios, 6 finales. Validado:
  0 errores, 0 avisos.

### Etapa 5 · Perfil local
- Ficha del investigador (la placa de la mesa): número, alias (sin registro
  central), retrato a elegir entre siluetas o foto propia reducida en el
  dispositivo, rangos individual y en pareja con progreso, puntos y méritos.
- Tarjeta de investigador exportable como código (para la clasificación
  entre amigos de la Etapa 7).
- Las partidas en pareja viajan también en las copias de seguridad.

### Etapa 6 · Cooperativo sin servidor
- Motor: reparto por papeles (A/B) en información dividida — piezas
  iniciales, apariciones automáticas e interrogatorios según el receptor; una
  acción propia nunca entrega una pieza del compañero. Puesta en común
  explícita e idempotente; unión de tableros.
- Códigos `DL1.` comprimidos (deflate-raw) y firmados (HMAC-SHA256 con la
  clave de la partida): invitación (~240 caracteres), aceptación, informes de
  campo (~400), propuesta y respuesta. Se aceptan con texto alrededor; se
  rechazan los de otra partida, los alterados y los incompletos.
- **Mesa compartida** (un iPhone): dos carpetas, «poner sobre la mesa»,
  pantalla de pase de turno, acusación que propone uno y firma el otro; se
  puntúa una vez con lo que sabe el equipo.
- **Correspondencia** (dos iPhone): invitación → «Preparado» (empieza el
  reloj) → código de aceptación → relojes alineados; informes con selección
  por categorías, notas, tablero y mensaje; recepción idempotente; propuesta,
  rechazo o firma; ambos dispositivos cierran con el mismo final.
- Mérito y rango en pareja independientes de los individuales.
- Validador: avisa si en un caso dividido algún papel puede resolverlo solo.
- **DL-C-0001 «Punto de rocío»** (Nueva Atenas, 2096): 3 sospechosos, 13
  evidencias repartidas entre Archivo Central (A) y Unidad de Calle (B), 4
  deducciones (2 cruzadas), 3 contradicciones (todas exigen compartir), 3
  interrogatorios repartidos, 6 finales. Comprobado: A solo alcanza 8
  evidencias, B solo 5; juntos, todo.

### Etapa 7 · Progresión y personalización
- Estadísticas calculadas a partir de lo guardado (individual y en pareja):
  abiertos, intentos, resueltos, actas impecables, precisión, fallos,
  cierres por tiempo, pistas, tiempos medio y mejor, rachas de diarios,
  hallazgos.
- Rangos con todos sus criterios (mérito, actas impecables, precisión,
  dificultad); la ficha muestra lo que falta para el siguiente.
- 28 logros (5 secretos) con premio en puntos gastables; algunos conceden
  piezas de la oficina. Se anuncian con una tira mecanografiada.
- 13 piezas de oficina nuevas: 5 se compran con puntos, 4 con logros y 4
  con rangos; dos objetos personales nuevos (lupa y placa).
- **La máquina de escribir** (`/maquina`): historial de cada intento con su
  registro de actividad, estadísticas, logros y clasificación entre amigos
  por tarjetas.
- Primera reapertura de cada expediente gratuita.
- Las copias de seguridad incluyen logros y amigos; IndexedDB v4.

### Etapa 8 · Contenido, optimización y publicación
- **DL-D-0002 «Una nota falsa»** (Viena, 1888; robo; diario nº 2): 4
  sospechosos y 1 testigo, 10 evidencias, 3 deducciones, 4 contradicciones,
  3 secretos, 4 interrogatorios, 6 finales. 0 errores, 0 avisos.
- **DL-C-0002 «La carta de marear»** (Sevilla, 1588; chantaje; primer
  cooperativo de expediente compartido, dificultad Inspector): 4
  sospechosos y 1 testigo, 11 evidencias, 4 deducciones, 3
  contradicciones, 4 secretos, 5 interrogatorios, 7 finales. 0 errores,
  0 avisos.
- Prueba de partida completa en el motor para los dos expedientes nuevos.
- Mesa compartida con expediente compartido: entrega en mano antes de
  firmar (antes quien proponía podía firmar su propia propuesta).
- Siluetas de ficha fijadas por el autor (`look`) en los 28 personajes.
- Carga diferida por pantallas: JS inicial de ~199 KB a ~166 KB gzip.
- Pantallas de arranque horizontales para 11 tamaños de iPhone (460 KB,
  fuera del precache).
- Avisos de progresión que no interceptan toques.
- La lista de partidas en pareja marca las que agotaron el tiempo.
- Flujo de GitHub Pages disparado también por la rama de desarrollo.
- Guías: pruebas en iPhone (`IPHONE_TESTING.md`) y producción de
  contenido (`CONTENT_PIPELINE.md`).

## Pruebas

- `@deadline/core`: 79 pruebas (validador, condiciones, motor, acusación y
  puntuación, cronómetro, diarios, rangos, estadísticas, logros, piezas de
  oficina, amigos, ajustes, perfil, copias de seguridad, cooperativo,
  códigos DL1 y partidas completas de DL-D-0002 y DL-C-0002).
- `@deadline/web`: 9 pruebas (IndexedDB v4, ajustes, perfil, calendario,
  exportar → restaurar en otro dispositivo, fusionar/reemplazar).
- Validador de contenido: 5 expedientes, 0 errores, 0 avisos (incluye
  simulación de alcanzabilidad y, en cooperativos divididos, que ningún
  papel pueda resolver solo).
- E2E en Chromium emulando iPhone 15 en horizontal (`npm run test:e2e`):
  - **Escritorio y ajustes** (32 comprobaciones): objetos de la mesa, zonas
    seguras, lámpara, navegación, máquina de escribir, ajustes, copias,
    IndexedDB v4, 404, service worker, arranque offline, giro.
  - **Caso completo** (42): resolver «Revelado en negro» solo con la
    interfaz; logros al cerrar con anuncio; mérito sin premios de logros;
    historial con registro de actividad; estadísticas; logros secretos
    ocultos; compra y equipamiento de una pieza; piezas de rango no
    vendibles; clasificación con la tarjeta de un segundo dispositivo.
  - **Etapa 4** (22): reloj simulado, avisos, tapar sin pausar, cierre por
    tiempo, primera reapertura gratis, segunda por 150 puntos, descarga
    verificada, juego sin conexión.
  - **Cooperativo** (33): mesa compartida con información dividida,
    expediente compartido con entrega en mano, y correspondencia entre dos
    contextos de navegador aislados.
- Build con `DEADLINE_BASE=/Deadline/` verificada.

## No probado todavía

- **iPhone físico**: Safari/WebKit real, notch real, instalación,
  pantallas de arranque, hápticos, hoja de compartir, audio con modo
  silencio, rendimiento de las capas de luz y del `canvas` de madera. Hay
  una lista de comprobación en `IPHONE_TESTING.md`.
- **Publicación real en GitHub Pages**: requiere que el propietario active
  Pages (Settings → Pages → Source: GitHub Actions). Ver `DISTRIBUTION.md`.
- Cooperativo con dos iPhone reales (Mensajes, WhatsApp, AirDrop).
- WebKit automatizado (no disponible en el entorno de desarrollo).

## Errores conocidos / deuda

- Sin ESLint (incompatible con TypeScript 7 por ahora).
- `npm audit`: avisos moderados en dependencias de compilación de
  `workbox-build`; no llegan al bundle.
- El núcleo con zod va entero en el paquete inicial (~166 KB gzip en
  total). `zod/mini` lo reduciría, pero exige reescribir los esquemas; no
  compensa ahora.
- Cualquier acción hecha milisegundos antes de matar la app puede no
  llegar a guardarse (la escritura en IndexedDB es asíncrona). En uso
  normal (cambiar de app, bloquear) sí se guarda.
- **Contenido**: hay 5 de los 3000 expedientes previstos (1 individual, 2
  diarios, 2 cooperativos). Desde el día 3, el calendario dice
  honestamente «en redacción». La producción del resto está descrita en
  `CONTENT_PIPELINE.md`.
- **Arte provisional**: retratos en silueta y evidencias gráficas
  esquemáticas. Falta decidir una fuente de ilustración sin coste.
- Música por época: no hay piezas; solo ambiente sintetizado.
- Clasificación entre amigos: datos declarados, no verificables (sin
  servidor no hay otra forma).
- La descarga de un expediente con muchas imágenes no se ha medido en un
  iPhone (los actuales pesan pocos KB).
