import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-I-0003 · EL PASTEL DE NAVIDAD
 * Le Glandier (Corrèze), enero de 1840 · Envenenamiento · Caso real · Inspector
 *
 * Caso real: la muerte de Charles Lafarge y el juicio a su esposa, Marie
 * Lafarge, el primero en que una pericia toxicológica (el método de Marsh,
 * aplicado por Mathieu Orfila) decidió un proceso ante la opinión pública.
 * Los hechos documentados siguen las fuentes; las conversaciones del
 * investigador son una recreación.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-I-0003',
  contentVersion: 1,
  mode: 'individual',
  title: 'El pastel de Navidad',
  subtitle: 'Un herrero arruinado muere tras comer lo que le manda su esposa',
  origin: 'real',
  historical: {
    documented: [
      'Marie Cappelle, huérfana de buena familia parisina, se casó en agosto de 1839 con Charles Lafarge, dueño de una forja en Le Glandier (Corrèze), un antiguo monasterio en ruinas.',
      'Charles había presentado su negocio como próspero; estaba cargado de deudas. Marie descubrió la casa medio derruida e infestada de ratas, y la primera noche le escribió pidiéndole que la dejara marcharse.',
      'En diciembre de 1839 Charles viajó a París para conseguir dinero con una patente. Recibió de Le Glandier un pastel; tras comerlo enfermó con vómitos.',
      'Volvió a casa en enero de 1840 y empeoró. Marie le atendía y le daba bebidas y comidas. Murió el 14 de enero de 1840.',
      'Marie había comprado arsénico en la farmacia de Uzerche, alegando que era para las ratas.',
      'Anna Brun, dama de compañía de la casa, declaró haber visto a Marie remover un polvo blanco en las bebidas del enfermo. Marie dijo que era goma arábiga.',
      'Una pasta matarratas preparada en la casa resultó no contener arsénico, sino harina y bicarbonato.',
      'Los primeros análisis locales fueron contradictorios. Mathieu Orfila, decano de la Facultad de Medicina de París, aplicó el método de Marsh a los restos exhumados y halló arsénico.',
      'Marie Lafarge fue condenada en septiembre de 1840 a trabajos forzados a perpetuidad, conmutados por prisión. Fue liberada en 1852, enferma, y murió ese mismo año.',
      'Denis Barbier, empleado de Charles, también había comprado arsénico; la defensa le señaló, sin éxito.',
    ],
    hypotheses: [
      'Una parte de la opinión de la época, y algunos autores después, defendieron la inocencia de Marie y sospecharon de Denis Barbier.',
      'La fiabilidad de los primeros análisis químicos fue muy discutida.',
    ],
    dramatized: [
      'Las conversaciones del investigador con los personajes y el orden de sus preguntas son una recreación.',
      'La redacción exacta de documentos, notas y horas está reconstruida para el juego.',
      'Los retratos son recreaciones artísticas, no fotografías de las personas reales.',
    ],
    documentedResolution:
      'Marie Lafarge fue declarada culpable de envenenar con arsénico a su marido, Charles Lafarge, y condenada a trabajos forzados a perpetuidad (pena conmutada por prisión). Mantuvo su inocencia hasta su muerte en 1852.',
    sources: [
      'Procès de Madame Lafarge, actas publicadas (París, 1840)',
      'Marie Cappelle, Mémoires de Marie Cappelle, veuve Lafarge (1841)',
      'J. M. Orfila, informes periciales sobre el caso Lafarge (1840)',
    ],
  },
  era: 'c19',
  eraLabel: 'Corrèze, 1840',
  year: 1840,
  location: { city: 'Le Glandier', place: 'Forja y casa de los Lafarge', country: 'Francia' },
  category: 'homicide',
  difficulty: 'inspector',
  keywords: ['Lafarge', 'arsénico', 'Orfila', 'Marsh', 'envenenamiento', 'Francia', 'pastel', 'caso real'],
  ambience: { music: 'victorian-night', mood: 'rural' },
  maxHints: 4,

  briefing: {
    incidentDisplay: 'Martes, 14 de enero de 1840 · madrugada',
    summary:
      'Charles Lafarge, dueño de la forja de Le Glandier, ha muerto tras dos semanas de vómitos y dolores. Tenía veintiocho años. Su madre está convencida de que lo ha envenenado su esposa, una joven parisina con la que se casó hace cinco meses.',
    context:
      'El juez de Brive le encarga reunir lo que se sepa antes de que el asunto llegue a París, donde ya hablan los periódicos. La viuda es de buena familia y tiene amigos influyentes; la familia del muerto la odia.',
    background:
      'Le Glandier es un antiguo monasterio cartujo convertido en forja. Charles lo presentaba como una empresa próspera; en realidad, debía dinero a medio Limousin.',
    victim: 'ch-charles',
    initialFacts: [],
    initialEvidence: ['ev-certificado', 'ev-carta-marie', 'ev-pastel'],
    initialTimeline: ['te-boda', 'te-pastel', 'te-muerte'],
  },

  characters: [
    {
      id: 'ch-charles',
      name: 'Charles Lafarge',
      look: { hair: 'short' },
      role: 'victim',
      age: 28,
      occupation: 'Dueño de una forja',
      appearance:
        'a 28-year-old French provincial ironmaster in 1839, heavy coarse face, thick dark hair, side whiskers, dark wool coat and loosely tied cravat, awkward stiff pose',
      summary: 'Un hombre rudo, endeudado y con grandes planes.',
      biography: 'Heredó la forja de su padre y se arruinó intentando modernizarla. Viudo de una primera esposa, buscó por agencia matrimonial una mujer con dote. La encontró en París.',
      personality: ['Rudo', 'Optimista con el dinero ajeno', 'Apegado a su madre'],
    },
    {
      id: 'ch-marie',
      name: 'Marie Lafarge',
      look: { hair: 'bun' },
      role: 'suspect',
      age: 24,
      occupation: 'Esposa de Charles',
      appearance:
        'a slender 24-year-old French woman in 1840, pale oval face, large dark intelligent eyes, dark hair parted in the middle and drawn into a low bun, black mourning dress with a high lace collar',
      summary: 'Una parisina culta, encerrada en una casa en ruinas.',
      biography: 'Huérfana criada por parientes acomodados de París. Lee, escribe versos y toca el piano. Se casó con Charles en cuatro días, convencida de que era rico. Llegó a Le Glandier y encontró ratas y deudas.',
      personality: ['Inteligente', 'Orgullosa', 'Teatral'],
      relationToVictim: 'Su esposa',
      motive: { text: 'Fue engañada sobre la fortuna de su marido; le pidió que la dejara ir y él se negó.', visibleWhen: { fact: 'fa-engano' } },
      alibi: { claim: 'Cuidó a su marido día y noche. El arsénico era para las ratas.' },
    },
    {
      id: 'ch-denis',
      name: 'Denis Barbier',
      look: { hair: 'short' },
      role: 'suspect',
      age: 30,
      occupation: 'Empleado de confianza de Charles',
      appearance:
        'a 30-year-old French clerk in 1840, thin sharp face, small dark eyes, slicked dark hair, threadbare dark coat and high collar, sly guarded expression',
      summary: 'Sabía de los negocios de Charles más que nadie.',
      biography: 'Hombre para todo de Charles: lleva las cuentas, viaja con él y hace recados. Le acompañó a París en diciembre. Hay quien dice que también le ayudaba con papeles menos limpios.',
      personality: ['Servicial', 'Reservado', 'Hostil con la señora'],
      relationToVictim: 'Su empleado',
      motive: { text: 'Estaba metido en los negocios turbios de Charles; con él muerto, nadie sabría lo que había firmado.', visibleWhen: { fact: 'fa-pagares-falsos' } },
      alibi: { claim: 'Se ocupó de la forja y de los recados. Compró arsénico porque se lo mandó el señor.' },
    },
    {
      id: 'ch-anna',
      name: 'Anna Brun',
      look: { hair: 'bun' },
      role: 'witness',
      age: 26,
      occupation: 'Dama de compañía de la casa',
      appearance:
        'a 26-year-old French lady companion in 1840, plain honest face, light brown hair in a tight bun under a small white cap, simple dark dress with a white collar, anxious eyes',
      summary: 'Vio lo que se servía en la habitación del enfermo.',
      biography: 'Vive en Le Glandier como compañía de la familia. Atendió a Charles junto a la señora y a la madre durante la enfermedad.',
      personality: ['Observadora', 'Temerosa', 'Honrada'],
    },
    {
      id: 'ch-madre',
      name: 'Adélaïde Lafarge',
      look: { hair: 'hat' },
      role: 'witness',
      age: 57,
      occupation: 'Madre de Charles',
      appearance:
        'a stern 57-year-old French provincial widow in 1840, deeply lined face, thin pressed lips, grey hair under a white lace widow cap, black dress and shawl',
      summary: 'Nunca quiso a su nuera.',
      biography: 'Vive en Le Glandier. Adoraba a su hijo y desconfió desde el primer día de la parisina que se encerraba a escribir cartas.',
      personality: ['Desconfiada', 'Rencorosa', 'Firme'],
    },
    {
      id: 'ch-orfila',
      name: 'Mathieu Orfila',
      look: { hair: 'short' },
      role: 'witness',
      age: 52,
      occupation: 'Decano de Medicina de París, toxicólogo',
      appearance:
        'a 52-year-old Spanish-born French toxicologist in 1840, broad intelligent face, dark curly hair going grey, clean shaven, dark coat with a high white collar and black cravat, confident gaze',
      summary: 'El químico más famoso de Francia.',
      biography: 'Nacido en Menorca, padre de la toxicología moderna. Ha perfeccionado el método de Marsh, capaz de revelar cantidades minúsculas de arsénico en un cuerpo.',
      personality: ['Metódico', 'Seguro de sí', 'Teatral en los tribunales'],
      appearsWhen: { fact: 'fa-analisis-dudosos' },
    },
  ],

  locations: [
    { id: 'lo-glandier', name: 'Le Glandier', description: 'Antiguo monasterio cartujo convertido en forja y vivienda, húmedo y medio en ruinas.' },
    { id: 'lo-alcoba', name: 'Alcoba del enfermo', description: 'Donde Charles pasó sus dos últimas semanas.' },
    { id: 'lo-uzerche', name: 'Farmacia de Uzerche', description: 'La botica más cercana, a unas horas de camino.' },
    { id: 'lo-paris', name: 'París', description: 'Donde Charles buscaba dinero en diciembre de 1839.' },
  ],

  relationships: [
    { id: 're-matrimonio', a: 'ch-marie', b: 'ch-charles', label: 'Matrimonio de cinco meses' },
    { id: 're-empleado', a: 'ch-denis', b: 'ch-charles', label: 'Empleado y hombre de confianza' },
    { id: 're-suegra', a: 'ch-madre', b: 'ch-marie', label: 'Suegra y nuera, enfrentadas' },
    { id: 're-enemigos', a: 'ch-denis', b: 'ch-marie', label: 'Se detestan', visibleWhen: { asked: 'q-denis-marie' } },
  ],

  facts: [
    { id: 'fa-engano', text: 'Charles se presentó como rico; Marie descubrió deudas y una casa en ruinas, y le pidió que la dejara ir.', important: true },
    { id: 'fa-pastel-envio', text: 'Marie preparó y mandó a París un envío con pastelitos y su retrato.', important: true },
    { id: 'fa-pastel-cambiado', text: 'A París llegó un único pastel grande, no los pastelitos que se vieron empaquetar.', important: true },
    { id: 'fa-arsenico-marie', text: 'Marie compró arsénico en Uzerche, diciendo que era para las ratas.', important: true },
    { id: 'fa-arsenico-denis', text: 'Denis también compró arsénico, por encargo de Charles.', important: true },
    { id: 'fa-pasta-sin', text: 'La pasta matarratas de la casa no contenía arsénico: era harina y bicarbonato.', important: true },
    { id: 'fa-polvo', text: 'Anna vio a Marie echar un polvo blanco en las bebidas del enfermo; ella dijo que era goma arábiga.', important: true },
    { id: 'fa-ponche', text: 'El ponche de huevo que Marie preparó tenía copos blancos que flotaban: no se disolvían como la goma.', important: true },
    { id: 'fa-analisis-dudosos', text: 'Los químicos de Brive hallaron arsénico en el ponche y en el estómago, pero no en el cuerpo: el resultado se discute.', important: true },
    { id: 'fa-orfila', text: 'Con el método de Marsh, Orfila halló arsénico en el cuerpo exhumado de Charles, y no en la tierra del cementerio.', important: true },
    { id: 'fa-pagares-falsos', text: 'Charles y Denis habían falsificado pagarés para sostener la forja.' },
    { id: 'fa-denis-paris', text: 'Denis estuvo en París con Charles cuando llegó el pastel, pero no lo probó.' },
    { id: 'fa-marie-cuidaba', text: 'Marie insistía en servir ella misma todas las bebidas y comidas del enfermo.', important: true },
  ],

  evidence: [
    {
      id: 'ev-certificado',
      kind: 'report',
      title: 'Nota del médico de cabecera',
      dated: '14 de enero de 1840',
      source: 'Doctor Bardon, médico de Uzerche',
      summary: 'Dos semanas de una enfermedad que no se curaba.',
      related: { characters: ['ch-charles'], locations: ['lo-alcoba'], events: ['te-muerte'] },
      body: [
        { type: 'heading', text: 'M. CHARLES LAFARGE · DEFUNCIÓN' },
        {
          type: 'typed',
          text: 'Vómitos violentos, sed ardiente, dolores de vientre, calambres en las piernas. {{dt-cert-sintomas|Mejora algunos días y empeora siempre tras comer o beber.}} Lo traté de una afección del estómago, que creí cólera.',
        },
        { type: 'typed', text: '{{dt-cert-antes|Ya volvió enfermo de París, con los mismos síntomas, tras comer algo que le enviaron de casa.}}' },
        { type: 'signature', name: 'Dr. Bardon' },
      ],
      details: [
        { id: 'dt-cert-sintomas', label: 'Empeora al comer', description: 'Los síntomas, que vuelven tras cada comida o bebida, son los de un envenenamiento repetido por arsénico.', effects: [], points: 15 },
        { id: 'dt-cert-antes', label: 'Ya enfermó en París', description: 'La enfermedad empezó con algo enviado desde Le Glandier.', effects: [{ unlockTimelineEvent: 'te-enferma-paris' }], points: 10 },
      ],
    },
    {
      id: 'ev-carta-marie',
      kind: 'letter',
      title: 'Carta de Marie a Charles, la primera noche',
      dated: 'Agosto de 1839',
      source: 'Hallada entre los papeles de Charles',
      summary: 'Lo que Marie escribió nada más llegar a Le Glandier.',
      related: { characters: ['ch-marie', 'ch-charles'], locations: ['lo-glandier'], events: ['te-boda'] },
      body: [
        { type: 'paragraph', text: 'Charles:' },
        {
          type: 'paragraph',
          text: '{{dt-carta-engano|Me han engañado. Esta casa no es la que me describiste; es una ruina, y tu fortuna, una ficción.}} No te quiero ni te querré nunca. Amo a otro.',
        },
        { type: 'paragraph', text: '{{dt-carta-veneno|Déjame marchar esta misma noche; si no, tengo arsénico, y sabré usarlo conmigo.}}' },
        { type: 'signature', name: 'Marie' },
      ],
      details: [
        { id: 'dt-carta-engano', label: 'Engañada', description: 'Marie se sintió estafada desde el primer día.', effects: [{ grantFact: 'fa-engano' }], points: 15 },
        { id: 'dt-carta-veneno', label: '«Tengo arsénico»', description: 'Ya hablaba de arsénico en agosto, meses antes de la compra en Uzerche. Luego dijo que era una amenaza contra sí misma, y se reconcilió con Charles.', effects: [], points: 10 },
      ],
      decisive: true,
    },
    {
      id: 'ev-pastel',
      kind: 'statement',
      title: 'Declaración sobre el envío a París',
      source: 'Tomada a la cocinera de Le Glandier',
      summary: 'Lo que se cocinó para mandar a Charles.',
      related: { characters: ['ch-marie', 'ch-charles'], locations: ['lo-glandier', 'lo-paris'], events: ['te-pastel'] },
      body: [
        { type: 'typed', text: '—Para Navidad, la señora quiso mandarle al señor unos pastelitos, y con ellos su retrato. Su suegra hizo los pastelitos; la señora escribió la carta.' },
        {
          type: 'typed',
          text: '—{{dt-envio-marie|La señora preparó la caja ella sola y la cerró con su lacre.}} Iban cuatro o cinco pastelitos pequeños en una caja.',
        },
        { type: 'signature', name: 'Cocinera de Le Glandier' },
      ],
      details: [{ id: 'dt-envio-marie', label: 'Cerró la caja ella misma', description: 'Marie fue la última en tocar el envío antes de que saliera.', effects: [{ grantFact: 'fa-pastel-envio' }], points: 15 }],
      decisive: true,
    },
    {
      id: 'ev-hostal',
      kind: 'statement',
      title: 'Declaración del dueño del hotel de París',
      source: 'Hotel de la Univers, París',
      summary: 'Cómo llegó el paquete a París.',
      autoDiscoverWhen: { asked: 'q-denis-paris' },
      related: { characters: ['ch-charles', 'ch-denis'], locations: ['lo-paris'], events: ['te-enferma-paris'] },
      body: [
        {
          type: 'typed',
          text: '—Llegó una caja para M. Lafarge el 18 de diciembre. {{dt-hostal-grande|Dentro no había pastelitos: había un solo pastel grande, redondo.}} El señor comió un trozo esa noche y estuvo vomitando hasta el amanecer.',
        },
        { type: 'typed', text: '—{{dt-hostal-denis|Su empleado no lo probó: dijo que no le gustaban los dulces.}} Tiró el resto a la mañana siguiente.' },
        { type: 'signature', name: 'El hotelero' },
      ],
      details: [
        { id: 'dt-hostal-grande', label: 'Un pastel grande', description: 'Lo que llegó no es lo que se vio empaquetar: alguien cambió el contenido.', effects: [{ grantFact: 'fa-pastel-cambiado' }, { unlockTimelineEvent: 'te-enferma-paris' }], points: 15 },
        { id: 'dt-hostal-denis', label: 'Denis no lo probó', description: 'Denis estaba allí, no comió y tiró lo que sobraba.', effects: [{ grantFact: 'fa-denis-paris' }], points: 10 },
      ],
      decisive: true,
    },
    {
      id: 'ev-farmacia',
      kind: 'record',
      title: 'Libro de venenos de la farmacia de Uzerche',
      source: 'Farmacia Eyssartier, Uzerche',
      summary: 'Quién compró arsénico, y cuándo.',
      autoDiscoverWhen: { asked: 'q-marie-ratas' },
      related: { characters: ['ch-marie', 'ch-denis'], locations: ['lo-uzerche'], events: ['te-compra-1', 'te-compra-2'] },
      body: [
        {
          type: 'table',
          header: ['Fecha', 'Comprador', 'Producto', 'Uso declarado'],
          rows: [
            ['12-dic-1839', '{{dt-farm-marie1|Mme. Lafarge}}', 'Arsénico, 64 g', 'Ratas'],
            ['2-ene-1840', '{{dt-farm-marie2|Mme. Lafarge, por medio de Denis}}', 'Arsénico, 64 g', 'Ratas'],
            ['5-ene-1840', '{{dt-farm-denis|D. Barbier, por orden del señor}}', 'Arsénico', 'Ratas'],
          ],
        },
        { type: 'handwritten', text: 'La señora insistió en que su marido no pudiera dormir por las ratas.', author: 'Nota del boticario' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-compra-1' }],
      details: [
        { id: 'dt-farm-marie1', label: 'Primera compra, antes del pastel', description: 'Marie compró arsénico seis días antes de mandar el envío a París.', effects: [{ grantFact: 'fa-arsenico-marie' }], points: 15 },
        { id: 'dt-farm-marie2', label: 'Segunda compra, al volver Charles', description: 'Al día siguiente de que Charles volviera enfermo, más arsénico.', effects: [{ unlockTimelineEvent: 'te-compra-2' }], points: 10 },
        { id: 'dt-farm-denis', label: 'Denis también compró', description: 'Denis tuvo arsénico en sus manos.', effects: [{ grantFact: 'fa-arsenico-denis' }], points: 10 },
      ],
      decisive: true,
    },
    {
      id: 'ev-pasta',
      kind: 'report',
      title: 'Análisis de la pasta matarratas',
      source: 'Químicos de Brive',
      summary: 'La pasta que se puso para las ratas de la casa.',
      autoDiscoverWhen: { fact: 'fa-arsenico-marie' },
      related: { characters: ['ch-marie'], locations: ['lo-glandier'], events: [] },
      body: [
        {
          type: 'typed',
          text: 'Muestras de la pasta preparada por orden de la señora y puesta en los rincones del desván. {{dt-pasta-nada|Composición: harina, agua y bicarbonato de sosa. No contiene arsénico.}}',
        },
        { type: 'typed', text: 'Las ratas, según los criados, siguen igual de gordas.' },
      ],
      details: [{ id: 'dt-pasta-nada', label: 'Pasta sin veneno', description: 'El arsénico comprado «para las ratas» no fue a parar a las ratas.', effects: [{ grantFact: 'fa-pasta-sin' }], points: 20 }],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-ponche',
      kind: 'physical',
      title: 'Vaso de ponche de huevo',
      source: 'Guardado por Adélaïde Lafarge',
      summary: 'El vaso que la madre apartó del enfermo.',
      autoDiscoverWhen: { asked: 'q-madre-vaso' },
      related: { characters: ['ch-madre', 'ch-marie'], locations: ['lo-alcoba'], events: ['te-ponche'] },
      body: [
        {
          type: 'typed',
          text: 'Ponche de huevo preparado por la señora Lafarge el 12 de enero. {{dt-ponche-copos|En la superficie flotan copos blancos que no se han disuelto: la goma arábiga se disuelve; el arsénico en polvo, mal molido, flota.}}',
        },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-ponche' }],
      details: [{ id: 'dt-ponche-copos', label: 'Copos que no se disuelven', description: 'El polvo blanco del ponche no es goma arábiga.', effects: [{ grantFact: 'fa-ponche' }], points: 20 }],
      decisive: true,
    },
    {
      id: 'ev-brive',
      kind: 'report',
      title: 'Informe de los químicos de Brive',
      source: 'Peritos del tribunal',
      summary: 'Arsénico en el ponche… y dudas en el cuerpo.',
      autoDiscoverWhen: { fact: 'fa-ponche' },
      related: { characters: ['ch-charles'], locations: [], events: [] },
      body: [
        { type: 'typed', text: 'Ponche de huevo: abundante arsénico. Contenido del estómago: arsénico, en cantidad apreciable.' },
        {
          type: 'typed',
          text: '{{dt-brive-cuerpo|Órganos exhumados del difunto, con el método de Marsh, que estos peritos aplican por primera vez: resultado negativo.}} La defensa sostiene que el arsénico del estómago pudo venir de los remedios.',
        },
      ],
      details: [{ id: 'dt-brive-cuerpo', label: 'Negativo en el cuerpo', description: 'Con el resultado del cuerpo en contra, el caso pende de un hilo. Hace falta un perito que domine el método.', effects: [{ grantFact: 'fa-analisis-dudosos' }], points: 15 }],
    },
    {
      id: 'ev-orfila',
      kind: 'report',
      title: 'Informe pericial de Mathieu Orfila',
      dated: 'Septiembre de 1840',
      source: 'Facultad de Medicina de París',
      summary: 'Lo que el método de Marsh, bien aplicado, encontró.',
      autoDiscoverWhen: { asked: 'q-orfila-marsh' },
      related: { characters: ['ch-orfila', 'ch-charles'], locations: [], events: ['te-orfila'] },
      body: [
        { type: 'heading', text: 'PERICIA TOXICOLÓGICA · LAFARGE' },
        {
          type: 'typed',
          text: 'Los peritos de Brive usaron reactivos impuros y un aparato mal montado. Repetido el análisis con reactivos comprobados en blanco: {{dt-orfila-cuerpo|hay arsénico en el hígado, en el corazón y en el tubo digestivo del difunto}}.',
        },
        { type: 'typed', text: '{{dt-orfila-tierra|La tierra del cementerio que rodeaba el ataúd, analizada aparte, no contiene arsénico: el veneno no vino de fuera.}}' },
        { type: 'signature', name: 'M. J. B. Orfila, decano' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-orfila' }],
      details: [
        { id: 'dt-orfila-cuerpo', label: 'Arsénico en los órganos', description: 'Charles Lafarge murió envenenado con arsénico.', effects: [{ grantFact: 'fa-orfila' }], points: 20 },
        { id: 'dt-orfila-tierra', label: 'No viene de la tierra', description: 'Se descarta que la tierra contaminara el cuerpo.', effects: [], points: 10 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-pagares',
      kind: 'document',
      title: 'Pagarés de la forja',
      source: 'Escritorio de Charles',
      summary: 'Firmas que no cuadran.',
      autoDiscoverWhen: { asked: 'q-denis-negocios' },
      related: { characters: ['ch-denis', 'ch-charles'], locations: ['lo-glandier'], events: [] },
      body: [
        {
          type: 'table',
          header: ['Fecha', 'Importe', 'Avalista'],
          rows: [
            ['nov-1839', '15.000 francos', '{{dt-pag-firma|«M. de Saint-Priest» (letra de Denis)}}'],
            ['dic-1839', '8.000 francos', 'Sin avalista'],
          ],
        },
        { type: 'handwritten', text: 'Que no se entere la señora.', author: 'Nota de Charles a Denis' },
      ],
      details: [{ id: 'dt-pag-firma', label: 'Una firma falsa', description: 'Denis y Charles falsificaban avales para conseguir dinero.', effects: [{ grantFact: 'fa-pagares-falsos' }], points: 15 }],
    },
  ],

  deductions: [
    {
      id: 'de-ratas',
      title: 'El arsénico no era para las ratas',
      combine: ['dt-farm-marie1', 'dt-pasta-nada'],
      explanation: 'Marie compró arsénico «para las ratas», pero la pasta que mandó poner no llevaba veneno. Lo que compró fue a otro sitio.',
      points: 30,
    },
    {
      id: 'de-pastel',
      title: 'El pastel cambiado',
      combine: ['dt-envio-marie', 'dt-hostal-grande'],
      explanation: 'La cocinera vio pastelitos; a París llegó un pastel grande. Quien cerró la caja pudo cambiar su contenido: fue Marie, a solas.',
      effects: [{ grantFact: 'fa-pastel-cambiado' }],
      points: 30,
    },
    {
      id: 'de-polvo',
      title: 'La «goma arábiga»',
      combine: ['fa-polvo', 'dt-ponche-copos'],
      explanation: 'Anna vio a Marie echar polvo blanco en las bebidas; en el ponche que la madre apartó, ese polvo flota y no se disuelve: no era goma, era arsénico.',
      points: 30,
    },
    {
      id: 'de-marsh',
      title: 'El veneno estaba en el cuerpo',
      combine: ['dt-brive-cuerpo', 'dt-orfila-cuerpo'],
      explanation: 'El primer análisis falló por un mal método. Bien aplicado, el de Marsh encuentra arsénico en los órganos de Charles, y no en la tierra.',
      points: 30,
    },
  ],

  contradictions: [
    {
      id: 'cx-marie-ratas',
      title: 'Las ratas no tocaron ese arsénico',
      a: { line: 'ln-marie-ratas' },
      b: { detail: 'dt-pasta-nada' },
      explanation: 'Marie dice que todo el arsénico se usó en la pasta para las ratas; la pasta no tiene arsénico.',
      effects: [{ grantFact: 'fa-arsenico-marie' }],
      points: 30,
    },
    {
      id: 'cx-marie-goma',
      title: 'La goma arábiga que no se disuelve',
      a: { line: 'ln-marie-goma' },
      b: { detail: 'dt-ponche-copos' },
      explanation: 'Marie dice que el polvo era goma arábiga para el estómago; los copos del ponche no se disuelven como la goma.',
      points: 30,
    },
    {
      id: 'cx-denis-pastel',
      title: 'Denis sí vio el pastel',
      a: { line: 'ln-denis-pastel' },
      b: { detail: 'dt-hostal-denis' },
      explanation: 'Denis dice que no estaba cuando llegó el paquete; el hotelero le vio rehusar el pastel y tirar el resto.',
      effects: [{ revealSecret: 'se-denis' }],
      points: 20,
    },
  ],

  secrets: [
    { id: 'se-denis', characterId: 'ch-denis', text: 'Denis tiró el resto del pastel porque Charles se lo pidió: temía que el médico de París lo achacara a la comida y empezara a hacer preguntas sobre la casa… y sobre los pagarés. Ocultaba fraude, no un asesinato.', points: 20 },
    { id: 'se-marie', characterId: 'ch-marie', text: 'Marie había amenazado ya en agosto con usar arsénico. Después fingió reconciliarse con Charles e incluso le hizo firmar un testamento en su favor, mientras él firmaba otro, a escondidas, en favor de su madre.', revealedWhen: { fact: 'fa-pastel-cambiado' }, points: 20 },
  ],

  interrogations: [
    {
      id: 'in-marie',
      characterId: 'ch-marie',
      setting: 'En el salón frío de Le Glandier, vestida de luto riguroso. Tiene un libro de versos en el regazo y no lo suelta.',
      opening: [{ text: 'Me acusan de lo peor porque soy de París y leo libros. Pregunte, señor. No tengo nada que esconder.' }],
      topics: [
        {
          id: 'tp-marie-boda',
          label: 'El matrimonio',
          kind: 'personal',
          questions: [
            {
              id: 'q-marie-boda',
              prompt: '¿Era feliz con su marido?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Al principio… me sentí engañada. Esta casa, las ratas, las deudas. Le escribí cosas terribles la primera noche.', tone: 'admission' },
                    { text: 'Pero hicimos las paces. Al final le quería. Mire cómo le cuidé.', tone: 'evasion' },
                  ],
                  effects: [{ grantFact: 'fa-engano' }],
                },
              ],
            },
            {
              id: 'q-marie-arsenico-carta',
              prompt: 'En aquella carta dice que tenía arsénico. En agosto.',
              kind: 'confront',
              requires: { detail: 'dt-carta-veneno' },
              responses: [{ lines: [{ text: 'Era para mí. Una muchacha desesperada dice cosas así. No lo tenía siquiera.', tone: 'evasion' }] }],
            },
          ],
        },
        {
          id: 'tp-marie-pastel',
          label: 'El envío a París',
          kind: 'events',
          questions: [
            {
              id: 'q-marie-pastel',
              prompt: '¿Qué le mandó a su marido por Navidad?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Unos pastelitos que hizo su madre y mi retrato. Quería que supiera que le esperaba.', tone: 'truth' },
                    { text: 'Que enfermara en París es cosa de los hoteles, o de lo que comía con ese Denis.', tone: 'evasion' },
                  ],
                },
              ],
            },
            {
              id: 'q-marie-cambio',
              prompt: 'A París no llegaron pastelitos, sino un pastel grande. Y usted cerró la caja sola.',
              kind: 'confront',
              requires: { fact: 'fa-pastel-cambiado' },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Marie cierra el libro despacio.' },
                    { text: 'Yo cerré la caja, sí. Luego pasó por muchas manos: el correo, la diligencia, el hotel. ¿Por qué ha de ser la mía?', tone: 'evasion' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'tp-marie-arsenico',
          label: 'El arsénico',
          kind: 'other',
          questions: [
            {
              id: 'q-marie-ratas',
              prompt: '¿Compró usted arsénico?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Para las ratas. No me dejaban dormir; corrían por encima de la cama. Lo compré en Uzerche, a la vista de todos.', tone: 'truth' },
                    { id: 'ln-marie-ratas', text: 'Todo se usó en la pasta que mandé poner en el desván. Todo.', tone: 'lie' },
                  ],
                },
              ],
            },
            {
              id: 'q-marie-cx-ratas',
              prompt: 'La pasta del desván no lleva arsénico. Es harina y bicarbonato.',
              kind: 'contradiction',
              contradiction: 'cx-marie-ratas',
              responses: [
                {
                  lines: [
                    { text: 'Entonces la cambiaron. Denis, o la vieja. Todos aquí me quieren ver en la cárcel.', tone: 'evasion' },
                  ],
                },
              ],
            },
            {
              id: 'q-marie-polvo',
              prompt: '¿Qué echaba usted en las bebidas de su marido?',
              kind: 'ask',
              requires: { fact: 'fa-polvo' },
              responses: [{ lines: [{ id: 'ln-marie-goma', text: 'Goma arábiga. Para el estómago. La llevo siempre en una cajita; cualquier médico se la recetaría.', tone: 'lie' }] }],
            },
            {
              id: 'q-marie-cx-goma',
              prompt: 'La goma se disuelve. Lo que usted echó en el ponche flota.',
              kind: 'contradiction',
              contradiction: 'cx-marie-goma',
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Un silencio largo. Por primera vez, Marie no mira al investigador, sino a la puerta.' },
                    { text: 'No diré nada más sin mi abogado. Lo que haya en ese vaso, otro lo puso.', tone: 'evasion' },
                  ],
                  effects: [{ grantFact: 'fa-marie-cuidaba' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-denis',
      characterId: 'ch-denis',
      setting: 'En la forja, entre el ruido del martinete. No deja de mirar hacia la casa.',
      opening: [{ text: 'El señor era un buen hombre. Si quiere saber qué pasó, pregunte a la de París.' }],
      topics: [
        {
          id: 'tp-denis-paris',
          label: 'París',
          kind: 'events',
          questions: [
            {
              id: 'q-denis-paris',
              prompt: '¿Estaba en París cuando llegó el paquete de Navidad?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { id: 'ln-denis-pastel', text: 'No, señor. Yo andaba de recados por la ciudad. Cuando volví, el señor ya estaba malo. Pregunte en el hotel.', tone: 'lie' },
                  ],
                },
              ],
            },
            {
              id: 'q-denis-cx',
              prompt: 'El hotelero le vio rechazar el pastel y tirar lo que sobró.',
              kind: 'contradiction',
              contradiction: 'cx-denis-pastel',
              responses: [
                {
                  lines: [
                    { text: 'Está bien. Estaba. No lo probé porque no me gustan los dulces, y lo tiré porque me lo mandó el señor.', tone: 'admission' },
                    { text: 'No quería que vinieran médicos haciendo preguntas. Teníamos… asuntos de papeles. Pero yo no envenené a nadie.', tone: 'admission' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'tp-denis-arsenico',
          label: 'El arsénico',
          kind: 'other',
          questions: [
            {
              id: 'q-denis-arsenico',
              prompt: '¿Compró usted arsénico?',
              kind: 'ask',
              requires: { detail: 'dt-farm-denis' },
              responses: [
                {
                  lines: [
                    { text: 'Una vez, porque el señor me lo mandó, para las ratas de la forja. Y otra vez se lo llevé a la señora, que me lo encargó ella.', tone: 'truth' },
                    { text: 'El mío lo puse en la forja, mezclado con sebo. Allí siguen las trampas, vaya a verlas.', tone: 'truth' },
                  ],
                  effects: [{ grantFact: 'fa-arsenico-denis' }],
                },
              ],
            },
          ],
        },
        {
          id: 'tp-denis-negocios',
          label: 'Los negocios',
          kind: 'person',
          about: 'ch-charles',
          questions: [
            {
              id: 'q-denis-negocios',
              prompt: '¿Cómo iban las cuentas de la forja?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Mal, como sabe todo el valle. El señor tenía ideas; le faltaba dinero. Mire los papeles si quiere, yo no tengo nada que ver.', tone: 'evasion' }] }],
            },
            {
              id: 'q-denis-marie',
              prompt: '¿Qué opina de la señora?',
              kind: 'ask',
              responses: [
                {
                  lines: [{ text: 'Que nunca quiso estar aquí. Que se pasaba el día escribiendo y mandando cartas. Y que no dejaba que nadie más le diera de comer al señor.', tone: 'truth' }],
                  effects: [{ grantFact: 'fa-marie-cuidaba' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-anna',
      characterId: 'ch-anna',
      setting: 'En la cocina, junto al fuego. Habla en voz baja y mira de vez en cuando a la escalera.',
      opening: [{ text: 'No quiero hacerle daño a nadie. Pero lo que vi, lo vi.' }],
      topics: [
        {
          id: 'tp-anna-alcoba',
          label: 'La alcoba del enfermo',
          kind: 'events',
          questions: [
            {
              id: 'q-anna-polvo',
              prompt: '¿Qué vio en la habitación del señor?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'La señora sacaba un polvo blanco de una cajita de malaquita y lo removía en el caldo, en el agua, en la leche.', tone: 'truth' },
                    { text: 'Le pregunté qué era. Me dijo que goma arábiga, para el estómago. Pero el señor, después, siempre vomitaba.', tone: 'truth' },
                  ],
                  effects: [{ grantFact: 'fa-polvo' }],
                },
              ],
            },
            {
              id: 'q-anna-quien',
              prompt: '¿Quién le servía la comida al enfermo?',
              kind: 'press',
              requires: { asked: 'q-anna-polvo' },
              responses: [
                {
                  lines: [{ text: 'Ella. Siempre ella. Si la madre o yo traíamos algo, la señora lo cogía y se lo daba con su mano.', tone: 'truth' }],
                  effects: [{ grantFact: 'fa-marie-cuidaba' }, { unlockTimelineEvent: 'te-cuidados' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-madre',
      characterId: 'ch-madre',
      setting: 'En la capilla de la casa, junto al ataúd. No se ha quitado el chal en dos días.',
      opening: [{ text: 'Mi hijo llegó de París enfermo y esa mujer lo terminó de matar en su propia cama.' }],
      topics: [
        {
          id: 'tp-madre-vaso',
          label: 'Lo que guardó',
          kind: 'other',
          questions: [
            {
              id: 'q-madre-vaso',
              prompt: '¿Tiene alguna prueba de lo que dice?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'El domingo, ella le preparó un ponche de huevo. Vi unos copos blancos flotando y no dejé que se lo bebiera.', tone: 'truth' },
                    { text: 'Lo guardé en el armario, tapado con un plato. Ahí lo tiene.', tone: 'truth' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'tp-madre-marie',
          label: 'La nuera',
          kind: 'person',
          about: 'ch-marie',
          questions: [
            {
              id: 'q-madre-testamento',
              prompt: '¿Hubo algún asunto de herencia?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Ella le hizo firmar un testamento dejándoselo todo. Él firmó otro, a escondidas, dejándomelo a mí. Ella no lo sabía.', tone: 'truth' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-orfila',
      characterId: 'ch-orfila',
      setting: 'En el laboratorio improvisado del tribunal de Tulle, rodeado de matraces y del público que no quiere perderse nada.',
      opening: [{ text: 'Mis colegas de Brive son honestos, pero el aparato de Marsh no perdona los descuidos. Pregunte.' }],
      topics: [
        {
          id: 'tp-orfila-marsh',
          label: 'El análisis',
          kind: 'other',
          questions: [
            {
              id: 'q-orfila-marsh',
              prompt: '¿Puede saberse si hay arsénico en el cuerpo?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Si lo hay, el método de Marsh lo convierte en una mancha negra y brillante sobre la porcelana. Pero hay que probar antes los reactivos en blanco: el cinc y el ácido a veces lo traen de fábrica.', tone: 'truth' },
                    { text: 'Y hay que analizar también la tierra de la tumba. Si no, cualquier abogado dirá que el veneno vino de fuera. Démelo todo y le daré la respuesta mañana.', tone: 'truth' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto a la muerte (madrugada del 14 de enero de 1840)
  timeline: [
    { id: 'te-boda', t: -224640, display: 'Agosto de 1839', title: 'Marie y Charles se casan y llegan a Le Glandier', description: 'La primera noche, Marie le escribe pidiéndole que la deje ir.', characters: ['ch-marie', 'ch-charles'], location: 'lo-glandier', key: true },
    { id: 'te-compra-1', t: -47520, display: '12 de diciembre', title: 'Marie compra arsénico en Uzerche', description: '«Para las ratas».', characters: ['ch-marie'], location: 'lo-uzerche', key: true },
    { id: 'te-pastel', t: -40320, display: '16 de diciembre', title: 'Sale de Le Glandier el envío de Navidad', description: 'Marie cierra la caja con su lacre.', characters: ['ch-marie'], location: 'lo-glandier', key: true },
    { id: 'te-enferma-paris', t: -37440, display: '18 de diciembre', title: 'Charles come el pastel en París y enferma', description: 'Vomita toda la noche; Denis no lo prueba.', characters: ['ch-charles', 'ch-denis'], location: 'lo-paris', key: true },
    { id: 'te-falso-ratas', t: -30000, display: 'Diciembre', title: 'El arsénico de Marie se usa en la pasta del desván', description: 'Según Marie.', characters: ['ch-marie'], location: 'lo-glandier', veracity: 'false', claimedBy: 'ch-marie' },
    { id: 'te-compra-2', t: -17280, display: '2 de enero', title: 'Nueva compra de arsénico para la señora', description: 'Al día siguiente de que Charles vuelva enfermo.', characters: ['ch-marie', 'ch-denis'], location: 'lo-uzerche', key: true },
    { id: 'te-cuidados', t: -14000, display: 'Enero', title: 'Marie sirve ella misma todo lo que toma el enfermo', description: 'Con un polvo blanco que llama goma arábiga.', characters: ['ch-marie', 'ch-anna'], location: 'lo-alcoba', key: true },
    { id: 'te-ponche', t: -2880, display: '12 de enero', title: 'La madre aparta un ponche con copos blancos', description: 'Y lo guarda.', characters: ['ch-madre', 'ch-marie'], location: 'lo-alcoba', key: true },
    { id: 'te-muerte', t: 0, display: '14 de enero, madrugada', title: 'Muere Charles Lafarge', description: 'Tras dos semanas de agonía.', characters: ['ch-charles'], location: 'lo-alcoba', key: true },
    { id: 'te-orfila', t: 345600, display: 'Septiembre de 1840', title: 'Orfila halla arsénico en el cuerpo exhumado', description: 'Con el método de Marsh, ante el tribunal.', characters: ['ch-orfila'], key: true },
  ],

  accusation: {
    motives: [
      { id: 'mo-libertad', label: 'Librarse de un marido que la había engañado y no la dejaba marchar', availableWhen: { fact: 'fa-engano' } },
      { id: 'mo-herencia', label: 'Heredar la forja', availableWhen: { asked: 'q-madre-testamento' } },
      { id: 'mo-pagares', label: 'Enterrar el fraude de los pagarés', availableWhen: { fact: 'fa-pagares-falsos' } },
      { id: 'mo-amante', label: 'Escapar con un amante de París' },
    ],
    methods: [
      { id: 'me-arsenico', label: 'Arsénico: primero en el pastel enviado a París y luego, a diario, en sus bebidas', availableWhen: { all: [{ fact: 'fa-pastel-cambiado' }, { fact: 'fa-polvo' }] } },
      { id: 'me-pastel', label: 'Un solo pastel envenenado enviado a París' },
      { id: 'me-trampas', label: 'Arsénico de las trampas de la forja, en la comida de la casa', availableWhen: { fact: 'fa-arsenico-denis' } },
      { id: 'me-enfermedad', label: 'No hubo veneno: murió de cólera' },
    ],
  },

  solution: {
    culprits: ['ch-marie'],
    motive: 'mo-libertad',
    method: 'me-arsenico',
    proof: ['ev-orfila', 'ev-ponche', 'ev-pasta', 'ev-hostal'],
    whatHappened:
      'Marie Lafarge envenenó con arsénico a su marido, Charles, entre diciembre de 1839 y enero de 1840. Engañada sobre su fortuna y atada a un matrimonio que no quería, compró arsénico en Uzerche diciendo que era para las ratas, aunque la pasta matarratas de la casa nunca lo llevó. Cambió los pastelitos del envío de Navidad por un pastel grande envenenado, que hizo enfermar a Charles en París. Cuando él volvió, le sirvió ella misma, a diario, bebidas con un polvo blanco que decía que era goma arábiga. Murió el 14 de enero. El primer análisis del cuerpo fracasó; Orfila, con el método de Marsh bien aplicado, encontró arsénico en sus órganos y no en la tierra de la tumba.',
    reconstruction: [
      'Agosto de 1839: Marie llega a Le Glandier, se siente estafada y amenaza por carta con el arsénico.',
      'Finge reconciliarse y hace firmar a Charles un testamento a su favor.',
      '12 de diciembre: compra arsénico en Uzerche «para las ratas».',
      'Cierra a solas la caja de Navidad; a París llega un pastel grande en lugar de los pastelitos.',
      'Charles lo come el 18 de diciembre y enferma. Vuelve a casa el 1 de enero.',
      'Marie compra más arsénico y se ocupa ella sola de lo que come y bebe el enfermo.',
      'Anna la ve echar polvo blanco; la madre aparta un ponche con copos que flotan.',
      '14 de enero: Charles muere. Meses después, Orfila halla arsénico en sus órganos.',
    ],
    decisiveEvidence: ['ev-carta-marie', 'ev-pastel', 'ev-farmacia', 'ev-pasta', 'ev-ponche', 'ev-orfila'],
    alibiTruths: [
      { characterId: 'ch-marie', truth: 'No usó el arsénico en las ratas: la pasta no tenía veneno. Lo usó en el pastel y en las bebidas de su marido.' },
      { characterId: 'ch-denis', truth: 'Compró arsénico por orden de Charles y lo puso en las trampas de la forja. Mintió sobre París para ocultar los pagarés falsos, no un crimen de sangre.' },
    ],
  },

  endings: [
    {
      id: 'en-orfila',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { fact: 'fa-orfila' } },
      outcome: 'success',
      title: 'La mancha en la porcelana',
      text: 'En la sala de Tulle, Orfila muestra al jurado las manchas negras del aparato de Marsh. Marie Lafarge es condenada en septiembre de 1840. Media Francia la cree inocente, y ella lo sostiene hasta su muerte, en 1852; pero desde entonces ningún envenenador podrá contar con que el arsénico desaparezca dentro de un cuerpo.',
    },
    {
      id: 'en-exito',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' },
      outcome: 'success',
      title: 'La viuda de negro',
      text: 'Marie Lafarge es condenada, aunque la defensa explota sin descanso la duda de los químicos de Brive. Las cartas de apoyo llegan a la prisión por cientos.',
    },
    { id: 'en-parcial', when: { culprit: 'correct' }, outcome: 'partial', title: 'Una acusación coja', text: 'La acusación apunta a la persona correcta, pero sin explicar bien cómo ni por qué. Los periódicos de París la convierten en una mártir.' },
    { id: 'en-denis', when: { culprit: 'ch-denis' }, outcome: 'failure', title: 'El falsificador', text: 'Denis Barbier es detenido. Sale a la luz el fraude de los pagarés, pero no un envenenamiento: su arsénico sigue en las trampas de la forja. La viuda se marcha a París.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Cólera', text: 'El certificado dice cólera y así se queda. En Le Glandier, la madre de Charles nunca vuelve a dirigir la palabra a su nuera.' },
  ],

  hints: [
    {
      id: 'hl-ratas',
      topic: 'El arsénico de las ratas',
      relevantWhen: { not: { fact: 'fa-pasta-sin' } },
      steps: ['¿Quién compró arsénico y para qué dijo que era?', 'Pregunta a Marie por el arsénico y mira el libro de la farmacia.', 'Si era para las ratas, analiza la pasta matarratas de la casa.'],
    },
    {
      id: 'hl-pastel',
      topic: 'El envío de Navidad',
      relevantWhen: { not: { fact: 'fa-pastel-cambiado' } },
      steps: ['Charles enfermó en París antes de volver.', '¿Quién estaba con él cuando llegó el paquete? Pregunta a Denis.', 'Compara lo que se empaquetó con lo que llegó al hotel.'],
    },
    {
      id: 'hl-cuerpo',
      topic: 'El análisis del cuerpo',
      relevantWhen: { all: [{ fact: 'fa-analisis-dudosos' }, { not: { fact: 'fa-orfila' } }] },
      steps: ['El primer análisis del cuerpo salió negativo.', 'Un método mal aplicado no prueba nada.', 'Pregunta a Orfila por el método de Marsh.'],
    },
  ],

  objectives: [
    { id: 'ob-ratas', text: 'Averigua adónde fue el arsénico «de las ratas».', completeWhen: { fact: 'fa-pasta-sin' }, points: 30 },
    { id: 'ob-cuerpo', text: 'Demuestra que había arsénico en el cuerpo.', completeWhen: { fact: 'fa-orfila' }, points: 30 },
    { id: 'ob-denis', text: 'Descubre qué ocultaba Denis.', completeWhen: { secret: 'se-denis' }, points: 20, hidden: true },
  ],

  assets: [],
};

export default caseFile;
