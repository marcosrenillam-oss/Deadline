import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-I-0012 · EL BESO DEL DOCTOR
 * Glasgow, marzo de 1865 · Envenenamiento · Caso real · Inspector
 *
 * Caso real: las muertes de Jane Taylor y de su hija Mary Jane, suegra y
 * esposa del médico Edward William Pritchard, envenenadas con antimonio en
 * su casa de Sauchiehall Street. Lo documentado sigue el juicio; la redacción
 * de documentos menores y las conversaciones son una recreación.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-I-0012',
  contentVersion: 1,
  mode: 'individual',
  title: 'El beso del doctor',
  subtitle: 'Un médico de Glasgow pierde a su suegra y a su esposa en tres semanas',
  origin: 'real',
  historical: {
    documented: [
      'El doctor Edward William Pritchard, médico inglés establecido en Glasgow, vanidoso y aficionado a contar aventuras falsas, vivía en Sauchiehall Street con su esposa, Mary Jane Taylor, sus hijos y el servicio.',
      'Desde finales de 1864 su esposa sufría vómitos y debilidad. Su madre, Jane Taylor, vino a cuidarla y murió el 25 de febrero de 1865 tras beber de un frasco de calmante; Pritchard certificó una apoplejía.',
      'La esposa murió el 18 de marzo de 1865. Pritchard certificó una fiebre gástrica.',
      'El doctor James Paterson, llamado a ver a la suegra, sospechó un envenenamiento y se negó a firmar el certificado de defunción; escribió al registro que la muerte le parecía «súbita, inesperada y misteriosa».',
      'Una carta anónima al fiscal provocó la investigación. Las autopsias hallaron antimonio en los dos cuerpos.',
      'Pritchard había comprado grandes cantidades de tártaro emético (antimonio) y de tintura de acónito. Mantenía relaciones con una criada adolescente, Mary McLeod, a la que había prometido casarse con ella si su esposa moría.',
      'En el funeral de su esposa, Pritchard hizo abrir el ataúd y la besó en los labios ante todos.',
      'Pritchard fue condenado y ahorcado en Glasgow el 28 de julio de 1865, en la última ejecución pública de la ciudad.',
    ],
    hypotheses: ['Se sospechó también de Pritchard por la muerte de una criada en un incendio de su casa en 1863; nunca fue acusado de ello.'],
    dramatized: [
      'Las conversaciones del investigador y la redacción concreta de recibos, notas y declaraciones son una recreación.',
      'Los retratos son recreaciones artísticas.',
    ],
    documentedResolution:
      'Edward William Pritchard fue condenado por envenenar con antimonio a su suegra y a su esposa, confesó antes de morir y fue ahorcado en Glasgow el 28 de julio de 1865.',
    sources: ['William Roughead (ed.), Trial of Dr. Pritchard, Notable British Trials (1906)', 'The Glasgow Herald, crónicas del juicio (julio de 1865)'],
  },
  era: 'c19',
  eraLabel: 'Glasgow, 1865',
  year: 1865,
  location: { city: 'Glasgow', place: '131 Sauchiehall Street', country: 'Escocia' },
  category: 'homicide',
  difficulty: 'inspector',
  keywords: ['Pritchard', 'Glasgow', 'antimonio', 'tártaro emético', 'médico', 'Paterson', 'caso real'],
  ambience: { music: 'victorian-night', mood: 'cold' },
  maxHints: 4,

  briefing: {
    incidentDisplay: 'Sábado, 18 de marzo de 1865 · madrugada',
    summary:
      'La esposa del doctor Pritchard ha muerto tras meses de vómitos, tres semanas después que su madre. Él ha firmado los dos certificados: apoplejía y fiebre gástrica. En el funeral, en Edimburgo, mandó abrir el ataúd para besarla delante de todos.',
    context:
      'Al fiscal de Glasgow le ha llegado una carta sin firma: «Las muertes de casa del Dr. Pritchard no son naturales». Le encarga averiguarlo antes de que el doctor vuelva de enterrar a su mujer.',
    background:
      'Pritchard es conocido en Glasgow: da conferencias sobre sus viajes, reparte fotografías suyas firmadas y presume de amistades ilustres que nadie ha visto. Muchos colegas no le soportan.',
    victim: 'ch-mary-jane',
    initialFacts: [],
    initialEvidence: ['ev-anonima', 'ev-certificados', 'ev-paterson'],
    initialTimeline: ['te-suegra', 'te-muerte'],
  },

  characters: [
    {
      id: 'ch-mary-jane',
      name: 'Mary Jane Pritchard',
      look: { hair: 'bun' },
      role: 'victim',
      age: 38,
      occupation: 'Esposa del doctor',
      appearance:
        'a gentle 38-year-old Victorian Scottish wife in 1864, soft oval face, dark hair parted in the middle and drawn into a low bun, dark silk dress with a white lace collar, kind tired eyes',
      summary: 'Llevaba meses enferma de algo que no se curaba.',
      biography: 'Hija de una familia acomodada de Edimburgo. Casada con Pritchard desde 1850, madre de cinco hijos. Desde el otoño de 1864, vómitos y calambres que empeoraban sin explicación.',
      personality: ['Dulce', 'Confiada', 'Paciente'],
    },
    {
      id: 'ch-pritchard',
      name: 'Edward William Pritchard',
      look: { hair: 'bald', beard: true },
      role: 'suspect',
      age: 40,
      occupation: 'Médico',
      appearance:
        'a tall 40-year-old Victorian English doctor in Glasgow in 1865, high bald forehead, enormous flowing dark beard, intense eyes, black frock coat with a watch chain, theatrical self-assured pose',
      summary: 'Barba espléndida, verbo fácil, siempre en el centro.',
      biography: 'Antiguo cirujano de la Armada. Ejerce en Glasgow desde 1860. Se inventa títulos y viajes. Tiene deudas y una criada joven a la que visita de noche.',
      personality: ['Vanidoso', 'Mentiroso', 'Sereno'],
      relationToVictim: 'Su marido y su médico',
      motive: { text: 'Prometió casarse con la criada si su mujer moría.', visibleWhen: { fact: 'fa-promesa' } },
      alibi: { claim: 'Cuidó a las dos mujeres con su ciencia. Murieron de enfermedad; él mismo firmó los certificados.' },
    },
    {
      id: 'ch-mcleod',
      name: 'Mary McLeod',
      look: { hair: 'bun' },
      role: 'suspect',
      age: 16,
      occupation: 'Criada de los Pritchard',
      appearance:
        'a frightened 16-year-old Scottish maidservant in 1865, young round face, red-brown hair under a white cap, plain dark dress and apron, downcast eyes',
      summary: 'La criada joven. Lleva el té a la señora.',
      biography: 'Entró a servir a los catorce años. El doctor la visita de noche. Lleva los platos y las bebidas a la habitación de la señora.',
      personality: ['Asustada', 'Callada'],
      relationToVictim: 'Su criada',
      motive: { text: 'El doctor le prometió casarse con ella si la señora moría.', visibleWhen: { fact: 'fa-promesa' } },
      alibi: { claim: 'Solo llevaba lo que le daban en la cocina o lo que le daba el doctor.' },
    },
    {
      id: 'ch-paterson',
      name: 'James Paterson',
      look: { hair: 'short', beard: true },
      role: 'witness',
      age: 60,
      occupation: 'Médico de Glasgow',
      appearance:
        'a stern 60-year-old Victorian Scottish physician in 1865, white side whiskers, thin grey hair, gold spectacles, black coat, severe principled expression',
      summary: 'Se negó a firmar un certificado.',
      biography: 'Médico veterano de Glasgow. Pritchard le llamó una noche a ver a su suegra moribunda y a su esposa enferma. No le gustó lo que vio.',
      personality: ['Íntegro', 'Prudente', 'Seco'],
    },
    {
      id: 'ch-cocinera',
      name: 'Catherine, la cocinera',
      look: { hair: 'bun' },
      role: 'witness',
      age: 45,
      occupation: 'Cocinera de los Pritchard',
      appearance:
        'a stout 45-year-old Victorian Scottish cook in 1865, red cheerful face now worried, grey hair under a cap, large apron, flour on her sleeves',
      summary: 'Probó la tapioca de la señora.',
      biography: 'Lleva años en la casa. Prepara las comidas de la enferma, que a veces el doctor sube él mismo.',
      personality: ['Charlatana', 'Leal a la señora'],
    },
    {
      id: 'ch-boticario',
      name: 'Sr. Currie',
      look: { hair: 'short' },
      role: 'witness',
      age: 50,
      occupation: 'Boticario de Glasgow',
      appearance:
        'a careful 50-year-old Victorian Glasgow chemist in 1865, neat grey hair, small spectacles, white apron over a dark waistcoat, ledger in hand',
      summary: 'Lleva el registro de venenos al día.',
      biography: 'Boticario de Sauchiehall Street. El doctor Pritchard le compra para su consulta.',
      personality: ['Ordenado', 'Discreto'],
      appearsWhen: { fact: 'fa-antimonio' },
    },
  ],

  locations: [
    { id: 'lo-casa', name: '131 Sauchiehall Street', description: 'Casa y consulta del doctor, en el centro de Glasgow.' },
    { id: 'lo-alcoba', name: 'Alcoba de la señora', description: 'Donde murió Mary Jane.' },
    { id: 'lo-cocina', name: 'Cocina', description: 'En el sótano.' },
    { id: 'lo-botica', name: 'Botica de Sauchiehall Street', description: 'A unos portales de la casa.', appearsWhen: { fact: 'fa-antimonio' } },
  ],

  relationships: [
    { id: 're-matrimonio', a: 'ch-pritchard', b: 'ch-mary-jane', label: 'Matrimonio' },
    { id: 're-amante', a: 'ch-pritchard', b: 'ch-mcleod', label: 'Amante secreta', visibleWhen: { asked: 'q-mcleod-doctor' } },
    { id: 're-criada', a: 'ch-mcleod', b: 'ch-mary-jane', label: 'Criada' },
  ],

  facts: [
    { id: 'fa-paterson', text: 'El Dr. Paterson vio a la suegra moribunda, sospechó un envenenamiento con antimonio y se negó a firmar el certificado.', important: true },
    { id: 'fa-frasco', text: 'La suegra murió tras beber de un frasco de calmante de opio que guardaba en su cuarto, y se quejó de que sabía amargo.', important: true },
    { id: 'fa-tapioca', text: 'La cocinera probó la tapioca de la señora, que había subido el doctor, y estuvo vomitando toda la noche.', important: true },
    { id: 'fa-antimonio', text: 'Las autopsias hallan antimonio en los cuerpos de la suegra y de la esposa, y acónito en el frasco de la suegra.', important: true },
    { id: 'fa-compras', text: 'Pritchard compró en pocos meses tártaro emético y tintura de acónito suficientes para matar a varias personas.', important: true },
    { id: 'fa-promesa', text: 'Pritchard prometió a la criada Mary McLeod casarse con ella si su esposa moría.', important: true },
    { id: 'fa-mejora-fuera', text: 'Cuando la esposa pasó unas semanas en casa de su familia en Edimburgo, mejoró; al volver, empeoró.', important: true },
    { id: 'fa-certificados', text: 'Pritchard firmó él mismo los dos certificados: apoplejía y fiebre gástrica.' },
  ],

  evidence: [
    {
      id: 'ev-anonima',
      kind: 'letter',
      title: 'Carta anónima al fiscal',
      dated: '18 de marzo de 1865',
      source: 'Fiscalía de Glasgow',
      summary: 'Alguien ha visto demasiado.',
      related: { characters: ['ch-pritchard'], locations: ['lo-casa'], events: [] },
      body: [
        { type: 'paragraph', text: 'Señor:' },
        {
          type: 'paragraph',
          text: '{{dt-anon-texto|La suegra del Dr. Pritchard murió de repente hace tres semanas y su esposa ha muerto hoy en circunstancias muy sospechosas. Él mismo firmó ambos certificados.}} Creo que es su deber investigar.',
        },
        { type: 'paragraph', text: 'Un amante de la justicia.' },
      ],
      details: [{ id: 'dt-anon-texto', label: 'Él firmó los dos', description: 'El médico que trataba a las víctimas es el que certificó sus muertes.', effects: [{ grantFact: 'fa-certificados' }], points: 10 }],
    },
    {
      id: 'ev-certificados',
      kind: 'document',
      title: 'Certificados de defunción',
      source: 'Registro civil de Glasgow',
      summary: 'Dos muertes, dos diagnósticos, una firma.',
      related: { characters: ['ch-pritchard'], locations: ['lo-casa'], events: ['te-suegra', 'te-muerte'] },
      body: [
        {
          type: 'table',
          header: ['Fallecida', 'Fecha', 'Causa', 'Firma'],
          rows: [
            ['Jane Taylor (suegra)', '25-feb-1865', 'Parálisis apoplética', 'E. W. Pritchard'],
            ['Mary Jane Pritchard (esposa)', '18-mar-1865', 'Fiebre gástrica', 'E. W. Pritchard'],
          ],
        },
        { type: 'handwritten', text: '{{dt-cert-negativa|Se intentó primero que firmara el certificado de la Sra. Taylor el Dr. Paterson, que se negó.}}', author: 'Nota del registrador' },
      ],
      details: [{ id: 'dt-cert-negativa', label: 'Paterson se negó', description: 'Otro médico no quiso firmar la primera muerte.', effects: [], points: 10 }],
    },
    {
      id: 'ev-paterson',
      kind: 'letter',
      title: 'Carta del Dr. Paterson al registro',
      dated: '27 de febrero de 1865',
      source: 'Registro civil de Glasgow',
      summary: 'Por qué no firmó.',
      related: { characters: ['ch-paterson'], locations: ['lo-alcoba'], events: ['te-suegra'] },
      body: [
        {
          type: 'paragraph',
          text: '{{dt-pat-misterio|No puedo certificar la muerte de la Sra. Taylor: me pareció súbita, inesperada y, para mí, misteriosa.}}',
        },
        {
          type: 'paragraph',
          text: '{{dt-pat-antimonio|Esa noche vi también a la Sra. Pritchard, en la cama: su aspecto era el de una persona bajo los efectos del antimonio.}} No me correspondía decir más a un colega.',
        },
        { type: 'signature', name: 'J. Paterson, médico' },
      ],
      details: [
        { id: 'dt-pat-misterio', label: '«Misteriosa»', description: 'Un médico con experiencia no se creyó la apoplejía.', effects: [], points: 10 },
        { id: 'dt-pat-antimonio', label: 'Aspecto de antimonio', description: 'Paterson reconoció en la esposa los efectos de un veneno.', effects: [{ grantFact: 'fa-paterson' }], points: 20 },
      ],
      decisive: true,
    },
    {
      id: 'ev-autopsia',
      kind: 'report',
      title: 'Informe de los químicos de la Corona',
      source: 'Profesores Maclagan y Penny',
      summary: 'Lo que había en los cuerpos exhumados.',
      autoDiscoverWhen: { asked: 'q-paterson-exhumar' },
      related: { characters: ['ch-mary-jane'], locations: [], events: ['te-exhumacion'] },
      body: [
        {
          type: 'typed',
          text: '{{dt-aut-antimonio|En los órganos de las dos mujeres, antimonio en cantidad: se les dio repetidamente, durante semanas, en forma de tártaro emético.}}',
        },
        { type: 'typed', text: '{{dt-aut-frasco|En el frasco de calmante de la Sra. Taylor, además del opio, acónito y antimonio.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-exhumacion' }],
      details: [
        { id: 'dt-aut-antimonio', label: 'Antimonio durante semanas', description: 'No fue una enfermedad: las envenenaron poco a poco.', effects: [{ grantFact: 'fa-antimonio' }], points: 25 },
        { id: 'dt-aut-frasco', label: 'El frasco amañado', description: 'Al calmante de la suegra le añadieron veneno.', effects: [{ grantFact: 'fa-frasco' }], points: 15 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-libro-botica',
      kind: 'record',
      title: 'Registro de venenos de la botica',
      source: 'Botica de Sauchiehall Street',
      summary: 'Las compras del doctor.',
      autoDiscoverWhen: { asked: 'q-currie' },
      related: { characters: ['ch-pritchard', 'ch-boticario'], locations: ['lo-botica'], events: ['te-compras'] },
      body: [
        {
          type: 'table',
          header: ['Fecha', 'Comprador', 'Producto'],
          rows: [
            ['nov-1864', 'Dr. Pritchard', 'Tártaro emético, 1 onza'],
            ['ene-1865', 'Dr. Pritchard', '{{dt-bot-tartaro|Tártaro emético, 1 onza}}'],
            ['feb-1865', 'Dr. Pritchard', '{{dt-bot-aconito|Tintura de acónito, 2 onzas}}'],
            ['mar-1865', 'Dr. Pritchard', 'Tártaro emético, 1 onza'],
          ],
        },
        { type: 'handwritten', text: '{{dt-bot-nota|Para una consulta pequeña, una onza de tártaro emético da para años.}}', author: 'Nota del boticario' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-compras' }],
      details: [
        { id: 'dt-bot-tartaro', label: 'Una onza tras otra', description: 'Cantidades absurdas para un médico de familia.', effects: [{ grantFact: 'fa-compras' }], points: 20 },
        { id: 'dt-bot-aconito', label: 'Acónito en febrero', description: 'Comprado días antes de la muerte de la suegra.', effects: [], points: 15 },
        { id: 'dt-bot-nota', label: 'Para años', description: 'El boticario se extrañó.', effects: [], points: 5 },
      ],
      decisive: true,
    },
    {
      id: 'ev-carta-familia',
      kind: 'letter',
      title: 'Carta de la familia Taylor',
      source: 'Edimburgo',
      summary: 'Una temporada lejos de casa.',
      autoDiscoverWhen: { asked: 'q-cocinera-senora' },
      related: { characters: ['ch-mary-jane'], locations: [], events: ['te-edimburgo'] },
      body: [
        {
          type: 'paragraph',
          text: '{{dt-fam-mejora|Mary Jane pasó con nosotros en Edimburgo las Navidades: comía, dormía y reía. En tres semanas parecía otra.}} Al volver a Glasgow, en enero, recayó.',
        },
        { type: 'signature', name: 'Michael Taylor, hermano de la difunta' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-edimburgo' }],
      details: [{ id: 'dt-fam-mejora', label: 'Mejoraba lejos de casa', description: 'La «enfermedad» desaparecía lejos de Sauchiehall Street.', effects: [{ grantFact: 'fa-mejora-fuera' }], points: 15 }],
    },
  ],

  deductions: [
    {
      id: 'de-casa',
      title: 'El veneno estaba en casa',
      combine: ['dt-fam-mejora', 'dt-aut-antimonio'],
      explanation: 'Mary Jane se curaba en Edimburgo y recaía al volver: el antimonio se lo daban en su propia casa, semana tras semana.',
      points: 30,
    },
    {
      id: 'de-compras',
      title: 'De la botica a la alcoba',
      combine: ['dt-bot-tartaro', 'dt-aut-antimonio'],
      explanation: 'El tártaro emético que encontraron los químicos es el que Pritchard compraba, onza tras onza, en cantidades que ninguna consulta necesita.',
      points: 35,
    },
    {
      id: 'de-frasco',
      title: 'El frasco de la suegra',
      combine: ['dt-aut-frasco', 'dt-bot-aconito'],
      explanation: 'El acónito del frasco de calmante de la suegra es el que Pritchard compró días antes de su muerte.',
      points: 30,
    },
  ],

  contradictions: [
    {
      id: 'cx-pritchard-fiebre',
      title: 'No era una fiebre',
      a: { line: 'ln-pritchard-fiebre' },
      b: { detail: 'dt-pat-antimonio' },
      explanation: 'Pritchard dice que su esposa tenía una fiebre gástrica; Paterson le vio en la cara los efectos del antimonio.',
      points: 25,
    },
    {
      id: 'cx-pritchard-tapioca',
      title: 'Quién subía la tapioca',
      a: { line: 'ln-pritchard-cocina' },
      b: { line: 'ln-cocinera-tapioca' },
      explanation: 'Pritchard dice que nunca se ocupaba de las comidas de la enferma; la cocinera le vio coger la tapioca, entrar en su consulta con ella y subirla él mismo.',
      effects: [{ grantFact: 'fa-tapioca' }],
      points: 30,
    },
    {
      id: 'cx-mcleod-nada',
      title: 'La promesa',
      a: { line: 'ln-mcleod-nada' },
      b: { line: 'ln-cocinera-noches' },
      explanation: 'Mary McLeod dice que el doctor no es más que su amo; la cocinera le ha visto entrar en su cuarto de noche y le ha oído prometerle «cuando la señora falte».',
      effects: [{ revealSecret: 'se-mcleod' }],
      points: 20,
    },
  ],

  secrets: [
    { id: 'se-mcleod', characterId: 'ch-mcleod', text: 'El doctor le había regalado un anillo y le había dicho que, si la señora moría, se casaría con ella. Ella nunca tocó las bebidas de la señora sin que él se las diera.', points: 20 },
    { id: 'se-paterson', characterId: 'ch-paterson', text: 'Paterson sospechó el envenenamiento tres semanas antes de la muerte de la esposa, pero no avisó a nadie por respeto a la etiqueta entre colegas. Se arrepentirá toda su vida.', revealedWhen: { fact: 'fa-paterson' }, points: 15 },
  ],

  interrogations: [
    {
      id: 'in-pritchard',
      characterId: 'ch-pritchard',
      setting: 'En su consulta, entre fotografías suyas firmadas y un esqueleto. Se acaricia la barba y sonríe con tristeza ensayada.',
      opening: [{ text: 'He perdido a mi esposa y a su madre en un mes. Pregunte, caballero. La ciencia no tiene nada que ocultar.' }],
      topics: [
        {
          id: 'tp-pritchard-enfermedad',
          label: 'Las enfermedades',
          kind: 'victim',
          questions: [
            {
              id: 'q-pritchard-fiebre',
              prompt: '¿De qué murió su esposa?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-pritchard-fiebre', text: 'De una fiebre gástrica, complicada por los nervios. Llevaba meses frágil. Hice todo lo humanamente posible.', tone: 'lie' }] }],
            },
            {
              id: 'q-pritchard-cocina',
              prompt: '¿Quién le preparaba la comida?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-pritchard-cocina', text: 'La cocinera y la criada. Yo soy médico, no cocinero; nunca he tocado una bandeja en mi vida.', tone: 'lie' }] }],
            },
            {
              id: 'q-pritchard-compras',
              prompt: '¿Para qué tanto tártaro emético y acónito?',
              kind: 'confront',
              requires: { fact: 'fa-compras' },
              responses: [{ lines: [{ text: 'Para mi consulta: el tártaro emético es un remedio clásico, y el acónito, para las neuralgias. Usted no entiende de medicina.', tone: 'evasion' }] }],
            },
          ],
        },
        {
          id: 'tp-pritchard-final',
          label: 'Los cuerpos',
          kind: 'other',
          questions: [
            {
              id: 'q-pritchard-final',
              prompt: 'Hay antimonio en los dos cuerpos, el que usted compraba, y acónito en el frasco de su suegra.',
              kind: 'confront',
              requires: { all: [{ fact: 'fa-antimonio' }, { fact: 'fa-compras' }] },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Pritchard deja de acariciarse la barba.' },
                    { text: 'Mi suegra tomaba su calmante a escondidas, en dosis absurdas. Y mi esposa… quizá se automedicaba. Las mujeres hacen esas cosas.', tone: 'lie' },
                  ],
                  effects: [{ setFlag: 'pritchard-culpa' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-mcleod',
      characterId: 'ch-mcleod',
      setting: 'En la cocina, junto a la cocinera, que no le suelta la mano.',
      opening: [{ text: 'Yo no he hecho nada malo. Lo juro.' }],
      topics: [
        {
          id: 'tp-mcleod',
          label: 'El doctor',
          kind: 'person',
          about: 'ch-pritchard',
          questions: [
            {
              id: 'q-mcleod-doctor',
              prompt: '¿Cómo es el doctor con usted?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-mcleod-nada', text: 'Es el amo. Me trata bien. No hay nada más.', tone: 'lie' }] }],
            },
            {
              id: 'q-mcleod-cx',
              prompt: 'La cocinera le ha oído prometerle matrimonio «cuando la señora falte».',
              kind: 'contradiction',
              contradiction: 'cx-mcleod-nada',
              responses: [
                {
                  lines: [
                    { text: 'Me dio un anillo. Me dijo que la señora no iba a vivir mucho, que estaba muy enferma, y que entonces nos casaríamos.', tone: 'admission' },
                    { text: 'Yo le subía lo que él me daba. Nunca le eché nada. Nunca.', tone: 'truth' },
                  ],
                  effects: [{ grantFact: 'fa-promesa' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-cocinera',
      characterId: 'ch-cocinera',
      setting: 'En la cocina del sótano, entre cacerolas. Habla bajito, mirando la escalera.',
      opening: [{ text: 'La señora era una santa. Y el señor… no diré nada del señor que no sea verdad.' }],
      topics: [
        {
          id: 'tp-cocinera',
          label: 'La señora',
          kind: 'victim',
          questions: [
            {
              id: 'q-cocinera-senora',
              prompt: '¿Cuándo empezó a enfermar la señora?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'En otoño. En Navidad se fue con su familia a Edimburgo y volvió como nueva. A las dos semanas, otra vez en la cama.', tone: 'truth' }] }],
            },
            {
              id: 'q-cocinera-tapioca',
              prompt: '¿Pasó algo raro con sus comidas?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { id: 'ln-cocinera-tapioca', text: 'Un día preparé tapioca para la señora. El doctor la cogió, se la llevó un momento a su consulta y luego la subió él mismo. La señora la dejó casi entera.', tone: 'truth' },
                    { text: 'Yo me comí lo que sobró, por no tirarlo. Estuve vomitando toda la noche, con un ardor en la garganta como fuego.', tone: 'truth' },
                  ],
                  effects: [{ unlockTimelineEvent: 'te-tapioca' }],
                },
              ],
            },
            {
              id: 'q-cocinera-mcleod',
              prompt: '¿Y la criada joven?',
              kind: 'ask',
              requires: { asked: 'q-mcleod-doctor' },
              responses: [{ lines: [{ id: 'ln-cocinera-noches', text: 'El señor sube a su cuarto de noche. Una vez le oí decirle: «Cuando la señora falte, serás tú la señora». Y la señora estaba arriba, muriéndose.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-paterson',
      characterId: 'ch-paterson',
      setting: 'En su consulta, con la carta al registro delante. Parece cansado.',
      opening: [{ text: 'Hice lo que creí correcto. Quizá no hice bastante.' }],
      topics: [
        {
          id: 'tp-paterson',
          label: 'Aquella noche',
          kind: 'events',
          questions: [
            {
              id: 'q-paterson-noche',
              prompt: '¿Qué vio cuando le llamaron?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'A la anciana agonizando, con los labios morados. Y a la esposa, en otra cama, con la cara y los vómitos de quien toma antimonio. Pritchard me dijo que era una fiebre.', tone: 'truth' }] }],
            },
            {
              id: 'q-paterson-exhumar',
              prompt: '¿Hay que exhumar los cuerpos?',
              kind: 'ask',
              requires: { fact: 'fa-paterson' },
              responses: [{ lines: [{ text: 'Sin ninguna duda. Y que los analicen los químicos de la Corona, no un médico de barrio como yo.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-currie',
      characterId: 'ch-boticario',
      setting: 'Tras el mostrador de la botica, entre frascos de colores.',
      opening: [{ text: 'El doctor Pritchard es un buen cliente. Demasiado bueno, quizá.' }],
      topics: [
        {
          id: 'tp-currie',
          label: 'Las compras',
          kind: 'other',
          questions: [
            {
              id: 'q-currie',
              prompt: '¿Qué le compraba el doctor?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Está todo en el registro de venenos. Le aviso: no le va a gustar lo que vea.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto a la muerte (madrugada del 18 de marzo de 1865)
  timeline: [
    { id: 'te-compras', t: -172800, display: 'Noviembre de 1864', title: 'Pritchard empieza a comprar tártaro emético', description: 'Onza tras onza.', characters: ['ch-pritchard'], location: 'lo-botica', key: true },
    { id: 'te-edimburgo', t: -110000, display: 'Navidad de 1864', title: 'Mary Jane mejora en Edimburgo, lejos de casa', description: 'Y recae al volver.', characters: ['ch-mary-jane'], key: true },
    { id: 'te-suegra', t: -29880, display: '25 de febrero de 1865', title: 'Muere Jane Taylor tras beber de su frasco de calmante', description: 'Paterson se niega a firmar.', characters: ['ch-pritchard', 'ch-paterson'], location: 'lo-casa', key: true },
    { id: 'te-tapioca', t: -2880, display: '16 de marzo', title: 'La cocinera enferma con las sobras de la tapioca que subió el doctor', description: 'Ardor de garganta y vómitos toda la noche.', characters: ['ch-cocinera', 'ch-pritchard'], location: 'lo-cocina', key: true },
    { id: 'te-falso-fiebre', t: -60, display: '18 de marzo', title: 'La señora muere de una fiebre gástrica', description: 'Según el certificado de Pritchard.', characters: ['ch-mary-jane'], veracity: 'false', claimedBy: 'ch-pritchard' },
    { id: 'te-muerte', t: 0, display: '18 de marzo, madrugada', title: 'Muerte de Mary Jane Pritchard', description: 'Después de meses de vómitos.', characters: ['ch-mary-jane'], location: 'lo-alcoba', key: true },
    { id: 'te-exhumacion', t: 10080, display: 'Finales de marzo', title: 'Exhumación y análisis: antimonio en las dos', description: 'Los químicos de la Corona lo confirman.', characters: ['ch-mary-jane'], key: true },
  ],

  accusation: {
    motives: [
      { id: 'mo-criada', label: 'Quitarse de en medio a su esposa (y a la suegra que la cuidaba) para casarse con la criada y librarse de sus deudas', availableWhen: { fact: 'fa-promesa' } },
      { id: 'mo-celos-criada', label: 'Celos de la criada hacia la señora', availableWhen: { asked: 'q-mcleod-doctor' } },
      { id: 'mo-herencia', label: 'Una herencia de la suegra' },
      { id: 'mo-error', label: 'Ninguno: errores de dosis de un médico' },
    ],
    methods: [
      { id: 'me-antimonio', label: 'Antimonio en las comidas de su esposa durante meses y veneno en el frasco de calmante de su suegra', availableWhen: { all: [{ fact: 'fa-antimonio' }, { fact: 'fa-tapioca' }] } },
      { id: 'me-te', label: 'Veneno en el té que subía la criada' },
      { id: 'me-fiebre', label: 'No hubo veneno: una fiebre contagiosa' },
      { id: 'me-sobredosis', label: 'La suegra se mató con su propio calmante y la esposa murió de pena' },
    ],
  },

  solution: {
    culprits: ['ch-pritchard'],
    motive: 'mo-criada',
    method: 'me-antimonio',
    proof: ['ev-autopsia', 'ev-libro-botica', 'ev-paterson'],
    whatHappened:
      'El doctor Edward William Pritchard envenenó a su esposa, Mary Jane, con antimonio durante meses, y a su suegra, Jane Taylor, con acónito y antimonio en su frasco de calmante. Mantenía una relación con la criada Mary McLeod, a la que había prometido casarse con ella si la señora moría. Compraba tártaro emético y acónito en cantidades que ninguna consulta necesita. Cuando su suegra vino a cuidar a su hija, la quitó también de en medio. Subía él mismo la comida a la enferma, después de pasar por su consulta. Firmó los dos certificados. Paterson reconoció el antimonio, se negó a firmar y no dijo nada más; una carta anónima hizo el resto.',
    reconstruction: [
      'Otoño de 1864: Pritchard empieza a comprar tártaro emético. Su mujer enferma.',
      'Navidad: Mary Jane se repone en Edimburgo. Al volver, recae.',
      'Febrero: llega la suegra a cuidarla. Pritchard compra acónito.',
      '25 de febrero: la suegra bebe de su frasco de calmante y muere. Paterson se niega a firmar.',
      'Marzo: Pritchard sube él mismo la tapioca; la cocinera enferma con las sobras.',
      '18 de marzo: muere Mary Jane. Pritchard certifica «fiebre gástrica».',
      'En el funeral, hace abrir el ataúd y la besa. Una carta anónima llega al fiscal.',
    ],
    decisiveEvidence: ['ev-paterson', 'ev-autopsia', 'ev-libro-botica', 'ev-carta-familia'],
    alibiTruths: [
      { characterId: 'ch-pritchard', truth: 'No la cuidó: la envenenó, y subía él mismo la comida tras pasar por su consulta.' },
      { characterId: 'ch-mcleod', truth: 'Solo subía lo que el doctor le daba; no sabía lo que llevaba.' },
    ],
  },

  endings: [
    {
      id: 'en-glasgow',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { flag: 'pritchard-culpa' } },
      outcome: 'success',
      title: 'La última horca de Glasgow',
      text: 'Pritchard es condenado en julio de 1865. Antes de morir confiesa las dos muertes, aunque cambia los detalles en cada versión. El 28 de julio, cien mil personas llenan la plaza de Jail Square para verle morir: es la última ejecución pública de Glasgow. El doctor Paterson, criticado por no haber hablado antes, escribe a los periódicos defendiendo su silencio.',
    },
    {
      id: 'en-exito',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' },
      outcome: 'success',
      title: 'El médico',
      text: 'La acusación demuestra cómo y por qué. Pritchard es condenado.',
    },
    { id: 'en-parcial', when: { culprit: 'correct' }, outcome: 'partial', title: 'Sin móvil', text: 'Acusáis a Pritchard, pero sin explicar por qué ni cómo. Su abogado le presenta como un médico despistado con una suegra adicta al opio.' },
    { id: 'en-mcleod', when: { culprit: 'ch-mcleod' }, outcome: 'failure', title: 'La criada', text: 'Mary McLeod, de dieciséis años, es detenida por subir las bandejas. El doctor declara contra ella con lágrimas en los ojos.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Fiebre gástrica', text: 'Los certificados se quedan como están. El doctor Pritchard da una conferencia sobre su duelo y vende fotografías suyas de luto.' },
  ],

  hints: [
    {
      id: 'hl-veneno',
      topic: '¿Veneno?',
      relevantWhen: { not: { fact: 'fa-antimonio' } },
      steps: ['¿Quién se negó a firmar un certificado?', 'Lee la carta de Paterson y habla con él.', 'Pídele que se exhumen los cuerpos.'],
    },
    {
      id: 'hl-mano',
      topic: 'Quién se lo daba',
      relevantWhen: { not: { fact: 'fa-tapioca' } },
      steps: ['¿Quién subía la comida a la enferma?', 'Pregunta a la cocinera.', 'Contrasta lo que dice con lo que dice el doctor.'],
    },
  ],

  objectives: [
    { id: 'ob-veneno', text: 'Demuestra que las dos fueron envenenadas.', completeWhen: { fact: 'fa-antimonio' }, points: 25 },
    { id: 'ob-promesa', text: 'Averigua qué prometió el doctor a la criada.', completeWhen: { fact: 'fa-promesa' }, points: 25 },
    { id: 'ob-paterson', text: 'Descubre por qué Paterson calló.', completeWhen: { secret: 'se-paterson' }, points: 15, hidden: true },
  ],

  assets: [],
};

export default caseFile;
