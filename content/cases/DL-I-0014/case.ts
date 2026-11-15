import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-I-0014 · EL QUE SABÍA DEMASIADO
 * Londres (Lambeth), abril de 1892 · Envenenamiento · Caso real · Unidad Especial
 *
 * Caso real: los envenenamientos con estricnina de Lambeth y el doctor Thomas
 * Neill Cream, que se delató a sí mismo con cartas de chantaje en las que
 * hablaba de una muerte que todo el mundo creía natural. Lo documentado sigue
 * el juicio; las conversaciones del investigador son una recreación.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-I-0014',
  contentVersion: 1,
  mode: 'individual',
  title: 'El que sabía demasiado',
  subtitle: 'Dos jóvenes mueren envenenadas en Lambeth y alguien escribe cartas sobre otra muerte',
  origin: 'real',
  historical: {
    documented: [
      'En la madrugada del 12 de abril de 1892, Alice Marsh y Emma Shrivell murieron entre convulsiones en su habitación del 118 de Stamford Street, en Lambeth. Antes de morir dijeron que un caballero llamado «Fred» les había dado unas píldoras largas y finas.',
      'El agente de policía George Comley había visto a un hombre con chistera y gafas salir de esa casa de madrugada.',
      'Ya en octubre de 1891 habían muerto en Lambeth Ellen Donworth, envenenada con estricnina, y Matilda Clover, cuya muerte se certificó como alcoholismo.',
      'Varias personas recibieron cartas de chantaje firmadas con nombres falsos. Al médico William Broadbent se le acusaba de haber envenenado a Matilda Clover y se le pedían 2.500 libras; al padre del estudiante de medicina Walter Harper se le acusaba de que su hijo había envenenado a Marsh y Shrivell.',
      'Nadie sabía que Matilda Clover hubiera sido envenenada. Exhumada, se halló estricnina en su cuerpo: solo el asesino podía saberlo.',
      'Un médico canadiense, Thomas Neill Cream, enseñó a un conocido, John Haynes, las casas de las víctimas, incluida la de Clover, y le habló de otra víctima, Louisa Harvey. Ella estaba viva: había fingido tragarse las píldoras que él le dio y las tiró al Támesis.',
      'Cream había sido condenado en Chicago en 1881 por envenenar con estricnina a un hombre. Fue condenado por el asesinato de Matilda Clover y ahorcado en Newgate el 15 de noviembre de 1892.',
    ],
    hypotheses: ['La leyenda de que dijo «Soy Jack el…» en el cadalso no tiene fundamento.'],
    dramatized: [
      'Las conversaciones del investigador y la redacción exacta de algunas cartas y partes son una recreación.',
      'Los retratos son recreaciones artísticas.',
    ],
    documentedResolution:
      'Thomas Neill Cream fue condenado por el asesinato de Matilda Clover con estricnina, y señalado por las muertes de Donworth, Marsh y Shrivell. Fue ahorcado el 15 de noviembre de 1892.',
    sources: ['W. Teignmouth Shore (ed.), Trial of Thomas Neill Cream, Notable British Trials (1923)', 'Dean Jobb, The Case of the Murderous Dr. Cream (2021)'],
  },
  era: 'c19',
  eraLabel: 'Londres, 1892',
  year: 1892,
  location: { city: 'Londres', place: '118 Stamford Street, Lambeth', country: 'Inglaterra' },
  category: 'homicide',
  difficulty: 'special-unit',
  keywords: ['Cream', 'Lambeth', 'estricnina', 'chantaje', 'cartas', 'Matilda Clover', 'caso real'],
  ambience: { music: 'london-1987-rain', mood: 'urban' },
  maxHints: 4,

  briefing: {
    incidentDisplay: 'Martes, 12 de abril de 1892 · 2:00',
    summary:
      'Dos jóvenes, Alice Marsh y Emma Shrivell, han muerto entre convulsiones en su cuarto de Stamford Street. Antes de morir dijeron que un caballero que se hacía llamar «Fred» les había dado unas píldoras alargadas y una lata de salmón. Es la tercera muerte por estricnina en Lambeth en seis meses.',
    context:
      'A Scotland Yard empiezan a llegar cartas extrañas: alguien ofrece revelar al culpable a cambio de dinero, y acusa a médicos respetables de muertes que nadie relacionaba. Le encargan leer esas cartas con lupa.',
    background:
      'Lambeth, al sur del Támesis: pensiones baratas, teatros de variedades, mujeres que viven en la calle. Pocas muertes de allí llegan a los periódicos.',
    victim: 'ch-marsh',
    initialFacts: [],
    initialEvidence: ['ev-parte', 'ev-carta-harper', 'ev-carta-broadbent'],
    initialTimeline: ['te-donworth', 'te-muerte'],
  },

  characters: [
    {
      id: 'ch-marsh',
      name: 'Alice Marsh',
      look: { hair: 'bun' },
      role: 'victim',
      age: 21,
      occupation: 'Sin oficio fijo',
      appearance:
        'a young 21-year-old Victorian London woman in 1892, pretty pale face, dark hair pinned up under a small hat with a feather, cheap ruffled blouse, tired eyes',
      summary: 'Compartía cuarto con su amiga Emma.',
      biography: 'Llegó a Londres desde Brighton. Vivía con Emma Shrivell en una pensión de Stamford Street.',
      personality: ['Alegre', 'Confiada'],
    },
    {
      id: 'ch-cream',
      name: '«Dr. Neill» (Thomas Neill Cream)',
      look: { hair: 'bald', glasses: true, beard: true },
      role: 'suspect',
      age: 41,
      occupation: 'Médico canadiense',
      appearance:
        'a 41-year-old Victorian doctor in London in 1892, balding head, heavy dark moustache, gold-rimmed spectacles over slightly crossed eyes, silk top hat, dark overcoat, cold smiling expression',
      summary: 'Muy aficionado a hablar de los crímenes de Lambeth.',
      biography: 'Médico formado en McGill. Llegó a Londres en octubre de 1891 y se aloja en Lambeth Palace Road. Habla mucho, toma morfina y se interesa por la policía.',
      personality: ['Charlatán', 'Vanidoso', 'Frío'],
      relationToVictim: 'Ninguna conocida',
      motive: { text: 'Mataba por placer y luego chantajeaba a inocentes con sus muertes.', visibleWhen: { fact: 'fa-solo-asesino' } },
      alibi: { claim: 'Es un médico respetable. Solo se interesa por los crímenes como cualquier ciudadano.' },
    },
    {
      id: 'ch-harper',
      name: 'Walter Harper',
      look: { hair: 'short' },
      role: 'suspect',
      age: 24,
      occupation: 'Estudiante de medicina',
      appearance:
        'a decent 24-year-old Victorian medical student in 1892, open boyish face, neat fair hair, tweed suit, worried honest eyes',
      summary: 'Las cartas le acusan a él.',
      biography: 'Estudiante en el Hospital St Thomas, hijo de un médico de Barnstaple. Se aloja en Lambeth Palace Road, en la misma casa que el doctor Neill.',
      personality: ['Formal', 'Ingenuo'],
      relationToVictim: 'Ninguna',
      motive: { text: 'Según la carta anónima, tenía relación con las víctimas.', visibleWhen: { evidence: 'ev-carta-harper' } },
      alibi: { claim: 'Estaba en Barnstaple, en casa de sus padres, la noche del 11 al 12 de abril.' },
    },
    {
      id: 'ch-haynes',
      name: 'John Haynes',
      look: { hair: 'hat', beard: true },
      role: 'witness',
      age: 45,
      occupation: 'Antiguo agente del servicio secreto americano',
      appearance:
        'a sharp 45-year-old American former detective in London in 1892, lean weathered face, grey moustache, bowler hat, tweed overcoat, alert skeptical eyes',
      summary: 'Le dieron una visita guiada que no pidió.',
      biography: 'Ingeniero y antiguo agente, vive en la misma zona. Se hizo amigo del doctor Neill, que le habla de los crímenes con demasiada pasión.',
      personality: ['Observador', 'Desconfiado'],
    },
    {
      id: 'ch-harvey',
      name: 'Louisa Harvey',
      look: { hair: 'hat' },
      role: 'witness',
      age: 22,
      occupation: 'Sin oficio fijo',
      appearance:
        'a bold 22-year-old Victorian London woman in 1892, lively sharp face, curled fringe under a feathered hat, cheap fur tippet, knowing street-smart eyes',
      summary: 'Según el doctor Neill, está muerta.',
      biography: 'Conoció a un caballero con gafas en octubre de 1891, que le dio unas píldoras «para el cutis».',
      personality: ['Desconfiada', 'Lista'],
      appearsWhen: { asked: 'q-haynes-paseo' },
    },
    {
      id: 'ch-comley',
      name: 'George Comley',
      look: { hair: 'hat' },
      role: 'witness',
      age: 30,
      occupation: 'Agente de policía de Lambeth',
      appearance:
        'a solid 30-year-old Metropolitan Police constable in 1892, honest broad face, short moustache, custodian helmet, dark uniform with buttoned tunic',
      summary: 'Vio a un hombre salir de la casa de madrugada.',
      biography: 'Hace la ronda de Stamford Street. Se fija en las caras.',
      personality: ['Atento', 'Concienzudo'],
    },
  ],

  locations: [
    { id: 'lo-stamford', name: '118 Stamford Street', description: 'Pensión de Lambeth donde vivían Alice y Emma.' },
    { id: 'lo-lambeth-road', name: 'Lambeth Palace Road', description: 'Donde se alojan el doctor Neill y Walter Harper.' },
    { id: 'lo-lambeth-clover', name: '27 Lambeth Road', description: 'Donde murió Matilda Clover en octubre.', appearsWhen: { evidence: 'ev-carta-broadbent' } },
  ],

  relationships: [
    { id: 're-vecinos', a: 'ch-cream', b: 'ch-harper', label: 'Vecinos de pensión' },
    { id: 're-amigos', a: 'ch-cream', b: 'ch-haynes', label: 'Conocidos' },
    { id: 're-harvey', a: 'ch-cream', b: 'ch-harvey', label: 'Le dio unas píldoras', visibleWhen: { asked: 'q-harvey' } },
  ],

  facts: [
    { id: 'fa-fred', text: 'Antes de morir, Alice y Emma dijeron que un tal «Fred», con gafas y chistera, les dio píldoras largas y finas.', important: true },
    { id: 'fa-comley', text: 'El agente Comley vio salir de la casa, de madrugada, a un hombre con chistera y gafas, bizco.', important: true },
    { id: 'fa-clover-natural', text: 'La muerte de Matilda Clover, en octubre, se certificó como alcoholismo: nadie la creía envenenada.', important: true },
    { id: 'fa-clover-estricnina', text: 'Exhumada, Matilda Clover tiene estricnina en el cuerpo.', important: true },
    { id: 'fa-solo-asesino', text: 'El autor de las cartas sabía que Clover había sido envenenada cuando nadie más lo sabía: solo el asesino podía saberlo.', important: true },
    { id: 'fa-harper-fuera', text: 'Walter Harper estaba en Barnstaple la noche del crimen.' },
    { id: 'fa-neill-casas', text: 'El doctor Neill enseñó a Haynes las casas de Marsh, Shrivell, Donworth y Clover, y habló de una quinta víctima, Lou Harvey.', important: true },
    { id: 'fa-harvey-viva', text: 'Lou Harvey está viva: fingió tragar las píldoras del caballero de las gafas y las tiró al río.', important: true },
    { id: 'fa-chicago', text: 'El doctor Neill es Thomas Neill Cream, condenado en Chicago en 1881 por envenenar con estricnina.', important: true },
    { id: 'fa-letra', text: 'Las cartas de chantaje y una receta firmada por el doctor Neill tienen la misma letra.', important: true },
  ],

  evidence: [
    {
      id: 'ev-parte',
      kind: 'report',
      title: 'Parte de la muerte de Marsh y Shrivell',
      dated: '12 de abril de 1892',
      source: 'Policía Metropolitana, división L',
      summary: 'Lo que dijeron antes de morir.',
      related: { characters: ['ch-marsh', 'ch-comley'], locations: ['lo-stamford'], events: ['te-muerte'] },
      body: [
        { type: 'typed', text: 'A las 2:00 la patrona oye gritos. Las dos jóvenes se retuercen en el suelo, con el cuerpo arqueado. Mueren camino del hospital de St Thomas.' },
        {
          type: 'typed',
          text: '{{dt-parte-fred|Emma Shrivell declara antes de morir que un caballero llamado «Fred», con gafas y chistera, les dio tres píldoras largas y finas a cada una, y una lata de salmón, y se fue hacia las dos menos cuarto.}}',
        },
        { type: 'typed', text: '{{dt-parte-comley|El agente Comley, de ronda, vio salir de la casa a esa hora a un hombre con chistera y gafas, bizco, con bigote.}}' },
      ],
      details: [
        { id: 'dt-parte-fred', label: '«Fred», con gafas', description: 'Las víctimas describieron al hombre de las píldoras.', effects: [{ grantFact: 'fa-fred' }], points: 15 },
        { id: 'dt-parte-comley', label: 'Visto por un agente', description: 'Un policía le vio la cara.', effects: [{ grantFact: 'fa-comley' }], points: 15 },
      ],
      decisive: true,
    },
    {
      id: 'ev-carta-harper',
      kind: 'letter',
      title: 'Carta de chantaje al Dr. Harper, de Barnstaple',
      dated: 'Abril de 1892',
      source: 'Entregada a la policía por el destinatario',
      summary: 'Acusan a un estudiante.',
      related: { characters: ['ch-harper'], locations: [], events: [] },
      body: [
        { type: 'paragraph', text: 'Señor:' },
        {
          type: 'paragraph',
          text: '{{dt-harper-texto|Tengo pruebas de que su hijo, Walter Harper, envenenó con estricnina a Alice Marsh y Emma Shrivell. Si me paga 1.500 libras, las pruebas desaparecerán.}}',
        },
        { type: 'signature', name: 'W. H. Murray' },
      ],
      details: [{ id: 'dt-harper-texto', label: 'Acusan a Harper', description: 'Alguien sabe que Harper vive en Lambeth y estudia medicina.', effects: [], points: 10 }],
    },
    {
      id: 'ev-carta-broadbent',
      kind: 'letter',
      title: 'Carta de chantaje al Dr. William Broadbent',
      dated: 'Noviembre de 1891',
      source: 'Entregada a la policía por el destinatario',
      summary: 'Una muerte que nadie había notado.',
      related: { characters: ['ch-cream'], locations: ['lo-lambeth-clover'], events: ['te-clover'] },
      body: [
        { type: 'paragraph', text: 'Señor:' },
        {
          type: 'paragraph',
          text: '{{dt-broad-clover|Matilda Clover, de 27 Lambeth Road, murió el 20 de octubre envenenada con estricnina. Tengo pruebas de que usted le dio el veneno.}} Si no quiere que las lleve a la policía, pague 2.500 libras.',
        },
        { type: 'signature', name: 'M. Malone' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-clover' }],
      details: [{ id: 'dt-broad-clover', label: 'Clover, envenenada', description: 'El autor dice que Clover murió de estricnina en noviembre de 1891.', effects: [], points: 20 }],
      decisive: true,
    },
    {
      id: 'ev-certificado-clover',
      kind: 'document',
      title: 'Certificado de defunción de Matilda Clover',
      dated: '21 de octubre de 1891',
      source: 'Registro de Lambeth',
      summary: 'Una muerte sin sospechas.',
      autoDiscoverWhen: { detail: 'dt-broad-clover' },
      related: { characters: [], locations: ['lo-lambeth-clover'], events: ['te-clover'] },
      body: [
        {
          type: 'typed',
          text: 'Matilda Clover, 27 años. {{dt-cert-natural|Causa: delirium tremens e insuficiencia cardiaca por alcoholismo.}} Sin autopsia ni encuesta del forense.',
        },
        { type: 'typed', text: 'Ningún periódico publicó su muerte.' },
      ],
      details: [{ id: 'dt-cert-natural', label: 'Muerte natural', description: 'Oficialmente, Clover murió de alcoholismo. Nadie hablaba de veneno.', effects: [{ grantFact: 'fa-clover-natural' }], points: 15 }],
    },
    {
      id: 'ev-exhumacion',
      kind: 'report',
      title: 'Análisis tras la exhumación de Matilda Clover',
      dated: 'Mayo de 1892',
      source: 'Dr. Thomas Stevenson, analista del Ministerio del Interior',
      summary: 'Lo que había en el cuerpo.',
      autoDiscoverWhen: { fact: 'fa-clover-natural' },
      related: { characters: [], locations: ['lo-lambeth-clover'], events: ['te-exhumacion'] },
      body: [{ type: 'typed', text: '{{dt-exh-estricnina|Estricnina en el estómago, el hígado y el pecho, en cantidad suficiente para matar.}}' }],
      onExamine: [{ unlockTimelineEvent: 'te-exhumacion' }],
      details: [{ id: 'dt-exh-estricnina', label: 'Estricnina', description: 'Clover fue envenenada, como decía la carta.', effects: [{ grantFact: 'fa-clover-estricnina' }], points: 20 }],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-chicago',
      kind: 'record',
      title: 'Expediente de la penitenciaría de Joliet, Illinois',
      source: 'Policía de Chicago, por cable',
      summary: 'Un médico con pasado.',
      autoDiscoverWhen: { asked: 'q-haynes-pasado' },
      related: { characters: ['ch-cream'], locations: [], events: ['te-chicago'] },
      body: [
        {
          type: 'typed',
          text: '{{dt-chic-cream|Thomas Neill Cream, médico, condenado en 1881 a cadena perpetua por envenenar con estricnina a Daniel Stott, a cuya esposa cortejaba. Conmutada; liberado en julio de 1891.}}',
        },
        { type: 'typed', text: 'Ya entonces escribió cartas acusando al farmacéutico del crimen.' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-chicago' }],
      details: [{ id: 'dt-chic-cream', label: 'Estricnina y cartas, en 1881', description: 'El doctor Neill ya mató así, y ya culpó a otro por carta.', effects: [{ grantFact: 'fa-chicago' }], points: 20 }],
      decisive: true,
    },
    {
      id: 'ev-receta',
      kind: 'document',
      title: 'Receta firmada por el doctor Neill',
      source: 'Farmacia de Parliament Street',
      summary: 'La letra del doctor.',
      autoDiscoverWhen: { asked: 'q-cream-farmacia' },
      related: { characters: ['ch-cream'], locations: [], events: [] },
      body: [
        { type: 'handwritten', text: 'Nux vomica, 1 onza. Cápsulas de gelatina vacías, 100.', author: 'T. Neill, M.D.' },
        { type: 'paragraph', text: '{{dt-rec-letra|La «M» y la «W» tienen el mismo trazo cerrado que las cartas firmadas «M. Malone» y «W. H. Murray». El papel es el mismo, de la misma papelería americana.}}' },
      ],
      details: [{ id: 'dt-rec-letra', label: 'La misma mano', description: 'El doctor Neill escribió las cartas de chantaje.', effects: [{ grantFact: 'fa-letra' }], points: 20 }],
      decisive: true,
      points: 10,
    },
  ],

  deductions: [
    {
      id: 'de-solo-asesino',
      title: 'Lo que solo sabía el asesino',
      combine: ['dt-broad-clover', 'dt-cert-natural'],
      explanation: 'En noviembre de 1891 la muerte de Clover era oficialmente alcoholismo y nadie hablaba de ella. Quien escribió que la habían envenenado con estricnina solo podía saberlo porque la envenenó él.',
      effects: [{ grantFact: 'fa-solo-asesino' }],
      points: 40,
    },
    {
      id: 'de-pildoras',
      title: 'Las cápsulas de gelatina',
      combine: ['dt-parte-fred', 'dt-rec-letra'],
      explanation: 'Las víctimas hablan de píldoras largas y finas; el doctor Neill compra cápsulas de gelatina vacías y nuez vómica, de la que se saca la estricnina, y escribe las cartas.',
      points: 30,
    },
    {
      id: 'de-harvey',
      title: 'La víctima que sigue viva',
      combine: ['fa-neill-casas', 'fa-harvey-viva'],
      explanation: 'El doctor Neill contó a Haynes que Lou Harvey era otra víctima; ella está viva, pero recuerda al caballero de gafas que le dio las píldoras. Neill la daba por muerta porque él le dio el veneno.',
      points: 30,
    },
  ],

  contradictions: [
    {
      id: 'cx-cream-clover',
      title: 'Cómo sabía lo de Clover',
      a: { line: 'ln-cream-periodicos' },
      b: { detail: 'dt-cert-natural' },
      explanation: 'El doctor Neill dice que sabe de las víctimas por los periódicos; ningún periódico publicó la muerte de Matilda Clover.',
      points: 30,
    },
    {
      id: 'cx-cream-harvey',
      title: 'No conocía a Lou Harvey',
      a: { line: 'ln-cream-harvey' },
      b: { line: 'ln-harvey-gafas' },
      explanation: 'El doctor dice que no conoce a Lou Harvey; ella le reconoce como el caballero que le dio las píldoras en octubre.',
      points: 30,
    },
  ],

  secrets: [
    { id: 'se-harper', characterId: 'ch-harper', text: 'Walter Harper ni siquiera conocía a las víctimas. El doctor Neill vivía en su misma casa y le escogió como chivo expiatorio porque su padre era un médico con dinero.', revealedWhen: { fact: 'fa-harper-fuera' }, points: 15 },
    { id: 'se-harvey', characterId: 'ch-harvey', text: 'Lou Harvey desconfió del caballero: fingió tragarse las píldoras y las tiró al Támesis desde el puente de Charing Cross en cuanto él se dio la vuelta.', revealedWhen: { fact: 'fa-harvey-viva' }, points: 20 },
  ],

  interrogations: [
    {
      id: 'in-cream',
      characterId: 'ch-cream',
      setting: 'En su habitación de Lambeth Palace Road, entre frascos y periódicos recortados. Le invita a sentarse y se ajusta las gafas.',
      opening: [{ text: 'Un caso apasionante, ¿verdad? Llevo semanas siguiéndolo. Tengo teorías, si le interesan.' }],
      topics: [
        {
          id: 'tp-cream-crimenes',
          label: 'Los crímenes',
          kind: 'events',
          questions: [
            {
              id: 'q-cream-victimas',
              prompt: '¿Cómo sabe usted tanto de las víctimas?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-cream-periodicos', text: 'Por los periódicos, como todo el mundo. Leo cada línea: Donworth, Clover, Marsh, Shrivell. Es mi afición.', tone: 'lie' }] }],
            },
            {
              id: 'q-cream-harvey',
              prompt: '¿Conoce a una tal Lou Harvey?',
              kind: 'ask',
              requires: { fact: 'fa-neill-casas' },
              responses: [{ lines: [{ id: 'ln-cream-harvey', text: 'De oídas. Otra pobre víctima del envenenador, creo. No la he visto en mi vida.', tone: 'lie' }] }],
            },
            {
              id: 'q-cream-farmacia',
              prompt: '¿Compra usted remedios en Londres?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Para mis pacientes, naturalmente. Soy representante de un preparado americano. Pregunte en la farmacia de Parliament Street, me conocen bien.', tone: 'evasion' }] }],
            },
          ],
        },
        {
          id: 'tp-cream-final',
          label: 'Las cartas',
          kind: 'document',
          questions: [
            {
              id: 'q-cream-cartas',
              prompt: 'Las cartas de chantaje son de su letra, y hablan de una muerte que nadie más sabía que fue un asesinato.',
              kind: 'confront',
              requires: { all: [{ fact: 'fa-letra' }, { fact: 'fa-solo-asesino' }] },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'El doctor Neill sonríe; por un momento parece complacido de que alguien lo haya entendido.' },
                    { text: 'Tienen ustedes al hombre equivocado. Pero admitirán que el autor de esas cartas es más listo que toda la policía de Londres.', tone: 'evasion' },
                  ],
                  effects: [{ setFlag: 'cream-presume' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-harper',
      characterId: 'ch-harper',
      setting: 'En la sala de estudio del Hospital St Thomas, pálido, con la carta de su padre en la mano.',
      opening: [{ text: 'Mi padre ha recibido esto. Yo no conozco a esas chicas. ¡Por Dios!' }],
      topics: [
        {
          id: 'tp-harper',
          label: 'Aquella noche',
          kind: 'alibi',
          questions: [
            {
              id: 'q-harper-noche',
              prompt: '¿Dónde estaba usted la noche del 11 al 12 de abril?',
              kind: 'ask',
              responses: [
                {
                  lines: [{ text: 'En Barnstaple, en casa de mis padres, por Pascua. Fui el 9 y volví el 18. Tiene el billete y a toda la familia.', tone: 'truth' }],
                  effects: [{ grantFact: 'fa-harper-fuera' }],
                },
              ],
            },
            {
              id: 'q-harper-vecino',
              prompt: '¿Quién sabe que su padre es médico y tiene dinero?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'En mi pensión, todos. Sobre todo un médico canadiense, el doctor Neill, que me pregunta mucho por mi familia.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-haynes',
      characterId: 'ch-haynes',
      setting: 'En un pub de Westminster Bridge Road, con una pinta que no ha tocado.',
      opening: [{ text: 'Ese doctor Neill me da escalofríos. Y yo he tratado con falsificadores y asesinos.' }],
      topics: [
        {
          id: 'tp-haynes',
          label: 'El doctor Neill',
          kind: 'person',
          about: 'ch-cream',
          questions: [
            {
              id: 'q-haynes-paseo',
              prompt: '¿Qué le ha contado el doctor de los crímenes?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Me llevó de paseo por Lambeth y me fue señalando las casas: aquí Marsh y Shrivell, aquí Donworth, aquí Matilda Clover. Y me dijo que había otra, Lou Harvey, muerta en un hotel.', tone: 'truth' },
                    { text: 'Clover. Nadie había dicho nunca que a Clover la hubieran matado.', tone: 'truth' },
                  ],
                  effects: [{ grantFact: 'fa-neill-casas' }, { unlockTimelineEvent: 'te-paseo' }],
                },
              ],
            },
            {
              id: 'q-haynes-pasado',
              prompt: '¿Sabe algo de su pasado?',
              kind: 'press',
              requires: { asked: 'q-haynes-paseo' },
              responses: [{ lines: [{ text: 'Dice que estudió en Montreal y que vivió en Chicago. Yo de usted pediría a la policía de Chicago su nombre completo: Thomas Neill Cream.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-harvey',
      characterId: 'ch-harvey',
      setting: 'En un café de Brixton, muy entera, con un cigarrillo.',
      opening: [{ text: '¿Que estoy muerta? Pues para estar muerta tengo bastante hambre.' }],
      topics: [
        {
          id: 'tp-harvey',
          label: 'El caballero',
          kind: 'events',
          questions: [
            {
              id: 'q-harvey',
              prompt: '¿Le dio alguien unas píldoras en octubre?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { id: 'ln-harvey-gafas', text: 'Un caballero con gafas de oro y bizco, que decía ser médico. Me dio dos píldoras largas «para el cutis» en el puente de Charing Cross y quiso verme tragarlas.', tone: 'truth' },
                    { text: 'Hice como que me las tragaba y las tiré al río cuando se volvió. Si me lo pone delante, le reconozco.', tone: 'truth' },
                  ],
                  effects: [{ grantFact: 'fa-harvey-viva' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-comley',
      characterId: 'ch-comley',
      setting: 'En la esquina de Stamford Street, de ronda.',
      opening: [{ text: 'Le vi salir. Lo he dicho mil veces y lo diré otras mil.' }],
      topics: [
        {
          id: 'tp-comley',
          label: 'El hombre',
          kind: 'events',
          questions: [
            {
              id: 'q-comley',
              prompt: '¿Le reconocería?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Sí. Desde entonces le he vuelto a ver por el barrio: un caballero de gafas y chistera que se aloja en Lambeth Palace Road. Bizco. Le he seguido un par de veces.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto a la muerte (2:00 del 12 de abril de 1892)
  timeline: [
    { id: 'te-chicago', t: -5781600, display: '1881', title: 'Cream, condenado en Chicago por envenenar con estricnina', description: 'Liberado en julio de 1891.', characters: ['ch-cream'], key: true },
    { id: 'te-donworth', t: -260640, display: '13 de octubre de 1891', title: 'Muere Ellen Donworth en Lambeth, envenenada con estricnina', description: 'Habló de un caballero de chistera.', characters: [], key: true },
    { id: 'te-clover', t: -251280, display: '20 de octubre de 1891', title: 'Muere Matilda Clover; certificado de alcoholismo', description: 'Nadie habla de veneno… salvo una carta.', characters: [], location: 'lo-lambeth-clover', key: true },
    { id: 'te-falso-harper', t: -15, display: '11 de abril, noche', title: 'Walter Harper da las píldoras a Alice y Emma', description: 'Según la carta anónima.', characters: ['ch-harper'], veracity: 'false', claimedBy: 'ch-cream' },
    { id: 'te-muerte', t: 0, display: '12 de abril de 1892, 2:00', title: 'Mueren Alice Marsh y Emma Shrivell', description: 'Tras las píldoras de «Fred».', characters: ['ch-marsh'], location: 'lo-stamford', key: true },
    { id: 'te-paseo', t: 20160, display: 'Mayo de 1892', title: 'Neill enseña a Haynes las casas de las víctimas', description: 'Incluida la de Clover.', characters: ['ch-cream', 'ch-haynes'], key: true },
    { id: 'te-exhumacion', t: 30240, display: 'Mayo de 1892', title: 'Exhumación de Matilda Clover: estricnina', description: 'El analista confirma lo que decía la carta.', characters: [], key: true },
  ],

  accusation: {
    suspects: ['ch-cream', 'ch-harper'],
    motives: [
      { id: 'mo-placer-chantaje', label: 'Matar por placer y luego intentar sacar dinero acusando a otros de sus crímenes', availableWhen: { fact: 'fa-solo-asesino' } },
      { id: 'mo-robo', label: 'Robar a las víctimas' },
      { id: 'mo-celos', label: 'Celos de un cliente despechado' },
      { id: 'mo-ciencia', label: 'Probar un remedio nuevo' },
    ],
    methods: [
      { id: 'me-capsulas', label: 'Estricnina en cápsulas de gelatina, presentadas como un remedio, que las víctimas tragaban delante de él', availableWhen: { all: [{ fact: 'fa-fred' }, { fact: 'fa-clover-estricnina' }] } },
      { id: 'me-salmon', label: 'Veneno en la lata de salmón' },
      { id: 'me-bebida', label: 'Veneno en la bebida, en una taberna' },
      { id: 'me-alcohol', label: 'No hubo veneno: alcohol adulterado' },
    ],
  },

  solution: {
    culprits: ['ch-cream'],
    motive: 'mo-placer-chantaje',
    method: 'me-capsulas',
    proof: ['ev-exhumacion', 'ev-receta', 'ev-carta-broadbent'],
    whatHappened:
      'Thomas Neill Cream, médico canadiense que se hacía llamar doctor Neill, envenenó con estricnina a mujeres pobres de Lambeth dándoles cápsulas de gelatina como si fueran un remedio. Así mató a Ellen Donworth y a Matilda Clover en octubre de 1891, y a Alice Marsh y Emma Shrivell en abril de 1892. Después escribió cartas de chantaje con nombres falsos acusando a personas respetables, como el doctor Broadbent o el estudiante Walter Harper, su vecino. En la carta a Broadbent habló del envenenamiento de Clover cuando nadie sabía que la habían envenenado: solo el asesino podía saberlo. La exhumación lo confirmó. Ya en Chicago había matado así y culpado a otro por carta.',
    reconstruction: [
      '1881: en Chicago, Cream envenena con estricnina y acusa por carta a un farmacéutico.',
      'Octubre de 1891: llega a Londres y compra nuez vómica y cápsulas vacías.',
      'Mata a Ellen Donworth y a Matilda Clover; Lou Harvey se salva tirando las píldoras al río.',
      'Noviembre: escribe a Broadbent que Clover fue envenenada.',
      '11 de abril de 1892: como «Fred», da cápsulas a Alice y Emma. El agente Comley le ve salir.',
      'Escribe al padre de Walter Harper acusándole.',
      'Mayo: enseña a Haynes las casas de las víctimas. La exhumación de Clover halla estricnina.',
    ],
    decisiveEvidence: ['ev-parte', 'ev-carta-broadbent', 'ev-certificado-clover', 'ev-exhumacion', 'ev-receta', 'ev-chicago'],
    alibiTruths: [
      { characterId: 'ch-cream', truth: 'No sabía de las víctimas por los periódicos: la muerte de Clover nunca salió en ninguno.' },
      { characterId: 'ch-harper', truth: 'Estaba de verdad en Barnstaple; Neill le eligió para chantajear a su padre.' },
    ],
  },

  endings: [
    {
      id: 'en-newgate',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { fact: 'fa-harvey-viva' } },
      outcome: 'success',
      title: 'La muerta que declaró',
      text: 'En el juicio de octubre de 1892, Lou Harvey entra en la sala y el doctor Neill palidece: la daba por muerta. Es condenado por el asesinato de Matilda Clover y ahorcado en Newgate el 15 de noviembre. Hasta el final insistió en que la policía había detenido al hombre equivocado; hasta el final, siguió hablando de más.',
    },
    {
      id: 'en-exito',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' },
      outcome: 'success',
      title: 'Las cartas',
      text: 'El asesino de Lambeth se delató a sí mismo, y la acusación lo demuestra. Cream es condenado.',
    },
    { id: 'en-parcial', when: { culprit: 'correct' }, outcome: 'partial', title: 'Un sospechoso charlatán', text: 'Acusáis al doctor Neill, pero sin probar cómo ni por qué. Su abogado le presenta como un aficionado a los crímenes con demasiada imaginación.' },
    { id: 'en-harper', when: { culprit: 'ch-harper' }, outcome: 'failure', title: 'El estudiante', text: 'Walter Harper, que estaba en Barnstaple, es acusado por una carta anónima. El autor de la carta escribe otra, encantado.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Alcohol adulterado', text: 'Las muertes se atribuyen a la ginebra barata de Lambeth. Un caballero de gafas sigue paseando por Stamford Street.' },
  ],

  hints: [
    {
      id: 'hl-clover',
      topic: 'Una muerte de más',
      relevantWhen: { not: { fact: 'fa-solo-asesino' } },
      steps: ['Lee la carta a Broadbent: ¿de quién habla?', '¿Qué decía oficialmente el certificado de esa mujer?', '¿Quién podía saber entonces que la habían envenenado?'],
    },
    {
      id: 'hl-neill',
      topic: 'El vecino de Harper',
      relevantWhen: { not: { fact: 'fa-neill-casas' } },
      steps: ['¿Quién conoce la familia de Walter Harper?', 'Pregunta a Harper por sus vecinos.', 'Habla con John Haynes sobre el doctor Neill.'],
    },
  ],

  objectives: [
    { id: 'ob-clover', text: 'Demuestra que Matilda Clover fue asesinada.', completeWhen: { fact: 'fa-clover-estricnina' }, points: 25 },
    { id: 'ob-letra', text: 'Averigua quién escribe las cartas.', completeWhen: { fact: 'fa-letra' }, points: 25 },
    { id: 'ob-harvey', text: 'Encuentra a la «quinta víctima».', completeWhen: { fact: 'fa-harvey-viva' }, points: 20, hidden: true },
  ],

  assets: [],
};

export default caseFile;
