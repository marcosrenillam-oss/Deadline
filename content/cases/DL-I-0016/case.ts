import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-I-0016 · LA ESCALERA DE MADERA
 * Hopewell (Nueva Jersey), 1932-1934 · Secuestro · Caso real · Unidad Especial
 *
 * Caso real: el secuestro del hijo de Charles y Anne Lindbergh y la
 * investigación que, dos años y medio después, llegó a Bruno Richard
 * Hauptmann siguiendo los billetes del rescate y la madera de una escalera.
 * Lo documentado sigue el juicio de Flemington; las conversaciones del
 * investigador son una recreación.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-I-0016',
  contentVersion: 1,
  mode: 'individual',
  title: 'La escalera de madera',
  subtitle: 'Se llevan de su cuna al hijo del hombre más famoso del mundo',
  origin: 'real',
  historical: {
    documented: [
      'La noche del 1 de marzo de 1932, Charles Augustus Lindbergh Jr., de veinte meses, hijo del aviador Charles Lindbergh, fue secuestrado de su habitación en la casa familiar de Hopewell (Nueva Jersey). En el alféizar quedó una nota que pedía 50.000 dólares, con un símbolo de dos círculos entrelazados.',
      'Bajo la ventana había una escalera de madera hecha a mano, en tres tramos, con un larguero roto.',
      'Un profesor jubilado del Bronx, John F. Condon («Jafsie»), se ofreció como intermediario. Habló con un hombre de acento alemán, «Cemetery John», y el 2 de abril le pagó el rescate en el cementerio de St. Raymond, en certificados de oro con los números anotados.',
      'El 12 de mayo de 1932 se encontró el cuerpo del niño en un bosque a pocos kilómetros de la casa. Había muerto la misma noche del secuestro.',
      'Una criada de la familia de la señora Lindbergh, Violet Sharp, se suicidó tras ser interrogada; después se comprobó que no tenía relación con el crimen.',
      'En septiembre de 1934, un empleado de gasolinera anotó la matrícula de un cliente que pagó con un certificado de oro del rescate: era Bruno Richard Hauptmann, carpintero alemán del Bronx. En su garaje había 14.600 dólares del rescate.',
      'El experto en maderas Arthur Koehler demostró que un larguero de la escalera procedía de una tabla del desván de Hauptmann. En el interior de un armario de su casa estaban escritos la dirección y el teléfono de Condon.',
      'Hauptmann dijo que el dinero se lo había dejado un amigo, Isidor Fisch, que había vuelto a Alemania y muerto. Fue condenado en Flemington en 1935 y ejecutado el 3 de abril de 1936.',
    ],
    hypotheses: [
      'Hauptmann sostuvo su inocencia hasta el final; algunos autores han defendido que era inocente o que tuvo cómplices.',
      'Cómo supo el secuestrador en qué habitación dormía el niño aquella noche, que no era la habitual de la familia en esa casa, sigue discutiéndose.',
    ],
    dramatized: [
      'Las conversaciones del investigador y la redacción concreta de informes y notas son una recreación; el socio de Fisch es un personaje de síntesis.',
      'El caso evita detalles del estado del niño por respeto.',
      'Los retratos son recreaciones artísticas.',
    ],
    documentedResolution:
      'Bruno Richard Hauptmann fue condenado por el secuestro y la muerte de Charles Lindbergh Jr. y ejecutado el 3 de abril de 1936.',
    sources: ['State of New Jersey v. Bruno Richard Hauptmann, actas del juicio (1935)', 'Jim Fisher, The Lindbergh Case (1987)', 'Arthur Koehler, «Techniques Used in Tracing the Lindbergh Kidnaping Ladder», Journal of Criminal Law and Criminology (1937)'],
  },
  era: 'c20',
  eraLabel: 'Nueva Jersey, 1932',
  year: 1932,
  location: { city: 'Hopewell', place: 'Casa de los Lindbergh', country: 'Estados Unidos' },
  category: 'kidnapping',
  difficulty: 'special-unit',
  keywords: ['Lindbergh', 'secuestro', 'Hauptmann', 'Jafsie', 'escalera', 'certificados de oro', 'Koehler', 'caso real'],
  ambience: { music: 'london-1987-rain', mood: 'cold' },
  maxHints: 4,

  briefing: {
    incidentDisplay: 'Martes, 1 de marzo de 1932 · 21:00',
    summary:
      'Alguien ha subido por una escalera hasta la habitación del hijo de Charles Lindbergh y se lo ha llevado de su cuna. En el alféizar hay una nota que pide 50.000 dólares. Bajo la ventana, una escalera de madera tosca, rota.',
    context:
      'Toda América busca al niño. La Policía del Estado de Nueva Jersey le incorpora al equipo del coronel Schwarzkopf. Habrá falsos secuestradores, videntes y estafadores. Siga lo único que no miente: el dinero y la madera.',
    background:
      'Lindbergh cruzó el Atlántico en solitario en 1927 y es el hombre más famoso del mundo. Su casa nueva de Hopewell está en un bosque aislado; la familia solo pasa allí los fines de semana.',
    victim: 'ch-nino',
    initialFacts: [],
    initialEvidence: ['ev-nota', 'ev-escalera', 'ev-gow'],
    initialTimeline: ['te-secuestro'],
  },

  characters: [
    {
      id: 'ch-nino',
      portrait: 'pt-nino',
      name: 'Charles A. Lindbergh Jr.',
      look: { hair: 'short' },
      role: 'victim',
      age: 1,
      ageLabel: '20 meses',
      occupation: 'Hijo de los Lindbergh',
      appearance:
        'a smiling 20-month-old American toddler in 1932, round face, fair curly hair, white knitted sleeping suit, bright eyes, studio photograph',
      summary: 'Rubio, de rizos, con un pequeño resfriado esa noche.',
      biography: 'Primer hijo de Charles y Anne Morrow Lindbergh. El país entero conoce su cara por las fotografías de los periódicos.',
      personality: ['Risueño'],
    },
    {
      id: 'ch-hauptmann',
      portrait: 'pt-hauptmann',
      name: 'Bruno Richard Hauptmann',
      look: { hair: 'short' },
      role: 'suspect',
      age: 35,
      occupation: 'Carpintero',
      appearance:
        'a 35-year-old German immigrant carpenter in New York in 1934, gaunt angular face, high cheekbones, light brown hair combed back, cleft chin, dark suit and tie, cold pale eyes',
      summary: 'Un carpintero alemán que dejó de trabajar en 1932.',
      biography: 'Entró ilegalmente en Estados Unidos en 1923; en Alemania tenía antecedentes por robo. Carpintero hábil. Desde la primavera de 1932 no trabaja: dice que vive de la bolsa.',
      personality: ['Frío', 'Orgulloso', 'Hermético'],
      relationToVictim: 'Ninguna conocida',
      motive: { text: 'Gastó el dinero del rescate.', visibleWhen: { fact: 'fa-garaje' } },
      alibi: { claim: 'El 1 de marzo estaba en el Bronx, en la panadería donde trabajaba su mujer. El dinero se lo dejó en una caja su amigo Isidor Fisch.' },
    },
    {
      id: 'ch-sharp',
      portrait: 'pt-sharp',
      name: 'Violet Sharp',
      look: { hair: 'bun' },
      role: 'suspect',
      age: 28,
      occupation: 'Criada de la familia Morrow',
      appearance:
        'a nervous 28-year-old English housemaid in 1932, pretty thin face, dark bobbed hair under a white cap, black maid’s uniform, anxious eyes',
      summary: 'Sabía que los Lindbergh se quedaban esa noche en Hopewell.',
      biography: 'Criada inglesa en casa de los Morrow, los padres de Anne Lindbergh. Esa noche salió con un hombre y se contradijo al contar con quién.',
      personality: ['Nerviosa', 'Reservada'],
      relationToVictim: 'Criada de la familia',
      motive: { text: 'Pudo pasar información a los secuestradores.', visibleWhen: { asked: 'q-sharp-noche' } },
      alibi: { claim: 'Estuvo en un cine y en un bar de carretera con un joven, Ernest Brinkert.' },
    },
    {
      id: 'ch-condon',
      portrait: 'pt-condon',
      name: 'John F. Condon («Jafsie»)',
      look: { hair: 'bald', beard: true },
      role: 'witness',
      age: 71,
      occupation: 'Profesor jubilado del Bronx',
      appearance:
        'a robust 71-year-old American retired schoolteacher in 1932, broad face, large white walrus moustache, bald head, dark overcoat and bowler hat, self-important eyes',
      summary: 'Habló con el secuestrador y le dio el dinero.',
      biography: 'Ofreció en un periódico del Bronx sus servicios como intermediario. Para su sorpresa, el secuestrador le contestó.',
      personality: ['Vanidoso', 'Valiente', 'Locuaz'],
    },
    {
      id: 'ch-gow',
      portrait: 'pt-gow',
      name: 'Betty Gow',
      look: { hair: 'bun' },
      role: 'witness',
      age: 28,
      occupation: 'Niñera',
      appearance:
        'a composed 28-year-old Scottish nursemaid in 1932, fresh open face, light brown hair in a neat bun, white nurse uniform, steady eyes',
      summary: 'Acostó al niño a las siete y media.',
      biography: 'Niñera escocesa del pequeño. Esa noche le puso una camiseta de franela que cosió ella misma para el resfriado.',
      personality: ['Serena', 'Cuidadosa'],
    },
    {
      id: 'ch-koehler',
      portrait: 'pt-koehler',
      name: 'Arthur Koehler',
      look: { hair: 'short', glasses: true },
      role: 'witness',
      age: 47,
      occupation: 'Experto en maderas del Servicio Forestal',
      appearance:
        'a meticulous 47-year-old American wood scientist in 1934, thin face, round glasses, short neat hair, three-piece suit, magnifying glass in hand',
      summary: 'Sabe leer la madera como un libro.',
      biography: 'Especialista del Laboratorio de Productos Forestales de Madison. Lleva dos años estudiando cada tabla de la escalera.',
      personality: ['Metódico', 'Paciente'],
    },
    {
      id: 'ch-socio',
      portrait: 'pt-socio',
      name: 'Socio de Isidor Fisch',
      look: { hair: 'hat' },
      role: 'witness',
      age: 45,
      occupation: 'Peletero de Nueva York',
      appearance:
        'a small 45-year-old Jewish furrier in New York in 1934, tired kind face, grey moustache, felt hat, waistcoat with a tape measure around the neck',
      summary: 'Conocía bien las cuentas de Fisch.',
      biography: 'Compartió negocio de pieles con Isidor Fisch, amigo de Hauptmann, hasta que Fisch se volvió a Alemania en 1933.',
      personality: ['Honrado', 'Melancólico'],
      appearsWhen: { asked: 'q-hauptmann-dinero' },
    },
    {
      id: 'ch-lyle',
      portrait: 'pt-lyle',
      name: 'Walter Lyle',
      look: { hair: 'hat' },
      role: 'witness',
      age: 30,
      occupation: 'Empleado de gasolinera',
      appearance:
        'a cheerful 30-year-old New York man, a gas station attendant in 1934, friendly face, peaked cap, overalls with an oil company badge',
      summary: 'Anotó una matrícula en un billete.',
      biography: 'Trabaja en una gasolinera de Lexington Avenue. Los bancos han avisado de que vigilen los certificados de oro.',
      personality: ['Desconfiado', 'Despierto'],
      appearsWhen: { fact: 'fa-billetes' },
    },
  ],

  locations: [
    { id: 'lo-casa', name: 'Casa de Hopewell', description: 'Casa nueva en un bosque aislado, con la habitación del niño en el primer piso.' },
    { id: 'lo-cementerio', name: 'Cementerio de St. Raymond, Bronx', description: 'Donde Condon entregó el rescate.' },
    { id: 'lo-hauptmann', name: 'Casa de Hauptmann', description: '1279 East 222nd Street, Bronx, con garaje y desván.', appearsWhen: { fact: 'fa-matricula' } },
  ],

  relationships: [
    { id: 're-intermediario', a: 'ch-condon', b: 'ch-hauptmann', label: 'Le entregó el rescate a «Cemetery John»', visibleWhen: { fact: 'fa-condon-armario' } },
    { id: 're-ninera', a: 'ch-gow', b: 'ch-nino', label: 'Su niñera' },
  ],

  facts: [
    { id: 'fa-nota', text: 'La nota del rescate tiene faltas propias de un alemán y una firma de dos círculos entrelazados.', important: true },
    { id: 'fa-escalera', text: 'La escalera es de fabricación casera, hecha por alguien que sabe de carpintería, con maderas de distinta procedencia.', important: true },
    { id: 'fa-acento', text: '«Cemetery John», el hombre que cobró el rescate, hablaba con acento alemán.', important: true },
    { id: 'fa-billetes', text: 'El rescate se pagó en certificados de oro con los números anotados.', important: true },
    { id: 'fa-sharp-inocente', text: 'Violet Sharp estaba de verdad con un amigo esa noche: no tuvo nada que ver.' },
    { id: 'fa-matricula', text: 'Un cliente pagó en una gasolinera con un certificado del rescate; su matrícula es la de Bruno Richard Hauptmann.', important: true },
    { id: 'fa-garaje', text: 'En el garaje de Hauptmann hay 14.600 dólares del rescate escondidos.', important: true },
    { id: 'fa-desvan', text: 'El larguero 16 de la escalera procede de una tabla del suelo del desván de Hauptmann.', important: true },
    { id: 'fa-condon-armario', text: 'Dentro de un armario de Hauptmann están escritos a lápiz la dirección y el teléfono de Condon.', important: true },
    { id: 'fa-letra', text: 'La letra de Hauptmann coincide con la de las notas del rescate, faltas incluidas.', important: true },
    { id: 'fa-fisch', text: 'Isidor Fisch, el amigo al que Hauptmann atribuye el dinero, se fue a Alemania en diciembre de 1933, enfermo y sin dinero, y murió allí.' },
  ],

  evidence: [
    {
      id: 'ev-nota',
      kind: 'letter',
      title: 'Nota del alféizar',
      dated: '1 de marzo de 1932',
      source: 'Habitación del niño',
      summary: 'Lo que dejó el secuestrador.',
      related: { characters: ['ch-nino'], locations: ['lo-casa'], events: ['te-secuestro'] },
      body: [
        {
          type: 'handwritten',
          text: '{{dt-nota-texto|Dear Sir! Have 50.000$ redy 25.000$ in 20$ bills 15.000$ in 10$ bills and 10.000$ in 5$ bills. After 2-4 days we will inform you were to deliver the mony.}} We warn you for making anyding public or for notify the police. The child is in gut care.',
          author: 'Sin firma',
        },
        { type: 'paragraph', text: '{{dt-nota-simbolo|Abajo, un dibujo: dos círculos azules entrelazados, con el centro rojo y tres agujeros.}}' },
      ],
      details: [
        { id: 'dt-nota-texto', label: '«Gut care», «anyding»', description: 'Las faltas son las de alguien cuya lengua materna es el alemán.', effects: [{ grantFact: 'fa-nota' }], points: 15 },
        { id: 'dt-nota-simbolo', label: 'La firma de los círculos', description: 'Un símbolo para que solo el verdadero secuestrador pueda demostrar que lo es.', effects: [], points: 10 },
      ],
      decisive: true,
    },
    {
      id: 'ev-escalera',
      kind: 'physical',
      title: 'La escalera de madera',
      source: 'Bajo la ventana de la habitación del niño',
      summary: 'Tres tramos, un larguero roto.',
      related: { characters: [], locations: ['lo-casa'], events: ['te-secuestro'] },
      body: [
        {
          type: 'typed',
          text: '{{dt-esc-casera|Hecha a mano, en tres tramos que encajan con espigas: la obra de alguien que sabe trabajar la madera, con prisa.}} El larguero del primer tramo está partido.',
        },
        { type: 'typed', text: '{{dt-esc-larguero|Uno de los largueros, el número 16, es de pino del sur y tiene cuatro agujeros de clavo cuadrados que no sirven para nada en la escalera: es madera reutilizada de otra obra.}}' },
      ],
      details: [
        { id: 'dt-esc-casera', label: 'Obra de un carpintero', description: 'Quien hizo la escalera sabe de carpintería.', effects: [{ grantFact: 'fa-escalera' }], points: 15 },
        { id: 'dt-esc-larguero', label: 'El larguero 16', description: 'Tiene agujeros de clavos que no corresponden a la escalera: viene de otra parte.', effects: [], points: 15 },
      ],
      decisive: true,
    },
    {
      id: 'ev-gow',
      kind: 'statement',
      title: 'Declaración de la niñera Betty Gow',
      source: 'Policía del Estado de Nueva Jersey',
      summary: 'La última vez que lo vio.',
      related: { characters: ['ch-gow', 'ch-nino'], locations: ['lo-casa'], events: ['te-acuesta', 'te-secuestro'] },
      body: [
        { type: 'typed', text: '—A las siete y media le acosté. Tenía catarro, y le puse una camiseta de franela que le cosí esa tarde. Cerré las contraventanas, pero una no cerraba bien.' },
        { type: 'typed', text: '—A las diez subí a verle. La cuna estaba vacía. Pensé que lo tenía su madre.' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-acuesta' }],
      details: [],
    },
    {
      id: 'ev-condon',
      kind: 'statement',
      title: 'Relato de Condon sobre los cementerios',
      source: 'John F. Condon',
      summary: 'Lo que habló con «Cemetery John».',
      autoDiscoverWhen: { asked: 'q-condon' },
      related: { characters: ['ch-condon'], locations: ['lo-cementerio'], events: ['te-rescate'] },
      body: [
        {
          type: 'typed',
          text: '—{{dt-con-acento|Hablamos una hora en el cementerio de Woodlawn, sentados en un banco. Acento alemán, muy marcado. Me preguntó: «¿Me ahorcarán si el niño está muerto?».}}',
        },
        { type: 'typed', text: '—{{dt-con-billetes|El 2 de abril le di 50.000 dólares en St. Raymond. Casi todo en certificados de oro, con cada número anotado por los bancos.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-rescate' }],
      details: [
        { id: 'dt-con-acento', label: 'Acento alemán', description: 'El que cobró el rescate era alemán.', effects: [{ grantFact: 'fa-acento' }], points: 15 },
        { id: 'dt-con-billetes', label: 'Billetes anotados', description: 'Cada certificado de oro del rescate puede reconocerse.', effects: [{ grantFact: 'fa-billetes' }], points: 15 },
      ],
      decisive: true,
    },
    {
      id: 'ev-gasolinera',
      kind: 'document',
      title: 'Certificado de oro de 10 dólares',
      dated: '15 de septiembre de 1934',
      source: 'Gasolinera de Lexington Avenue',
      summary: 'Con una matrícula escrita en el margen.',
      autoDiscoverWhen: { asked: 'q-lyle' },
      related: { characters: ['ch-lyle', 'ch-hauptmann'], locations: [], events: ['te-gasolinera'] },
      body: [
        { type: 'typed', text: 'Certificado de oro de 10 dólares, serie que figura en la lista del rescate Lindbergh.' },
        { type: 'handwritten', text: '{{dt-gas-matricula|4U-13-41 N.Y.}}', author: 'Anotado por W. Lyle' },
        { type: 'typed', text: '{{dt-gas-titular|La matrícula corresponde a un Dodge azul a nombre de Richard Hauptmann, 1279 East 222nd Street, Bronx.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-gasolinera' }],
      details: [
        { id: 'dt-gas-matricula', label: 'Una matrícula', description: 'El empleado anotó la matrícula del cliente en el billete.', effects: [], points: 10 },
        { id: 'dt-gas-titular', label: 'Richard Hauptmann', description: 'El billete del rescate lo gastó Hauptmann.', effects: [{ grantFact: 'fa-matricula' }], points: 20 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-registro',
      kind: 'report',
      title: 'Registro de la casa de Hauptmann',
      dated: 'Septiembre de 1934',
      source: 'Policía de Nueva York y del Estado de Nueva Jersey',
      summary: 'El garaje, el armario y el desván.',
      autoDiscoverWhen: { fact: 'fa-matricula' },
      related: { characters: ['ch-hauptmann'], locations: ['lo-hauptmann'], events: ['te-registro'] },
      body: [
        { type: 'heading', text: '1279 EAST 222ND STREET' },
        { type: 'typed', text: '{{dt-reg-garaje|En el garaje, en un hueco de la pared y en una lata, 14.600 dólares en certificados de oro de la lista del rescate.}}' },
        { type: 'typed', text: '{{dt-reg-armario|Dentro de la puerta de un armario, escritos a lápiz: la dirección y el teléfono de John F. Condon, «2974 Decatur, Sedgwick 3-7154».}}' },
        { type: 'typed', text: '{{dt-reg-desvan|En el suelo del desván falta un trozo de una tabla de pino del sur; los clavos del resto están clavados en las vigas.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-registro' }],
      details: [
        { id: 'dt-reg-garaje', label: '14.600 dólares', description: 'Hauptmann guardaba una parte enorme del rescate.', effects: [{ grantFact: 'fa-garaje' }], points: 20 },
        { id: 'dt-reg-armario', label: 'El teléfono de Jafsie', description: 'Hauptmann tenía apuntado el teléfono del intermediario.', effects: [{ grantFact: 'fa-condon-armario' }], points: 20 },
        { id: 'dt-reg-desvan', label: 'Una tabla cortada', description: 'Falta un trozo de tabla en el suelo del desván.', effects: [], points: 15 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-koehler',
      kind: 'report',
      title: 'Informe de Arthur Koehler sobre el larguero 16',
      source: 'Laboratorio de Productos Forestales',
      summary: 'De dónde salió la madera.',
      autoDiscoverWhen: { asked: 'q-koehler' },
      related: { characters: ['ch-koehler', 'ch-hauptmann'], locations: ['lo-hauptmann'], events: [] },
      body: [
        {
          type: 'typed',
          text: '{{dt-koe-encaje|Puesto el larguero 16 en el hueco del suelo del desván, sus cuatro agujeros de clavo coinciden exactamente con los agujeros de las vigas. Los anillos de crecimiento continúan los de la tabla vecina: son la misma tabla, cortada.}}',
        },
        { type: 'typed', text: 'Las demás maderas proceden de un almacén del Bronx donde Hauptmann compraba material.' },
        { type: 'signature', name: 'A. Koehler' },
      ],
      details: [{ id: 'dt-koe-encaje', label: 'La misma tabla', description: 'La escalera se hizo, en parte, con el suelo del desván de Hauptmann.', effects: [{ grantFact: 'fa-desvan' }], points: 25 }],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-letra',
      kind: 'report',
      title: 'Cotejo de escritura',
      source: 'Peritos calígrafos del Estado',
      summary: 'Las notas y las muestras de Hauptmann.',
      autoDiscoverWhen: { asked: 'q-hauptmann-dictado' },
      related: { characters: ['ch-hauptmann'], locations: [], events: [] },
      body: [
        {
          type: 'typed',
          text: '{{dt-let-faltas|En el dictado, Hauptmann escribe «boad» por «boat», «singnature» por «signature» y «were» por «where», las mismas faltas de las notas del rescate. La forma de la «x» y de la «t» coincide.}}',
        },
      ],
      details: [{ id: 'dt-let-faltas', label: 'Las mismas faltas', description: 'Hauptmann escribe igual que el autor de las notas del rescate.', effects: [{ grantFact: 'fa-letra' }], points: 20 }],
      decisive: true,
    },
  ],

  deductions: [
    {
      id: 'de-dinero',
      title: 'Del cementerio al garaje',
      combine: ['dt-con-billetes', 'dt-reg-garaje'],
      explanation: 'El rescate se pagó en certificados anotados, y 14.600 dólares de esa lista estaban escondidos en el garaje de Hauptmann.',
      points: 30,
    },
    {
      id: 'de-escalera',
      title: 'La madera del desván',
      combine: ['dt-esc-larguero', 'dt-koe-encaje'],
      explanation: 'El larguero 16, con agujeros de clavo que no servían a la escalera, encaja en el hueco del suelo del desván de Hauptmann: la escalera salió de su casa.',
      points: 40,
    },
    {
      id: 'de-aleman',
      title: 'Un carpintero alemán',
      combine: ['dt-nota-texto', 'dt-esc-casera'],
      explanation: 'Las notas son de alguien de lengua alemana, y la escalera, de alguien que sabe carpintería.',
      points: 20,
    },
  ],

  contradictions: [
    {
      id: 'cx-hauptmann-fisch',
      title: 'El dinero de Fisch',
      a: { line: 'ln-hauptmann-fisch' },
      b: { line: 'ln-amigo-fisch' },
      explanation: 'Hauptmann dice que el dinero se lo dejó Isidor Fisch en una caja; Fisch se fue a Alemania sin un centavo y pidió prestado para el pasaje.',
      effects: [{ grantFact: 'fa-fisch' }],
      points: 25,
    },
    {
      id: 'cx-hauptmann-condon',
      title: 'El teléfono del armario',
      a: { line: 'ln-hauptmann-condon' },
      b: { detail: 'dt-reg-armario' },
      explanation: 'Hauptmann dice que no conoce a Condon; tiene su dirección y su teléfono escritos dentro de su armario.',
      points: 25,
    },
  ],

  secrets: [
    { id: 'se-sharp', characterId: 'ch-sharp', text: 'Violet Sharp mintió al principio sobre su cita de aquella noche porque le avergonzaba haber salido con un desconocido. Se suicidó antes de que se comprobara que decía la verdad.', revealedWhen: { fact: 'fa-sharp-inocente' }, points: 15 },
    { id: 'se-hauptmann', characterId: 'ch-hauptmann', text: 'Hauptmann dejó su trabajo de carpintero el mismo día del pago del rescate, el 2 de abril de 1932, y desde entonces vivía de «inversiones en bolsa» que perdían dinero.', revealedWhen: { fact: 'fa-garaje' }, points: 20 },
  ],

  interrogations: [
    {
      id: 'in-hauptmann',
      characterId: 'ch-hauptmann',
      setting: 'En la comisaría del distrito de Greenwich, en septiembre de 1934. Sentado muy recto, sin mirar a nadie.',
      opening: [{ text: 'No tengo nada que ver con ese niño. Soy un carpintero honrado.' }],
      topics: [
        {
          id: 'tp-hauptmann-dinero',
          label: 'El dinero',
          kind: 'other',
          questions: [
            {
              id: 'q-hauptmann-dinero',
              prompt: '¿De dónde sacó los 14.600 dólares del garaje?',
              kind: 'confront',
              requires: { fact: 'fa-garaje' },
              responses: [{ lines: [{ id: 'ln-hauptmann-fisch', text: 'Me los dejó mi amigo Isidor Fisch en una caja de zapatos antes de irse a Alemania. Se mojó en el armario, la abrí y vi el dinero. Me lo debía.', tone: 'lie' }] }],
            },
            {
              id: 'q-hauptmann-condon',
              prompt: '¿Conoce a John Condon?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-hauptmann-condon', text: 'No. No le he visto en mi vida.', tone: 'lie' }] }],
            },
            {
              id: 'q-hauptmann-dictado',
              prompt: 'Escriba lo que le voy a dictar.',
              kind: 'ask',
              requires: { fact: 'fa-matricula' },
              responses: [{ lines: [{ speaker: 'narration', text: 'Hauptmann escribe durante horas, despacio, lo que le dictan los peritos: frases de las notas del rescate.' }] }],
            },
          ],
        },
        {
          id: 'tp-hauptmann-escalera',
          label: 'La escalera',
          kind: 'other',
          questions: [
            {
              id: 'q-hauptmann-final',
              prompt: 'El larguero 16 sale de su desván. El dinero estaba en su garaje. Y la letra es la suya.',
              kind: 'confront',
              requires: { all: [{ fact: 'fa-desvan' }, { fact: 'fa-letra' }, { fact: 'fa-garaje' }] },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Hauptmann aprieta la mandíbula.' },
                    { text: 'No hice ninguna escalera. Soy un buen carpintero: esa escalera es una chapuza.', tone: 'evasion' },
                  ],
                  effects: [{ setFlag: 'hauptmann-niega' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-sharp',
      characterId: 'ch-sharp',
      setting: 'En la casa de los Morrow en Englewood, en 1932. Muy pálida.',
      opening: [{ text: 'Ya les he contado todo. ¿Por qué no me dejan en paz?' }],
      topics: [
        {
          id: 'tp-sharp',
          label: 'Aquella noche',
          kind: 'alibi',
          questions: [
            {
              id: 'q-sharp-noche',
              prompt: '¿Con quién salió la noche del 1 de marzo?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Con un joven, Ernest. Fuimos a un bar de carretera. No sé su apellido… sí lo sé, Brinkert. Perdonen, estoy nerviosa.', tone: 'evasion' }] }],
            },
            {
              id: 'q-sharp-comprobar',
              prompt: 'Comprobaremos lo que dice.',
              kind: 'press',
              requires: { asked: 'q-sharp-noche' },
              responses: [
                {
                  lines: [{ speaker: 'narration', text: 'Los testigos del bar y el propio Brinkert confirman la historia: estuvieron allí hasta medianoche.' }],
                  effects: [{ grantFact: 'fa-sharp-inocente' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-condon',
      characterId: 'ch-condon',
      setting: 'En su casa del Bronx, encantado de tener público.',
      opening: [{ text: 'Soy el único hombre en América que ha hablado con el secuestrador. Pregunte, pregunte.' }],
      topics: [
        {
          id: 'tp-condon',
          label: '«Cemetery John»',
          kind: 'events',
          questions: [
            {
              id: 'q-condon',
              prompt: '¿Cómo era el hombre del cementerio?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Delgado, de unos treinta y cinco años, con el sombrero calado y un acento alemán como para cortarlo. Se lo cuento todo con detalle.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-lyle',
      characterId: 'ch-lyle',
      setting: 'En su gasolinera, limpiándose las manos con un trapo.',
      opening: [{ text: 'Ya nadie paga con certificados de oro. Este tipo sí. Me dio mala espina.' }],
      topics: [
        {
          id: 'tp-lyle',
          label: 'El cliente',
          kind: 'events',
          questions: [
            {
              id: 'q-lyle',
              prompt: '¿Qué pasó con ese billete?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Pagó 98 centavos de gasolina con uno de diez de oro. Le dije que ya no se veían mucho y me dijo que tenía unos cien en casa. Apunté la matrícula en el billete, por si acaso.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-koehler',
      characterId: 'ch-koehler',
      setting: 'En el desván de Hauptmann, de rodillas, con el larguero 16 en las manos.',
      opening: [{ text: 'Dos años con esta escalera. Cada tabla me ha contado algo.' }],
      topics: [
        {
          id: 'tp-koehler',
          label: 'El larguero 16',
          kind: 'other',
          questions: [
            {
              id: 'q-koehler',
              prompt: '¿Encaja el larguero en algún sitio de esta casa?',
              kind: 'ask',
              requires: { fact: 'fa-garaje' },
              responses: [{ lines: [{ text: 'Mire ese hueco del suelo. Póngalo ahí. Ahora meta los clavos viejos por sus agujeros… ¿lo ve? Lo he puesto por escrito.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-amigo',
      characterId: 'ch-gow',
      setting: 'En la casa de Hopewell, en 1932, antes de volver a Escocia.',
      opening: [{ text: 'Era un niño tan bueno. Pregunte lo que necesite.' }],
      topics: [
        {
          id: 'tp-gow',
          label: 'La noche',
          kind: 'events',
          questions: [
            {
              id: 'q-gow-noche',
              prompt: '¿Por qué esa noche se quedaron en Hopewell?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Por el resfriado del niño. Normalmente volvíamos a casa de los Morrow el lunes. Esa vez nos quedamos hasta el martes. Muy pocos lo sabían.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-fisch',
      characterId: 'ch-socio',
      setting: 'En una peletería del Lower East Side, entre pieles colgadas.',
      opening: [{ text: 'Isidor era mi socio. Pobre hombre. Pregunte.' }],
      topics: [
        {
          id: 'tp-fisch',
          label: 'Isidor Fisch',
          kind: 'person',
          about: 'ch-hauptmann',
          questions: [
            {
              id: 'q-fisch',
              prompt: '¿Tenía dinero Isidor Fisch?',
              kind: 'ask',
              requires: { asked: 'q-hauptmann-dinero' },
              responses: [{ lines: [{ id: 'ln-amigo-fisch', text: '¿Isidor? Estaba tuberculoso y sin un centavo. Para el pasaje a Alemania tuvo que pedir prestado. Si hubiera tenido una caja con miles de dólares, se habría curado en un sanatorio.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto al secuestro (hacia las 21:00 del 1 de marzo de 1932)
  timeline: [
    { id: 'te-acuesta', t: -90, display: '1 de marzo, 19:30', title: 'Betty Gow acuesta al niño', description: 'Con una camiseta de franela recién cosida.', characters: ['ch-gow', 'ch-nino'], location: 'lo-casa', key: true },
    { id: 'te-secuestro', t: 0, display: '1 de marzo, hacia las 21:00', title: 'Secuestro del niño por la ventana con una escalera', description: 'Una nota en el alféizar.', characters: ['ch-nino'], location: 'lo-casa', key: true },
    { id: 'te-falso-panaderia', t: 10, display: '1 de marzo, noche', title: 'Hauptmann está en la panadería del Bronx', description: 'Según Hauptmann.', characters: ['ch-hauptmann'], veracity: 'false', claimedBy: 'ch-hauptmann' },
    { id: 'te-rescate', t: 46080, display: '2 de abril de 1932', title: 'Condon paga el rescate en el cementerio de St. Raymond', description: 'Certificados de oro anotados.', characters: ['ch-condon'], location: 'lo-cementerio', key: true },
    { id: 'te-gasolinera', t: 1306080, display: '15 de septiembre de 1934', title: 'Un billete del rescate en una gasolinera de Nueva York', description: 'Con una matrícula anotada.', characters: ['ch-lyle'], key: true },
    { id: 'te-registro', t: 1313280, display: 'Septiembre de 1934', title: 'Registro de la casa de Hauptmann: dinero, teléfono y desván', description: '14.600 dólares en el garaje.', characters: ['ch-hauptmann'], location: 'lo-hauptmann', key: true },
  ],

  accusation: {
    suspects: ['ch-hauptmann', 'ch-sharp'],
    motives: [
      { id: 'mo-rescate', label: 'Cobrar 50.000 dólares de rescate del hombre más famoso del país', availableWhen: { fact: 'fa-garaje' } },
      { id: 'mo-venganza', label: 'Vengarse de Lindbergh' },
      { id: 'mo-encargo', label: 'Un encargo de una banda organizada' },
      { id: 'mo-informacion', label: 'Vender información a los secuestradores', availableWhen: { asked: 'q-sharp-noche' } },
    ],
    methods: [
      { id: 'me-escalera', label: 'Subió con una escalera hecha por él, en parte con madera de su desván, se llevó al niño y cobró el rescate en el cementerio', availableWhen: { all: [{ fact: 'fa-desvan' }, { fact: 'fa-acento' }] } },
      { id: 'me-dentro', label: 'Alguien de la casa le dio el niño por la puerta' },
      { id: 'me-banda', label: 'Una banda de Chicago con un coche esperando' },
      { id: 'me-coche', label: 'Se lo llevaron en coche desde el jardín' },
    ],
  },

  solution: {
    culprits: ['ch-hauptmann'],
    motive: 'mo-rescate',
    method: 'me-escalera',
    proof: ['ev-koehler', 'ev-registro', 'ev-gasolinera'],
    whatHappened:
      'Bruno Richard Hauptmann, carpintero alemán del Bronx, secuestró al hijo de los Lindbergh la noche del 1 de marzo de 1932 para cobrar un rescate. Subió a la habitación con una escalera que había fabricado él, usando en parte una tabla del suelo de su propio desván, y dejó una nota con faltas propias de su alemán. El niño murió esa misma noche. Hauptmann negoció después con Condon como «Cemetery John», con acento alemán, y cobró 50.000 dólares en certificados de oro anotados. Dejó de trabajar ese mismo día. Dos años y medio más tarde, un empleado de gasolinera anotó su matrícula en un billete del rescate; en su garaje había 14.600 dólares, en su armario el teléfono de Condon y en su desván, el hueco de la tabla del larguero 16.',
    reconstruction: [
      'Hauptmann fabrica una escalera de tres tramos, en parte con una tabla del suelo de su desván.',
      '1 de marzo de 1932, hacia las 21:00: sube a la habitación, se lleva al niño y deja la nota.',
      'El larguero se rompe al bajar. El niño muere esa noche.',
      'Marzo: Hauptmann negocia con Condon; le ve en Woodlawn como «Cemetery John».',
      '2 de abril: cobra el rescate en St. Raymond. Deja su trabajo.',
      'Septiembre de 1934: paga gasolina con un certificado del rescate; el empleado anota la matrícula.',
      'En su casa aparecen el dinero, el teléfono de Condon y el hueco de la tabla.',
    ],
    decisiveEvidence: ['ev-nota', 'ev-escalera', 'ev-condon', 'ev-gasolinera', 'ev-registro', 'ev-koehler', 'ev-letra'],
    alibiTruths: [
      { characterId: 'ch-hauptmann', truth: 'El dinero no era de Fisch, que murió sin un centavo; y la escalera salió de su desván.' },
      { characterId: 'ch-sharp', truth: 'Estaba de verdad con un amigo esa noche; no tuvo nada que ver.' },
    ],
  },

  endings: [
    {
      id: 'en-flemington',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { fact: 'fa-fisch' } },
      outcome: 'success',
      title: 'El juicio del siglo',
      text: 'En enero de 1935, en el pequeño juzgado de Flemington, Arthur Koehler encaja el larguero 16 ante el jurado y Condon señala a Hauptmann: «Es John». Hauptmann es condenado y ejecutado el 3 de abril de 1936, sin confesar. El Congreso ya había aprobado la «Ley Lindbergh», que convierte el secuestro en delito federal. Hasta hoy hay quien defiende que no actuó solo.',
    },
    {
      id: 'en-exito',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' },
      outcome: 'success',
      title: 'Madera y dinero',
      text: 'La acusación une el dinero, la letra y la madera. Hauptmann es condenado.',
    },
    { id: 'en-parcial', when: { culprit: 'correct' }, outcome: 'partial', title: 'El receptor del dinero', text: 'Probáis que Hauptmann tenía el dinero, pero no que subiera la escalera. Su defensa repite la historia de Fisch y la caja de zapatos.' },
    { id: 'en-sharp', when: { culprit: 'ch-sharp' }, outcome: 'failure', title: 'La criada', text: 'Acusáis a Violet Sharp, que tenía coartada. Su muerte pesa sobre la investigación, y el dinero del rescate sigue circulando por el Bronx.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Sin resolver', text: 'El caso se enfría. De vez en cuando aparece un certificado de oro de la lista en algún banco de Nueva York.' },
  ],

  hints: [
    {
      id: 'hl-billetes',
      topic: 'El dinero',
      relevantWhen: { not: { fact: 'fa-matricula' } },
      steps: ['El rescate se pagó de una manera especial. Habla con Condon.', 'Si los billetes estaban anotados, alguien acabará gastándolos.', 'Pregunta en la gasolinera por el certificado de oro.'],
    },
    {
      id: 'hl-madera',
      topic: 'La escalera',
      relevantWhen: { all: [{ fact: 'fa-garaje' }, { not: { fact: 'fa-desvan' } }] },
      steps: ['El larguero 16 tiene agujeros de clavo que no sirven para nada.', 'Mira el suelo del desván de Hauptmann.', 'Pide a Koehler que pruebe el larguero en el hueco.'],
    },
  ],

  objectives: [
    { id: 'ob-dinero', text: 'Sigue el rastro del rescate.', completeWhen: { fact: 'fa-garaje' }, points: 25 },
    { id: 'ob-madera', text: 'Averigua de dónde salió la madera de la escalera.', completeWhen: { fact: 'fa-desvan' }, points: 30 },
    { id: 'ob-sharp', text: 'Comprueba la coartada de Violet Sharp.', completeWhen: { fact: 'fa-sharp-inocente' }, points: 15, hidden: true },
  ],

  assets: [
    { id: 'pt-lyle', kind: 'image', src: 'portraits/ch-lyle.webp', bytes: 0, sha256: '', width: 480, height: 593, alt: 'Recreación artística del retrato de Walter Lyle.', credit: 'Recreación artística generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). No es una fotografía de la persona real.' },
    { id: 'pt-socio', kind: 'image', src: 'portraits/ch-socio.webp', bytes: 0, sha256: '', width: 480, height: 593, alt: 'Recreación artística del retrato de Socio de Isidor Fisch.', credit: 'Recreación artística generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). No es una fotografía de la persona real.' },
    { id: 'pt-koehler', kind: 'image', src: 'portraits/ch-koehler.webp', bytes: 0, sha256: '', width: 480, height: 593, alt: 'Recreación artística del retrato de Arthur Koehler.', credit: 'Recreación artística generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). No es una fotografía de la persona real.' },
    { id: 'pt-gow', kind: 'image', src: 'portraits/ch-gow.webp', bytes: 0, sha256: '', width: 480, height: 593, alt: 'Recreación artística del retrato de Betty Gow.', credit: 'Recreación artística generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). No es una fotografía de la persona real.' },
    { id: 'pt-condon', kind: 'image', src: 'portraits/ch-condon.webp', bytes: 0, sha256: '', width: 480, height: 593, alt: 'Recreación artística del retrato de John F. Condon («Jafsie»).', credit: 'Recreación artística generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). No es una fotografía de la persona real.' },
    { id: 'pt-sharp', kind: 'image', src: 'portraits/ch-sharp.webp', bytes: 0, sha256: '', width: 480, height: 593, alt: 'Recreación artística del retrato de Violet Sharp.', credit: 'Recreación artística generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). No es una fotografía de la persona real.' },
    { id: 'pt-hauptmann', kind: 'image', src: 'portraits/ch-hauptmann.webp', bytes: 0, sha256: '', width: 480, height: 593, alt: 'Recreación artística del retrato de Bruno Richard Hauptmann.', credit: 'Recreación artística generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). No es una fotografía de la persona real.' },
    { id: 'pt-nino', kind: 'image', src: 'portraits/ch-nino.webp', bytes: 0, sha256: '', width: 480, height: 593, alt: 'Recreación artística del retrato de Charles A. Lindbergh Jr..', credit: 'Recreación artística generada para DEADLINE con un modelo de imagen de pesos abiertos (Realistic Vision 5.1, CreativeML OpenRAIL-M). No es una fotografía de la persona real.' },
  ],
};

export default caseFile;
