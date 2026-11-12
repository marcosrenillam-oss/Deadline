import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-C-0001 · PUNTO DE ROCÍO  (cooperativo, información dividida)
 * Nueva Atenas, 2096 · Homicidio · Ficción original · Detective
 *
 * A — ARCHIVO CENTRAL: registros digitales (accesos, consolas, red eléctrica,
 *     mensajes, informes de reservas). Interroga a Ladas por videollamada.
 * B — UNIDAD DE CALLE: escena, forense, dron de mantenimiento, taquillas.
 *     Interroga a Draganis e Irini Saba.
 *
 * Verdad: Nikos Draganis, subjefe de turno de la Torre de Condensación 7,
 * firmaba informes de reservas de agua falsos pagados por el consorcio. La
 * ingeniera jefe Selene Markou tenía las cifras reales y se reunió esa noche
 * con la periodista Irini Saba. Draganis dejó una macro tecleando en su
 * consola como coartada, aprovechó el apagón de las 23:00 para empujar a
 * Selene desde la pasarela del nivel 9, le quitó la tarjeta y a las 23:20 la
 * usó para borrar la carpeta con las cifras reales. Un dron de mantenimiento,
 * con batería propia, lo captó a las 23:14 con la chaqueta naranja de Hydra.
 *
 * Para resolverlo hay que poner en común: ninguna de las dos mitades basta.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-C-0001',
  contentVersion: 1,
  mode: 'coop',
  title: 'Punto de rocío',
  subtitle: 'Una ingeniera cae de la torre que da de beber a Nueva Atenas',
  origin: 'fiction',
  era: 'dystopian-future',
  eraLabel: 'Nueva Atenas, 2096',
  year: 2096,
  location: { city: 'Nueva Atenas', place: 'Torre de Condensación 7, distrito del Pireo Alto', country: 'Ciudad-estado de Nueva Atenas' },
  category: 'homicide',
  difficulty: 'detective',
  keywords: ['agua', 'torre de condensación', 'Hydra', 'apagón', 'dron', 'periodista', 'reservas'],
  ambience: { music: 'new-athens-2096', mood: 'cold' },
  maxHints: 4,

  coop: {
    style: 'split',
    roles: [
      {
        id: 'A',
        title: 'Archivo Central',
        briefing:
          'Trabajas desde la sala de datos de la Prefectura. Tienes acceso a los registros de la torre: accesos, consolas, red eléctrica, mensajería y los informes de reservas. Puedes interrogar a Petros Ladas, de Hydra, por videollamada. Lo que veas tú no lo verá tu compañero si no se lo pasas.',
      },
      {
        id: 'B',
        title: 'Unidad de Calle',
        briefing:
          'Estás en la torre. Tienes la escena, el informe forense, las imágenes del dron de mantenimiento y acceso a las instalaciones. Puedes interrogar a Nikos Draganis y a la periodista Irini Saba. Lo que veas tú no lo verá tu compañero si no se lo pasas.',
      },
    ],
  },

  briefing: {
    incidentDisplay: 'Noche del 3 de marzo de 2096',
    summary:
      'La doctora Selene Markou, ingeniera jefe de la Torre de Condensación 7, aparece muerta al pie de la pasarela del nivel 9. El consorcio Hydra habla de un accidente durante el apagón de la noche.',
    context:
      'Un técnico del turno de mañana encontró el cuerpo a las 7:10. La torre produce un tercio del agua potable del Pireo Alto. En plena temporada de racionamiento, la Prefectura quiere el caso cerrado deprisa; vosotros, cerrado bien.',
    background:
      'Desde la Gran Sequía de 2071, Nueva Atenas vive bajo una cúpula climática y bebe del agua que las torres arrancan al aire. El consorcio Hydra las gestiona y publica cada semana el nivel de reservas, que decide las raciones.',
    victim: 'ch-selene',
    initialFacts: [],
    initialEvidence: ['ev-parte', 'ev-accesos', 'ev-consola', 'ev-energia', 'ev-mensajes', 'ev-reservas', 'ev-escena', 'ev-forense', 'ev-dron'],
    initialTimeline: ['te-muerte', 'te-hallazgo'],
  },

  characters: [
    {
      id: 'ch-selene',
      name: 'Selene Markou',
      role: 'victim',
      age: 46,
      occupation: 'Ingeniera jefe de la Torre 7',
      summary: 'Conocía cada litro que salía de su torre.',
      biography: 'Diseñó la tercera generación de condensadores. Insobornable, según quien lo diga; incómoda, según otros.',
      personality: ['Rigurosa', 'Testaruda', 'Desconfiada con Hydra'],
    },
    {
      id: 'ch-nikos',
      name: 'Nikos Draganis',
      role: 'suspect',
      age: 39,
      occupation: 'Subjefe de turno de la Torre 7',
      summary: 'Firma los informes semanales de reservas.',
      biography: 'Ingeniero de sistemas, quince años en Hydra. Aspira a la jefatura de la torre desde hace cinco.',
      personality: ['Cordial', 'Metódico', 'Demasiado preparado'],
      relationToVictim: 'Su segundo en la torre',
      motive: { text: 'Firmaba informes de reservas falsos; Selene tenía las cifras reales.', visibleWhen: { fact: 'fa-motivo' } },
      alibi: { claim: 'En su consola de la sala de control toda la noche.' },
    },
    {
      id: 'ch-irini',
      name: 'Irini Saba',
      role: 'suspect',
      age: 33,
      occupation: 'Periodista independiente',
      summary: 'Investiga el racionamiento.',
      biography: 'Publica en canales cifrados lo que los medios del consorcio no publican. Hydra la ha demandado dos veces.',
      personality: ['Valiente', 'Desconfiada', 'Protege a sus fuentes'],
      relationToVictim: 'Supuestamente, ninguna',
      motive: { text: 'Selene era su fuente; si se echaba atrás, perdía la exclusiva.', visibleWhen: { secret: 'se-irini' } },
      alibi: { claim: 'En su casa, escribiendo, toda la noche.' },
    },
    {
      id: 'ch-ladas',
      name: 'Petros Ladas',
      role: 'suspect',
      age: 52,
      occupation: 'Jefe de seguridad del consorcio Hydra',
      summary: 'Su trabajo es que nada salga de las torres.',
      biography: 'Antiguo oficial de la policía hidráulica. Habla poco y nunca por escrito.',
      personality: ['Frío', 'Leal al consorcio', 'Preciso'],
      relationToVictim: 'Responsable de la seguridad de su torre',
      motive: { text: 'Hydra sospechaba que Selene iba a filtrar datos.', visibleWhen: { secret: 'se-ladas' } },
      alibi: { claim: 'En la sede central de Hydra, en el Ágora Nueva, hasta medianoche.' },
    },
  ],

  locations: [
    { id: 'lo-torre', name: 'Torre de Condensación 7', description: 'Cuarenta niveles de rejillas, ventiladores y depósitos.' },
    { id: 'lo-pasarela', name: 'Pasarela del nivel 9', description: 'Plataforma exterior de mantenimiento, a veintidós metros del nivel 2.' },
    { id: 'lo-control', name: 'Sala de control y anexo T-3', description: 'Consolas de turno y la terminal de archivo T-3.' },
    { id: 'lo-sede', name: 'Sede de Hydra', description: 'En el Ágora Nueva, a veinte minutos de la torre.' },
  ],

  relationships: [
    { id: 're-jefa', a: 'ch-selene', b: 'ch-nikos', label: 'Jefa y subjefe' },
    { id: 're-fuente', a: 'ch-selene', b: 'ch-irini', label: 'Fuente y periodista', visibleWhen: { secret: 'se-irini' } },
    { id: 're-vigilancia', a: 'ch-ladas', b: 'ch-selene', label: 'Vigilante y vigilada', visibleWhen: { secret: 'se-ladas' } },
  ],

  facts: [
    { id: 'fa-entrada-2241', text: 'Selene entró en la torre a las 22:41 con su tarjeta.' },
    { id: 'fa-acceso-2320', text: 'La tarjeta de Selene se usó a las 23:20 en la terminal de archivo T-3, en el anexo de la sala de control.', important: true },
    { id: 'fa-sin-tarjeta', text: 'Selene no llevaba encima su tarjeta de acceso.', important: true },
    { id: 'fa-tarjeta-usada', text: 'Alguien usó la tarjeta de Selene después de su muerte para entrar en el archivo de la torre.', important: true },
    { id: 'fa-carpeta', text: 'A las 23:20 se borró de la terminal T-3 la carpeta «Reservas_reales», propiedad de Selene.', important: true },
    { id: 'fa-macro', text: 'Entre las 22:58 y las 23:31 la consola de Draganis registra pulsaciones a intervalos exactos de 1,8 segundos: una macro, no una persona.', important: true },
    { id: 'fa-apagon', text: 'Apagón en la Torre 7 entre las 23:00 y las 23:12. Las cámaras fijas no grabaron.', important: true },
    { id: 'fa-dron-2314', text: 'A las 23:14 el dron de mantenimiento capta en el nivel 9 a alguien con la chaqueta naranja de mantenimiento de Hydra, bajando a la escalera.', important: true },
    { id: 'fa-coartada-falsa', text: 'Mientras su consola «tecleaba» sola, alguien con chaqueta de Hydra bajaba del nivel 9: la coartada de Draganis es falsa.', important: true },
    { id: 'fa-chaqueta', text: 'Las fibras naranjas bajo las uñas de Selene son de la chaqueta rota de la taquilla 12, la de Draganis.', important: true },
    { id: 'fa-cifras', text: 'Los informes semanales de reservas, firmados por Draganis, dan cifras imposibles para el caudal real de la torre.' },
    { id: 'fa-motivo', text: 'Selene tenía las cifras reales; Draganis firmaba las falsas. La carpeta borrada era la prueba.', important: true },
    { id: 'fa-cita', text: 'Selene e Irini Saba quedaron a las 22:40 en la plataforma 3 de la torre.' },
    { id: 'fa-baliza', text: 'En el bolso de Selene había una baliza de seguimiento con número de serie de Hydra.' },
    { id: 'fa-ladas-sede', text: 'Ladas no salió de la sede de Hydra entre las 21:00 y las 00:10.' },
    { id: 'fa-irini-se-fue', text: 'Irini salió de la torre a las 22:56, antes del apagón.' },
  ],

  evidence: [
    {
      id: 'ev-parte',
      kind: 'report',
      title: 'Parte de incidencia',
      holder: 'both',
      source: 'Prefectura de Nueva Atenas',
      summary: 'Lo que se sabe al empezar.',
      body: [
        { type: 'heading', text: 'PARTE 2096-03-04 / PA-0711' },
        { type: 'typed', text: 'Fallecida: Dra. Selene Markou, 46 años, ingeniera jefe de la Torre de Condensación 7. Hallada a las 07:10 al pie de la pasarela exterior del nivel 9, sobre la rejilla del nivel 2.' },
        { type: 'typed', text: 'Versión de Hydra: caída accidental durante el apagón de la noche. Solicitan cierre urgente.' },
        { type: 'typed', text: 'Se asignan dos investigadores: Archivo Central (registros) y Unidad de Calle (escena). Coordínense.' },
      ],
    },
    // ── Papel A · Archivo Central ────────────────────────────────────────────
    {
      id: 'ev-accesos',
      kind: 'digital',
      title: 'Registro de accesos de la Torre 7',
      holder: 'A',
      source: 'Servidor de control de accesos',
      summary: 'Quién pasó una tarjeta, dónde y cuándo.',
      body: [
        {
          type: 'table',
          header: ['Hora', 'Tarjeta', 'Puerta'],
          rows: [
            ['21:58', 'N. DRAGANIS', 'Sala de control'],
            ['22:38', 'VISITANTE-3', 'Plataforma 3'],
            ['{{dt-entrada|22:41}}', 'S. MARKOU', 'Acceso principal'],
            ['22:56', 'VISITANTE-3', 'Salida plataforma 3'],
            ['23:00–23:12', '—', 'Sin registro (apagón)'],
            ['{{dt-acceso-2320|23:20}}', 'S. MARKOU', 'Terminal de archivo T-3 (anexo de control)'],
            ['07:08', 'A. KOSTA', 'Acceso principal'],
          ],
        },
      ],
      details: [
        { id: 'dt-entrada', label: 'Selene entra a las 22:41', description: 'Con su propia tarjeta.', effects: [{ grantFact: 'fa-entrada-2241' }, { unlockTimelineEvent: 'te-entrada' }], points: 5 },
        { id: 'dt-acceso-2320', label: 'La tarjeta de Selene, a las 23:20', description: 'En la terminal de archivo, junto a la sala de control. ¿Seguía viva?', effects: [{ grantFact: 'fa-acceso-2320' }, { unlockTimelineEvent: 'te-borrado' }], points: 20 },
      ],
    },
    {
      id: 'ev-borrado',
      kind: 'digital',
      title: 'Diario de la terminal T-3',
      holder: 'A',
      source: 'Copia de seguridad del sistema de archivo',
      summary: 'Qué se hizo en la terminal a las 23:20.',
      autoDiscoverWhen: { detail: 'dt-acceso-2320' },
      body: [
        { type: 'typed', text: '23:20:04 · sesión iniciada · tarjeta S. MARKOU' },
        { type: 'typed', text: '23:20:51 · {{dt-carpeta|eliminación definitiva: /markou/Reservas_reales (312 archivos)}}' },
        { type: 'typed', text: '23:21:10 · sesión cerrada' },
      ],
      details: [{ id: 'dt-carpeta', label: '«Reservas_reales», borrada', description: 'Alguien eliminó la carpeta de Selene con su propia tarjeta.', effects: [{ grantFact: 'fa-carpeta' }], points: 20 }],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-consola',
      kind: 'digital',
      title: 'Actividad de la consola de Draganis',
      holder: 'A',
      source: 'Telemetría de la sala de control',
      summary: 'Pulsaciones registradas en la consola 2.',
      body: [
        { type: 'typed', text: 'Consola 2 · usuario N. DRAGANIS · actividad continua de 21:59 a 00:40.' },
        {
          type: 'table',
          header: ['Franja', 'Pulsaciones/min', 'Intervalo medio'],
          rows: [
            ['22:00–22:57', '41–118', 'irregular'],
            ['{{dt-macro|22:58–23:31}}', '33', '1,800 s exactos'],
            ['23:32–00:40', '36–97', 'irregular'],
          ],
        },
      ],
      details: [{ id: 'dt-macro', label: 'Pulsaciones de reloj', description: 'Ninguna persona teclea cada 1,8 segundos exactos durante media hora: era una macro.', effects: [{ grantFact: 'fa-macro' }, { unlockTimelineEvent: 'te-macro' }], points: 25 }],
      decisive: true,
    },
    {
      id: 'ev-energia',
      kind: 'record',
      title: 'Registro de la red eléctrica',
      holder: 'A',
      source: 'Distribuidora del Pireo Alto',
      summary: 'El apagón de la noche.',
      body: [{ type: 'typed', text: '{{dt-apagon|Torre 7: corte de suministro de 23:00:12 a 23:12:40. Cámaras fijas sin alimentación.}} Los drones de mantenimiento tienen batería propia.' }],
      details: [{ id: 'dt-apagon', label: 'Doce minutos a oscuras', description: 'Las cámaras fijas no grabaron; los drones, sí podían.', effects: [{ grantFact: 'fa-apagon' }, { unlockTimelineEvent: 'te-apagon' }], points: 10 }],
    },
    {
      id: 'ev-mensajes',
      kind: 'digital',
      title: 'Mensajes interceptados',
      holder: 'A',
      source: 'Orden judicial de la Prefectura',
      summary: 'El último intercambio de Selene.',
      body: [
        { type: 'quote', text: 'Plataforma 3, 22:40. Te doy lo que tengo. El resto, cuando esté segura.', speaker: 'S. Markou, 21:17' },
        { type: 'quote', text: '{{dt-cita|Allí estaré. Iré sola.}}', speaker: 'I. Saba, 21:19', lineId: 'ln-irini-mensaje' },
      ],
      details: [{ id: 'dt-cita', label: 'Una cita a las 22:40', description: 'Irini Saba quedó con Selene en la torre.', effects: [{ grantFact: 'fa-cita' }, { unlockTimelineEvent: 'te-cita' }], points: 15 }],
    },
    {
      id: 'ev-reservas',
      kind: 'report',
      title: 'Informes semanales de reservas',
      holder: 'A',
      source: 'Publicaciones del consorcio Hydra',
      summary: 'Las cifras que deciden las raciones.',
      body: [
        {
          type: 'table',
          header: ['Semana', 'Producción declarada', 'Firma'],
          rows: [
            ['6', '4,1 hm³', 'N. Draganis'],
            ['7', '4,3 hm³', 'N. Draganis'],
            ['8', '4,4 hm³', 'N. Draganis'],
          ],
        },
        { type: 'typed', text: '{{dt-cifras|Capacidad máxima de diseño de la Torre 7: 2,9 hm³ por semana.}}' },
      ],
      details: [{ id: 'dt-cifras', label: 'Más agua de la que la torre puede dar', description: 'Las cifras firmadas por Draganis superan la capacidad física de la torre.', effects: [{ grantFact: 'fa-cifras' }], points: 20 }],
    },
    {
      id: 'ev-sede',
      kind: 'digital',
      title: 'Accesos a la sede de Hydra',
      holder: 'A',
      source: 'Aportado por Petros Ladas',
      summary: 'La coartada del jefe de seguridad.',
      body: [{ type: 'typed', text: 'P. LADAS · entrada 20:52 · salida 00:10. {{dt-sede|Sin salidas intermedias. Cámaras del vestíbulo coinciden.}}' }],
      details: [{ id: 'dt-sede', label: 'Ladas no salió de la sede', description: 'Su coartada se sostiene.', effects: [{ grantFact: 'fa-ladas-sede' }], points: 10 }],
    },
    // ── Papel B · Unidad de Calle ────────────────────────────────────────────
    {
      id: 'ev-escena',
      kind: 'report',
      title: 'Informe de la escena',
      holder: 'B',
      source: 'Unidad de Calle',
      summary: 'Lo que había junto al cuerpo.',
      body: [
        { type: 'typed', text: 'Cuerpo sobre la rejilla del nivel 2, bajo la pasarela del nivel 9. Barandilla del nivel 9 intacta y a la altura reglamentaria: no es fácil caerse por accidente.' },
        { type: 'typed', text: 'Bolso de trabajo cerrado junto al cuerpo. {{dt-baliza|En un bolsillo interior, una baliza de seguimiento del tamaño de una moneda, con número de serie de Hydra.}}' },
        { type: 'typed', text: '{{dt-sin-tarjeta|No lleva encima su tarjeta de acceso: ni en el bolso, ni en la ropa, ni en el nivel 9.}}' },
      ],
      details: [
        { id: 'dt-sin-tarjeta', label: 'Falta su tarjeta', description: 'Alguien se la llevó.', effects: [{ grantFact: 'fa-sin-tarjeta' }], points: 20 },
        { id: 'dt-baliza', label: 'Una baliza de Hydra', description: 'Alguien la seguía.', effects: [{ grantFact: 'fa-baliza' }], points: 15 },
      ],
    },
    {
      id: 'ev-forense',
      kind: 'report',
      title: 'Informe forense',
      holder: 'B',
      source: 'Instituto Forense del Pireo',
      summary: 'Causa y hora de la muerte.',
      body: [
        { type: 'field', label: 'Causa', value: 'Traumatismos por caída desde unos 22 metros.' },
        { type: 'field', label: 'Hora estimada', value: 'Entre las 23:00 y las 23:12.' },
        { type: 'typed', text: 'Hematomas en ambas muñecas compatibles con un forcejeo previo. {{dt-fibras|Bajo las uñas de la mano derecha, fibras sintéticas de color naranja.}}' },
      ],
      details: [{ id: 'dt-fibras', label: 'Fibras naranjas bajo las uñas', description: 'Se defendió de alguien.', effects: [], points: 15 }],
    },
    {
      id: 'ev-dron',
      kind: 'photo',
      title: 'Capturas del dron de mantenimiento MK-7',
      holder: 'B',
      source: 'Memoria del dron (batería propia)',
      summary: 'El dron siguió volando durante el apagón.',
      body: [
        {
          type: 'table',
          header: ['Hora', 'Nivel', 'Lo que se ve (infrarrojo)'],
          rows: [
            ['22:44', '3', 'Dos siluetas en la plataforma 3, conversando.'],
            ['22:57', '3', 'Plataforma 3 vacía.'],
            ['23:05', '9', 'Una silueta en la pasarela; se acerca otra desde la escalera.'],
            ['{{dt-dron|23:14}}', '9', 'Una figura con chaqueta de mantenimiento con banda naranja de Hydra baja a la escalera, sujetándose el antebrazo.'],
          ],
        },
      ],
      details: [{ id: 'dt-dron', label: 'La chaqueta naranja, a las 23:14', description: 'Alguien de mantenimiento de Hydra bajaba del nivel 9 justo después del apagón.', effects: [{ grantFact: 'fa-dron-2314' }, { unlockTimelineEvent: 'te-dron' }], points: 25 }],
      decisive: true,
    },
    {
      id: 'ev-taquilla',
      kind: 'physical',
      title: 'Registro de la taquilla 12',
      holder: 'B',
      source: 'Vestuario de la sala de control',
      summary: 'La taquilla de Nikos Draganis.',
      body: [
        {
          type: 'paragraph',
          text: 'Chaqueta de mantenimiento de Hydra, con banda naranja, colgada y aún húmeda de condensación. {{dt-manga|La manga derecha tiene un desgarrón reciente; faltan fibras del ribete naranja.}}',
        },
      ],
      details: [{ id: 'dt-manga', label: 'Un desgarrón en la manga', description: 'Faltan fibras naranjas, como las que Selene tenía bajo las uñas.', effects: [], points: 20 }],
      decisive: true,
      points: 10,
    },
  ],

  deductions: [
    {
      id: 'de-tarjeta',
      title: 'Una tarjeta en manos de otro',
      combine: ['dt-sin-tarjeta', 'dt-acceso-2320'],
      explanation: 'La tarjeta de Selene no estaba con el cuerpo y se usó a las 23:20, cuando ella ya había muerto: alguien se la quitó para entrar en el archivo.',
      effects: [{ grantFact: 'fa-tarjeta-usada' }],
      points: 30,
    },
    {
      id: 'de-coartada',
      title: 'Una consola que teclea sola',
      combine: ['dt-macro', 'dt-dron'],
      explanation: 'De 22:58 a 23:31 la consola de Draganis repetía pulsaciones de reloj; a las 23:14 alguien con chaqueta de Hydra bajaba del nivel 9. Su coartada es una macro.',
      effects: [{ grantFact: 'fa-coartada-falsa' }],
      points: 40,
    },
    {
      id: 'de-chaqueta',
      title: 'Fibras de una manga rota',
      combine: ['dt-fibras', 'dt-manga'],
      explanation: 'Las fibras naranjas bajo las uñas de Selene salieron de la manga desgarrada de la chaqueta de la taquilla 12.',
      effects: [{ grantFact: 'fa-chaqueta' }],
      points: 30,
    },
    {
      id: 'de-motivo',
      title: 'Las cifras reales',
      combine: ['dt-cifras', 'dt-carpeta'],
      explanation: 'Draganis firmaba producciones imposibles; Selene guardaba las reales en «Reservas_reales», la carpeta que alguien borró con su tarjeta.',
      effects: [{ grantFact: 'fa-motivo' }],
      points: 30,
    },
  ],

  contradictions: [
    {
      id: 'cx-nikos',
      title: 'Draganis no estaba tecleando',
      a: { line: 'ln-nikos-consola' },
      b: { detail: 'dt-macro' },
      explanation: 'Draganis asegura que no se levantó de la consola; las pulsaciones de esa media hora son de una macro.',
      effects: [],
      points: 30,
    },
    {
      id: 'cx-irini',
      title: 'Irini estuvo en la torre',
      a: { line: 'ln-irini-casa' },
      b: { detail: 'dt-cita' },
      explanation: 'Irini dice que no salió de casa; sus mensajes demuestran que quedó con Selene en la plataforma 3.',
      effects: [{ unlockTimelineEvent: 'te-cita' }],
      points: 25,
    },
    {
      id: 'cx-ladas',
      title: 'Hydra sí la vigilaba',
      a: { line: 'ln-ladas-nunca' },
      b: { detail: 'dt-baliza' },
      explanation: 'Ladas niega que Hydra vigilara a Selene; en su bolso había una baliza de seguimiento del consorcio.',
      effects: [],
      points: 25,
    },
  ],

  secrets: [
    { id: 'se-irini', characterId: 'ch-irini', text: 'Selene era la fuente de Irini. Esa noche le dio un primer lote de datos y le prometió «el resto» cuando estuviera segura.', points: 25 },
    { id: 'se-ladas', characterId: 'ch-ladas', text: 'Hydra seguía a Selene con una baliza desde hacía un mes: sospechaban que iba a filtrar algo.', points: 25 },
  ],

  interrogations: [
    {
      id: 'in-nikos',
      characterId: 'ch-nikos',
      holder: 'B',
      setting: 'Sala de control de la Torre 7. Las pantallas siguen mostrando el caudal en tiempo real.',
      opening: [{ text: 'Selene era la mejor ingeniera que he conocido. Si hay algo que pueda hacer… Lo que necesiten.' }],
      topics: [
        {
          id: 'tp-nikos-noche',
          label: 'La noche del apagón',
          kind: 'alibi',
          questions: [
            {
              id: 'q-nikos-noche',
              prompt: '¿Dónde estaba anoche?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Aquí, en la consola 2. Cuando se fue la luz seguí con el sistema de emergencia; son doce minutos muy largos.', tone: 'truth' },
                    { id: 'ln-nikos-consola', text: 'No me levanté de la silla en toda la noche. Pueden comprobar la consola: hay actividad continua.', tone: 'lie' },
                  ],
                  effects: [{ unlockTimelineEvent: 'te-falso-nikos' }],
                },
              ],
            },
            {
              id: 'q-nikos-cx',
              prompt: 'Su consola tecleaba cada 1,8 segundos exactos durante media hora.',
              kind: 'contradiction',
              contradiction: 'cx-nikos',
              responses: [{ lines: [{ text: 'Un script de mantenimiento. Lo lanzo cuando reviso los depósitos a mano. ¿Eso es un delito?', tone: 'evasion' }] }],
            },
            {
              id: 'q-nikos-chaqueta',
              prompt: '¿Dónde guarda su chaqueta de mantenimiento?',
              kind: 'ask',
              requires: { fact: 'fa-dron-2314' },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Draganis tarda un segundo de más en contestar.' },
                    { text: 'En mi taquilla, la 12. Como todo el mundo. ¿Quieren verla? Adelante.', tone: 'neutral' },
                  ],
                  effects: [{ grantEvidence: 'ev-taquilla' }],
                },
              ],
            },
          ],
        },
        {
          id: 'tp-nikos-selene',
          label: 'Selene Markou',
          kind: 'victim',
          about: 'ch-selene',
          questions: [
            {
              id: 'q-nikos-relacion',
              prompt: '¿Cómo se llevaban?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Bien. Discutíamos de números, como discuten dos ingenieros. Ella era muy… exigente con los números.', tone: 'evasion' }] }],
            },
            {
              id: 'q-nikos-informes',
              prompt: 'Usted firma informes de producción que la torre no puede alcanzar.',
              kind: 'confront',
              requires: { fact: 'fa-cifras' },
              responses: [{ lines: [{ text: 'Firmo lo que me pasa el sistema de agregación de Hydra. Si hay un error, es del algoritmo, no mío.', tone: 'lie' }] }],
            },
            {
              id: 'q-nikos-final',
              prompt: 'Una macro tecleaba por usted mientras bajaba del nivel 9 con la chaqueta rota. Las fibras estaban bajo las uñas de Selene.',
              kind: 'confront',
              requires: { all: [{ fact: 'fa-coartada-falsa' }, { fact: 'fa-chaqueta' }] },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Draganis mira el contador de caudal de la pantalla, que sigue subiendo.' },
                    { text: 'Iba a hundir la ciudad. ¿Saben lo que pasa si mañana se publica que hay la mitad de agua? Disturbios. Muertos.', tone: 'admission' },
                    { text: 'Solo quería la tarjeta. Ella no la soltaba. La barandilla… no la miré.', tone: 'admission' },
                  ],
                  effects: [{ setFlag: 'nikos-confiesa' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-irini',
      characterId: 'ch-irini',
      holder: 'B',
      setting: 'Un café del muelle, con la cúpula goteando condensación.',
      opening: [{ text: 'Si esto es una citación encubierta, quiero a mi abogada. Si no, tienen diez minutos.' }],
      topics: [
        {
          id: 'tp-irini-noche',
          label: 'La noche del apagón',
          kind: 'alibi',
          questions: [
            {
              id: 'q-irini-noche',
              prompt: '¿Dónde estuvo anoche?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-irini-casa', text: 'En casa, escribiendo. No conocía a Selene Markou más que de nombre.', tone: 'lie' }], effects: [{ unlockTimelineEvent: 'te-falso-irini' }] }],
            },
            {
              id: 'q-irini-cx',
              prompt: 'Quedaron a las 22:40 en la plataforma 3. Tenemos sus mensajes.',
              kind: 'contradiction',
              contradiction: 'cx-irini',
              responses: [
                {
                  lines: [
                    { text: 'Era mi fuente. Me dio un primer lote de datos: tablas de caudal. Dijo que el resto me lo daría cuando estuviera segura.', tone: 'admission' },
                    { text: 'Me fui a las once menos cuarto, más o menos. Ella estaba bien. Nerviosa, pero bien.', tone: 'truth' },
                  ],
                  effects: [{ revealSecret: 'se-irini' }, { grantFact: 'fa-irini-se-fue' }, { unlockTimelineEvent: 'te-irini-sale' }],
                },
              ],
            },
            {
              id: 'q-irini-miedo',
              prompt: '¿De quién tenía miedo Selene?',
              kind: 'press',
              requires: { secret: 'se-irini' },
              responses: [{ lines: [{ text: 'De dentro, no de fuera. Me dijo: «Hydra me vigila, pero quien firma las cifras está a tres consolas de mí».', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-ladas',
      characterId: 'ch-ladas',
      holder: 'A',
      setting: 'Videollamada desde la sede de Hydra. Detrás de Ladas, una pared desnuda.',
      opening: [{ text: 'Hydra colaborará plenamente. Tienen mi tiempo hasta que llegue el comunicado oficial.' }],
      topics: [
        {
          id: 'tp-ladas-noche',
          label: 'La noche del apagón',
          kind: 'alibi',
          questions: [
            {
              id: 'q-ladas-noche',
              prompt: '¿Dónde estaba anoche?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'En la sede, en una reunión de crisis por el racionamiento hasta medianoche. Les envío el registro de accesos.', tone: 'truth' }], effects: [{ grantEvidence: 'ev-sede' }] }],
            },
          ],
        },
        {
          id: 'tp-ladas-selene',
          label: 'La seguridad de la torre',
          kind: 'other',
          questions: [
            {
              id: 'q-ladas-vigilancia',
              prompt: '¿Vigilaba Hydra a la doctora Markou?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-ladas-nunca', text: 'Nunca. Hydra no vigila a sus ingenieros. Sería ilegal.', tone: 'lie' }] }],
            },
            {
              id: 'q-ladas-cx',
              prompt: 'En el bolso de la doctora había una baliza de Hydra.',
              kind: 'contradiction',
              contradiction: 'cx-ladas',
              responses: [
                {
                  lines: [
                    { text: 'Teníamos indicios de que iba a filtrar datos a la prensa. La seguíamos desde hacía un mes. Por eso sé que no salió de la torre esa noche.', tone: 'admission' },
                    { text: 'Y por eso sé que su señal se quedó quieta en el nivel 2 a las 23:06. Hydra no la mató, inspector: Hydra la estaba mirando.', tone: 'truth' },
                  ],
                  effects: [{ revealSecret: 'se-ladas' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto a la muerte (23:06)
  timeline: [
    { id: 'te-cita', t: -26, display: '22:40', title: 'Selene e Irini se citan en la plataforma 3', description: 'Selene le entrega un primer lote de datos.', characters: ['ch-selene', 'ch-irini'], location: 'lo-torre', key: true },
    { id: 'te-entrada', t: -25, display: '22:41', title: 'Selene entra en la torre con su tarjeta', description: 'Acceso principal.', characters: ['ch-selene'], location: 'lo-torre' },
    { id: 'te-irini-sale', t: -10, display: '22:56', title: 'Irini sale de la torre', description: 'Antes del apagón.', characters: ['ch-irini'], location: 'lo-torre', key: true },
    { id: 'te-macro', t: -8, display: '22:58', title: 'La consola de Draganis empieza a teclear sola', description: 'Una macro de intervalo fijo.', characters: ['ch-nikos'], location: 'lo-control', key: true },
    { id: 'te-apagon', t: -6, display: '23:00', title: 'Apagón en la Torre 7', description: 'Doce minutos sin cámaras fijas.', characters: [], location: 'lo-torre', key: true },
    { id: 'te-muerte', t: 0, display: 'Hacia las 23:06', title: 'Selene cae desde el nivel 9', description: 'Tras un forcejeo en la pasarela.', characters: ['ch-selene'], location: 'lo-pasarela', key: true },
    { id: 'te-dron', t: 8, display: '23:14', title: 'Una chaqueta naranja baja del nivel 9', description: 'Captada por el dron de mantenimiento.', characters: ['ch-nikos'], location: 'lo-pasarela', key: true },
    { id: 'te-borrado', t: 14, display: '23:20', title: 'Se borra «Reservas_reales» con la tarjeta de Selene', description: 'Terminal T-3, junto a la sala de control.', characters: ['ch-nikos'], location: 'lo-control', key: true },
    { id: 'te-hallazgo', t: 484, display: '07:10', title: 'Un técnico encuentra el cuerpo', description: 'Turno de mañana.', characters: ['ch-selene'], location: 'lo-torre', key: true },
    { id: 'te-falso-nikos', t: -2, display: 'Toda la noche', title: 'Draganis, sin levantarse de su consola', description: 'Según Draganis.', characters: ['ch-nikos'], veracity: 'false', claimedBy: 'ch-nikos' },
    { id: 'te-falso-irini', t: -20, display: 'Toda la noche', title: 'Irini, en casa escribiendo', description: 'Según Irini.', characters: ['ch-irini'], veracity: 'false', claimedBy: 'ch-irini' },
  ],

  accusation: {
    motives: [
      { id: 'mo-reservas', label: 'Impedir que salieran a la luz las cifras reales de agua que él falsificaba', availableWhen: { fact: 'fa-motivo' } },
      { id: 'mo-puesto', label: 'Quedarse con la jefatura de la torre' },
      { id: 'mo-filtracion', label: 'Proteger al consorcio de una filtración', availableWhen: { secret: 'se-ladas' } },
      { id: 'mo-exclusiva', label: 'Asegurarse la exclusiva antes de que la fuente se echara atrás', availableWhen: { secret: 'se-irini' } },
    ],
    methods: [
      { id: 'me-empujon', label: 'La empujó desde la pasarela durante el apagón y usó su tarjeta para borrar las cifras', availableWhen: { fact: 'fa-tarjeta-usada' } },
      { id: 'me-barandilla', label: 'Saboteó la barandilla del nivel 9' },
      { id: 'me-dron', label: 'Lanzó un dron de mantenimiento contra ella' },
      { id: 'me-accidente', label: 'No hubo crimen: fue un accidente en la oscuridad' },
    ],
  },

  solution: {
    culprits: ['ch-nikos'],
    motive: 'mo-reservas',
    method: 'me-empujon',
    proof: ['ev-taquilla', 'ev-dron', 'ev-consola', 'ev-borrado'],
    whatHappened:
      'Nikos Draganis firmaba producciones de agua imposibles pagadas por el consorcio. Selene Markou guardaba las cifras reales y había empezado a pasárselas a una periodista. Esa noche, Draganis dejó una macro tecleando en su consola, aprovechó el apagón para subir al nivel 9, forcejeó con Selene para quitarle la tarjeta y la empujó por la barandilla. A las 23:20 usó la tarjeta para borrar «Reservas_reales». No contaba con el dron de mantenimiento, que siguió volando con su batería.',
    reconstruction: [
      'A las 22:40 Selene se cita con Irini Saba en la plataforma 3 y le entrega un primer lote de datos. Irini se va a las 22:56.',
      'A las 22:58 Draganis lanza una macro en su consola: su coartada.',
      'A las 23:00 se va la luz. Draganis sube al nivel 9 con su chaqueta de mantenimiento.',
      'Forcejean por la tarjeta; Selene le desgarra la manga. Hacia las 23:06 cae desde la pasarela.',
      'A las 23:14 el dron, con batería propia, lo capta bajando a la escalera sujetándose el antebrazo.',
      'A las 23:20 usa la tarjeta de Selene en la terminal T-3 y borra «Reservas_reales». A las 23:31 detiene la macro.',
    ],
    decisiveEvidence: ['ev-consola', 'ev-dron', 'ev-taquilla', 'ev-forense', 'ev-accesos', 'ev-borrado'],
    alibiTruths: [
      { characterId: 'ch-nikos', truth: 'No estaba en su consola: una macro tecleaba por él de 22:58 a 23:31.' },
      { characterId: 'ch-irini', truth: 'No estaba en casa: se reunió con Selene en la torre, pero se fue a las 22:56, antes del apagón.' },
      { characterId: 'ch-ladas', truth: 'Su coartada es cierta. Mintió sobre la vigilancia de Hydra.' },
    ],
  },

  endings: [
    {
      id: 'en-confesion',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { flag: 'nikos-confiesa' } },
      outcome: 'success',
      title: 'Agua clara',
      text: 'Draganis confiesa en la sala de control, con el contador de caudal a su espalda. Irini Saba publica las cifras reales tres días después. Hay disturbios, sí; también una comisión que revisa las torres. Las raciones bajan. Por primera vez en años, son verdad.',
    },
    { id: 'en-exito', when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' }, outcome: 'success', title: 'Caso cerrado bajo la cúpula', text: 'La macro, el dron y la chaqueta rota bastan. Draganis es condenado. Hydra emite un comunicado lamentando «la conducta individual de un empleado».' },
    { id: 'en-parcial', when: { culprit: 'correct' }, outcome: 'partial', title: 'El culpable, sin el porqué', text: 'Draganis es detenido, pero la acusación no explica lo que había detrás. Hydra lo despide discretamente y los informes de reservas siguen saliendo cada semana.' },
    { id: 'en-irini', when: { culprit: 'ch-irini' }, outcome: 'failure', title: 'La periodista', text: 'Irini Saba es detenida. El consorcio aplaude. Los datos que Selene le dio desaparecen en el depósito de pruebas. Draganis asciende a jefe de torre.' },
    { id: 'en-ladas', when: { culprit: 'ch-ladas' }, outcome: 'failure', title: 'El jefe de seguridad', text: 'Las cámaras de la sede de Hydra desmontan la acusación en una mañana. Ladas presenta una queja formal y la Prefectura os aparta del caso.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Accidente laboral', text: 'El expediente se cierra como accidente durante un apagón. La Torre 7 recibe una barandilla nueva.' },
  ],

  hints: [
    {
      id: 'hl-comun',
      topic: 'Dos mitades',
      relevantWhen: { not: { fact: 'fa-tarjeta-usada' } },
      steps: ['Ninguno de los dos tiene el caso entero: poned en común lo que veis.', 'Lo que falta en la escena puede aparecer en un registro.', 'La tarjeta que no estaba con el cuerpo dejó rastro en el registro de accesos.'],
    },
    {
      id: 'hl-coartada',
      topic: 'Una coartada perfecta',
      relevantWhen: { all: [{ fact: 'fa-tarjeta-usada' }, { not: { fact: 'fa-coartada-falsa' } }] },
      steps: ['Una coartada demasiado continua merece una segunda mirada.', 'Mirad cómo tecleaba la consola 2 durante el apagón.', 'Relacionad el ritmo de la consola de Draganis con lo que vio el dron a las 23:14.'],
    },
    {
      id: 'hl-chaqueta',
      topic: 'La chaqueta',
      relevantWhen: { all: [{ fact: 'fa-dron-2314' }, { not: { fact: 'fa-chaqueta' } }] },
      steps: ['El dron vio una prenda muy concreta.', 'Preguntad a quien pueda llevarla dónde la guarda.', 'Comparad la manga de la chaqueta de la taquilla con lo que encontró el forense.'],
    },
  ],

  objectives: [
    { id: 'ob-irini', text: 'Averiguad qué hacía Irini Saba en la torre.', completeWhen: { secret: 'se-irini' }, points: 30 },
    { id: 'ob-ladas', text: 'Descubrid qué ocultaba Hydra.', completeWhen: { secret: 'se-ladas' }, points: 30 },
    { id: 'ob-motivo', text: 'Recuperad lo que había en la carpeta borrada.', completeWhen: { fact: 'fa-motivo' }, points: 40, hidden: true },
  ],

  assets: [],
};

export default caseFile;
