import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-I-0002 · LA DENTADURA DEL HORNO
 * Boston, noviembre de 1849 · Homicidio · Caso real · Inspector
 *
 * Caso real: el asesinato del doctor George Parkman en la Facultad de
 * Medicina de Harvard. Los hechos documentados (desaparición, deuda,
 * hallazgo de restos, dentadura identificada por su dentista, cartas
 * anónimas, condena y confesión del profesor John White Webster) siguen las
 * fuentes; las conversaciones del investigador son una recreación.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-I-0002',
  contentVersion: 1,
  mode: 'individual',
  title: 'La dentadura del horno',
  subtitle: 'Un médico rico desaparece camino de una facultad de Medicina',
  origin: 'real',
  historical: {
    documented: [
      'El doctor George Parkman, médico y uno de los mayores propietarios de Boston, desapareció el viernes 23 de noviembre de 1849 tras dirigirse a la Facultad de Medicina de Harvard, en North Grove Street.',
      'John White Webster, profesor de Química de Harvard, le debía dinero. Parkman le había prestado sumas garantizadas, entre otras cosas, con su colección de minerales, que Webster volvió a ofrecer como garantía a otra persona.',
      'Webster sostuvo que aquel viernes le había pagado unos 483 dólares en su aula y que Parkman se marchó con el dinero.',
      'El conserje de la facultad, Ephraim Littlefield, que vivía en el sótano con su esposa, sospechó de Webster y abrió un boquete en la pared del pozo situado bajo su laboratorio. Allí aparecieron restos humanos el 30 de noviembre.',
      'En el laboratorio se hallaron más restos en un baúl de té y, en el horno, fragmentos de hueso y una dentadura postiza.',
      'El dentista Nathan Cooley Keep reconoció la dentadura: la había hecho él para Parkman y conservaba el molde.',
      'Durante la búsqueda llegaron a la policía cartas anónimas que desviaban la atención; en el juicio se atribuyeron a Webster.',
      'La familia ofreció recompensas por encontrar a Parkman. En el juicio, la defensa insinuó que el conserje buscaba cobrarlas.',
      'Webster fue condenado en 1850 y ahorcado el 30 de agosto. Antes de morir confesó que había golpeado a Parkman en su laboratorio en un arrebato de ira.',
    ],
    hypotheses: [
      'Se discutió si el crimen fue premeditado o un arrebato, como sostuvo Webster en su confesión.',
      'La conducta del conserje y su interés por la recompensa fueron objeto de debate en la época.',
    ],
    dramatized: [
      'Las conversaciones del investigador con los personajes, sus frases y el orden exacto de las pesquisas son una recreación.',
      'Algunos detalles de los documentos (redacción del parte, notas, horarios al minuto) están reconstruidos para el juego.',
      'Los retratos son recreaciones artísticas, no fotografías de las personas reales.',
    ],
    documentedResolution:
      'John White Webster fue declarado culpable del asesinato de George Parkman y ahorcado en Boston el 30 de agosto de 1850, tras confesar que lo mató golpeándolo en su laboratorio.',
    sources: [
      'Commonwealth v. Webster (1850), actas del juicio publicadas en Boston',
      'Simon Schama, Dead Certainties (1991)',
      'Helen Thomson, Murder at Harvard (1971)',
    ],
  },
  era: 'c19',
  eraLabel: 'Boston, 1849',
  year: 1849,
  location: { city: 'Boston', place: 'Facultad de Medicina de Harvard, North Grove Street', country: 'Estados Unidos' },
  category: 'homicide',
  difficulty: 'inspector',
  keywords: ['Boston', 'Harvard', 'Parkman', 'Webster', 'dentadura', 'horno', 'conserje', 'cartas anónimas', 'caso real'],
  ambience: { music: 'victorian-night', mood: 'tense' },
  maxHints: 4,

  briefing: {
    incidentDisplay: 'Viernes, 23 de noviembre de 1849 · tarde',
    summary:
      'El doctor George Parkman, uno de los hombres más ricos de Boston, salió de casa a cobrar deudas y no volvió. Lo vieron por última vez camino de la Facultad de Medicina de Harvard. Lleva una semana desaparecido y la ciudad entera lo busca.',
    context:
      'La familia ha pegado carteles por todo Boston y ofrece recompensa. El alguacil Francis Tukey ha registrado el puerto, los muelles y los edificios de Parkman, y le llegan cartas que juran haberlo visto en mil sitios. Le piden que mire donde nadie ha mirado: la propia facultad.',
    background:
      'Parkman, de cincuenta y nueve años, médico de formación, vive de sus alquileres y es famoso por cobrar en persona, a pie, hasta el último centavo. Donó el terreno donde se levantó la facultad.',
    victim: 'ch-parkman',
    initialFacts: [],
    initialEvidence: ['ev-cartel', 'ev-parte', 'ev-cita'],
    initialTimeline: ['te-cita', 'te-visto', 'te-desaparece'],
  },

  characters: [
    {
      id: 'ch-parkman',
      name: 'George Parkman',
      look: { hair: 'short' },
      role: 'victim',
      age: 59,
      occupation: 'Médico y propietario',
      appearance:
        'a tall gaunt 59-year-old Boston gentleman in 1849, long thin face, prominent jaw, receding grey hair, black frock coat, high white collar and black stock, stern restless eyes',
      summary: 'Cobraba sus deudas a pie, puerta por puerta.',
      biography: 'Médico formado en Europa que dejó la consulta por los negocios. Alto, flaco, de paso rápido y genio vivo. Prestaba dinero a muchos, también a colegas de Harvard, y nunca perdonaba un plazo.',
      personality: ['Puntilloso', 'Impaciente', 'Generoso con las instituciones, implacable con los deudores'],
    },
    {
      id: 'ch-webster',
      name: 'John White Webster',
      look: { hair: 'short', glasses: true },
      role: 'suspect',
      age: 56,
      occupation: 'Profesor de Química en Harvard',
      appearance:
        'a plump 56-year-old American chemistry professor in 1849, round face, small round spectacles, short dark hair going grey, clean shaven, dark frock coat and white cravat, nervous polite smile',
      summary: 'Un profesor afable que vive por encima de su sueldo.',
      biography: 'Catedrático de Química y Mineralogía, conocido por sus demostraciones con fuego y explosiones. Vive en Cambridge con su mujer y sus hijas, y da recepciones que su sueldo no paga.',
      personality: ['Sociable', 'Nervioso', 'Orgulloso'],
      relationToVictim: 'Le debía dinero',
      motive: { text: 'Debía a Parkman una suma que no podía pagar, y había vuelto a empeñar la misma garantía.', visibleWhen: { fact: 'fa-doble-garantia' } },
      alibi: { claim: 'Pagó a Parkman en su aula el viernes por la tarde; Parkman se fue con el dinero.' },
    },
    {
      id: 'ch-littlefield',
      name: 'Ephraim Littlefield',
      look: { hair: 'short' },
      role: 'suspect',
      age: 37,
      occupation: 'Conserje de la Facultad de Medicina',
      appearance:
        'a 37-year-old American college janitor in 1849, lean weathered face, short dark hair, sideburns, rough wool jacket over a waistcoat, watchful suspicious eyes',
      summary: 'Vive en el sótano de la facultad y lo ve todo.',
      biography: 'Cuida el edificio, enciende las estufas y, se rumorea, ayuda a conseguir cadáveres para las clases de anatomía. Vive en el sótano con su mujer, Caroline.',
      personality: ['Desconfiado', 'Tenaz', 'Interesado'],
      relationToVictim: 'Conocía a Parkman de vista',
      motive: { text: 'La familia ofrece una recompensa que es varias veces su sueldo de un año.', visibleWhen: { fact: 'fa-recompensa' } },
      alibi: { claim: 'Todo el viernes en el edificio, con sus faenas, y por la noche en una fiesta con su mujer.' },
    },
    {
      id: 'ch-keep',
      name: 'Nathan Cooley Keep',
      look: { hair: 'short', beard: true },
      role: 'witness',
      age: 49,
      occupation: 'Dentista',
      appearance:
        'a 49-year-old Boston dentist in 1849, neat side whiskers, short grey-brown hair, dark coat, white collar, careful serious expression',
      summary: 'Recuerda cada boca que ha tratado.',
      biography: 'Uno de los dentistas más reputados de Boston. Hizo en 1846 una dentadura postiza para el doctor Parkman, y guarda los moldes de su trabajo.',
      personality: ['Minucioso', 'Sereno', 'Escrupuloso'],
      appearsWhen: { evidence: 'ev-horno' },
    },
    {
      id: 'ch-tukey',
      name: 'Francis Tukey',
      look: { hair: 'short', beard: true },
      role: 'witness',
      age: 35,
      occupation: 'Alguacil (city marshal) de Boston',
      appearance:
        'a 35-year-old Boston city marshal in 1849, strong square face, thick dark hair, full moustache, dark frock coat with a badge, tired determined eyes',
      summary: 'Ha registrado medio Boston y recibe cartas cada día.',
      biography: 'Jefe de la policía de Boston. Lleva una semana dirigiendo la mayor búsqueda que ha visto la ciudad.',
      personality: ['Enérgico', 'Pragmático'],
    },
  ],

  locations: [
    { id: 'lo-facultad', name: 'Facultad de Medicina', description: 'Edificio de ladrillo en North Grove Street, junto al río y la cárcel.' },
    { id: 'lo-laboratorio', name: 'Laboratorio de Webster', description: 'Aula y laboratorio de química, con un horno de ensayo y una escalera privada al sótano.' },
    { id: 'lo-pozo', name: 'Pozo bajo el laboratorio', description: 'El pozo ciego del retrete privado de Webster, cerrado con muros de ladrillo.', appearsWhen: { evidence: 'ev-pozo' } },
    { id: 'lo-casa', name: 'Casa de Parkman', description: 'En Walnut Street, en Beacon Hill.' },
  ],

  relationships: [
    { id: 're-deuda', a: 'ch-webster', b: 'ch-parkman', label: 'Deudor y acreedor', visibleWhen: { fact: 'fa-deuda' } },
    { id: 're-conserje', a: 'ch-littlefield', b: 'ch-webster', label: 'Conserje del edificio donde enseña', },
    { id: 're-dentista', a: 'ch-keep', b: 'ch-parkman', label: 'Su dentista', visibleWhen: { evidence: 'ev-molde' } },
  ],

  facts: [
    { id: 'fa-cita', text: 'Parkman tenía una cita con Webster en la facultad el viernes a la una y media.', important: true },
    { id: 'fa-ultimo', text: 'Lo vieron por última vez hacia las dos menos cuarto, entrando en North Grove Street.', important: true },
    { id: 'fa-deuda', text: 'Webster debía dinero a Parkman desde hacía años.', important: true },
    { id: 'fa-doble-garantia', text: 'Webster ofreció como garantía a otro acreedor la misma colección de minerales que ya respondía de su deuda con Parkman.', important: true },
    { id: 'fa-dice-pago', text: 'Webster asegura que el viernes pagó a Parkman 483,64 dólares en su aula.' },
    { id: 'fa-sin-dinero', text: 'Webster no tenía de dónde sacar los 483 dólares que dice haber pagado.', important: true },
    { id: 'fa-cerrado', text: 'Webster pasó la semana encerrado en su laboratorio, con el horno encendido a todas horas.', important: true },
    { id: 'fa-pavo', text: 'Webster regaló un pavo al conserje por Acción de Gracias: la primera vez en siete años.' },
    { id: 'fa-recompensa', text: 'La familia ofrece una recompensa por encontrar a Parkman.' },
    { id: 'fa-restos-pozo', text: 'En el pozo bajo el laboratorio hay restos humanos.', important: true },
    { id: 'fa-restos-lab', text: 'En el laboratorio hay más restos humanos, escondidos en un baúl de té.', important: true },
    { id: 'fa-dentadura', text: 'En el horno de Webster apareció una dentadura postiza con oro.', important: true },
    { id: 'fa-es-parkman', text: 'La dentadura del horno es la que el dentista Keep hizo para Parkman: los restos son suyos.', important: true },
    { id: 'fa-cartas-webster', text: 'Las cartas anónimas que despistaban a la policía salieron de la mano de Webster.', important: true },
    { id: 'fa-littlefield-fiesta', text: 'El viernes por la noche Littlefield estaba en una fiesta con su mujer, ante muchos testigos.' },
  ],

  evidence: [
    {
      id: 'ev-cartel',
      kind: 'press',
      title: 'Cartel de búsqueda',
      dated: 'Sábado, 24 de noviembre de 1849',
      source: 'Pegado en las calles de Boston',
      summary: 'La familia pide ayuda a toda la ciudad.',
      related: { characters: ['ch-parkman'], locations: ['lo-casa'], events: ['te-visto'] },
      body: [
        { type: 'heading', text: '¡3.000 DÓLARES DE RECOMPENSA!' },
        {
          type: 'typed',
          text: 'El DR. GEORGE PARKMAN, conocido ciudadano de Boston, salió de su casa en Walnut Street el viernes 23, a mediodía. {{dt-cartel-visto|Se le vio por última vez hacia las dos menos cuarto, en la esquina de Blossom Street con Vine Street, en dirección a la Facultad de Medicina.}}',
        },
        { type: 'typed', text: 'Alto y delgado; levita negra, pantalón oscuro, chaleco de seda morado y sombrero negro.' },
        { type: 'typed', text: '{{dt-cartel-recompensa|Se pagarán 3.000 dólares a quien dé noticias que permitan encontrarlo con vida, y 1.000 por el hallazgo de su cuerpo.}}' },
        { type: 'signature', name: 'Robert Gould Shaw, en nombre de la familia' },
      ],
      details: [
        { id: 'dt-cartel-visto', label: 'Camino de la facultad', description: 'Lo último que se sabe es que iba hacia la Facultad de Medicina.', effects: [{ grantFact: 'fa-ultimo' }], points: 10 },
        { id: 'dt-cartel-recompensa', label: 'Una recompensa enorme', description: 'Mil dólares por el cuerpo: años de sueldo para un trabajador.', effects: [{ grantFact: 'fa-recompensa' }], points: 5 },
      ],
    },
    {
      id: 'ev-parte',
      kind: 'report',
      title: 'Parte del alguacil Tukey',
      source: 'Policía de Boston',
      summary: 'Una semana de búsqueda, y nada.',
      related: { characters: ['ch-tukey', 'ch-parkman'], locations: ['lo-facultad'], events: [] },
      body: [
        { type: 'heading', text: 'POLICÍA DE BOSTON · BÚSQUEDA DEL DR. PARKMAN' },
        { type: 'typed', text: 'Registrados: los muelles y los barcos amarrados, el río dragado frente a la Facultad, las casas y solares de la propiedad del doctor, las posadas de la ciudad.' },
        {
          type: 'typed',
          text: 'En la Facultad de Medicina se ha registrado el edificio con el permiso de los profesores. {{dt-parte-lab|En el laboratorio del profesor Webster se entró solo a la sala y la trastienda, en compañía del propio profesor; no se bajó a su sótano privado.}}',
        },
        { type: 'typed', text: 'Se reciben a diario cartas que aseguran haber visto al doctor en Cambridge, en un barco, en una taberna de East Boston. Ninguna ha dado fruto.' },
        { type: 'signature', name: 'Francis Tukey, alguacil' },
      ],
      details: [{ id: 'dt-parte-lab', label: 'Un sótano sin registrar', description: 'El único rincón de la facultad que nadie ha mirado a fondo es el sótano privado de Webster.', effects: [], points: 15 }],
    },
    {
      id: 'ev-cita',
      kind: 'statement',
      title: 'Declaración del criado de la familia Parkman',
      source: 'Tomada en Walnut Street',
      summary: 'Una visita temprana el día de la desaparición.',
      related: { characters: ['ch-parkman', 'ch-webster'], locations: ['lo-casa'], events: ['te-cita'] },
      body: [
        { type: 'typed', text: '—El viernes, hacia las nueve de la mañana, llamó a la puerta un caballero bajo y grueso, con gafas. Preguntó por el doctor.' },
        { type: 'typed', text: '—{{dt-cita-hora|Le oí decir al doctor que pasara por la facultad a la una y media, que allí arreglarían lo suyo.}} El doctor contestó que allí estaría, y dijo el nombre: Webster.' },
        { type: 'signature', name: 'Criado de la casa Parkman' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-cita' }],
      details: [{ id: 'dt-cita-hora', label: 'Una cita a la una y media', description: 'Webster citó a Parkman en la facultad la misma tarde en que desapareció.', effects: [{ grantFact: 'fa-cita' }], points: 15 }],
      decisive: true,
      points: 5,
    },
    {
      id: 'ev-pagares',
      kind: 'record',
      title: 'Pagarés y garantías del profesor Webster',
      source: 'Papeles del despacho de Parkman',
      summary: 'Lo que Webster debía, y a cambio de qué.',
      autoDiscoverWhen: { asked: 'q-webster-deuda' },
      related: { characters: ['ch-webster', 'ch-parkman'], locations: ['lo-casa'], events: [] },
      body: [
        {
          type: 'table',
          header: ['Fecha', 'Deuda', 'Garantía'],
          rows: [
            ['1842', '400 dólares, a Parkman', 'Pagaré personal'],
            ['1847', '{{dt-hipoteca|2.432 dólares, a Parkman y otros amigos}}', '{{dt-hipoteca-objeto|Hipoteca sobre sus bienes muebles: muebles, libros y su colección de minerales}}'],
          ],
        },
        { type: 'handwritten', text: 'Webster pagó algo de lo primero. De lo segundo, nada. Le apremio desde el verano.', author: 'Nota de Parkman' },
      ],
      details: [
        { id: 'dt-hipoteca', label: 'Más de dos mil dólares', description: 'Una deuda enorme para un catedrático.', effects: [{ grantFact: 'fa-deuda' }], points: 10 },
        { id: 'dt-hipoteca-objeto', label: 'La colección de minerales', description: 'La colección de Webster responde de su deuda con Parkman.', effects: [], points: 10 },
      ],
    },
    {
      id: 'ev-shaw',
      kind: 'letter',
      title: 'Carta de Robert Gould Shaw',
      source: 'Entregada por la familia',
      summary: 'El cuñado de Parkman cuenta una venta sospechosa.',
      autoDiscoverWhen: { fact: 'fa-deuda' },
      related: { characters: ['ch-webster', 'ch-parkman'], locations: [], events: ['te-enfado'] },
      body: [
        { type: 'paragraph', text: 'Señor:' },
        {
          type: 'paragraph',
          text: 'Hace unos meses el profesor Webster vino a mí apurado y me pidió 1.200 dólares. {{dt-shaw-coleccion|Me ofreció como garantía su colección de minerales, asegurándome que estaba libre de cargas.}}',
        },
        {
          type: 'paragraph',
          text: 'Lo comenté con mi cuñado. {{dt-shaw-furia|George montó en cólera: esa colección ya estaba hipotecada a su favor. Desde entonces no dejó a Webster en paz; iba a buscarle a sus clases y le amenazó con hacerlo público y con su puesto.}}',
        },
        { type: 'signature', name: 'Robert Gould Shaw' },
      ],
      details: [
        { id: 'dt-shaw-coleccion', label: 'La misma garantía, dos veces', description: 'Webster empeñó a Shaw lo que ya había hipotecado a Parkman.', effects: [], points: 15 },
        { id: 'dt-shaw-furia', label: 'Parkman le acosaba', description: 'Parkman amenazaba con arruinar la reputación de Webster.', effects: [{ unlockTimelineEvent: 'te-enfado' }], points: 15 },
      ],
      decisive: true,
      points: 5,
    },
    {
      id: 'ev-caroline',
      kind: 'statement',
      title: 'Declaración de Caroline Littlefield',
      source: 'Tomada en la vivienda del sótano',
      summary: 'La mujer del conserje cuenta su viernes.',
      autoDiscoverWhen: { asked: 'q-little-viernes' },
      related: { characters: ['ch-littlefield'], locations: ['lo-facultad'], events: ['te-fiesta'] },
      body: [
        { type: 'typed', text: '—El viernes por la tarde Ephraim anduvo por el edificio con sus faenas. A la noche fuimos a casa de unos conocidos, a una fiesta.' },
        { type: 'typed', text: '—{{dt-fiesta|Estuvimos hasta pasada la medianoche; bailó con medio barrio, todos le vieron.}} Volvimos andando juntos.' },
        { type: 'signature', name: 'Caroline Littlefield' },
      ],
      details: [{ id: 'dt-fiesta', label: 'Una fiesta con testigos', description: 'Littlefield pasó la noche del viernes a la vista de muchos.', effects: [{ grantFact: 'fa-littlefield-fiesta' }, { unlockTimelineEvent: 'te-fiesta' }], points: 10 }],
    },
    {
      id: 'ev-cartas',
      kind: 'letter',
      title: 'Cartas anónimas recibidas por el alguacil',
      source: 'Archivo de la policía',
      summary: 'Tres cartas que juran saber dónde está Parkman.',
      autoDiscoverWhen: { asked: 'q-tukey-cartas' },
      related: { characters: ['ch-tukey'], locations: [], events: [] },
      body: [
        { type: 'handwritten', text: '«Dr. Parkman was took on board the ship Herculean and one of the captains took him». Sin firma. Letra torpe, como de quien escribe mal a propósito.', author: 'Primera carta' },
        { type: 'handwritten', text: '«Lo hallarán en Brooklyn Heights». Firmada «Civis».', author: 'Segunda carta' },
        {
          type: 'paragraph',
          text: '{{dt-cartas-papel|Las tres están escritas en el mismo papel de cartas, grueso y de buena calidad, que no gasta un marinero. El que las escribe disimula la letra, pero no las mayúsculas: las «D» tienen el mismo bucle.}}',
        },
      ],
      details: [{ id: 'dt-cartas-papel', label: 'Mano educada, letra disfrazada', description: 'Alguien culto intenta desviar la búsqueda lejos de la facultad.', effects: [], points: 15 }],
    },
    {
      id: 'ev-caligrafia',
      kind: 'document',
      title: 'Nota manuscrita del profesor Webster',
      source: 'Entregada por la facultad (aviso de clase)',
      summary: 'La letra del profesor, para comparar.',
      autoDiscoverWhen: { evidence: 'ev-cartas' },
      related: { characters: ['ch-webster'], locations: ['lo-laboratorio'], events: [] },
      body: [
        { type: 'handwritten', text: '«Dr. Webster aplaza su lección del jueves». ', author: 'J. W. Webster' },
        { type: 'paragraph', text: '{{dt-letra-d|La «D» de «Dr.» tiene exactamente el mismo bucle cerrado hacia la izquierda.}} Y el papel es del mismo gramaje.' },
      ],
      details: [{ id: 'dt-letra-d', label: 'La misma «D»', description: 'El bucle de la mayúscula coincide con el de las cartas anónimas.', effects: [], points: 15 }],
      decisive: true,
    },
    {
      id: 'ev-pozo',
      kind: 'report',
      title: 'Informe del hallazgo en el pozo',
      source: 'Policía de Boston',
      summary: 'Lo que había detrás del muro del sótano.',
      autoDiscoverWhen: { flag: 'pozo-abierto' },
      related: { characters: ['ch-littlefield', 'ch-tukey'], locations: ['lo-pozo'], events: ['te-pozo'] },
      body: [
        { type: 'heading', text: 'VIERNES, 30 DE NOVIEMBRE · TARDE' },
        {
          type: 'typed',
          text: 'Tras dos días abriendo con cincel y palanca un boquete en el muro de ladrillo del pozo ciego bajo el laboratorio del profesor Webster, el conserje Littlefield avisó a la policía. {{dt-pozo-restos|Dentro, sobre los residuos, había una pelvis y partes de una pierna humana. No proceden de las salas de disección: no tienen las marcas ni la preparación de los cadáveres de anatomía.}}',
        },
        { type: 'signature', name: 'Francis Tukey, alguacil' },
      ],
      details: [{ id: 'dt-pozo-restos', label: 'Restos que no son de la sala de disección', description: 'Alguien se deshizo de un cuerpo en el pozo privado de Webster.', effects: [{ grantFact: 'fa-restos-pozo' }, { unlockTimelineEvent: 'te-pozo' }], points: 20 }],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-baul',
      kind: 'physical',
      title: 'Baúl de té del laboratorio',
      source: 'Registro del laboratorio de Webster',
      summary: 'Un baúl lleno de corteza de curtir.',
      autoDiscoverWhen: { evidence: 'ev-pozo' },
      related: { characters: ['ch-webster'], locations: ['lo-laboratorio'], events: [] },
      body: [
        { type: 'typed', text: 'En un rincón del laboratorio, un baúl de té cubierto de minerales. {{dt-baul|Bajo una capa de corteza de curtir, un torso y un muslo humanos.}}' },
      ],
      details: [{ id: 'dt-baul', label: 'Más restos, ocultos', description: 'Los restos estaban escondidos dentro del laboratorio de Webster.', effects: [{ grantFact: 'fa-restos-lab' }], points: 15 }],
      decisive: true,
    },
    {
      id: 'ev-horno',
      kind: 'physical',
      title: 'Restos del horno de ensayo',
      source: 'Registro del laboratorio de Webster',
      summary: 'Lo que no terminó de arder.',
      autoDiscoverWhen: { evidence: 'ev-pozo' },
      related: { characters: ['ch-webster'], locations: ['lo-laboratorio'], events: ['te-horno'] },
      body: [
        { type: 'typed', text: 'Entre las escorias del horno, fragmentos de hueso calcinado, botones y monedas fundidas. {{dt-dentadura|Y una dentadura postiza de porcelana con base de oro, ennegrecida pero entera en parte.}}' },
      ],
      details: [{ id: 'dt-dentadura', label: 'Una dentadura postiza', description: 'Una dentadura hecha a medida identifica a su dueño mejor que una cara.', effects: [{ grantFact: 'fa-dentadura' }, { unlockTimelineEvent: 'te-horno' }], points: 20 }],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-molde',
      kind: 'object',
      title: 'Molde de escayola del dentista Keep',
      source: 'Consulta del doctor Keep',
      summary: 'El molde de la boca de Parkman, de 1846.',
      autoDiscoverWhen: { asked: 'q-keep-molde' },
      related: { characters: ['ch-keep', 'ch-parkman'], locations: [], events: [] },
      body: [
        { type: 'paragraph', text: 'Molde de escayola de la mandíbula inferior del doctor Parkman, rotulado «G. Parkman, 1846».' },
        {
          type: 'paragraph',
          text: '{{dt-molde-encaja|La pieza del horno encaja en el molde como una llave en su cerradura: la misma mandíbula prominente, el mismo hueco que hubo que ajustar a toda prisa antes de la inauguración de la facultad.}}',
        },
      ],
      details: [{ id: 'dt-molde-encaja', label: 'Encaja en el molde', description: 'La dentadura del horno es la de Parkman.', effects: [], points: 20 }],
      decisive: true,
      points: 10,
    },
  ],

  deductions: [
    {
      id: 'de-dinero',
      title: 'Un pago imposible',
      combine: ['dt-hipoteca', 'fa-dice-pago'],
      explanation: 'Webster no podía pagar ni los intereses; que dé de golpe 483 dólares en metálico el mismo día que Parkman desaparece no se sostiene.',
      effects: [{ grantFact: 'fa-sin-dinero' }],
      points: 30,
    },
    {
      id: 'de-garantia',
      title: 'La colección empeñada dos veces',
      combine: ['dt-hipoteca-objeto', 'dt-shaw-coleccion'],
      explanation: 'La misma colección de minerales respondía de la deuda con Parkman y se la ofreció a Shaw como libre: Parkman podía denunciarle por fraude.',
      effects: [{ grantFact: 'fa-doble-garantia' }],
      points: 30,
    },
    {
      id: 'de-dientes',
      title: 'La dentadura de Parkman',
      combine: ['dt-dentadura', 'dt-molde-encaja'],
      explanation: 'La dentadura que salió del horno de Webster encaja en el molde que Keep hizo de la boca de Parkman: los restos son del doctor.',
      effects: [{ grantFact: 'fa-es-parkman' }],
      points: 40,
    },
    {
      id: 'de-cartas',
      title: 'El autor de las cartas',
      combine: ['dt-cartas-papel', 'dt-letra-d'],
      explanation: 'El bucle de la «D» y el papel de las cartas anónimas son los de la nota de Webster: él escribía las pistas falsas.',
      effects: [{ grantFact: 'fa-cartas-webster' }],
      points: 30,
    },
  ],

  contradictions: [
    {
      id: 'cx-webster-visita',
      title: 'Webster sí estuvo con Parkman en la facultad',
      a: { line: 'ln-webster-nove' },
      b: { detail: 'dt-cita-hora' },
      explanation: 'Webster dice que no vio a Parkman aquella tarde en la facultad; el criado le oyó citarlo allí a la una y media.',
      effects: [{ unlockTimelineEvent: 'te-encuentro' }],
      points: 30,
    },
    {
      id: 'cx-webster-lab',
      title: 'El laboratorio no estaba «como siempre»',
      a: { line: 'ln-webster-normal' },
      b: { line: 'ln-little-horno' },
      explanation: 'Webster dice que trabajó como siempre; el conserje cuenta la puerta cerrada por dentro, el agua corriendo y el muro del horno tan caliente que no se podía tocar.',
      effects: [{ grantFact: 'fa-cerrado' }],
      points: 30,
    },
    {
      id: 'cx-little-dinero',
      title: 'Littlefield no estaba solo el viernes por la noche',
      a: { line: 'ln-little-solo' },
      b: { detail: 'dt-fiesta' },
      explanation: 'Littlefield dijo que pasó la noche en el edificio; su mujer cuenta que estuvieron en una fiesta. No mentía para tapar un crimen, sino una costumbre poco digna.',
      effects: [{ revealSecret: 'se-littlefield' }],
      points: 15,
    },
  ],

  secrets: [
    { id: 'se-littlefield', characterId: 'ch-littlefield', text: 'Littlefield complementaba su sueldo consiguiendo cadáveres para las clases de anatomía, sin hacer preguntas sobre su procedencia. Por eso no quería que se registrase el sótano a fondo… hasta que sospechó de Webster.', points: 20 },
    { id: 'se-webster', characterId: 'ch-webster', text: 'Webster había vuelto a empeñar su colección de minerales, ya hipotecada a Parkman, y Parkman amenazaba con hacerlo público.', revealedWhen: { fact: 'fa-doble-garantia' }, points: 20 },
  ],

  interrogations: [
    {
      id: 'in-webster',
      characterId: 'ch-webster',
      setting: 'En su laboratorio. Huele a ácido y a carbón; el horno está encendido aunque hace rato que acabó la clase.',
      opening: [{ text: '¡Qué asunto tan espantoso! El pobre Parkman. Pregunte lo que quiera, pero sea breve: tengo clase a las doce.' }],
      topics: [
        {
          id: 'tp-webster-viernes',
          label: 'El viernes',
          kind: 'events',
          questions: [
            {
              id: 'q-webster-viernes',
              prompt: '¿Vio usted al doctor Parkman el viernes?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Por la mañana pasé por su casa a decirle que tenía su dinero. Nada más.', tone: 'evasion' },
                    { id: 'ln-webster-nove', text: 'Aquí, en la facultad, no lo vi en toda la tarde. Ni siquiera sé si llegó a venir.', tone: 'lie' },
                  ],
                },
              ],
            },
            {
              id: 'q-webster-cx',
              prompt: 'El criado le oyó citarle aquí a la una y media.',
              kind: 'contradiction',
              contradiction: 'cx-webster-visita',
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Webster se limpia las gafas con más cuidado del necesario.' },
                    { text: 'Ah, sí, sí… lo confundía con otro día. Vino. Vino y le pagué en mi aula, en mano.', tone: 'admission' },
                    { id: 'ln-webster-pago', text: 'Cuatrocientos ochenta y tres dólares con sesenta y cuatro centavos. Cogió el dinero y se fue diciendo que cancelaría la hipoteca. Fue la última vez que lo vi.', tone: 'lie' },
                  ],
                  effects: [{ unlockTimelineEvent: 'te-encuentro' }, { unlockTimelineEvent: 'te-falso-pago' }, { grantFact: 'fa-dice-pago' }],
                },
              ],
            },
            {
              id: 'q-webster-semana',
              prompt: '¿Qué ha hecho esta semana en el laboratorio?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-webster-normal', text: 'Lo de siempre: preparar experimentos para mis clases. Nada fuera de lo normal.', tone: 'lie' }] }],
            },
          ],
        },
        {
          id: 'tp-webster-deuda',
          label: 'El dinero',
          kind: 'personal',
          questions: [
            {
              id: 'q-webster-deuda',
              prompt: '¿Le debía dinero a Parkman?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Una pequeñez, ya saldada. George era muy puntilloso con las cuentas. Si quiere ver papeles, los tendrá su familia.', tone: 'evasion' },
                  ],
                  effects: [{ grantFact: 'fa-deuda' }],
                },
              ],
            },
            {
              id: 'q-webster-coleccion',
              prompt: 'Ofreció a Shaw una colección que ya estaba hipotecada a Parkman.',
              kind: 'confront',
              requires: { fact: 'fa-doble-garantia' },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Por primera vez, el profesor no sonríe.' },
                    { text: 'Un descuido. Un malentendido de papeles. George lo tomó como una afrenta personal; venía a mis clases a mirarme desde la última fila.', tone: 'admission' },
                    { text: 'Pero yo le pagué. Le pagué.', tone: 'lie' },
                  ],
                },
              ],
            },
            {
              id: 'q-webster-dinero',
              prompt: '¿De dónde sacó 483 dólares, si no podía pagar ni los intereses?',
              kind: 'confront',
              requires: { fact: 'fa-sin-dinero' },
              responses: [{ lines: [{ text: 'Ahorros. Las entradas de mis conferencias. No tengo por qué darle explicaciones de mis bolsillos.', tone: 'evasion' }] }],
            },
          ],
        },
        {
          id: 'tp-webster-final',
          label: 'Lo que había en el laboratorio',
          kind: 'other',
          questions: [
            {
              id: 'q-webster-restos',
              prompt: 'En su laboratorio y bajo él había restos humanos. En su horno, la dentadura de Parkman.',
              kind: 'confront',
              requires: { all: [{ fact: 'fa-es-parkman' }, { fact: 'fa-restos-lab' }] },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Webster se sienta. Le tiemblan las manos.' },
                    { text: '¡Es una conspiración! Ese conserje ha puesto ahí lo que ha querido para cobrar la recompensa. Cualquiera puede bajar a ese sótano.', tone: 'lie' },
                  ],
                },
              ],
            },
            {
              id: 'q-webster-cartas',
              prompt: 'Las cartas anónimas que despistaban a la policía son de su mano.',
              kind: 'confront',
              requires: { all: [{ fact: 'fa-cartas-webster' }, { fact: 'fa-es-parkman' }] },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Un largo silencio. Fuera, alguien cierra un portón de golpe y el profesor se sobresalta.' },
                    { text: 'Me insultó. Aquí mismo, delante de mi mesa, me llamó tramposo y mentiroso y me amenazó con echarme de Harvard.', tone: 'admission' },
                    { text: 'Tenía en la mano un trozo de madera, de la leña del horno. Le golpeé una vez. Una. Y ya no se movió.', tone: 'admission' },
                    { text: 'Después… cerré la puerta. Tenía el horno, el agua, el pozo. Pensé que podría hacerlo desaparecer.', tone: 'admission' },
                  ],
                  effects: [{ setFlag: 'webster-confiesa' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-littlefield',
      characterId: 'ch-littlefield',
      setting: 'En la vivienda del sótano, junto a la estufa. Tiene las manos llenas de polvo de ladrillo.',
      opening: [{ text: 'El doctor Parkman vino aquí el viernes; yo no le vi salir. Y desde entonces el profesor de arriba no es el mismo. Pregunte.' }],
      topics: [
        {
          id: 'tp-little-viernes',
          label: 'El viernes',
          kind: 'alibi',
          questions: [
            {
              id: 'q-little-viernes',
              prompt: '¿Dónde estuvo usted el viernes?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Por la tarde, aquí, con las estufas y las faenas. A eso de las dos menos cuarto vi al doctor Parkman venir calle abajo hacia la puerta.', tone: 'truth' },
                    { id: 'ln-little-solo', text: 'Y por la noche, también aquí. Solo. No salí del edificio.', tone: 'lie' },
                  ],
                  effects: [{ grantFact: 'fa-ultimo' }, { unlockTimelineEvent: 'te-visto' }],
                },
              ],
            },
            {
              id: 'q-little-cx',
              prompt: 'Su mujer dice que pasaron la noche en una fiesta.',
              kind: 'contradiction',
              contradiction: 'cx-little-dinero',
              responses: [
                {
                  lines: [
                    { text: 'Bueno, sí. Fuimos a la fiesta de los Grant. No quería que se hablara de mí más de la cuenta, con lo que se dice de los conserjes de las facultades.', tone: 'admission' },
                    { text: 'Hay cosas que se bajan a este sótano de noche, para las clases de anatomía, y uno no pregunta de dónde salen. Pero el doctor Parkman no es una de ellas: eso es cosa del de arriba.', tone: 'admission' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'tp-little-webster',
          label: 'El profesor Webster',
          kind: 'person',
          about: 'ch-webster',
          questions: [
            {
              id: 'q-little-webster',
              prompt: '¿Qué ha notado en el profesor esta semana?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Que se encierra. Siempre me dejaba pasar a barrer; esta semana, la puerta con cerrojo por dentro, día y noche.', tone: 'truth' },
                    { id: 'ln-little-horno', text: 'Se oía el agua correr sin parar, y el muro del horno, desde mi lado, estaba tan caliente que no se podía apoyar la mano. Para qué tanto fuego, sin clases.', tone: 'truth' },
                  ],
                },
              ],
            },
            {
              id: 'q-little-pavo',
              prompt: '¿Le ha pasado algo más con él?',
              kind: 'press',
              requires: { asked: 'q-little-webster' },
              responses: [
                {
                  lines: [{ text: 'El martes me dio una orden para recoger un pavo para Acción de Gracias. En siete años no me había regalado ni una cerilla.', tone: 'truth' }],
                  effects: [{ grantFact: 'fa-pavo' }],
                },
              ],
            },
          ],
        },
        {
          id: 'tp-little-pozo',
          label: 'El pozo',
          kind: 'other',
          questions: [
            {
              id: 'q-little-pozo',
              prompt: '¿Se puede llegar al pozo de debajo del laboratorio?',
              kind: 'ask',
              requires: { any: [{ fact: 'fa-cerrado' }, { detail: 'dt-parte-lab' }] },
              responses: [
                {
                  lines: [
                    { text: 'Solo él tiene la llave de su retrete. Pero el pozo linda con el muro del sótano. Con un cincel y paciencia…', tone: 'truth' },
                    { speaker: 'narration', text: 'Dos días después, Littlefield abre por fin un boquete en el ladrillo y manda llamar a la policía.' },
                  ],
                  effects: [{ setFlag: 'pozo-abierto' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-keep',
      characterId: 'ch-keep',
      setting: 'En su consulta de Boston. Tiene sobre la mesa, envuelta en un pañuelo, la dentadura sacada del horno.',
      opening: [{ text: 'Me han traído esto de la facultad. Quieren saber si lo reconozco.' }],
      topics: [
        {
          id: 'tp-keep-dentadura',
          label: 'La dentadura',
          kind: 'other',
          questions: [
            {
              id: 'q-keep-molde',
              prompt: '¿Puede saber de quién es?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Keep le da vueltas a la pieza ennegrecida sin decir nada. Le cuesta tragar.' },
                    { text: 'La hice yo, en 1846. Guardo el molde de cada boca que trato. Déjeme traerlo.', tone: 'truth' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-tukey',
      characterId: 'ch-tukey',
      setting: 'En la comisaría, rodeado de cartas y planos de los muelles.',
      opening: [{ text: 'Si viene a decirme que ha visto a Parkman en un barco, póngase a la cola.' }],
      topics: [
        {
          id: 'tp-tukey-busqueda',
          label: 'La búsqueda',
          kind: 'events',
          questions: [
            {
              id: 'q-tukey-cartas',
              prompt: '¿Qué cartas ha recibido?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Docenas. Casi todas de chiflados. Tres me dan mala espina: todas dicen dónde está, y todas lejos de la facultad. Tome, mírelas usted.', tone: 'truth' }] }],
            },
            {
              id: 'q-tukey-facultad',
              prompt: '¿Registraron a fondo la facultad?',
              kind: 'ask',
              responses: [
                {
                  lines: [{ text: 'Lo que nos dejaron. Los profesores son caballeros; uno no le pide a un catedrático de Harvard que le abra el retrete.', tone: 'truth' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto a la muerte (hacia las dos de la tarde del viernes)
  timeline: [
    { id: 'te-enfado', t: -10080, display: 'Semanas antes', title: 'Parkman descubre que la colección se ofreció también a Shaw', description: 'Desde entonces acosa a Webster.', characters: ['ch-parkman', 'ch-webster'], key: true },
    { id: 'te-cita', t: -300, display: 'Viernes, 9:00', title: 'Webster cita a Parkman en la facultad a la una y media', description: 'En la puerta de casa de Parkman.', characters: ['ch-webster', 'ch-parkman'], location: 'lo-casa', key: true },
    { id: 'te-visto', t: -15, display: 'Viernes, 13:45', title: 'Parkman camina hacia la Facultad de Medicina', description: 'Lo ven en Blossom Street; Littlefield lo ve llegar.', characters: ['ch-parkman'], location: 'lo-facultad', key: true },
    { id: 'te-encuentro', t: -5, display: 'Viernes, hacia las 14:00', title: 'Parkman y Webster se encuentran en el laboratorio', description: 'Parkman le acusa de tramposo.', characters: ['ch-parkman', 'ch-webster'], location: 'lo-laboratorio', key: true },
    { id: 'te-falso-pago', t: 0, display: 'Viernes, por la tarde', title: 'Webster paga a Parkman y este se marcha con el dinero', description: 'Según Webster.', characters: ['ch-webster', 'ch-parkman'], veracity: 'false', claimedBy: 'ch-webster' },
    { id: 'te-desaparece', t: 1, display: 'Viernes, 14:00', title: 'Muerte de George Parkman', description: 'Un golpe en el laboratorio de Webster.', characters: ['ch-parkman'], location: 'lo-laboratorio', key: true },
    { id: 'te-fiesta', t: 420, display: 'Viernes, noche', title: 'Littlefield y su mujer, en una fiesta', description: 'Hasta pasada la medianoche.', characters: ['ch-littlefield'] },
    { id: 'te-horno', t: 2880, display: 'Domingo a jueves', title: 'Webster quema restos en el horno de su laboratorio', description: 'Con la puerta cerrada por dentro.', characters: ['ch-webster'], location: 'lo-laboratorio', key: true },
    { id: 'te-pozo', t: 10080, display: 'Viernes 30, tarde', title: 'Littlefield abre el muro del pozo y aparecen los restos', description: 'Llama a la policía.', characters: ['ch-littlefield'], location: 'lo-pozo', key: true },
  ],

  accusation: {
    motives: [
      { id: 'mo-fraude', label: 'Callar a Parkman, que iba a denunciar el fraude de la colección y a arruinarle', availableWhen: { fact: 'fa-doble-garantia' } },
      { id: 'mo-deuda', label: 'Librarse de una deuda que no podía pagar', availableWhen: { fact: 'fa-deuda' } },
      { id: 'mo-recompensa', label: 'Cobrar la recompensa de la familia', availableWhen: { fact: 'fa-recompensa' } },
      { id: 'mo-robo', label: 'Robarle el dinero que había cobrado' },
    ],
    methods: [
      { id: 'me-golpe', label: 'Le golpeó en el laboratorio y se deshizo del cuerpo entre el horno, el pozo y un baúl', availableWhen: { fact: 'fa-restos-pozo' } },
      { id: 'me-veneno', label: 'Lo envenenó con un producto del laboratorio' },
      { id: 'me-calle', label: 'Lo asaltó en la calle al salir de la facultad' },
      { id: 'me-anatomia', label: 'Escondió el cuerpo entre los cadáveres de la sala de anatomía' },
    ],
  },

  solution: {
    culprits: ['ch-webster'],
    motive: 'mo-fraude',
    method: 'me-golpe',
    proof: ['ev-molde', 'ev-horno', 'ev-pozo', 'ev-shaw'],
    whatHappened:
      'John White Webster mató a George Parkman en su laboratorio de la Facultad de Medicina el viernes 23 de noviembre de 1849. Le debía dinero y había ofrecido como garantía a Robert Gould Shaw la misma colección de minerales que ya respondía de su deuda con Parkman. Lo citó a la una y media; Parkman lo acusó de tramposo y amenazó con arruinarle, y Webster lo golpeó con un trozo de leña. Durante la semana, encerrado, quemó parte del cuerpo en el horno, arrojó otra al pozo de su retrete y escondió el resto en un baúl de té. Escribió cartas anónimas para desviar la búsqueda y contó que había pagado a Parkman. El conserje Littlefield, receloso, abrió el muro del pozo; la dentadura que salió del horno, reconocida por el dentista Keep, identificó a la víctima.',
    reconstruction: [
      'Semanas antes, Parkman descubre que Webster ha ofrecido a Shaw una colección que ya le había hipotecado. Desde entonces lo acosa.',
      'El viernes por la mañana, Webster pasa por casa de Parkman y lo cita en la facultad a la una y media.',
      'Hacia las dos menos cuarto, Parkman baja por North Grove Street. Littlefield lo ve llegar. Nadie lo ve salir.',
      'En el laboratorio, Parkman le llama tramposo y le amenaza. Webster lo golpea con un trozo de leña.',
      'Webster cierra la puerta. Durante días mantiene el horno encendido y el agua corriendo.',
      'Arroja restos al pozo de su retrete, esconde otros en un baúl de té y quema lo demás, dentadura incluida.',
      'Envía a la policía cartas anónimas que sitúan a Parkman lejos de la facultad, y regala un pavo al conserje.',
      'El viernes 30, Littlefield abre el muro del pozo. La dentadura del horno encaja en el molde del doctor Keep.',
    ],
    decisiveEvidence: ['ev-cita', 'ev-shaw', 'ev-pozo', 'ev-baul', 'ev-horno', 'ev-molde', 'ev-caligrafia'],
    alibiTruths: [
      { characterId: 'ch-webster', truth: 'No pagó a Parkman: no tenía ese dinero. Lo mató en su laboratorio y pasó la semana deshaciéndose del cuerpo.' },
      { characterId: 'ch-littlefield', truth: 'Mintió sobre la noche del viernes, que pasó en una fiesta con su mujer, para no hablar de sus tratos con cadáveres. No tuvo que ver con la muerte.' },
    ],
  },

  endings: [
    {
      id: 'en-confesion',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { flag: 'webster-confiesa' } },
      outcome: 'success',
      title: 'Lo que contó la porcelana',
      text: 'Webster es juzgado en marzo de 1850, en un proceso que sigue todo el país. La dentadura hecha por el doctor Keep convence al jurado: es la primera vez que una prueba dental decide un juicio por asesinato en Estados Unidos. Condenado, Webster confiesa por escrito antes de morir en la horca el 30 de agosto. Littlefield cobra la recompensa.',
    },
    {
      id: 'en-exito',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' },
      outcome: 'success',
      title: 'El catedrático y la horca',
      text: 'Sin confesión, la acusación se sostiene en el molde del dentista, en los restos y en las cartas. Webster es condenado. Durante años, Boston no habla de otra cosa.',
    },
    { id: 'en-parcial', when: { culprit: 'correct' }, outcome: 'partial', title: 'El culpable, a medias', text: 'Webster es acusado, pero la defensa siembra dudas sobre el móvil y sobre cómo murió Parkman. El juicio se alarga y el jurado duda más de lo que debería.' },
    { id: 'en-littlefield', when: { culprit: 'ch-littlefield' }, outcome: 'failure', title: 'El conserje', text: 'Littlefield es detenido. Los invitados de la fiesta juran que bailó toda la noche. La defensa del profesor Webster no podría haber soñado nada mejor: el verdadero culpable sigue dando clase.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Desaparecido', text: 'La acusación no se sostiene. En los archivos de la policía de Boston, George Parkman sigue figurando como desaparecido.' },
  ],

  hints: [
    {
      id: 'hl-cita',
      topic: 'La última cita',
      relevantWhen: { not: { contradiction: 'cx-webster-visita' } },
      steps: ['¿Con quién iba a verse Parkman esa tarde?', 'Lee la declaración del criado de los Parkman.', 'Pregunta a Webster si vio a Parkman en la facultad y señala la contradicción con la cita de la una y media.'],
    },
    {
      id: 'hl-pozo',
      topic: 'Donde nadie ha mirado',
      relevantWhen: { not: { flag: 'pozo-abierto' } },
      steps: ['El parte del alguacil dice qué partes de la facultad no se registraron.', 'Quien conoce el sótano es el conserje.', 'Pregunta a Littlefield por el pozo de debajo del laboratorio.'],
    },
    {
      id: 'hl-dientes',
      topic: 'Identificar los restos',
      relevantWhen: { all: [{ evidence: 'ev-horno' }, { not: { fact: 'fa-es-parkman' } }] },
      steps: ['Un cuerpo quemado no se reconoce por la cara.', 'Una dentadura postiza la hace un dentista a medida.', 'Habla con el doctor Keep y relaciona su molde con la dentadura del horno.'],
    },
  ],

  objectives: [
    { id: 'ob-garantia', text: 'Descubre por qué Parkman perseguía a Webster.', completeWhen: { fact: 'fa-doble-garantia' }, points: 30 },
    { id: 'ob-cartas', text: 'Averigua quién escribía las cartas anónimas.', completeWhen: { fact: 'fa-cartas-webster' }, points: 30 },
    { id: 'ob-conserje', text: 'Descubre qué escondía el conserje.', completeWhen: { secret: 'se-littlefield' }, points: 20, hidden: true },
  ],

  assets: [],
};

export default caseFile;
