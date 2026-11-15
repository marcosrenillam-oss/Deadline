import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-C-0006 · EL BORDEREAU  (cooperativo, información dividida)
 * París, 1894-1898 · Conspiración (espionaje) · Caso real · Unidad Especial
 *
 * Caso real: el asunto Dreyfus. Un documento robado de la papelera de la
 * embajada alemana llevó a condenar al capitán Alfred Dreyfus por traición.
 * El verdadero autor era el comandante Ferdinand Walsin Esterhazy, como
 * descubrieron el teniente coronel Georges Picquart y la familia Dreyfus.
 *
 * Reparto: A trabaja en la Sección de Estadística (el bordereau, el «petit
 * bleu», los expedientes); B fuera del Ministerio (la letra de Esterhazy, el
 * banquero que la reconoció, sus deudas). La prueba necesita a los dos.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-C-0006',
  contentVersion: 1,
  mode: 'coop',
  title: 'El bordereau',
  subtitle: 'Un oficial judío es condenado por traición. La letra del documento no es la suya',
  origin: 'real',
  historical: {
    documented: [
      'En septiembre de 1894, la Sección de Estadística (contraespionaje) del Estado Mayor francés recibió de la papelera del agregado militar alemán, Max von Schwartzkoppen, una carta sin firma que anunciaba la entrega de documentos militares secretos: el «bordereau».',
      'Por una supuesta semejanza de letra, se acusó al capitán Alfred Dreyfus, oficial judío alsaciano del Estado Mayor. Fue condenado en consejo de guerra en diciembre de 1894, en parte con un expediente secreto que no se enseñó a la defensa, degradado públicamente y deportado a la isla del Diablo.',
      'En 1896 el nuevo jefe de la Sección, el teniente coronel Georges Picquart, recibió un «petit bleu», una carta-telegrama de Schwartzkoppen dirigida al comandante Ferdinand Walsin Esterhazy, que nunca se envió.',
      'Picquart comparó cartas de Esterhazy con el bordereau y vio que la letra era la misma. Sus superiores le apartaron y le enviaron a Túnez.',
      'En 1897, el banquero J. de Castro reconoció en un facsímil del bordereau publicado en la prensa la letra de su cliente Esterhazy, y avisó a Mathieu Dreyfus, hermano del condenado. Esterhazy estaba lleno de deudas.',
      'El comandante Hubert-Joseph Henry había fabricado en 1896 un documento falso que acusaba a Dreyfus. En 1898 se descubrió el «faux Henry»; Henry confesó y se suicidó. Esterhazy, absuelto por un consejo de guerra en enero de 1898, huyó a Inglaterra.',
      'Émile Zola publicó «J’accuse…!» en enero de 1898. Dreyfus fue indultado en 1899 y rehabilitado en 1906.',
    ],
    hypotheses: ['Se ha discutido si Esterhazy actuó solo o con la tolerancia de otros oficiales; él llegó a decir que era un agente doble.'],
    dramatized: [
      'Los investigadores que manejan los jugadores, sus conversaciones y el reparto de papeles son una recreación.',
      'La redacción concreta de algunos documentos y notas es una recreación; el texto del «petit bleu» sigue el original en lo esencial.',
      'Los retratos son recreaciones artísticas.',
    ],
    documentedResolution:
      'El autor del bordereau y espía al servicio de Alemania era el comandante Ferdinand Walsin Esterhazy. Alfred Dreyfus era inocente: fue rehabilitado en 1906.',
    sources: ['Jean-Denis Bredin, L’Affaire (1983)', 'Ruth Harris, The Man on Devil’s Island (2010)', 'Émile Zola, «J’accuse…!», L’Aurore (13 de enero de 1898)'],
  },
  era: 'c19',
  eraLabel: 'París, 1896',
  year: 1896,
  location: { city: 'París', place: 'Ministerio de la Guerra, rue Saint-Dominique', country: 'Francia' },
  category: 'conspiracy',
  difficulty: 'special-unit',
  keywords: ['Dreyfus', 'Esterhazy', 'Picquart', 'bordereau', 'petit bleu', 'espionaje', 'Zola', 'caso real'],
  ambience: { music: 'victorian-night', mood: 'tense' },
  maxHints: 5,

  coop: {
    style: 'split',
    roles: [
      {
        id: 'A',
        title: 'Sección de Estadística',
        briefing:
          'Estás dentro del Ministerio de la Guerra, junto al teniente coronel Picquart: el bordereau, los papeles que llegan de la embajada alemana, los expedientes y los oficiales de la Sección. Lo que veas no lo verá tu compañero si no se lo pasas.',
      },
      {
        id: 'B',
        title: 'Investigación privada',
        briefing:
          'Trabajas fuera del Ministerio, con Mathieu Dreyfus: la prensa, los bancos, los acreedores y la vida de un comandante con deudas. Lo que veas no lo verá tu compañero si no se lo pasas.',
      },
    ],
  },

  briefing: {
    incidentDisplay: 'Septiembre de 1894',
    summary:
      'Hace dos años, el capitán Alfred Dreyfus fue condenado por entregar secretos militares a Alemania y deportado a la isla del Diablo. La única prueba pública era una carta sin firma, el bordereau, de una letra «parecida» a la suya. Él sigue jurando que es inocente. Y los secretos, al parecer, siguen saliendo.',
    context:
      'Primavera de 1896. Al nuevo jefe del contraespionaje, Georges Picquart, le llegan papeles de la embajada alemana que no encajan; fuera del Ministerio, el hermano del condenado no ha dejado de buscar. Los dos necesitan pruebas, no opiniones.',
    background:
      'Francia vive obsesionada con Alemania tras la derrota de 1870, y el antisemitismo llena los periódicos. Dudar de la condena es, para muchos, insultar al Ejército.',
    victim: 'ch-dreyfus',
    initialFacts: [],
    initialEvidence: ['ev-bordereau', 'ev-petit-bleu', 'ev-facsimil'],
    initialTimeline: ['te-bordereau', 'te-condena'],
  },

  characters: [
    {
      id: 'ch-dreyfus',
      name: 'Alfred Dreyfus',
      look: { hair: 'short', glasses: true, beard: true },
      role: 'victim',
      age: 35,
      occupation: 'Capitán de artillería, condenado',
      appearance:
        'a 35-year-old French army captain in 1894, thin serious face, pince-nez spectacles, short dark hair, neat moustache, dark artillery uniform, stiff reserved expression',
      summary: 'Condenado por traición. Jura que es inocente.',
      biography: 'Alsaciano, judío, de familia rica de industriales textiles. Brillante en la Escuela de Guerra, poco simpático a sus compañeros. Desde 1895 está encerrado en la isla del Diablo, en la Guayana.',
      personality: ['Rígido', 'Leal', 'Inquebrantable'],
    },
    {
      id: 'ch-esterhazy',
      name: 'Ferdinand Walsin Esterhazy',
      look: { hair: 'short' },
      role: 'suspect',
      age: 49,
      occupation: 'Comandante de infantería',
      appearance:
        'a gaunt 49-year-old French army major in 1896, hollow cheeks, large drooping dark moustache, bulging restless eyes, infantry uniform worn with dandyish carelessness',
      summary: 'Arruinado, jugador, siempre pidiendo dinero.',
      biography: 'Oficial de origen húngaro-francés, con pasado en la Legión Extranjera. Debe dinero a medio París y escribe cartas furiosas contra Francia y el Ejército a su amante.',
      personality: ['Desesperado', 'Teatral', 'Cínico'],
      relationToVictim: 'Ninguna conocida',
      motive: { text: 'Vendía secretos a Alemania para pagar sus deudas.', visibleWhen: { fact: 'fa-deudas' } },
      alibi: { claim: 'No conoce a Schwartzkoppen. El bordereau no es suyo: lo escribió Dreyfus, imitando su letra para perderle.' },
    },
    {
      id: 'ch-henry',
      name: 'Hubert-Joseph Henry',
      look: { hair: 'short' },
      role: 'suspect',
      age: 50,
      occupation: 'Comandante de la Sección de Estadística',
      appearance:
        'a burly 50-year-old French army major in 1896, heavy peasant face, thick moustache, cropped grey hair, uniform tight across the chest, stubborn suspicious eyes',
      summary: 'El veterano de la Sección. Dice que hay más pruebas.',
      biography: 'Hijo de campesinos, ascendido desde soldado. Fue él quien llevó el bordereau a la Sección en 1894 y quien declaró en el consejo de guerra que «una persona honorable» le había señalado a Dreyfus.',
      personality: ['Leal al Ejército', 'Terco', 'Astuto'],
      relationToVictim: 'Testigo de cargo',
      motive: { text: 'Proteger al Estado Mayor de su error, a cualquier precio.', visibleWhen: { fact: 'fa-faux' } },
      alibi: { claim: 'Solo ha servido al Ejército y ha aportado nuevas pruebas contra Dreyfus.' },
    },
    {
      id: 'ch-picquart',
      name: 'Georges Picquart',
      look: { hair: 'short' },
      role: 'witness',
      age: 41,
      occupation: 'Teniente coronel, jefe de la Sección de Estadística',
      appearance:
        'an elegant 41-year-old French lieutenant colonel in 1896, fine intelligent face, trim moustache, neatly parted dark hair, dark staff uniform, calm thoughtful eyes',
      summary: 'No le cae bien Dreyfus. Pero le importa la verdad.',
      biography: 'Alsaciano, culto, melómano. No tiene simpatía por los judíos ni por Dreyfus, al que tuvo de alumno. Desde julio de 1895 dirige el contraespionaje.',
      personality: ['Honesto', 'Frío', 'Valiente'],
    },
    {
      id: 'ch-mathieu',
      name: 'Mathieu Dreyfus',
      look: { hair: 'short', beard: true },
      role: 'witness',
      age: 38,
      occupation: 'Industrial, hermano del condenado',
      appearance:
        'a determined 38-year-old French industrialist in 1897, strong handsome face, full dark beard, dark frock coat, tired resolute eyes',
      summary: 'Lleva tres años buscando al verdadero culpable.',
      biography: 'Hermano mayor de Alfred. Ha dejado la fábrica familiar para dedicarse a probar su inocencia. Ha hecho imprimir el facsímil del bordereau y lo ha repartido por todo París.',
      personality: ['Tenaz', 'Prudente'],
    },
    {
      id: 'ch-castro',
      name: 'J. de Castro',
      look: { hair: 'hat', beard: true },
      role: 'witness',
      age: 45,
      occupation: 'Banquero',
      appearance:
        'a well-dressed 45-year-old Parisian banker in 1897, neat grey beard, top hat, dark overcoat, a folded newspaper in his gloved hand',
      summary: 'Reconoció una letra en un cartel.',
      biography: 'Banquero de la Bolsa de París. Tuvo como cliente a un comandante que le debía dinero y le escribía cartas a menudo.',
      personality: ['Prudente', 'Íntegro'],
    },
  ],

  locations: [
    { id: 'lo-ministerio', name: 'Ministerio de la Guerra', description: 'Rue Saint-Dominique. La Sección de Estadística ocupa unos despachos discretos.' },
    { id: 'lo-embajada', name: 'Embajada de Alemania', description: 'Rue de Lille. Su portera trabaja para el contraespionaje francés.' },
    { id: 'lo-isla', name: 'Isla del Diablo', description: 'Peñasco frente a la Guayana donde Dreyfus vive encadenado de noche.' },
  ],

  relationships: [
    { id: 're-hermanos', a: 'ch-mathieu', b: 'ch-dreyfus', label: 'Hermanos' },
    { id: 're-seccion', a: 'ch-picquart', b: 'ch-henry', label: 'Jefe y subordinado' },
    { id: 're-banco', a: 'ch-castro', b: 'ch-esterhazy', label: 'Banquero y cliente', visibleWhen: { fact: 'fa-castro' } },
  ],

  facts: [
    { id: 'fa-bordereau', text: 'El bordereau es una carta sin firma, sacada de la papelera del agregado alemán, que anuncia la entrega de documentos militares.', important: true },
    { id: 'fa-artillero', text: 'Según los expertos de la Sección, el autor del bordereau «tenía que ser artillero» por los documentos que cita; pero el texto tiene errores que un artillero del Estado Mayor no cometería.', important: true },
    { id: 'fa-petit-bleu', text: 'El agregado alemán escribió un «petit bleu» al comandante Esterhazy: había tratos entre ellos.', important: true },
    { id: 'fa-letra-esterhazy', text: 'La letra de Esterhazy es idéntica a la del bordereau.', important: true },
    { id: 'fa-castro', text: 'El banquero de Castro reconoció la letra de su cliente Esterhazy en el facsímil del bordereau.', important: true },
    { id: 'fa-deudas', text: 'Esterhazy debía decenas de miles de francos y había pedido dinero a todo el mundo.', important: true },
    { id: 'fa-papel-calco', text: 'El bordereau está escrito en papel calco de un tipo que Esterhazy usaba y que Dreyfus nunca compró.', important: true },
    { id: 'fa-secreto', text: 'Dreyfus fue condenado con un expediente secreto que su abogado nunca vio.' },
    { id: 'fa-faux', text: 'Una carta de 1896 que nombra a Dreyfus, aportada por el comandante Henry, está hecha con trozos de dos papeles distintos: es una falsificación.', important: true },
    { id: 'fa-patria', text: 'Esterhazy escribió a una amante que no le importaría morir como capitán de ulanos alemanes sacando a sablazos a los franceses.' },
  ],

  evidence: [
    {
      id: 'ev-bordereau',
      kind: 'document',
      title: 'El bordereau',
      dated: 'Septiembre de 1894',
      source: 'Papelera del agregado militar alemán, por la portera de la embajada',
      summary: 'La carta que condenó a Dreyfus.',
      holder: 'both',
      related: { characters: ['ch-dreyfus'], locations: ['lo-embajada'], events: ['te-bordereau'] },
      body: [
        { type: 'heading', text: 'SIN FECHA NI FIRMA' },
        {
          type: 'handwritten',
          text: 'Sin noticias que me indiquen que desea usted verme, le envío sin embargo, señor, algunas informaciones interesantes: 1.º una nota sobre el freno hidráulico del 120… {{dt-bord-maniobras|5.º el proyecto de manual de tiro de la artillería de campaña. Este último documento es muy difícil de conseguir… Me voy a maniobras.}}',
          author: 'Anónimo',
        },
        { type: 'paragraph', text: '{{dt-bord-papel|Escrito en papel calco muy fino, por las dos caras.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-bordereau' }],
      details: [
        { id: 'dt-bord-maniobras', label: '«Me voy a maniobras»', description: 'El autor se iba a maniobras en septiembre de 1894. Dreyfus, oficial en prácticas del Estado Mayor, no fue a ninguna ese año.', effects: [{ grantFact: 'fa-bordereau' }], points: 15 },
        { id: 'dt-bord-papel', label: 'Papel calco', description: 'Un papel poco común, que se puede rastrear.', effects: [], points: 10 },
      ],
      decisive: true,
    },
    {
      id: 'ev-petit-bleu',
      kind: 'letter',
      title: 'El «petit bleu»',
      dated: 'Marzo de 1896',
      source: 'Papelera del agregado militar alemán, en trocitos',
      summary: 'Una carta-telegrama que nunca se envió.',
      holder: 'A',
      related: { characters: ['ch-esterhazy', 'ch-picquart'], locations: ['lo-embajada'], events: ['te-petit-bleu'] },
      body: [
        { type: 'paragraph', text: 'Recompuesto con goma por la Sección de Estadística:' },
        {
          type: 'handwritten',
          text: '{{dt-pb-texto|Señor: espero ante todo una explicación más detallada que la que me dio el otro día sobre la cuestión pendiente. En consecuencia, le ruego que me la dé por escrito para que pueda juzgar si puedo seguir mis relaciones con la casa R. o no.}} C.',
          author: 'Schwartzkoppen',
        },
        { type: 'paragraph', text: '{{dt-pb-destinatario|Dirección: Señor comandante Esterhazy, 27 rue de la Bienfaisance, París.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-petit-bleu' }],
      details: [
        { id: 'dt-pb-texto', label: 'Unas «relaciones»', description: 'El agregado alemán trataba algo con un oficial francés.', effects: [], points: 10 },
        { id: 'dt-pb-destinatario', label: 'Comandante Esterhazy', description: 'El oficial que trataba con el agregado alemán es Esterhazy.', effects: [{ grantFact: 'fa-petit-bleu' }], points: 20 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-cartas-esterhazy',
      kind: 'letter',
      title: 'Cartas de Esterhazy al Ministerio',
      dated: '1896',
      source: 'Expediente personal del comandante',
      summary: 'Pidiendo un destino en el Estado Mayor.',
      holder: 'A',
      autoDiscoverWhen: { fact: 'fa-petit-bleu' },
      related: { characters: ['ch-esterhazy'], locations: ['lo-ministerio'], events: [] },
      body: [
        { type: 'handwritten', text: 'Mi general: me permito solicitar de nuevo un puesto en el Estado Mayor, donde mis servicios…', author: 'Comandante Esterhazy' },
        { type: 'paragraph', text: '{{dt-ce-letra|Al ponerla junto a la fotografía del bordereau: la misma inclinación, la misma doble «s» alargada, la misma forma de cerrar la «d». No se parecen: son la misma letra.}}' },
      ],
      details: [{ id: 'dt-ce-letra', label: 'La misma letra', description: 'Esterhazy escribió el bordereau.', effects: [{ grantFact: 'fa-letra-esterhazy' }], points: 25 }],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-faux',
      kind: 'document',
      title: 'La carta del agregado italiano (expediente de Henry)',
      dated: 'Noviembre de 1896',
      source: 'Expediente de la Sección de Estadística',
      summary: 'La «prueba definitiva» contra Dreyfus.',
      holder: 'A',
      autoDiscoverWhen: { asked: 'q-henry-pruebas' },
      related: { characters: ['ch-henry', 'ch-dreyfus'], locations: ['lo-ministerio'], events: ['te-faux'] },
      body: [
        { type: 'handwritten', text: 'He leído que un diputado va a preguntar por Dreyfus. Si piden explicaciones en Roma, diré que nunca he tenido relaciones con ese judío.', author: 'Atribuida al agregado italiano Panizzardi' },
        {
          type: 'paragraph',
          text: '{{dt-faux-papel|Mirada a contraluz, la carta está hecha con trozos pegados: el encabezamiento y la firma tienen un rayado azul pálido; el centro, donde aparece el nombre de Dreyfus, un rayado gris violeta. Son dos papeles distintos.}}',
        },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-faux' }],
      details: [{ id: 'dt-faux-papel', label: 'Dos papeles distintos', description: 'La única carta que nombra a Dreyfus está montada con trozos: es falsa.', effects: [{ grantFact: 'fa-faux' }], points: 25 }],
      decisive: true,
    },
    {
      id: 'ev-facsimil',
      kind: 'press',
      title: 'Facsímil del bordereau en Le Matin',
      dated: '10 de noviembre de 1896',
      source: 'Le Matin',
      summary: 'Todo París puede ver la letra.',
      holder: 'B',
      related: { characters: ['ch-mathieu'], locations: [], events: [] },
      body: [
        { type: 'heading', text: 'LA PRUEBA DE LA TRAICIÓN' },
        { type: 'typed', text: 'Publicamos hoy el facsímil del documento que llevó a la condena del capitán Dreyfus.' },
        { type: 'typed', text: '{{dt-fac-cartel|Mathieu Dreyfus ha hecho imprimir carteles con la letra y pide a quien la reconozca que se presente.}}' },
      ],
      details: [{ id: 'dt-fac-cartel', label: 'Un cartel por todo París', description: 'Cualquiera que reconozca la letra puede avisar.', effects: [], points: 5 }],
    },
    {
      id: 'ev-castro',
      kind: 'statement',
      title: 'Visita del banquero de Castro',
      dated: 'Noviembre de 1897',
      source: 'Casa de Mathieu Dreyfus',
      summary: 'Un banquero reconoce una letra.',
      holder: 'B',
      autoDiscoverWhen: { asked: 'q-castro' },
      related: { characters: ['ch-castro', 'ch-esterhazy'], locations: [], events: ['te-castro'] },
      body: [
        {
          type: 'typed',
          text: '—{{dt-cas-letra|Paseaba por el bulevar, vi el cartel y me quedé helado: es la letra de un cliente mío, el comandante Esterhazy. Tengo en casa una docena de cartas suyas.}}',
        },
        { type: 'typed', text: '—{{dt-cas-deudas|Todas para pedirme dinero o para aplazar lo que me debe.}}' },
        { type: 'signature', name: 'J. de Castro' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-castro' }],
      details: [
        { id: 'dt-cas-letra', label: '«Es la letra de Esterhazy»', description: 'Alguien de fuera del Ejército reconoce la letra del bordereau.', effects: [{ grantFact: 'fa-castro' }], points: 20 },
        { id: 'dt-cas-deudas', label: 'Siempre pidiendo dinero', description: 'Esterhazy vivía de préstamos.', effects: [], points: 10 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-deudas',
      kind: 'record',
      title: 'Pagarés y protestos de Esterhazy',
      source: 'Tribunales de comercio y acreedores',
      summary: 'Lo que debía el comandante.',
      holder: 'B',
      autoDiscoverWhen: { fact: 'fa-castro' },
      related: { characters: ['ch-esterhazy'], locations: [], events: [] },
      body: [
        {
          type: 'table',
          header: ['Acreedor', 'Deuda', 'Estado'],
          rows: [
            ['Prestamistas varios', '{{dt-deu-total|Más de 50.000 francos}}', 'Protestados'],
            ['Su sastre', '3.000 francos', 'Embargo'],
            ['Un primo, Christian Esterhazy', '{{dt-deu-primo|35.000 francos «invertidos» y perdidos}}', 'Pleito'],
          ],
        },
      ],
      details: [
        { id: 'dt-deu-total', label: 'Ahogado en deudas', description: 'Esterhazy necesitaba dinero desesperadamente en 1894.', effects: [{ grantFact: 'fa-deudas' }], points: 15 },
        { id: 'dt-deu-primo', label: 'Hasta su familia', description: 'Estafaba incluso a sus parientes.', effects: [], points: 5 },
      ],
    },
    {
      id: 'ev-ulanos',
      kind: 'letter',
      title: 'Cartas de Esterhazy a Madame de Boulancy',
      dated: '1884',
      source: 'Entregadas por su antigua amante',
      summary: 'Lo que pensaba de Francia.',
      holder: 'B',
      autoDiscoverWhen: { asked: 'q-mathieu-amante' },
      related: { characters: ['ch-esterhazy'], locations: [], events: [] },
      body: [
        {
          type: 'handwritten',
          text: '{{dt-ul-texto|Si esta noche viniesen a decirme que mañana me matarán como capitán de ulanos sacando a sablazos a los franceses, sería perfectamente feliz… No haría daño ni a un perro, pero mataría a cien mil franceses con placer.}}',
          author: 'F. W. Esterhazy',
        },
        { type: 'paragraph', text: '{{dt-ul-papel|Una de las cartas está escrita en papel calco muy fino, igual que el del bordereau.}}' },
      ],
      details: [
        { id: 'dt-ul-texto', label: '«Capitán de ulanos»', description: 'Esterhazy despreciaba a Francia y soñaba con servir a Alemania.', effects: [{ grantFact: 'fa-patria' }], points: 15 },
        { id: 'dt-ul-papel', label: 'El mismo papel calco', description: 'Esterhazy usaba el raro papel calco del bordereau.', effects: [{ grantFact: 'fa-papel-calco' }], points: 20 },
      ],
      decisive: true,
    },
  ],

  deductions: [
    {
      id: 'de-letra',
      title: 'Dos pruebas de la misma letra',
      combine: ['dt-ce-letra', 'dt-cas-letra'],
      explanation: 'Dentro del Ministerio, la letra de las cartas de Esterhazy es la del bordereau; fuera, su banquero la reconoce en el facsímil sin haber visto nunca las cartas del Ministerio. Dos caminos independientes, el mismo hombre.',
      points: 40,
    },
    {
      id: 'de-espia',
      title: 'El cliente del agregado alemán',
      combine: ['dt-pb-destinatario', 'dt-deu-total'],
      explanation: 'El agregado alemán trataba con Esterhazy, y Esterhazy estaba ahogado en deudas: vendía secretos para pagarlas.',
      points: 30,
    },
    {
      id: 'de-papel',
      title: 'El papel calco',
      combine: ['dt-bord-papel', 'dt-ul-papel'],
      explanation: 'El bordereau está escrito en un papel calco poco común, el mismo que usaba Esterhazy en sus cartas.',
      points: 25,
    },
  ],

  contradictions: [
    {
      id: 'cx-esterhazy-schwartzkoppen',
      title: 'Sí conocía al agregado',
      a: { line: 'ln-esterhazy-conoce' },
      b: { detail: 'dt-pb-destinatario' },
      explanation: 'Esterhazy jura que no conoce a Schwartzkoppen; el agregado le escribió un «petit bleu» a su casa sobre sus «relaciones».',
      points: 25,
    },
    {
      id: 'cx-esterhazy-calco',
      title: 'Nunca usó papel calco',
      a: { line: 'ln-esterhazy-calco' },
      b: { detail: 'dt-ul-papel' },
      explanation: 'Esterhazy dice que nunca ha usado papel calco; su antigua amante conserva una carta suya en ese mismo papel.',
      points: 25,
    },
    {
      id: 'cx-henry-carta',
      title: 'La carta de Henry',
      a: { line: 'ln-henry-autentica' },
      b: { detail: 'dt-faux-papel' },
      explanation: 'Henry dice que la carta que nombra a Dreyfus llegó tal cual de la embajada; está montada con dos papeles distintos.',
      effects: [{ revealSecret: 'se-henry' }],
      points: 30,
    },
  ],

  secrets: [
    { id: 'se-henry', characterId: 'ch-henry', text: 'El comandante Henry fabricó en 1896 la carta que nombraba a Dreyfus, pegando su texto en un papel con el encabezamiento y la firma de una carta auténtica, para cerrar el caso. Confesará en 1898 y se cortará el cuello en su celda al día siguiente.', points: 25 },
    { id: 'se-picquart', characterId: 'ch-picquart', text: 'Cuando Picquart informó a sus superiores de que el culpable era Esterhazy, le respondieron: «¿Qué le importa a usted que ese judío esté en la isla del Diablo?». Le mandaron a Túnez.', revealedWhen: { fact: 'fa-letra-esterhazy' }, points: 20 },
  ],

  interrogations: [
    {
      id: 'in-picquart',
      characterId: 'ch-picquart',
      holder: 'A',
      setting: 'En su despacho de la Sección, con la puerta cerrada y el bordereau fotografiado sobre la mesa.',
      opening: [{ text: 'No me gusta lo que estoy viendo. Pero no voy a cerrar los ojos.' }],
      topics: [
        {
          id: 'tp-picquart',
          label: 'El bordereau',
          kind: 'document',
          questions: [
            {
              id: 'q-picquart-artillero',
              prompt: '¿Por qué se acusó a Dreyfus?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Porque el autor «tenía que ser» un artillero del Estado Mayor, y Dreyfus lo era. Y porque era judío; eso nadie lo escribió, pero todos lo pensaron.', tone: 'truth' },
                    { text: 'Lo curioso es que el bordereau habla del freno del 120 con errores que ningún artillero cometería. Y lo del expediente secreto… al abogado no se le enseñó nada.', tone: 'truth' },
                  ],
                  effects: [{ grantFact: 'fa-artillero' }, { grantFact: 'fa-secreto' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-henry',
      characterId: 'ch-henry',
      holder: 'A',
      setting: 'En su despacho de la Sección, entre cajas de papeles recompuestos. Se levanta con desconfianza.',
      opening: [{ text: 'El caso Dreyfus está cerrado. Y bien cerrado. ¿Qué busca, que deshonren al Ejército?' }],
      topics: [
        {
          id: 'tp-henry',
          label: 'Las pruebas',
          kind: 'document',
          questions: [
            {
              id: 'q-henry-pruebas',
              prompt: '¿Hay más pruebas contra Dreyfus?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-henry-autentica', text: 'Una carta del agregado italiano que lo nombra con todas las letras. Llegó de la embajada como siempre, por el «camino ordinario». Es auténtica.', tone: 'lie' }] }],
            },
            {
              id: 'q-henry-cx',
              prompt: 'La carta está montada con dos papeles distintos.',
              kind: 'contradiction',
              contradiction: 'cx-henry-carta',
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Henry se pone rojo y luego blanco.' },
                    { text: 'Lo hice por el Ejército. Teníamos la certeza; solo faltaba una prueba que se pudiera enseñar. No podía permitir que se reabriera.', tone: 'admission' },
                  ],
                  effects: [{ setFlag: 'henry-confiesa' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-esterhazy',
      characterId: 'ch-esterhazy',
      holder: 'A',
      setting: 'En un café del bulevar, con el bigote enorme y la mirada saltona. Habla alto, para que le oigan.',
      opening: [{ text: '¡Los judíos quieren cargarme su traición! Soy un oficial francés de vieja nobleza.' }],
      topics: [
        {
          id: 'tp-esterhazy',
          label: 'Los alemanes',
          kind: 'personal',
          questions: [
            {
              id: 'q-esterhazy-conoce',
              prompt: '¿Conoce al agregado militar alemán?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-esterhazy-conoce', text: 'Jamás le he visto. Ni le he escrito ni me ha escrito.', tone: 'lie' }] }],
            },
            {
              id: 'q-esterhazy-calco',
              prompt: '¿Usa usted papel calco?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-esterhazy-calco', text: '¿Papel calco? Nunca. ¿Para qué querría yo eso?', tone: 'lie' }] }],
            },
            {
              id: 'q-esterhazy-final',
              prompt: 'Su letra es la del bordereau, su papel es el del bordereau y el agregado alemán le escribía.',
              kind: 'confront',
              requires: { all: [{ fact: 'fa-letra-esterhazy' }, { fact: 'fa-papel-calco' }, { fact: 'fa-petit-bleu' }] },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Esterhazy se ríe, pero le tiembla el bigote.' },
                    { text: 'Me lo dictaron. Era un agente doble, por orden de mis jefes. Pregunten al Estado Mayor; ellos no se lo dirán. Me voy a Londres.', tone: 'evasion' },
                  ],
                  effects: [{ setFlag: 'esterhazy-huye' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-mathieu',
      characterId: 'ch-mathieu',
      holder: 'B',
      setting: 'En el salón de su piso de París, lleno de copias del facsímil.',
      opening: [{ text: 'Mi hermano es inocente. Lo sé como sé mi nombre. Ayúdeme a demostrarlo.' }],
      topics: [
        {
          id: 'tp-mathieu',
          label: 'La búsqueda',
          kind: 'events',
          questions: [
            {
              id: 'q-mathieu-amante',
              prompt: '¿Quién puede saber cómo piensa el comandante Esterhazy?',
              kind: 'ask',
              requires: { fact: 'fa-castro' },
              responses: [{ lines: [{ text: 'Una antigua amante suya, Madame de Boulancy, a la que debe dinero, guarda sus cartas. Dice que en ellas habla de Francia como un enemigo.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-castro',
      characterId: 'ch-castro',
      holder: 'B',
      setting: 'En la puerta de casa de Mathieu Dreyfus, con un fajo de cartas atado con una cinta.',
      opening: [{ text: 'Perdone que me presente así. He visto un cartel en el bulevar.' }],
      topics: [
        {
          id: 'tp-castro',
          label: 'La letra',
          kind: 'document',
          questions: [
            {
              id: 'q-castro',
              prompt: '¿Qué ha visto en el cartel?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'La letra de un hombre que me debe mucho dinero. Tengo aquí sus cartas. Compárelas usted mismo.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto a la llegada del bordereau (septiembre de 1894)
  timeline: [
    { id: 'te-bordereau', t: 0, display: 'Septiembre de 1894', title: 'El bordereau llega a la Sección de Estadística', description: 'Desde la papelera del agregado alemán.', characters: [], location: 'lo-embajada', key: true },
    { id: 'te-falso-dreyfus', t: 20000, display: 'Octubre de 1894', title: 'Los expertos atribuyen el bordereau a Dreyfus', description: 'Según el Estado Mayor.', characters: ['ch-dreyfus'], veracity: 'false', claimedBy: 'ch-henry' },
    { id: 'te-condena', t: 129600, display: 'Diciembre de 1894', title: 'Dreyfus es condenado en consejo de guerra', description: 'Con un expediente secreto.', characters: ['ch-dreyfus'], key: true },
    { id: 'te-petit-bleu', t: 792000, display: 'Marzo de 1896', title: 'Picquart recibe el «petit bleu» dirigido a Esterhazy', description: 'Recompuesto con goma.', characters: ['ch-picquart', 'ch-esterhazy'], key: true },
    { id: 'te-faux', t: 1094400, display: 'Noviembre de 1896', title: 'Henry aporta una carta que nombra a Dreyfus', description: 'Montada con dos papeles.', characters: ['ch-henry'], key: true },
    { id: 'te-castro', t: 1620000, display: 'Noviembre de 1897', title: 'El banquero de Castro reconoce la letra de Esterhazy', description: 'En un cartel del bulevar.', characters: ['ch-castro', 'ch-mathieu'], key: true },
  ],

  accusation: {
    suspects: ['ch-esterhazy', 'ch-henry', 'ch-dreyfus'],
    motives: [
      { id: 'mo-deudas', label: 'Pagar con secretos militares unas deudas que le ahogaban', availableWhen: { all: [{ fact: 'fa-deudas' }, { fact: 'fa-petit-bleu' }] } },
      { id: 'mo-ideologia', label: 'Odio a Francia y admiración por Alemania', availableWhen: { fact: 'fa-patria' } },
      { id: 'mo-ejercito', label: 'Proteger la reputación del Estado Mayor', availableWhen: { fact: 'fa-faux' } },
      { id: 'mo-dinero-dreyfus', label: 'Dinero para un capitán rico que no lo necesitaba' },
    ],
    methods: [
      { id: 'me-bordereau', label: 'Escribió el bordereau de su puño y letra, en su papel calco, y vendía documentos al agregado alemán', availableWhen: { all: [{ fact: 'fa-letra-esterhazy' }, { fact: 'fa-castro' }] } },
      { id: 'me-falsificacion', label: 'Fabricó pruebas falsas contra un inocente', availableWhen: { fact: 'fa-faux' } },
      { id: 'me-dreyfus', label: 'Entregaba documentos del Estado Mayor durante sus prácticas' },
      { id: 'me-calco', label: 'Calcó la letra de otro oficial para inculparle' },
    ],
  },

  solution: {
    culprits: ['ch-esterhazy'],
    motive: 'mo-deudas',
    method: 'me-bordereau',
    proof: ['ev-cartas-esterhazy', 'ev-castro', 'ev-petit-bleu'],
    whatHappened:
      'El autor del bordereau y espía al servicio de Alemania era el comandante Ferdinand Walsin Esterhazy. Ahogado en deudas, vendía documentos militares al agregado alemán Schwartzkoppen. En septiembre de 1894 le escribió el bordereau, en su papel calco, y lo envió antes de irse de maniobras. La carta acabó en la papelera de la embajada y de ahí en la Sección de Estadística, donde se culpó al capitán Dreyfus, judío y artillero del Estado Mayor. En 1896 el «petit bleu» del agregado a Esterhazy llevó a Picquart a comparar su letra con la del bordereau: era la misma. El banquero de Castro la reconoció también en 1897. Para impedir que se reabriera el caso, el comandante Henry fabricó una carta falsa que nombraba a Dreyfus.',
    reconstruction: [
      'Esterhazy, arruinado, empieza a vender documentos al agregado alemán.',
      'Septiembre de 1894: escribe el bordereau en papel calco y anuncia que se va a maniobras.',
      'La carta pasa de la papelera de la embajada a la Sección de Estadística.',
      'Diciembre de 1894: Dreyfus es condenado con un expediente secreto.',
      'Marzo de 1896: el «petit bleu» lleva a Picquart hasta Esterhazy; la letra coincide.',
      'Noviembre de 1896: Henry fabrica una carta que nombra a Dreyfus.',
      'Noviembre de 1897: el banquero de Castro reconoce la letra de Esterhazy en un cartel.',
    ],
    decisiveEvidence: ['ev-bordereau', 'ev-petit-bleu', 'ev-cartas-esterhazy', 'ev-castro', 'ev-ulanos'],
    alibiTruths: [
      { characterId: 'ch-esterhazy', truth: 'Sí conocía al agregado alemán, sí usaba papel calco, y la letra del bordereau es la suya.' },
      { characterId: 'ch-henry', truth: 'Su «prueba definitiva» la fabricó él mismo con trozos de dos cartas.' },
    ],
  },

  endings: [
    {
      id: 'en-jaccuse',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { all: [{ fact: 'fa-faux' }, { fact: 'fa-castro' }] } },
      outcome: 'success',
      title: '«J’accuse…!»',
      text: 'En enero de 1898 un consejo de guerra absuelve a Esterhazy en tres minutos, y dos días después Émile Zola publica en L’Aurore su carta al presidente de la República: «Yo acuso». En agosto se descubre la falsificación de Henry, que se corta el cuello en el Mont-Valérien. Esterhazy huye a Londres y acaba confesando a un periódico que escribió el bordereau. Dreyfus vuelve de la isla del Diablo en 1899; en 1906 es rehabilitado y condecorado en el mismo patio donde le arrancaron los galones.',
    },
    {
      id: 'en-exito',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' },
      outcome: 'success',
      title: 'La letra',
      text: 'Demostráis quién escribió el bordereau. El Estado Mayor tardará años en admitirlo, pero ya no puede esconderlo.',
    },
    { id: 'en-henry', when: { culprit: 'ch-henry' }, outcome: 'partial', title: 'El falsificador', text: 'Desenmascaráis a Henry, pero su falsificación tapaba a otro. El verdadero espía sigue cobrando de Alemania.' },
    { id: 'en-dreyfus', when: { culprit: 'ch-dreyfus' }, outcome: 'failure', title: 'Cosa juzgada', text: 'Dais la razón al consejo de guerra. Alfred Dreyfus sigue encadenado cada noche en la isla del Diablo, y los documentos siguen saliendo.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Razón de Estado', text: 'El asunto se entierra «por el honor del Ejército». Picquart es destinado al desierto de Túnez.' },
  ],

  hints: [
    {
      id: 'hl-pb',
      topic: 'A quién escribía el agregado',
      relevantWhen: { not: { fact: 'fa-petit-bleu' } },
      steps: ['A: hay una carta-telegrama recompuesta en la Sección.', 'Mira a quién va dirigida.', 'Busca en el Ministerio cartas de ese oficial.'],
    },
    {
      id: 'hl-castro',
      topic: 'Alguien de fuera',
      relevantWhen: { not: { fact: 'fa-castro' } },
      steps: ['B: Mathieu ha repartido la letra por todo París.', 'Alguien ha reconocido la letra.', 'Habla con el banquero de Castro.'],
    },
    {
      id: 'hl-henry',
      topic: 'La prueba definitiva',
      relevantWhen: { not: { fact: 'fa-faux' } },
      steps: ['A: Henry dice que hay más pruebas.', 'Pídeselas.', 'Mírala a contraluz.'],
    },
  ],

  objectives: [
    { id: 'ob-letra', text: 'Demostrad quién escribió el bordereau.', completeWhen: { all: [{ fact: 'fa-letra-esterhazy' }, { fact: 'fa-castro' }] }, points: 30 },
    { id: 'ob-faux', text: 'Desenmascarad la prueba falsa.', completeWhen: { fact: 'fa-faux' }, points: 25 },
    { id: 'ob-ulanos', text: 'Averiguad qué pensaba Esterhazy de Francia.', completeWhen: { fact: 'fa-patria' }, points: 15, hidden: true },
  ],

  assets: [],
};

export default caseFile;
