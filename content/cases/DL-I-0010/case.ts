import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-I-0010 · SANGRE EN EL SALTERIO
 * Brujas, marzo de 1127 · Conspiración · Caso real · Inspector
 *
 * Caso real: el asesinato de Carlos el Bueno, conde de Flandes, mientras
 * rezaba en la iglesia de San Donaciano de Brujas, a manos de miembros del
 * clan de los Erembaldos. Lo contó día a día el notario Galberto de Brujas.
 * Lo documentado sigue su crónica; las pistas concretas y las conversaciones
 * del investigador son una recreación.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-I-0010',
  contentVersion: 1,
  mode: 'individual',
  title: 'Sangre en el salterio',
  subtitle: 'Matan al conde de Flandes de rodillas, en misa. ¿Quién lo decidió?',
  origin: 'real',
  historical: {
    documented: [
      'El 2 de marzo de 1127, Carlos el Bueno, conde de Flandes, fue asesinado al amanecer mientras rezaba y repartía limosnas en la iglesia de San Donaciano, en el castillo de Brujas.',
      'Le mataron caballeros del clan de los Erembaldos. Asestó el golpe Borsiard, sobrino del preboste Bertulfo, jefe del capítulo de San Donaciano y canciller de Flandes.',
      'El conde había iniciado una investigación sobre el origen servil de los Erembaldos: si se probaba que descendían de siervos, perderían su libertad, sus cargos y sus matrimonios con familias libres.',
      'El conde también había mandado destruir la casa de Borsiard por sus ataques contra Tancmaro de Straten, enemigo del clan.',
      'Los conjurados se reunieron la noche anterior y se comprometieron a matar al conde. Entre ellos estaba Isaac, camarero del conde y pariente del clan.',
      'Los asesinos se encerraron en el castillo y en la torre de la iglesia, donde fueron sitiados. El preboste Bertulfo huyó, fue capturado y ejecutado en Ypres. Isaac huyó disfrazado y fue ahorcado. Borsiard fue ejecutado.',
      'El notario Galberto de Brujas escribió un diario de los hechos día a día, una de las crónicas más vivas de la Edad Media.',
    ],
    hypotheses: ['El grado de implicación directa del preboste Bertulfo, que siempre negó haber ordenado el crimen, fue discutido ya por los contemporáneos.'],
    dramatized: [
      'El investigador, sus conversaciones y las pistas concretas (la cera, el salterio, la nota, el registro de limosnas) son una recreación.',
      'Los nombres de algunos testigos menores y los diálogos son inventados.',
      'Los retratos son recreaciones artísticas.',
    ],
    documentedResolution:
      'El conde Carlos el Bueno fue asesinado por una conjura del clan de los Erembaldos, encabezado por el preboste Bertulfo; el golpe lo dio su sobrino Borsiard. Ambos fueron ejecutados en 1127.',
    sources: ['Galberto de Brujas, De multro, traditione et occisione gloriosi Karoli comitis Flandriarum (1127-1128)', 'James Bruce Ross (trad.), The Murder of Charles the Good (1960)'],
  },
  era: 'medieval',
  eraLabel: 'Brujas, 1127',
  year: 1127,
  location: { city: 'Brujas', place: 'Iglesia de San Donaciano, en el castillo', country: 'Condado de Flandes' },
  category: 'conspiracy',
  difficulty: 'inspector',
  keywords: ['Brujas', 'Flandes', 'Carlos el Bueno', 'Erembaldos', 'Galberto', 'conjura', 'siervos', 'caso real'],
  ambience: { music: 'rome-64-fire', mood: 'ritual' },
  maxHints: 4,

  briefing: {
    incidentDisplay: 'Miércoles, 2 de marzo de 1127 · al alba',
    summary:
      'El conde Carlos de Flandes ha sido asesinado de rodillas en la tribuna de San Donaciano, con el salterio abierto y las monedas de las limosnas en la mano. Lo mataron caballeros que entraron con las espadas bajo las capas. Todo Brujas sabe quién empuñó la espada. Nadie se atreve a decir quién la mandó.',
    context:
      'Los barones que vienen a sitiar el castillo quieren nombres para el juicio: no solo el del brazo, también el de la cabeza. Le piden que ordene los testimonios, mientras un notario llamado Galberto lo apunta todo en tablillas de cera.',
    background:
      'El clan de los Erembaldos domina Brujas: el preboste Bertulfo manda en el capítulo de San Donaciano y es canciller del condado; sus sobrinos y parientes son caballeros. Pero corre un rumor: que su abuelo era siervo del conde.',
    victim: 'ch-carlos',
    initialFacts: [],
    initialEvidence: ['ev-tribuna', 'ev-galberto', 'ev-servidumbre'],
    initialTimeline: ['te-muerte', 'te-asedio'],
  },

  characters: [
    {
      id: 'ch-carlos',
      name: 'Carlos el Bueno',
      look: { hair: 'short', beard: true },
      role: 'victim',
      age: 43,
      occupation: 'Conde de Flandes',
      appearance:
        'a pious 43-year-old medieval Flemish count in 1127, lean ascetic face, short brown beard, simple dark woollen tunic and cloak, thin gold circlet, calm stern eyes, painted in the style of a twelfth-century manuscript portrait',
      summary: 'Justo, piadoso y decidido a poner orden.',
      biography: 'Hijo del rey Canuto de Dinamarca. Conde desde 1119. Repartía pan en las hambrunas y castigaba a los nobles que rompían la paz. Había empezado a investigar quién era libre y quién siervo en su condado.',
      personality: ['Justo', 'Piadoso', 'Inflexible'],
    },
    {
      id: 'ch-bertulfo',
      name: 'Bertulfo',
      look: { hair: 'bald' },
      role: 'suspect',
      age: 60,
      occupation: 'Preboste de San Donaciano y canciller de Flandes',
      appearance:
        'a powerful 60-year-old medieval Flemish provost in 1127, heavy shrewd face, tonsured grey hair, rich black canon robes with a fur collar, ring of office, cold calculating eyes, twelfth-century manuscript style',
      summary: 'El hombre más poderoso de Brujas después del conde.',
      biography: 'Cabeza del clan de los Erembaldos. Ha colocado a sus sobrinos en los mejores puestos y ha casado a sus sobrinas con caballeros libres. Si su familia es declarada sierva, lo pierde todo.',
      personality: ['Orgulloso', 'Astuto', 'Altivo'],
      relationToVictim: 'Su canciller',
      motive: { text: 'La investigación del conde iba a declarar siervos a todos los Erembaldos.', visibleWhen: { fact: 'fa-servidumbre' } },
      alibi: { claim: 'Estaba en su casa del claustro, durmiendo. Se enteró del crimen como todos y lloró al conde.' },
    },
    {
      id: 'ch-borsiard',
      name: 'Borsiard',
      look: { hair: 'short', beard: true },
      role: 'suspect',
      age: 30,
      occupation: 'Caballero, sobrino del preboste',
      appearance:
        'a fierce 30-year-old medieval Flemish knight in 1127, scarred hard face, short dark beard, mail coif pushed back, dark cloak over a hauberk, wild defiant eyes, twelfth-century manuscript style',
      summary: 'Violento, y con su casa reducida a cenizas.',
      biography: 'Sobrino de Bertulfo. Lleva años en guerra privada con Tancmaro de Straten. Por ello el conde mandó quemar su casa hace una semana.',
      personality: ['Violento', 'Rencoroso', 'Impulsivo'],
      relationToVictim: 'Vasallo castigado',
      motive: { text: 'El conde mandó destruir su casa por su guerra con Tancmaro.', visibleWhen: { fact: 'fa-casa-quemada' } },
      alibi: { claim: 'No niega nada: «Lo hice y lo haría otra vez».' },
    },
    {
      id: 'ch-isaac',
      name: 'Isaac',
      look: { hair: 'short' },
      role: 'suspect',
      age: 35,
      occupation: 'Camarero del conde, pariente del clan',
      appearance:
        'a nervous 35-year-old medieval Flemish courtier in 1127, narrow pale face, clean shaven, short hair, fine green tunic with a belt of office and keys, darting eyes, twelfth-century manuscript style',
      summary: 'Sabía a qué hora rezaba el conde y por qué puerta.',
      biography: 'Camarero del conde, encargado de sus aposentos. Casado con una sobrina del preboste. Ha desaparecido de Brujas.',
      personality: ['Nervioso', 'Ambicioso', 'Doble'],
      relationToVictim: 'Su camarero',
      motive: { text: 'Por su matrimonio con una Erembalda, él también podía ser declarado siervo.', visibleWhen: { fact: 'fa-servidumbre' } },
      alibi: { claim: 'Huyó porque temía que le culparan por ser pariente del clan.' },
    },
    {
      id: 'ch-tancmaro',
      name: 'Tancmaro de Straten',
      look: { hair: 'short', beard: true },
      role: 'witness',
      age: 45,
      occupation: 'Señor de Straten, enemigo del clan',
      appearance:
        'a grim 45-year-old medieval Flemish lord in 1127, broad weathered face, greying beard, fur-lined cloak over a mail shirt, sword at his side, wary vengeful eyes, twelfth-century manuscript style',
      summary: 'El enemigo de los Erembaldos.',
      biography: 'Señor rural en guerra con Borsiard. Fue él quien llevó ante el conde la acusación de que los Erembaldos eran de sangre sierva.',
      personality: ['Vengativo', 'Franco'],
    },
    {
      id: 'ch-galberto',
      name: 'Galberto',
      look: { hair: 'short' },
      role: 'witness',
      age: 40,
      occupation: 'Notario del conde',
      appearance:
        'a thoughtful 40-year-old medieval Flemish notary in 1127, gentle intelligent face, clean shaven, tonsured brown hair, plain grey clerical robe, wax tablets and stylus in his hands, twelfth-century manuscript style',
      summary: 'Lo apunta todo en sus tablillas.',
      biography: 'Notario al servicio del conde. Desde el día del crimen escribe cada noche lo ocurrido en tablillas de cera, «a la luz de una vela, entre el ruido de las armas».',
      personality: ['Minucioso', 'Piadoso', 'Valiente'],
    },
    {
      id: 'ch-fromold',
      name: 'Fromold el Joven',
      look: { hair: 'short' },
      role: 'witness',
      age: 28,
      occupation: 'Notario y favorito del conde',
      appearance:
        'a young 28-year-old medieval Flemish clerk in 1127, earnest pale face, short fair hair, dark clerical robe, ink-stained fingers, frightened eyes, twelfth-century manuscript style',
      summary: 'Se libró por no estar en la tribuna.',
      biography: 'Notario joven y de confianza del conde, envidiado por el preboste. Esa mañana se retrasó y llegó a la iglesia cuando ya había ocurrido todo.',
      personality: ['Leal', 'Asustado'],
    },
  ],

  locations: [
    { id: 'lo-tribuna', name: 'Tribuna de San Donaciano', description: 'La galería alta de la iglesia del castillo, donde el conde rezaba cada mañana.' },
    { id: 'lo-castillo', name: 'Castillo de Brujas', description: 'Recinto amurallado con la iglesia, el palacio del conde y la casa del preboste.' },
    { id: 'lo-casa-borsiard', name: 'Casa de Borsiard', description: 'En las afueras de Brujas. Reducida a cenizas.' },
    { id: 'lo-casa-preboste', name: 'Casa del preboste', description: 'Junto al claustro, dentro del castillo.', appearsWhen: { asked: 'q-fromold-noche' } },
  ],

  relationships: [
    { id: 're-tio', a: 'ch-bertulfo', b: 'ch-borsiard', label: 'Tío y sobrino' },
    { id: 're-isaac', a: 'ch-isaac', b: 'ch-bertulfo', label: 'Casado con una sobrina del preboste' },
    { id: 're-enemigos', a: 'ch-borsiard', b: 'ch-tancmaro', label: 'Enemigos en guerra privada' },
    { id: 're-canciller', a: 'ch-bertulfo', b: 'ch-carlos', label: 'Canciller del conde' },
  ],

  facts: [
    { id: 'fa-servidumbre', text: 'El conde investigaba si los Erembaldos descendían de siervos: si se probaba, perderían su libertad y sus cargos.', important: true },
    { id: 'fa-casa-quemada', text: 'Una semana antes, el conde mandó quemar la casa de Borsiard por su guerra contra Tancmaro.', important: true },
    { id: 'fa-reunion', text: 'La noche anterior al crimen hubo una reunión en casa del preboste, con Borsiard, Isaac y otros caballeros del clan.', important: true },
    { id: 'fa-isaac-puerta', text: 'Isaac, el camarero, dejó abierta la puerta del claustro que da a la tribuna.', important: true },
    { id: 'fa-isaac-huye', text: 'Isaac huyó de Brujas disfrazado de monje.' },
    { id: 'fa-bertulfo-sabia', text: 'El preboste dio a los conjurados su palabra de protegerlos antes del crimen.', important: true },
    { id: 'fa-borsiard-golpe', text: 'Borsiard dio el golpe con su espada, de frente.', important: true },
    { id: 'fa-limosnas', text: 'El conde murió repartiendo limosnas: no llevaba escolta dentro de la iglesia.' },
  ],

  evidence: [
    {
      id: 'ev-tribuna',
      kind: 'report',
      title: 'Lo que se halló en la tribuna',
      source: 'Canónigos de San Donaciano',
      summary: 'El cuerpo del conde y su salterio.',
      related: { characters: ['ch-carlos'], locations: ['lo-tribuna'], events: ['te-muerte'] },
      body: [
        {
          type: 'typed',
          text: 'El conde yace de bruces ante el altar de la tribuna, con el salterio abierto en el salmo de penitencia. {{dt-trib-monedas|Tiene en la mano izquierda las monedas que repartía a los pobres.}}',
        },
        {
          type: 'typed',
          text: '{{dt-trib-golpe|Una sola herida en la cabeza, de espada, dada de frente y de arriba abajo: quien golpeó estaba de pie ante él y el conde llegó a levantar los ojos.}}',
        },
        { type: 'typed', text: '{{dt-trib-puerta|La puerta pequeña que comunica la tribuna con el claustro, que se cierra de noche, estaba abierta.}}' },
      ],
      details: [
        { id: 'dt-trib-monedas', label: 'Repartiendo limosnas', description: 'El conde no esperaba nada: estaba solo, rezando.', effects: [{ grantFact: 'fa-limosnas' }], points: 5 },
        { id: 'dt-trib-golpe', label: 'De frente', description: 'El asesino no se escondió: le miró a la cara.', effects: [], points: 10 },
        { id: 'dt-trib-puerta', label: 'La puerta del claustro', description: 'Alguien con llaves la dejó abierta para que entraran.', effects: [], points: 15 },
      ],
      decisive: true,
    },
    {
      id: 'ev-galberto',
      kind: 'document',
      title: 'Tablillas de Galberto',
      dated: '2 de marzo de 1127',
      source: 'Notario Galberto de Brujas',
      summary: 'Lo que contaron los que estaban en la iglesia.',
      related: { characters: ['ch-galberto', 'ch-borsiard'], locations: ['lo-tribuna'], events: ['te-muerte'] },
      body: [
        {
          type: 'handwritten',
          text: '{{dt-gal-borsiard|Entraron por la puerta del claustro, con las espadas bajo las capas. Borsiard se adelantó, el conde levantó la cabeza del salterio y Borsiard le partió la frente.}}',
          author: 'Galberto',
        },
        { type: 'handwritten', text: 'Mataron también al castellano de Bourbourg y a otros que estaban cerca. Luego cerraron el castillo.', author: 'Galberto' },
      ],
      details: [{ id: 'dt-gal-borsiard', label: 'Borsiard le golpeó', description: 'Los testigos señalan a Borsiard como el que dio el golpe.', effects: [{ grantFact: 'fa-borsiard-golpe' }], points: 15 }],
      decisive: true,
    },
    {
      id: 'ev-servidumbre',
      kind: 'document',
      title: 'Pleito por el estado de los Erembaldos',
      source: 'Corte del conde',
      summary: 'Un caballero acusado de siervo.',
      related: { characters: ['ch-bertulfo', 'ch-carlos', 'ch-tancmaro'], locations: ['lo-castillo'], events: ['te-pleito'] },
      body: [
        {
          type: 'typed',
          text: 'Un caballero libre, casado con una sobrina del preboste, ha sido retado en la corte del conde: «Quien se casa con una sierva y vive con ella un año, se hace siervo».',
        },
        {
          type: 'typed',
          text: '{{dt-serv-conde|El conde ha ordenado averiguar el linaje de los Erembaldos: si su abuelo fue siervo del conde, todos ellos, con sus hijos y sus bienes, pertenecen al conde.}}',
        },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-pleito' }],
      details: [{ id: 'dt-serv-conde', label: 'Siervos del conde', description: 'La investigación del conde podía arrebatar al clan su libertad, sus cargos y sus tierras.', effects: [{ grantFact: 'fa-servidumbre' }], points: 20 }],
      decisive: true,
    },
    {
      id: 'ev-orden-quema',
      kind: 'document',
      title: 'Orden de destruir la casa de Borsiard',
      dated: 'Finales de febrero de 1127',
      source: 'Cancillería del conde',
      summary: 'Por romper la paz.',
      autoDiscoverWhen: { asked: 'q-tancmaro' },
      related: { characters: ['ch-carlos', 'ch-borsiard', 'ch-tancmaro'], locations: ['lo-casa-borsiard'], events: ['te-quema'] },
      body: [
        {
          type: 'typed',
          text: '{{dt-quema-orden|Por haber atacado las tierras de Tancmaro de Straten en tiempo de paz, se destruirá por el fuego la casa de Borsiard, sobrino del preboste.}} Ejecutado en presencia del conde.',
        },
        { type: 'typed', text: '{{dt-quema-sello|Lleva el sello del canciller: Bertulfo tuvo que sellarla él mismo.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-quema' }],
      details: [
        { id: 'dt-quema-orden', label: 'La casa quemada', description: 'Borsiard tenía su propio agravio contra el conde.', effects: [{ grantFact: 'fa-casa-quemada' }], points: 15 },
        { id: 'dt-quema-sello', label: 'El sello del canciller', description: 'El preboste tuvo que sellar la ruina de su propio sobrino.', effects: [], points: 10 },
      ],
    },
    {
      id: 'ev-llaves',
      kind: 'object',
      title: 'Llavero del camarero',
      source: 'Hallado en el aposento de Isaac',
      summary: 'Faltan llaves.',
      autoDiscoverWhen: { asked: 'q-galberto-isaac' },
      related: { characters: ['ch-isaac'], locations: ['lo-castillo'], events: [] },
      body: [
        {
          type: 'typed',
          text: 'El llavero del camarero del conde, abandonado en su aposento con prisas. {{dt-llaves-falta|Está todo salvo una llave: la de la puerta pequeña del claustro a la tribuna, que solo tienen el camarero y el sacristán. La del sacristán está en su sitio.}}',
        },
      ],
      details: [{ id: 'dt-llaves-falta', label: 'La llave de la tribuna', description: 'Isaac abrió la puerta por la que entraron los asesinos.', effects: [{ grantFact: 'fa-isaac-puerta' }], points: 20 }],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-hermano-lego',
      kind: 'statement',
      title: 'Declaración de un hermano lego de Thérouanne',
      source: 'Abadía de Thérouanne',
      summary: 'Un monje que no sabía rezar.',
      autoDiscoverWhen: { fact: 'fa-isaac-puerta' },
      related: { characters: ['ch-isaac'], locations: [], events: ['te-huida'] },
      body: [
        {
          type: 'typed',
          text: '—{{dt-lego-isaac|Llegó un hombre con hábito de monje, pidiendo asilo. No sabía las horas del oficio ni las respuestas de la misa. Bajo el hábito llevaba un cinturón de cortesano con hebilla de plata.}}',
        },
        { type: 'typed', text: '—Cuando le apretamos, dijo que se llamaba Isaac y que venía de Brujas. Lloró y dijo: «El preboste me juró que no nos pasaría nada».' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-huida' }],
      details: [{ id: 'dt-lego-isaac', label: 'Un falso monje', description: 'Isaac huyó disfrazado: no es la huida de un inocente.', effects: [{ grantFact: 'fa-isaac-huye' }], points: 15 }],
    },
  ],

  deductions: [
    {
      id: 'de-puerta',
      title: 'Quién abrió la puerta',
      combine: ['dt-trib-puerta', 'dt-llaves-falta'],
      explanation: 'La puerta del claustro, cerrada de noche, estaba abierta, y la única llave que falta es la del camarero Isaac: él dejó entrar a los asesinos.',
      points: 30,
    },
    {
      id: 'de-motivo',
      title: 'Siervos o asesinos',
      combine: ['dt-serv-conde', 'dt-quema-orden'],
      explanation: 'El conde iba a declarar siervo a todo el clan y acababa de quemar la casa de Borsiard. Para los Erembaldos, matarle era la única manera de seguir siendo libres.',
      points: 30,
    },
  ],

  contradictions: [
    {
      id: 'cx-bertulfo-dormia',
      title: 'El preboste no dormía',
      a: { line: 'ln-bertulfo-dormia' },
      b: { line: 'ln-fromold-reunion' },
      explanation: 'Bertulfo dice que estaba durmiendo y no sabía nada; Fromold vio a medianoche a Borsiard, Isaac y otros caballeros entrar y salir de su casa, y le oyó prometerles protección.',
      effects: [{ grantFact: 'fa-reunion' }],
      points: 30,
    },
    {
      id: 'cx-bertulfo-llanto',
      title: 'Lágrimas y palabra dada',
      a: { line: 'ln-bertulfo-llora' },
      b: { line: 'ln-borsiard-palabra' },
      explanation: 'Bertulfo dice que lloró al conde y que nada sabía; Borsiard le recuerda la palabra que les dio la víspera: «Os protegeré a todos».',
      effects: [{ grantFact: 'fa-bertulfo-sabia' }],
      points: 30,
    },
  ],

  secrets: [
    { id: 'se-bertulfo', characterId: 'ch-bertulfo', text: 'El preboste sabía que si el conde terminaba su investigación, él mismo, canciller de Flandes, sería declarado siervo del conde. Prefirió un conde muerto a un señor.', revealedWhen: { fact: 'fa-bertulfo-sabia' }, points: 25 },
    { id: 'se-tancmaro', characterId: 'ch-tancmaro', text: 'Tancmaro alentó la acusación de servidumbre para hundir a sus enemigos; no sabía que con ello firmaba la sentencia del conde.', revealedWhen: { asked: 'q-tancmaro' }, points: 15 },
  ],

  interrogations: [
    {
      id: 'in-bertulfo',
      characterId: 'ch-bertulfo',
      setting: 'En su casa del claustro, entre libros y candelabros. Los sitiadores ya rodean el castillo; él actúa como si nada.',
      opening: [{ text: 'Un crimen horrible, cometido por jóvenes exaltados. Yo soy un hombre de Iglesia. Pregunte, y vaya en paz.' }],
      topics: [
        {
          id: 'tp-bertulfo-noche',
          label: 'Aquella noche',
          kind: 'alibi',
          questions: [
            {
              id: 'q-bertulfo-noche',
              prompt: '¿Dónde estaba usted la noche anterior al crimen?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-bertulfo-dormia', text: 'Aquí, durmiendo, como un viejo que soy. No recibí a nadie.', tone: 'lie' }] }],
            },
            {
              id: 'q-bertulfo-muerte',
              prompt: '¿Qué hizo al saber la muerte del conde?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-bertulfo-llora', text: 'Llorar. Lloré a mi señor como un hijo. Yo no sabía nada de lo que tramaban mis sobrinos.', tone: 'lie' }] }],
            },
          ],
        },
        {
          id: 'tp-bertulfo-linaje',
          label: 'El linaje',
          kind: 'personal',
          questions: [
            {
              id: 'q-bertulfo-siervos',
              prompt: '¿Es cierto que el conde iba a declarar siervos a los Erembaldos?',
              kind: 'ask',
              requires: { fact: 'fa-servidumbre' },
              responses: [{ lines: [{ text: 'Calumnias de Tancmaro, que nos odia. Somos libres desde siempre. ¿Un canciller de Flandes, siervo? Ridículo.', tone: 'evasion' }] }],
            },
            {
              id: 'q-bertulfo-final',
              prompt: 'Fromold le vio recibir a los conjurados a medianoche, y Borsiard recuerda la palabra que les dio.',
              kind: 'confront',
              requires: { all: [{ fact: 'fa-reunion' }, { fact: 'fa-bertulfo-sabia' }] },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'El preboste mira por la ventana hacia las tiendas de los sitiadores.' },
                    { text: '¿Siervo? ¿Yo? ¿Mis sobrinos, los hijos de mis hermanas, siervos de un danés? Antes la muerte. La suya o la nuestra.', tone: 'admission' },
                  ],
                  effects: [{ setFlag: 'bertulfo-admite' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-borsiard',
      characterId: 'ch-borsiard',
      setting: 'En la torre de San Donaciano, entre los sitiados. Tiene la espada en las rodillas y no se la quita de encima.',
      opening: [{ text: 'Sí, fui yo. ¿Qué más quieres saber, escribano?' }],
      topics: [
        {
          id: 'tp-borsiard',
          label: 'El golpe',
          kind: 'events',
          questions: [
            {
              id: 'q-borsiard-por-que',
              prompt: '¿Por qué lo hizo?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Quemó mi casa por una riña con Tancmaro, que me ha robado más que yo a él. Y quería hacernos siervos a todos. A mí. A mis hijos.', tone: 'truth' }] }],
            },
            {
              id: 'q-borsiard-quien',
              prompt: '¿Quién más lo sabía?',
              kind: 'press',
              requires: { asked: 'q-borsiard-por-que' },
              responses: [{ lines: [{ text: 'Todos los que estábamos. Pregunte a quien abrió la puerta, si lo encuentra. Yo no doy nombres.', tone: 'evasion' }] }],
            },
            {
              id: 'q-borsiard-tio',
              prompt: 'Su tío dice que no sabía nada y que lloró al conde.',
              kind: 'press',
              requires: { fact: 'fa-reunion' },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Borsiard se ríe con ganas por primera vez.' },
                    { id: 'ln-borsiard-palabra', text: '¿Llorar? La noche antes nos cogió las manos uno a uno y nos dijo: «Haced lo que tenéis que hacer, que yo os protegeré a todos ante el rey y ante el Papa». Que llore ahora.', tone: 'truth' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-isaac',
      characterId: 'ch-isaac',
      setting: 'Preso en Thérouanne, con el hábito de monje todavía puesto. Tiembla.',
      opening: [{ text: 'Yo no maté a nadie. Yo no toqué al conde.' }],
      topics: [
        {
          id: 'tp-isaac',
          label: 'La puerta',
          kind: 'events',
          questions: [
            {
              id: 'q-isaac-puerta',
              prompt: 'Falta su llave de la puerta del claustro.',
              kind: 'confront',
              requires: { fact: 'fa-isaac-puerta' },
              responses: [
                {
                  lines: [
                    { text: 'La abrí. Me dijeron que solo iban a asustarle, a obligarle a dejar el pleito. Luego vi las espadas…', tone: 'admission' },
                    { text: 'El preboste me juró que no nos pasaría nada. Él lo arregló todo la noche antes, en su casa.', tone: 'admission' },
                  ],
                  effects: [{ grantFact: 'fa-reunion' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-galberto',
      characterId: 'ch-galberto',
      setting: 'En una esquina del claustro, escribiendo en sus tablillas. Las borra y vuelve a escribir.',
      opening: [{ text: 'Escribo porque si no, nadie recordará cómo fue. Pregunte.' }],
      topics: [
        {
          id: 'tp-galberto',
          label: 'Lo que vio',
          kind: 'events',
          questions: [
            {
              id: 'q-galberto-isaac',
              prompt: '¿Falta alguien en el castillo desde el crimen?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'El camarero, Isaac. Desapareció esa misma mañana, antes de que cerraran las puertas. Su aposento está revuelto.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-fromold',
      characterId: 'ch-fromold',
      setting: 'Escondido en casa de un canónigo amigo, con la puerta atrancada.',
      opening: [{ text: 'Si me hubiera levantado a tiempo, estaría muerto junto al conde. Dios me retrasó.' }],
      topics: [
        {
          id: 'tp-fromold',
          label: 'La noche anterior',
          kind: 'events',
          questions: [
            {
              id: 'q-fromold-noche',
              prompt: '¿Vio algo la noche antes del crimen?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { id: 'ln-fromold-reunion', text: 'Desde mi ventana se ve la casa del preboste. A medianoche entraron Borsiard, Isaac y otros cuatro caballeros. Salieron tarde. En la puerta, el preboste les dijo: «Id tranquilos, que yo respondo por vosotros».', tone: 'truth' },
                  ],
                  effects: [{ unlockTimelineEvent: 'te-reunion' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-tancmaro',
      characterId: 'ch-tancmaro',
      setting: 'En el campamento de los sitiadores, junto a una hoguera.',
      opening: [{ text: 'Ya os lo dije. Siervos y traidores. Ahora, además, asesinos.' }],
      topics: [
        {
          id: 'tp-tancmaro',
          label: 'Los Erembaldos',
          kind: 'other',
          questions: [
            {
              id: 'q-tancmaro',
              prompt: '¿Qué pasó entre usted y Borsiard?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Guerra. Me quemó granjas y yo a él. El conde nos llamó a los dos al orden y castigó a Borsiard quemándole la casa. Y yo le conté al conde lo que todo el mundo sabía del abuelo de los Erembaldos.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto a la muerte (alba del 2 de marzo de 1127)
  timeline: [
    { id: 'te-pleito', t: -43200, display: 'Febrero de 1127', title: 'El conde ordena investigar el linaje de los Erembaldos', description: 'Si eran siervos, pertenecerían al conde.', characters: ['ch-carlos', 'ch-bertulfo'], key: true },
    { id: 'te-quema', t: -10080, display: 'Finales de febrero', title: 'El conde manda quemar la casa de Borsiard', description: 'Por su guerra con Tancmaro.', characters: ['ch-carlos', 'ch-borsiard'], location: 'lo-casa-borsiard', key: true },
    { id: 'te-reunion', t: -360, display: '1 de marzo, medianoche', title: 'Los conjurados se reúnen en casa del preboste', description: '«Yo respondo por vosotros».', characters: ['ch-bertulfo', 'ch-borsiard', 'ch-isaac'], location: 'lo-casa-preboste', key: true },
    { id: 'te-falso-duerme', t: -300, display: '1 de marzo, noche', title: 'El preboste duerme y no recibe a nadie', description: 'Según Bertulfo.', characters: ['ch-bertulfo'], veracity: 'false', claimedBy: 'ch-bertulfo' },
    { id: 'te-muerte', t: 0, display: '2 de marzo, al alba', title: 'Borsiard mata al conde en la tribuna de San Donaciano', description: 'Entraron por la puerta del claustro.', characters: ['ch-carlos', 'ch-borsiard'], location: 'lo-tribuna', key: true },
    { id: 'te-huida', t: 120, display: '2 de marzo, mañana', title: 'Isaac huye de Brujas disfrazado de monje', description: 'Antes de que cierren las puertas.', characters: ['ch-isaac'], key: true },
    { id: 'te-asedio', t: 10080, display: 'Marzo de 1127', title: 'Los barones sitian a los conjurados en el castillo y la torre', description: 'Galberto lo apunta todo.', characters: ['ch-galberto', 'ch-borsiard'], location: 'lo-castillo', key: true },
  ],

  accusation: {
    motives: [
      { id: 'mo-libertad', label: 'Impedir que el conde declarara siervos a los Erembaldos y les quitara cargos, tierras y libertad', availableWhen: { fact: 'fa-servidumbre' } },
      { id: 'mo-casa', label: 'Vengar la casa quemada de Borsiard', availableWhen: { fact: 'fa-casa-quemada' } },
      { id: 'mo-trono', label: 'Poner a otro conde en Flandes' },
      { id: 'mo-robo', label: 'Robar el tesoro del conde' },
    ],
    methods: [
      { id: 'me-conjura', label: 'Conjura acordada la víspera en casa del preboste: el camarero abrió la puerta del claustro y Borsiard le golpeó en la tribuna', availableWhen: { all: [{ fact: 'fa-reunion' }, { fact: 'fa-isaac-puerta' }] } },
      { id: 'me-arrebato', label: 'Un arrebato de Borsiard, solo, al ver al conde' },
      { id: 'me-sicarios', label: 'Sicarios extranjeros pagados por Tancmaro' },
      { id: 'me-veneno', label: 'Veneno en el vino de la misa' },
    ],
  },

  solution: {
    culprits: ['ch-bertulfo', 'ch-borsiard'],
    motive: 'mo-libertad',
    method: 'me-conjura',
    proof: ['ev-llaves', 'ev-servidumbre', 'ev-galberto'],
    whatHappened:
      'El conde Carlos el Bueno fue asesinado por una conjura de los Erembaldos encabezada por el preboste Bertulfo, canciller de Flandes. El conde había mandado investigar si el clan descendía de siervos: si se probaba, todos ellos, con sus cargos y sus tierras, pasarían a pertenecerle. Además había hecho quemar la casa de Borsiard, sobrino del preboste. La víspera, a medianoche, Bertulfo reunió en su casa a Borsiard, al camarero Isaac y a otros caballeros, y les prometió protección. Al alba, Isaac abrió con su llave la puerta del claustro a la tribuna; entraron con las espadas bajo las capas y Borsiard golpeó al conde de frente mientras rezaba y repartía limosnas.',
    reconstruction: [
      'Febrero: el conde ordena investigar el linaje servil de los Erembaldos.',
      'Finales de febrero: manda quemar la casa de Borsiard.',
      '1 de marzo, medianoche: reunión en casa del preboste; Bertulfo promete protegerlos.',
      'Al alba, Isaac abre con su llave la puerta del claustro a la tribuna.',
      'Los conjurados entran con las espadas bajo las capas. Borsiard golpea al conde mientras reza.',
      'Isaac huye disfrazado de monje; los demás se encierran en el castillo.',
      'Los barones los sitian; Galberto lo apunta todo.',
    ],
    decisiveEvidence: ['ev-tribuna', 'ev-galberto', 'ev-servidumbre', 'ev-llaves'],
    alibiTruths: [
      { characterId: 'ch-bertulfo', truth: 'No dormía: a medianoche reunió a los conjurados en su casa y les prometió protección.' },
      { characterId: 'ch-isaac', truth: 'No huyó por miedo a una calumnia: abrió la puerta del claustro a los asesinos.' },
    ],
  },

  endings: [
    {
      id: 'en-galberto',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { flag: 'bertulfo-admite' } },
      outcome: 'success',
      title: 'Lo que escribió Galberto',
      text: 'El preboste huye del castillo de noche, pero lo atrapan y lo ajustician en Ypres. Isaac muere en la horca. Borsiard, tras semanas de asedio en la torre, es ejecutado. Los demás conjurados son arrojados desde lo alto de la torre de Brujas. Galberto termina su diario: es lo único que queda de aquella primavera, y gracias a él sabemos quién dio el golpe y quién lo ordenó.',
    },
    {
      id: 'en-exito',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' },
      outcome: 'success',
      title: 'La cabeza y el brazo',
      text: 'Los barones juzgan al brazo y a la cabeza de la conjura. Flandes tendrá un conde nuevo antes del verano.',
    },
    { id: 'en-borsiard', when: { culprit: 'ch-borsiard' }, outcome: 'partial', title: 'Solo el brazo', text: 'Borsiard paga por su espada. El preboste, que juró no saber nada, vuelve a su claustro y sigue sellando documentos.' },
    { id: 'en-tancmaro', when: { culprit: 'ch-tancmaro' }, outcome: 'failure', title: 'El enemigo equivocado', text: 'Acusáis al enemigo de los Erembaldos, que estaba fuera de Brujas. El clan respira, y la verdad se queda en unas tablillas que nadie lee.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Un crimen sin cabeza', text: 'Se habla de jóvenes exaltados y de mala suerte. El clan conserva su libertad, y Brujas aprende a no preguntar por el abuelo de nadie.' },
  ],

  hints: [
    {
      id: 'hl-puerta',
      topic: 'Por dónde entraron',
      relevantWhen: { not: { fact: 'fa-isaac-puerta' } },
      steps: ['Mira la tribuna: ¿qué puerta estaba abierta?', '¿Falta alguien en el castillo? Pregunta a Galberto.', 'Busca en el aposento del que falta.'],
    },
    {
      id: 'hl-cabeza',
      topic: 'Quién lo decidió',
      relevantWhen: { not: { fact: 'fa-reunion' } },
      steps: ['Un golpe así se prepara. ¿Dónde se reunieron?', 'Alguien que vive enfrente de la casa del preboste estaba despierto.', 'Pregunta a Fromold por la noche anterior.'],
    },
  ],

  objectives: [
    { id: 'ob-motivo', text: 'Averigua qué iba a hacer el conde con los Erembaldos.', completeWhen: { fact: 'fa-servidumbre' }, points: 20 },
    { id: 'ob-cabeza', text: 'Demuestra que el preboste sabía.', completeWhen: { fact: 'fa-bertulfo-sabia' }, points: 30 },
    { id: 'ob-isaac', text: 'Encuentra al que abrió la puerta.', completeWhen: { fact: 'fa-isaac-huye' }, points: 15, hidden: true },
  ],

  assets: [],
};

export default caseFile;
