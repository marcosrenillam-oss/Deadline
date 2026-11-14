import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-I-0009 · POLVOS PARA LIMPIAR GUIJARROS
 * Henley-on-Thames, agosto de 1751 · Envenenamiento · Caso real · Detective
 *
 * Caso real: la muerte del abogado Francis Blandy y el juicio a su hija
 * Mary, que le echó en las gachas los polvos que le mandaba su pretendiente,
 * el capitán William Cranstoun. Fue uno de los primeros juicios en que un
 * médico, Anthony Addington, presentó pruebas químicas de arsénico. Lo
 * documentado sigue el proceso; las conversaciones son una recreación.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-I-0009',
  contentVersion: 1,
  mode: 'individual',
  title: 'Polvos para limpiar guijarros',
  subtitle: 'Un abogado de pueblo enferma cada vez que su hija le sirve las gachas',
  origin: 'real',
  historical: {
    documented: [
      'Francis Blandy, abogado y secretario municipal de Henley-on-Thames, había anunciado para su única hija, Mary, una dote de 10.000 libras.',
      'En 1746 apareció el capitán William Henry Cranstoun, escocés, hijo de un lord, que la cortejó. Estaba casado en secreto en Escocia. El padre de Mary se opuso a la boda.',
      'Cranstoun envió a Mary unos polvos con la etiqueta «polvos para limpiar los guijarros escoceses» y le dijo que eran unos polvos de amor que harían que su padre aprobara la boda.',
      'En el verano de 1751 Francis Blandy enfermó repetidamente tras tomar gachas y té que le preparaba su hija. La criada Susan Gunnell y otros que probaron las sobras enfermaron también.',
      'Susan Gunnell vio un poso blanco en el fondo de la cazuela de las gachas y lo guardó. El médico Anthony Addington lo examinó y concluyó que era arsénico.',
      'Mary intentó quemar en el fuego de la cocina las cartas de Cranstoun y un papel con polvos; una criada rescató el papel, que no ardió del todo.',
      'Francis Blandy murió el 14 de agosto de 1751. Mary fue juzgada en Oxford en marzo de 1752, condenada y ahorcada el 6 de abril. Cranstoun huyó a Francia y murió ese mismo año.',
    ],
    hypotheses: [
      'Mary sostuvo hasta el final que creía que los polvos eran un filtro amoroso; nunca se ha sabido si llegó a creerlo.',
      'Se ha discutido hasta qué punto Cranstoun planeó la muerte del padre o solo quería la dote.',
    ],
    dramatized: [
      'Las conversaciones del investigador y la redacción de las cartas y notas son una recreación.',
      'Los retratos son recreaciones artísticas.',
    ],
    documentedResolution:
      'Mary Blandy fue condenada por envenenar con arsénico a su padre, Francis Blandy, con los polvos que le enviaba el capitán Cranstoun, y ahorcada en Oxford el 6 de abril de 1752. Cranstoun escapó a la justicia.',
    sources: ['The Tryal of Mary Blandy, Spinster (1752)', 'Anthony Addington, testimonio médico en el juicio (1752)', 'William Roughead (ed.), Trial of Mary Blandy, Notable British Trials (1914)'],
  },
  era: 'early-modern',
  eraLabel: 'Henley, 1751',
  year: 1751,
  location: { city: 'Henley-on-Thames', place: 'Casa de los Blandy, Hart Street', country: 'Inglaterra' },
  category: 'homicide',
  difficulty: 'detective',
  keywords: ['Mary Blandy', 'Henley', 'arsénico', 'Cranstoun', 'dote', 'gachas', 'filtro de amor', 'caso real'],
  ambience: { music: 'seville-1588', mood: 'melancholic' },
  maxHints: 4,

  briefing: {
    incidentDisplay: 'Miércoles, 14 de agosto de 1751',
    summary:
      'Francis Blandy, abogado de Henley, ha muerto tras semanas de dolores y vómitos. La servidumbre murmura que la señorita Mary le servía las gachas y el té, y que todos los que probaban las sobras acababan en la cama.',
    context:
      'El médico de la familia le pide que reúna lo que se sabe antes de que el juez de paz decida si encierra a la hija. Mary es educada, encantadora y la heredera de una dote famosa en todo el condado.',
    background:
      'El señor Blandy presumía de la dote de su hija para casarla bien. Lleva cinco años negándose a que se case con un capitán escocés del que se dicen cosas.',
    victim: 'ch-francis',
    initialFacts: [],
    initialEvidence: ['ev-sintomas', 'ev-cazuela', 'ev-papel'],
    initialTimeline: ['te-gachas', 'te-muerte'],
  },

  characters: [
    {
      id: 'ch-francis',
      name: 'Francis Blandy',
      look: { hair: 'hat' },
      role: 'victim',
      age: 62,
      occupation: 'Abogado y secretario municipal de Henley',
      appearance:
        'a stout 62-year-old Georgian English country attorney in 1750, florid face, grey powdered wig, brown coat and waistcoat, white neckcloth, shrewd but tired eyes',
      summary: 'Orgulloso de su hija y de su dote.',
      biography: 'Abogado respetado del pueblo. Viudo desde hace poco. Repite a quien quiera oírle que su Mary tendrá diez mil libras, aunque su fortuna real es bastante menor.',
      personality: ['Orgulloso', 'Testarudo', 'Cariñoso'],
    },
    {
      id: 'ch-mary',
      name: 'Mary Blandy',
      look: { hair: 'bun' },
      role: 'suspect',
      age: 31,
      occupation: 'Hija del abogado',
      appearance:
        'a 31-year-old Georgian English gentlewoman in 1751, intelligent oval face, dark hair dressed close under a small lace cap, black silk dress with a white fichu, composed sad dark eyes',
      summary: 'Lista, culta, y harta de esperar.',
      biography: 'Hija única, bien educada. Sus pretendientes se espantaban al conocer la dote real. Hace cinco años que espera casarse con el capitán Cranstoun, contra la voluntad de su padre.',
      personality: ['Inteligente', 'Serena', 'Enamorada'],
      relationToVictim: 'Su hija',
      motive: { text: 'Su padre impedía su boda con Cranstoun.', visibleWhen: { fact: 'fa-oposicion' } },
      alibi: { claim: 'Le daba a su padre unos polvos de amor que le había mandado Cranstoun para que aprobara la boda. No sabía que fueran veneno.' },
    },
    {
      id: 'ch-cranstoun',
      name: 'William Henry Cranstoun',
      look: { hair: 'short' },
      role: 'suspect',
      age: 37,
      occupation: 'Capitán del ejército, hijo de un lord escocés',
      appearance:
        'a short 37-year-old Scottish army captain in 1750, small pockmarked face, weak chin, sandy wig, red regimental coat with gold lace, ingratiating smile',
      summary: 'Bajito, picado de viruela y muy persuasivo.',
      biography: 'Hijo menor de un lord escocés, sin fortuna. Lleva años escribiendo a Mary desde Escocia. Su familia está en pleitos con una mujer que dice ser su esposa.',
      personality: ['Persuasivo', 'Mentiroso', 'Codicioso'],
      relationToVictim: 'Pretendiente rechazado de su hija',
      motive: { text: 'Quería la dote, y el padre se interponía.', visibleWhen: { fact: 'fa-casado' } },
      alibi: { claim: 'Estaba en Escocia. ¿Cómo iba a envenenar a nadie en Henley?' },
    },
    {
      id: 'ch-susan',
      name: 'Susan Gunnell',
      look: { hair: 'bun' },
      role: 'witness',
      age: 40,
      occupation: 'Criada de los Blandy',
      appearance:
        'a sturdy 40-year-old Georgian English maidservant in 1751, plain honest face, brown hair under a white mob cap, rough apron over a dark dress, watchful eyes',
      summary: 'Probó las sobras y enfermó.',
      biography: 'Lleva años sirviendo en la casa. Desconfía del capitán desde la primera visita.',
      personality: ['Observadora', 'Leal al señor'],
    },
    {
      id: 'ch-addington',
      name: 'Anthony Addington',
      look: { hair: 'hat' },
      role: 'witness',
      age: 38,
      occupation: 'Médico de Reading',
      appearance:
        'a 38-year-old Georgian English physician in 1751, intelligent open face, grey wig tied back, dark coat, white neckcloth, careful thoughtful expression',
      summary: 'Médico llamado al final, con un frasco en la mano.',
      biography: 'Médico reputado de Reading. Le llamaron cuando ya era tarde. Ha estudiado los efectos del arsénico y sabe reconocerlo.',
      personality: ['Metódico', 'Prudente'],
      appearsWhen: { evidence: 'ev-cazuela' },
    },
    {
      id: 'ch-littleton',
      name: 'Robert Littleton',
      look: { hair: 'short' },
      role: 'witness',
      age: 25,
      occupation: 'Pasante del señor Blandy',
      appearance:
        'a nervous 25-year-old Georgian English law clerk in 1751, thin earnest face, own hair tied back, plain dark coat, ink-stained fingers',
      summary: 'Le dieron una carta para echar al correo.',
      biography: 'Pasante del despacho de Blandy. Leal a su maestro. Mary le pidió que mandara una carta a Escocia.',
      personality: ['Escrupuloso', 'Leal'],
    },
  ],

  locations: [
    { id: 'lo-casa', name: 'Casa de los Blandy', description: 'En Hart Street, Henley-on-Thames.' },
    { id: 'lo-cocina', name: 'Cocina', description: 'Donde se preparaban las gachas y el té del señor.' },
    { id: 'lo-escocia', name: 'Escocia', description: 'Donde vive Cranstoun, entre pleitos.' },
  ],

  relationships: [
    { id: 're-hija', a: 'ch-mary', b: 'ch-francis', label: 'Padre e hija' },
    { id: 're-novios', a: 'ch-mary', b: 'ch-cranstoun', label: 'Prometidos en secreto' },
    { id: 're-criada', a: 'ch-susan', b: 'ch-francis', label: 'Criada' },
  ],

  facts: [
    { id: 'fa-sobras', text: 'Quienes probaron las sobras de las gachas y el té del señor enfermaron con los mismos síntomas.', important: true },
    { id: 'fa-poso', text: 'En el fondo de la cazuela de las gachas había un poso blanco y arenoso.', important: true },
    { id: 'fa-arsenico', text: 'El poso de la cazuela es arsénico.', important: true },
    { id: 'fa-papel-arsenico', text: 'El papel que Mary quiso quemar contenía el mismo polvo blanco: arsénico.', important: true },
    { id: 'fa-quemar', text: 'Mary intentó quemar en el fuego de la cocina un papel de polvos y cartas.', important: true },
    { id: 'fa-oposicion', text: 'El señor Blandy se oponía a la boda de Mary con Cranstoun.', important: true },
    { id: 'fa-casado', text: 'Cranstoun ya estaba casado en Escocia.', important: true },
    { id: 'fa-cartas-polvos', text: 'Cranstoun mandaba los polvos desde Escocia con instrucciones de echarlos en la comida del padre.', important: true },
    { id: 'fa-carta-mary', text: 'Con su padre agonizando, Mary escribió a Cranstoun para avisarle y pedirle que destruyera sus cartas.', important: true },
    { id: 'fa-mary-sirve', text: 'Mary preparaba ella misma las gachas y el té de su padre.', important: true },
  ],

  evidence: [
    {
      id: 'ev-sintomas',
      kind: 'report',
      title: 'Notas del boticario de Henley',
      source: 'Mr. Norton, boticario',
      summary: 'Lo que padeció el señor Blandy.',
      related: { characters: ['ch-francis'], locations: ['lo-casa'], events: ['te-muerte'] },
      body: [
        { type: 'typed', text: 'Dolores de vientre ardientes, vómitos, sed, la garganta en carne viva. Los dientes se le mueven en las encías. Las uñas y la piel, oscuras.' },
        { type: 'typed', text: '{{dt-sint-sobras|La criada Susan y la cocinera, que probaron las sobras de sus gachas, han enfermado igual, aunque más leve.}}' },
      ],
      details: [{ id: 'dt-sint-sobras', label: 'Las sobras enferman', description: 'El mal estaba en lo que comía el señor.', effects: [{ grantFact: 'fa-sobras' }], points: 15 }],
    },
    {
      id: 'ev-cazuela',
      kind: 'physical',
      title: 'Cazuela de las gachas',
      source: 'Guardada por Susan Gunnell',
      summary: 'El fondo de una cazuela que nadie lavó.',
      related: { characters: ['ch-susan', 'ch-francis'], locations: ['lo-cocina'], events: ['te-gachas'] },
      body: [
        {
          type: 'typed',
          text: '{{dt-caz-poso|En el fondo, un poso blanco y arenoso que no se ha disuelto con la avena.}} Susan lo raspó y lo guardó en un papel antes de que alguien fregara la cazuela.',
        },
      ],
      details: [{ id: 'dt-caz-poso', label: 'Un poso blanco', description: 'Algo que no es avena se echó en las gachas.', effects: [{ grantFact: 'fa-poso' }], points: 15 }],
      decisive: true,
    },
    {
      id: 'ev-papel',
      kind: 'object',
      title: 'Papel medio quemado',
      source: 'Rescatado del fuego de la cocina',
      summary: 'Lo que alguien quiso quemar.',
      related: { characters: ['ch-mary'], locations: ['lo-cocina'], events: ['te-quema'] },
      body: [
        {
          type: 'typed',
          text: '{{dt-pap-rotulo|Un papel doblado, chamuscado por un lado, con un rótulo legible: «Polvos para limpiar los guijarros escoceses».}} Dentro quedan restos de un polvo blanco.',
        },
        { type: 'typed', text: '{{dt-pap-quien|Lo arrojó al fuego la señorita Mary, junto con un fajo de cartas; la cocinera lo sacó cuando ella se fue, porque el papel no ardía.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-quema' }],
      details: [
        { id: 'dt-pap-rotulo', label: '«Para limpiar guijarros»', description: 'Una etiqueta que no explica por qué estaba en la cocina.', effects: [], points: 10 },
        { id: 'dt-pap-quien', label: 'Lo tiró Mary', description: 'Mary quiso hacer desaparecer el papel y las cartas.', effects: [{ grantFact: 'fa-quemar' }], points: 15 },
      ],
      decisive: true,
    },
    {
      id: 'ev-addington',
      kind: 'report',
      title: 'Examen del doctor Addington',
      source: 'Anthony Addington, médico de Reading',
      summary: 'Qué es el polvo blanco.',
      autoDiscoverWhen: { asked: 'q-addington' },
      related: { characters: ['ch-addington'], locations: [], events: [] },
      body: [
        {
          type: 'typed',
          text: 'He calentado sobre un hierro al rojo el poso de la cazuela. {{dt-add-ajo|Desprende un humo blanco con olor a ajo, y deja en el hierro una mancha como el arsénico blanco que tengo de muestra.}}',
        },
        { type: 'typed', text: '{{dt-add-papel|El polvo del papel rescatado da exactamente el mismo resultado.}} Ambos son arsénico.' },
        { type: 'signature', name: 'A. Addington' },
      ],
      details: [
        { id: 'dt-add-ajo', label: 'Humo con olor a ajo', description: 'El poso de las gachas es arsénico.', effects: [{ grantFact: 'fa-arsenico' }], points: 20 },
        { id: 'dt-add-papel', label: 'El mismo polvo', description: 'Lo que Mary quiso quemar era también arsénico.', effects: [{ grantFact: 'fa-papel-arsenico' }], points: 20 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-carta-interceptada',
      kind: 'letter',
      title: 'Carta de Mary a Cranstoun, interceptada',
      dated: 'Agosto de 1751',
      source: 'Entregada por el pasante Robert Littleton',
      summary: 'La carta que Mary quería mandar a Escocia.',
      autoDiscoverWhen: { asked: 'q-littleton' },
      related: { characters: ['ch-mary', 'ch-cranstoun'], locations: ['lo-escocia'], events: ['te-carta'] },
      body: [
        { type: 'paragraph', text: 'Querido Willy:' },
        {
          type: 'paragraph',
          text: '{{dt-int-aviso|Mi padre está muy enfermo y en la casa sospechan. Ten cuidado con lo que escribes y quema todas mis cartas; yo haré lo mismo con las tuyas.}}',
        },
        { type: 'paragraph', text: '{{dt-int-polvos|No me mandes más polvos de esos por el correo; ya no hacen falta.}}' },
        { type: 'signature', name: 'Tu M. B.' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-carta' }],
      details: [
        { id: 'dt-int-aviso', label: '«Quema todas mis cartas»', description: 'Mary avisa a Cranstoun y le pide destruir pruebas.', effects: [{ grantFact: 'fa-carta-mary' }], points: 20 },
        { id: 'dt-int-polvos', label: '«Ya no hacen falta»', description: 'Mary sabía que los polvos estaban haciendo su efecto.', effects: [], points: 15 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-cartas-cranstoun',
      kind: 'letter',
      title: 'Fragmentos de las cartas de Cranstoun',
      source: 'Rescatados del fuego por la cocinera',
      summary: 'Lo que decían las cartas que Mary quemó.',
      autoDiscoverWhen: { fact: 'fa-quemar' },
      related: { characters: ['ch-cranstoun', 'ch-mary', 'ch-francis'], locations: ['lo-escocia'], events: ['te-polvos'] },
      body: [
        {
          type: 'handwritten',
          text: '…{{dt-cc-instruccion|echa los polvos en su té o en sus gachas, poco cada vez, y verás cómo se ablanda y consiente}}… …{{dt-cc-guijarros|te mando más con los guijarros escoceses, para que nadie pregunte}}…',
          author: 'W. H. C.',
        },
        { type: 'paragraph', text: 'Los bordes están quemados; faltan las fechas.' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-polvos' }],
      details: [
        { id: 'dt-cc-instruccion', label: '«Poco cada vez»', description: 'Cranstoun daba instrucciones precisas: pequeñas dosis en la comida del padre.', effects: [{ grantFact: 'fa-cartas-polvos' }], points: 20 },
        { id: 'dt-cc-guijarros', label: 'Los guijarros como tapadera', description: 'Mandaba los polvos camuflados en un regalo de guijarros.', effects: [], points: 10 },
      ],
      decisive: true,
    },
    {
      id: 'ev-escocia',
      kind: 'document',
      title: 'Sentencia del tribunal de Edimburgo',
      source: 'Court of Session, Edimburgo',
      summary: 'Un pleito que el capitán no mencionaba.',
      autoDiscoverWhen: { asked: 'q-mary-cranstoun' },
      related: { characters: ['ch-cranstoun'], locations: ['lo-escocia'], events: [] },
      body: [
        {
          type: 'typed',
          text: '{{dt-esc-casado|Se declara válido el matrimonio entre el capitán William Henry Cranstoun y Anne Murray, con quien tiene una hija, y se le condena a pagarle una pensión.}}',
        },
      ],
      details: [{ id: 'dt-esc-casado', label: 'Ya estaba casado', description: 'Cranstoun no podía casarse con Mary; lo que buscaba era la dote.', effects: [{ grantFact: 'fa-casado' }], points: 20 }],
    },
  ],

  deductions: [
    {
      id: 'de-gachas',
      title: 'El veneno estaba en las gachas',
      combine: ['dt-sint-sobras', 'dt-add-ajo'],
      explanation: 'Quien probaba las sobras enfermaba, y el poso de la cazuela es arsénico: el veneno entraba con las gachas que preparaba Mary.',
      points: 30,
    },
    {
      id: 'de-papel',
      title: 'Los guijarros eran arsénico',
      combine: ['dt-pap-quien', 'dt-add-papel'],
      explanation: 'El papel que Mary quiso quemar contenía el mismo arsénico que el poso de las gachas.',
      points: 30,
    },
    {
      id: 'de-instigador',
      title: 'Quién mandaba los polvos',
      combine: ['dt-cc-instruccion', 'dt-esc-casado'],
      explanation: 'Cranstoun, ya casado y sin poder casarse con Mary, le mandaba arsénico disfrazado con instrucciones de dárselo poco a poco a su padre: quería la dote, no la boda.',
      points: 30,
    },
  ],

  contradictions: [
    {
      id: 'cx-mary-cocina',
      title: 'Mary sí preparaba las gachas',
      a: { line: 'ln-mary-cocina' },
      b: { line: 'ln-susan-gachas' },
      explanation: 'Mary dice que nunca entraba en la cocina; Susan la vio preparar y remover las gachas de su padre.',
      effects: [{ grantFact: 'fa-mary-sirve' }],
      points: 25,
    },
    {
      id: 'cx-mary-amor',
      title: '¿Un filtro de amor?',
      a: { line: 'ln-mary-amor' },
      b: { detail: 'dt-int-polvos' },
      explanation: 'Mary dice que creía dar a su padre un filtro de amor; en su carta escribe que los polvos «ya no hacen falta», cuando su padre agoniza.',
      points: 30,
    },
  ],

  secrets: [
    { id: 'se-mary', characterId: 'ch-mary', text: 'Después de que su padre enfermara la primera vez, Mary vio enfermar a la criada que comió las sobras y siguió dándole los polvos.', revealedWhen: { all: [{ fact: 'fa-sobras' }, { fact: 'fa-mary-sirve' }] }, points: 20 },
    { id: 'se-susan', characterId: 'ch-susan', text: 'Susan avisó al señor de que temía que le estuvieran envenenando. El señor contestó: «¿Quién iba a querer hacerme daño?», y siguió tomando sus gachas.', revealedWhen: { asked: 'q-susan-aviso' }, points: 15 },
  ],

  interrogations: [
    {
      id: 'in-mary',
      characterId: 'ch-mary',
      setting: 'En el salón de la casa, de luto, con un pañuelo entre los dedos. Habla con voz baja y ordenada.',
      opening: [{ text: 'He perdido a mi padre y ahora me miran como a un monstruo. Pregunte lo que quiera.' }],
      topics: [
        {
          id: 'tp-mary-padre',
          label: 'Su padre',
          kind: 'victim',
          questions: [
            {
              id: 'q-mary-cocina',
              prompt: '¿Quién preparaba las comidas de su padre?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-mary-cocina', text: 'La cocinera, naturalmente. Yo no entro en la cocina; no es cosa de una señorita.', tone: 'lie' }] }],
            },
            {
              id: 'q-mary-cx',
              prompt: 'Susan la vio remover las gachas de su padre, en la cocina.',
              kind: 'contradiction',
              contradiction: 'cx-mary-cocina',
              responses: [{ lines: [{ text: 'Alguna vez se las preparé yo. Una hija cuida a su padre enfermo.', tone: 'admission' }] }],
            },
          ],
        },
        {
          id: 'tp-mary-cranstoun',
          label: 'El capitán',
          kind: 'person',
          about: 'ch-cranstoun',
          questions: [
            {
              id: 'q-mary-cranstoun',
              prompt: '¿Por qué se oponía su padre a su boda con el capitán Cranstoun?',
              kind: 'ask',
              responses: [
                {
                  lines: [{ text: 'Por unas calumnias de Escocia: que si tenía allí una esposa. Mentiras de una mujer interesada. Willy me lo ha jurado mil veces.', tone: 'evasion' }],
                  effects: [{ grantFact: 'fa-oposicion' }],
                },
              ],
            },
            {
              id: 'q-mary-polvos',
              prompt: '¿Qué eran los polvos del papel que quiso quemar?',
              kind: 'ask',
              requires: { fact: 'fa-papel-arsenico' },
              responses: [
                {
                  lines: [
                    { id: 'ln-mary-amor', text: 'Unos polvos de amor que Willy me mandaba de Escocia. Me dijo que si se los daba a mi padre, se ablandaría y nos dejaría casarnos. Yo creía que eran inofensivos.', tone: 'evasion' },
                    { text: 'Los quemé cuando me asusté, no porque supiera nada.', tone: 'evasion' },
                  ],
                },
              ],
            },
            {
              id: 'q-mary-cx2',
              prompt: 'En su carta a Cranstoun dice que los polvos «ya no hacen falta». Su padre agonizaba.',
              kind: 'contradiction',
              contradiction: 'cx-mary-amor',
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Mary se queda inmóvil. Luego dobla el pañuelo con mucho cuidado.' },
                    { text: 'Él me dijo que no le harían daño. Me lo dijo. Y yo quería creerle más de lo que quería a nadie.', tone: 'admission' },
                  ],
                  effects: [{ setFlag: 'mary-admite' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-cranstoun',
      characterId: 'ch-cranstoun',
      setting: 'No viene a Henley. Contesta por carta desde Escocia, con letra muy redonda y muchas reverencias.',
      opening: [{ text: 'Caballero: me apena profundamente la muerte del señor Blandy, a quien siempre respeté pese a su injusta oposición.' }],
      topics: [
        {
          id: 'tp-cranstoun',
          label: 'Por carta',
          kind: 'personal',
          questions: [
            {
              id: 'q-cranstoun-polvos',
              prompt: '¿Mandaba usted polvos a la señorita Blandy?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Le mandaba guijarros escoceses, que a ella le gustaban, y unos polvos para limpiarlos y sacarles brillo. Si los usó para otra cosa, no es culpa mía.', tone: 'lie' }] }],
            },
            {
              id: 'q-cranstoun-casado',
              prompt: 'Un tribunal de Edimburgo declaró válido su matrimonio con Anne Murray.',
              kind: 'confront',
              requires: { fact: 'fa-casado' },
              responses: [{ lines: [{ text: 'Una sentencia injusta que pienso recurrir. Mis intenciones con la señorita Blandy fueron siempre honorables. No volveré a escribir sobre este asunto.', tone: 'evasion' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-susan',
      characterId: 'ch-susan',
      setting: 'En la cocina, junto al fogón apagado. Tiene todavía mala cara.',
      opening: [{ text: 'Yo lo dije, señor. Lo dije antes que nadie.' }],
      topics: [
        {
          id: 'tp-susan',
          label: 'Las gachas',
          kind: 'events',
          questions: [
            {
              id: 'q-susan-gachas',
              prompt: '¿Quién preparaba las gachas del señor?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { id: 'ln-susan-gachas', text: 'La señorita Mary, desde hace semanas. Bajaba a la cocina, removía las gachas ella misma y se las subía. No dejaba que nadie las tocara.', tone: 'truth' },
                    { text: 'Un día me comí lo que sobró en la cazuela y estuve dos días vomitando. Desde entonces me fijé en el fondo.', tone: 'truth' },
                  ],
                  effects: [{ unlockTimelineEvent: 'te-gachas' }],
                },
              ],
            },
            {
              id: 'q-susan-aviso',
              prompt: '¿Le dijo algo al señor?',
              kind: 'press',
              requires: { asked: 'q-susan-gachas' },
              responses: [{ lines: [{ text: 'Le enseñé el poso y le dije que temía por él. Me miró mucho rato y me dijo: «¿Quién iba a querer hacerme daño a mí?». Y siguió tomándolas.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-addington',
      characterId: 'ch-addington',
      setting: 'En el despacho del señor Blandy, con un hierro, una vela y dos papelitos doblados sobre la mesa.',
      opening: [{ text: 'Llegué demasiado tarde para el paciente. No para la verdad, quizá.' }],
      topics: [
        {
          id: 'tp-addington',
          label: 'El polvo blanco',
          kind: 'other',
          questions: [
            {
              id: 'q-addington',
              prompt: '¿Qué es ese polvo blanco?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Hay maneras de saberlo. Déjeme calentar un poco sobre este hierro y comparar con una muestra de arsénico. Lo anoto todo.', tone: 'truth' }] }],
            },
            {
              id: 'q-addington-padre',
              prompt: '¿Dijo algo el señor Blandy antes de morir?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'Sabía que le habían envenenado y sabía quién. Solo dijo: «Pobre muchacha enamorada… qué no hará una mujer por el hombre que ama».', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-littleton',
      characterId: 'ch-littleton',
      setting: 'En el despacho, entre legajos. Tiene una carta en el bolsillo y le arde.',
      opening: [{ text: 'Le debo todo al señor Blandy. No pude… no pude echarla al correo sin más.' }],
      topics: [
        {
          id: 'tp-littleton',
          label: 'La carta',
          kind: 'document',
          questions: [
            {
              id: 'q-littleton',
              prompt: '¿Qué carta?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'La señorita Mary me dio una carta para el capitán, a Escocia. Con el señor en la cama, sospeché. La abrí. Tome. Que Dios me perdone.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto a la muerte (14 de agosto de 1751, mañana)
  timeline: [
    { id: 'te-polvos', t: -129600, display: 'Junio de 1751', title: 'Llegan de Escocia los «polvos para limpiar guijarros»', description: 'Con instrucciones de Cranstoun.', characters: ['ch-cranstoun', 'ch-mary'], key: true },
    { id: 'te-falso-amor', t: -100000, display: 'Verano', title: 'Mary da a su padre un filtro de amor inofensivo', description: 'Según Mary.', characters: ['ch-mary'], veracity: 'false', claimedBy: 'ch-mary' },
    { id: 'te-gachas', t: -14400, display: 'Principios de agosto', title: 'Mary prepara a su padre las gachas; Susan enferma con las sobras', description: 'Y guarda el poso de la cazuela.', characters: ['ch-mary', 'ch-susan'], location: 'lo-cocina', key: true },
    { id: 'te-carta', t: -7200, display: '9 de agosto', title: 'Mary escribe a Cranstoun que queme sus cartas', description: 'Littleton la intercepta.', characters: ['ch-mary', 'ch-littleton'], key: true },
    { id: 'te-quema', t: -5760, display: '10 de agosto', title: 'Mary arroja al fuego cartas y un papel de polvos', description: 'La cocinera los rescata.', characters: ['ch-mary'], location: 'lo-cocina', key: true },
    { id: 'te-muerte', t: 0, display: '14 de agosto', title: 'Muerte de Francis Blandy', description: '«Pobre muchacha enamorada».', characters: ['ch-francis'], location: 'lo-casa', key: true },
  ],

  accusation: {
    motives: [
      { id: 'mo-dote', label: 'Quitar de en medio al padre que impedía la boda y quedarse con la dote', availableWhen: { fact: 'fa-oposicion' } },
      { id: 'mo-herencia-cr', label: 'La dote, para un hombre que ya estaba casado', availableWhen: { fact: 'fa-casado' } },
      { id: 'mo-maltrato', label: 'Vengarse de un padre cruel' },
      { id: 'mo-error', label: 'Ninguno: creía darle un filtro de amor' },
    ],
    methods: [
      { id: 'me-gachas', label: 'Arsénico mandado desde Escocia como «polvos para guijarros», echado poco a poco en las gachas y el té del padre', availableWhen: { all: [{ fact: 'fa-arsenico' }, { fact: 'fa-cartas-polvos' }] } },
      { id: 'me-una-dosis', label: 'Una sola dosis grande la víspera de la muerte' },
      { id: 'me-cocinera', label: 'La cocinera, por descuido, con el matarratas' },
      { id: 'me-enfermedad', label: 'No hubo veneno: una fiebre de verano' },
    ],
  },

  solution: {
    culprits: ['ch-mary', 'ch-cranstoun'],
    motive: 'mo-dote',
    method: 'me-gachas',
    proof: ['ev-addington', 'ev-carta-interceptada', 'ev-cartas-cranstoun'],
    whatHappened:
      'Francis Blandy murió envenenado con arsénico por su hija Mary, con los polvos que le mandaba desde Escocia el capitán William Cranstoun. El padre se oponía a la boda; Cranstoun, que ya estaba casado y solo quería la dote, le envió el arsénico con la etiqueta de «polvos para limpiar guijarros escoceses» e instrucciones de echarlo poco a poco en la comida del padre, diciéndole que era un filtro de amor. Mary preparó ella misma, durante semanas, las gachas y el té de su padre. Las sobras enfermaban a las criadas, y aun así siguió. Cuando la casa empezó a sospechar, escribió a Cranstoun que quemara sus cartas y que los polvos «ya no hacían falta», e intentó quemar los suyos en la cocina.',
    reconstruction: [
      'Cranstoun, casado en secreto en Escocia, corteja a Mary por su dote; el padre se opone.',
      'Desde Escocia, Cranstoun manda «polvos para limpiar guijarros» con instrucciones de echarlos en su comida.',
      'Mary prepara ella misma las gachas y el té de su padre durante semanas.',
      'Susan prueba las sobras, enferma y guarda el poso de la cazuela.',
      'Mary escribe a Cranstoun que queme sus cartas; Littleton la intercepta.',
      'Mary arroja al fuego cartas y un papel de polvos; la cocinera los rescata.',
      'El 14 de agosto muere Francis Blandy. Addington identifica el arsénico.',
    ],
    decisiveEvidence: ['ev-cazuela', 'ev-papel', 'ev-addington', 'ev-carta-interceptada', 'ev-cartas-cranstoun'],
    alibiTruths: [
      { characterId: 'ch-mary', truth: 'Siguió echando los polvos cuando ya había visto enfermar a la criada con las sobras.' },
      { characterId: 'ch-cranstoun', truth: 'Estaba en Escocia, sí, pero desde allí mandaba el arsénico con instrucciones.' },
    ],
  },

  endings: [
    {
      id: 'en-oxford',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { flag: 'mary-admite' } },
      outcome: 'success',
      title: '«Por decencia, no muy alto»',
      text: 'Mary Blandy es juzgada en Oxford en marzo de 1752. Por primera vez, un médico explica a un jurado cómo ha reconocido el arsénico con un hierro y una vela. La condenan. El 6 de abril sube a la horca y pide que no la cuelguen muy alto, «por decencia». El capitán Cranstoun ha huido a Flandes; muere en diciembre de ese mismo año, sin haber pisado un tribunal.',
    },
    {
      id: 'en-exito',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' },
      outcome: 'success',
      title: 'Los dos',
      text: 'La acusación señala la mano que servía las gachas y la que mandaba los polvos. Mary es condenada; Cranstoun, fuera del alcance de la justicia inglesa, queda señalado para siempre.',
    },
    { id: 'en-mary', when: { culprit: 'ch-mary' }, outcome: 'partial', title: 'La mano', text: 'Mary es condenada sola. Del capitán que mandaba los polvos no se vuelve a hablar en el juicio.' },
    { id: 'en-cranstoun', when: { culprit: 'ch-cranstoun' }, outcome: 'partial', title: 'El instigador', text: 'Señaláis al capitán, que está en Escocia y no piensa volver. La mano que echó los polvos queda sin juzgar.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Fiebre de verano', text: 'El señor Blandy muere de unas fiebres. Su hija hereda lo poco que había detrás de la famosa dote y espera, inútilmente, cartas de Escocia.' },
  ],

  hints: [
    {
      id: 'hl-gachas',
      topic: 'Qué enfermaba al señor',
      relevantWhen: { not: { fact: 'fa-arsenico' } },
      steps: ['¿Qué tenían en común los que enfermaron?', 'Mira la cazuela que guardó Susan.', 'Pide al doctor Addington que examine el poso.'],
    },
    {
      id: 'hl-cartas',
      topic: 'De dónde salían los polvos',
      relevantWhen: { not: { fact: 'fa-cartas-polvos' } },
      steps: ['Mary quiso quemar algo más que un papel.', 'Examina el papel medio quemado.', 'Busca lo que la cocinera rescató del fuego.'],
    },
  ],

  objectives: [
    { id: 'ob-arsenico', text: 'Identifica el polvo blanco.', completeWhen: { fact: 'fa-arsenico' }, points: 25 },
    { id: 'ob-cranstoun', text: 'Averigua qué escondía el capitán.', completeWhen: { fact: 'fa-casado' }, points: 25 },
    { id: 'ob-susan', text: 'Descubre si alguien avisó al señor.', completeWhen: { secret: 'se-susan' }, points: 15, hidden: true },
  ],

  assets: [],
};

export default caseFile;
