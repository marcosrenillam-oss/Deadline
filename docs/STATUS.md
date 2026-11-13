# Estado del proyecto

Última actualización: Etapa 7.

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
| 8 · Contenido, optimización y pruebas | Pendiente |

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

## Pruebas

- `@deadline/core`: 69 pruebas (validador, condiciones, motor, acusación y
  puntuación, cronómetro, diarios, rangos, ajustes, perfil, cosméticos,
  copias de seguridad).
- `@deadline/web`: 9 pruebas (IndexedDB, ajustes, perfil, calendario,
  exportar → restaurar en otro dispositivo, fusionar/reemplazar).
- E2E (Chromium emulando iPhone 15): 37 comprobaciones — objetos de la mesa,
  zonas seguras simuladas, nota de bienvenida, lámpara persistente,
  navegación por objetos, ajustes persistentes, material de la mesa,
  exportar/importar/rechazar copia manipulada, IndexedDB v2, 404, service
  worker, arranque offline, giro a vertical y vuelta.
- E2E del caso (Chromium, iPhone 15 en horizontal): 25 comprobaciones —
  resolver «Revelado en negro» de principio a fin solo con la interfaz
  (lupa en texto e imagen, relacionar, interrogar, contradicción,
  confrontación, cronología, tablero, acusación, final con confesión,
  informe, modo archivo, reflejo en archivo y escritorio).
- E2E de la Etapa 4 (reloj simulado): 20 comprobaciones — aviso del diario
  en la mesa, calendario, origen real, aviso de 10 minutos sin jugar, tapar
  sin pausar, cierre automático a los 60 minutos, cobro de descubrimientos,
  reapertura pagando 150 puntos con reloj nuevo y descubrimientos
  conservados, descarga verificada, apertura sin conexión con imágenes,
  detección de recursos borrados por el sistema.
- E2E del cooperativo: 30 comprobaciones — mesa compartida completa
  (información dividida, poner sobre la mesa, pase de turno, deducciones
  cruzadas, confesión, acusación conjunta, mérito en pareja) y
  correspondencia entre dos contextos de navegador aislados (alias, tarjeta,
  invitación con texto alrededor, relojes alineados, informe firmado,
  mensaje, idempotencia, código alterado rechazado, propuesta rechazada,
  propuesta firmada con el mismo final en los dos).
- Build con `DEADLINE_BASE=/Deadline/`: navegación, alcance del service
  worker, manifiesto, iconos y enlace profundo sin conexión verificados.

## No probado todavía

- **iPhone físico**: Safari/WebKit real, notch real, instalación, hápticos
  de iOS, hoja de compartir, audio con modo silencio, rendimiento de las
  capas de luz y del `canvas` de madera.
- Publicación real en GitHub Pages (el flujo está escrito; hay que activarlo).
- WebKit automatizado (no disponible en el entorno de desarrollo).

## Errores conocidos / deuda

- Sin ESLint (incompatible con TypeScript 7 por ahora).
- `npm audit`: avisos moderados en dependencias de compilación de
  `workbox-build`; no llegan al bundle.
- Bundle JS ≈ 140 KB gzip; revisar `zod/mini` en la Etapa 8.
- Cualquier acción hecha milisegundos antes de matar la app (o recargarla
  por completo) puede no llegar a guardarse: la escritura en IndexedDB es
  asíncrona y el navegador la aborta. Las pruebas E2E lo detectaron; en uso
  normal (cambiar de app, bloquear) sí se guarda. Las pruebas esperan a que
  termine la escritura antes de recargar.
- Diario, pareja e historial siguen siendo pantallas que indican su etapa.
- **Arte provisional:** retratos en silueta y evidencias gráficas
  esquemáticas. Faltan retratos y fotografías con calidad final (Etapa 8;
  necesita decidir una fuente de imágenes sin coste).
- **Riesgo de bloqueo en la reapertura:** si un jugador cierra un caso sin
  descubrir casi nada y no tiene otros casos que resolver, puede no llegar a
  los puntos de la reapertura. Con 2 expedientes publicados es posible.
  Opciones a decidir: saldo inicial, primera reapertura gratis o coste
  menor. No lo he cambiado por mi cuenta.
- Cooperativo: no se ha probado todavía con dos iPhone reales (compartir
  por Mensajes/WhatsApp/AirDrop y pegar). Sin lector de QR por ahora.
- Cooperativo: si el tiempo se agota sin acusación conjunta, cada
  dispositivo cierra su parte como «cooperativa incompleta»; la lista de
  partidas del teléfono no lo refleja hasta abrirla.
- Solo hay un cooperativo escrito (de información dividida); el estilo
  «compartido» está implementado pero sin caso propio.
- Solo hay un diario escrito: del día 2 en adelante el calendario dice
  honestamente «en redacción».
- La descarga de un expediente con muchas imágenes no se ha medido aún en
  un iPhone (los dos casos actuales pesan pocos KB).
- Música por época: no hay piezas todavía.
- Falta `apple-touch-startup-image` horizontal.
