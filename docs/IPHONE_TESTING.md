# Pruebas en iPhone físico

Las pruebas automáticas corren en Chromium emulando un iPhone 15. Safari en
un iPhone real (WebKit) puede comportarse distinto. Esta lista cubre lo que
solo se puede comprobar en el dispositivo. Anota modelo, versión de iOS y
resultado de cada punto.

## Instalación
- [ ] Abrir `https://marcosrenillam-oss.github.io/Deadline/` en Safari.
- [ ] Compartir → *Añadir a pantalla de inicio*. El icono es el sello rojo «DL».
- [ ] Abrir desde el icono **con el iPhone en horizontal**: aparece la
      pantalla de arranque (sello, DEADLINE) y no un destello blanco.
- [ ] Abrir en vertical: aparece el aviso de girar el teléfono.
- [ ] Sin barra de Safari; la barra de estado es translúcida.

## Mesa y zonas seguras
- [ ] La Dynamic Island / notch no tapa ningún objeto ni texto, girando a
      un lado y al otro.
- [ ] El indicador de inicio no tapa la placa ni la libreta.
- [ ] Los seis objetos responden al primer toque; la cadenita enciende y
      apaga la lámpara.
- [ ] La animación de cada objeto es fluida (sin tirones) al abrirlo.

## Sonido y tacto
- [ ] El primer toque desbloquea el audio; los efectos suenan.
- [ ] Con el interruptor de silencio activado no suena nada.
- [ ] Hápticos (iOS 18+): se notan al tocar objetos y al sellar.

## Expediente
- [ ] Lupa sobre texto e imagen; zoom con dos dedos en las evidencias.
- [ ] Tablero: arrastrar tarjetas y tender hilos con el dedo.
- [ ] El teclado no tapa el campo al escribir notas o alias.
- [ ] El reloj sigue contando con la app en segundo plano o bloqueada
      (volver a los 5 minutos y comprobar el tiempo restante).

## Sin conexión
- [ ] Archivo → descargar un expediente → «Disponible sin conexión».
- [ ] Modo avión → cerrar la app del todo → abrirla: arranca y el
      expediente descargado se abre con sus imágenes.

## Datos
- [ ] Lámpara → Archivo → Exportar: aparece la hoja de compartir; guardar
      en Archivos.
- [ ] Borrar la app, reinstalar e importar la copia: vuelve todo
      (casos, notas, logros, amigos).
- [ ] Ajustes → Archivo: el estado del almacenamiento indica si es
      persistente.

## Cooperativo con dos iPhone
- [ ] A crea una invitación y la envía por Mensajes; B la pega tal cual
      (con el texto que añade Mensajes alrededor) y pulsa «Preparado».
- [ ] B devuelve el código de aceptación por WhatsApp; los relojes quedan
      alineados (diferencia de pocos segundos).
- [ ] Informes de campo por AirDrop (como texto) en ambos sentidos.
- [ ] Propuesta, rechazo y firma: los dos llegan al mismo final.

## Progresión
- [ ] Al cerrar un caso aparece la tira de logro y no impide tocar nada.
- [ ] Máquina de escribir: historial, estadísticas, logros y clasificación.
- [ ] Tarjeta de investigador enviada por Mensajes y pegada en el otro
      iPhone: aparece en la clasificación.

## Rendimiento
- [ ] La mesa no se calienta ni gasta batería de forma llamativa en 10
      minutos con la lámpara encendida (capas de luz y textura de madera).
- [ ] `/Deadline/diagnostico`: anotar los datos del dispositivo si algo
      falla.
