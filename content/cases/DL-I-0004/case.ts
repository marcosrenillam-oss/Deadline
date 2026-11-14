import type { CaseFileInput } from '../../../packages/core/src/case/schema.ts';

/**
 * DL-I-0004 · EL SÓTANO DE HILLDROP CRESCENT
 * Londres, julio de 1910 · Desaparición / homicidio · Caso real · Inspector
 *
 * Caso real: la desaparición de la cantante Cora Crippen («Belle Elmore») y
 * la investigación del inspector jefe Walter Dew, que acabó con la detención
 * de su marido, el doctor Hawley Harvey Crippen, en alta mar gracias a la
 * telegrafía sin hilos. Lo documentado sigue las fuentes; las conversaciones
 * del investigador son una recreación.
 */
const caseFile: CaseFileInput = {
  schemaVersion: 1,
  id: 'DL-I-0004',
  contentVersion: 1,
  mode: 'individual',
  title: 'El sótano de Hilldrop Crescent',
  subtitle: 'Una cantante se marcha a América sin despedirse de nadie',
  origin: 'real',
  historical: {
    documented: [
      'Cora Crippen, cantante de music hall con el nombre artístico de Belle Elmore, fue vista por última vez la noche del 31 de enero al 1 de febrero de 1910, tras una cena en su casa del 39 de Hilldrop Crescent (Camden, Londres) con el matrimonio Martinetti.',
      'Su marido, el médico homeópata estadounidense Hawley Harvey Crippen, dijo a las amigas de Belle que se había marchado a América; después, que había muerto allí de una neumonía. Publicó la noticia en el periódico del gremio, The Era.',
      'La Music Hall Ladies’ Guild recibió una carta de dimisión firmada por Belle que no estaba escrita con su letra.',
      'Ethel Le Neve, mecanógrafa y amante de Crippen, se mudó a la casa y se dejó ver con un broche y pieles de Belle.',
      'El 19 de enero de 1910 Crippen compró cinco granos de hidrobromuro de hioscina en la farmacia Lewis & Burrows. En febrero empeñó joyas de su esposa.',
      'Amigos de Belle acudieron a Scotland Yard. El inspector jefe Walter Dew interrogó a Crippen el 8 de julio; Crippen admitió que la muerte era inventada y dijo que Belle le había dejado por otro hombre.',
      'El 9 de julio Crippen y Le Neve huyeron. El 13 de julio Dew encontró restos humanos enterrados en cal bajo el suelo de ladrillo del sótano, con un trozo de chaqueta de pijama de la casa Jones Brothers.',
      'Le Neve, disfrazada de muchacho, y Crippen embarcaron en Amberes en el SS Montrose. El capitán Henry Kendall los reconoció y avisó por telegrafía sin hilos. Dew los adelantó en un barco más rápido y los detuvo el 31 de julio frente a Quebec.',
      'El patólogo Bernard Spilsbury identificó en un trozo de piel una cicatriz como la de una operación abdominal de Belle; el toxicólogo William Willcox halló hioscina en los restos.',
      'Crippen fue condenado y ahorcado en la prisión de Pentonville el 23 de noviembre de 1910. Ethel Le Neve fue juzgada aparte y absuelta.',
    ],
    hypotheses: [
      'Un estudio genético de 2007 afirmó que los restos del sótano no eran de Cora Crippen; sus métodos y conclusiones han sido muy discutidos.',
      'Nunca se aclaró del todo cuánto sabía Ethel Le Neve.',
    ],
    dramatized: [
      'Las conversaciones del investigador y el orden de sus preguntas son una recreación.',
      'La redacción de cartas, telegramas e informes está reconstruida para el juego.',
      'Los retratos son recreaciones artísticas, no fotografías de las personas reales.',
    ],
    documentedResolution:
      'Hawley Harvey Crippen fue declarado culpable del asesinato de su esposa Cora («Belle Elmore») y ahorcado el 23 de noviembre de 1910. Ethel Le Neve fue absuelta.',
    sources: [
      'Filson Young (ed.), Trial of Hawley Harvey Crippen, Notable British Trials (1920)',
      'Walter Dew, I Caught Crippen (1938)',
      'Erik Larson, Thunderstruck (2006)',
    ],
  },
  era: 'c20',
  eraLabel: 'Londres, 1910',
  year: 1910,
  location: { city: 'Londres', place: '39 Hilldrop Crescent, Camden', country: 'Reino Unido' },
  category: 'disappearance',
  difficulty: 'inspector',
  keywords: ['Crippen', 'Belle Elmore', 'Londres', 'Scotland Yard', 'Dew', 'hioscina', 'Montrose', 'telegrafía', 'caso real'],
  ambience: { music: 'london-1987-rain', mood: 'urban' },
  maxHints: 4,

  briefing: {
    incidentDisplay: 'Martes, 1 de febrero de 1910 · madrugada',
    summary:
      'Belle Elmore, cantante de music hall, lleva cinco meses sin dar señales. Su marido, el doctor Crippen, dice que se fue a América y que allí murió. Sus amigas no se lo creen: Belle no se habría ido sin despedirse, y la amante del doctor ya lleva sus joyas.',
    context:
      'Scotland Yard, julio de 1910. Un matrimonio de artistas ha venido a quejarse y el inspector jefe Walter Dew le pide que le acompañe a Hilldrop Crescent. Oficialmente, nadie ha cometido ningún delito: una esposa se ha marchado.',
    background:
      'Crippen, médico homeópata de Michigan, vende remedios de patente en Londres. Belle, extravagante y generosa, soñaba con triunfar en el escenario y gastaba lo que él ganaba. El matrimonio no era feliz.',
    victim: 'ch-belle',
    initialFacts: [],
    initialEvidence: ['ev-denuncia', 'ev-era', 'ev-dimision'],
    initialTimeline: ['te-cena', 'te-desaparece', 'te-necrologica'],
  },

  characters: [
    {
      id: 'ch-belle',
      name: 'Cora Crippen («Belle Elmore»)',
      look: { hair: 'long' },
      role: 'victim',
      age: 37,
      occupation: 'Cantante de music hall',
      appearance:
        'a buxom 37-year-old Edwardian music hall singer in 1909, round lively face, large dark eyes, abundant dark hair piled high, big feathered hat, ruffled high-necked blouse, a glittering brooch, theatrical confident smile',
      summary: 'Le gustaban las plumas, los diamantes y los escenarios.',
      biography: 'Nacida en Brooklyn como Kunigunde Mackamotzki, adoptó el nombre de Cora Turner y luego el artístico de Belle Elmore. Tesorera de la Music Hall Ladies’ Guild. Tenía una cicatriz de una operación abdominal.',
      personality: ['Extrovertida', 'Derrochadora', 'De carácter fuerte'],
    },
    {
      id: 'ch-crippen',
      name: 'Hawley Harvey Crippen',
      look: { hair: 'bald', glasses: true },
      role: 'suspect',
      age: 47,
      occupation: 'Médico homeópata y vendedor de remedios',
      appearance:
        'a small slight 47-year-old American doctor in London in 1910, thinning sandy hair, large bulging eyes behind thick gold-rimmed spectacles, drooping sandy moustache, neat three-piece suit with a high collar and bow tie, mild polite expression',
      summary: 'Un hombrecillo amable, con gafas gruesas y un bigote caído.',
      biography: 'Nacido en Michigan, estudió homeopatía y llegó a Londres en 1897 para vender los remedios de Munyon. Educado, tranquilo, nunca levanta la voz. Mantiene desde hace años una relación con su mecanógrafa.',
      personality: ['Educado', 'Sereno', 'Muy sereno'],
      relationToVictim: 'Su marido',
      motive: { text: 'Quería empezar una vida con Ethel Le Neve; Belle amenazaba con dejarle y llevarse los ahorros.', visibleWhen: { fact: 'fa-ahorros' } },
      alibi: { claim: 'Belle se fue a América con otro hombre. Él inventó su muerte para evitar el escándalo.' },
    },
    {
      id: 'ch-ethel',
      name: 'Ethel Le Neve',
      look: { hair: 'bun' },
      role: 'suspect',
      age: 27,
      occupation: 'Mecanógrafa de Crippen',
      appearance:
        'a slim pale 27-year-old Edwardian London typist in 1910, delicate oval face, large sad grey eyes, light brown hair swept up into a soft bun, plain high-collared white blouse, shy nervous expression',
      summary: 'Discreta, pálida y enamorada.',
      biography: 'Trabaja con Crippen desde 1900 y es su amante desde hace años. En marzo se mudó a Hilldrop Crescent.',
      personality: ['Tímida', 'Leal', 'Nerviosa'],
      relationToVictim: 'Amante de su marido',
      motive: { text: 'Con Belle fuera de la casa, ella ocuparía su lugar.', visibleWhen: { fact: 'fa-broche' } },
      alibi: { claim: 'No sabía nada: el doctor le dijo que Belle se había ido a América.' },
    },
    {
      id: 'ch-clara',
      name: 'Clara Martinetti',
      look: { hair: 'hat' },
      role: 'witness',
      age: 45,
      occupation: 'Artista retirada y amiga de Belle',
      appearance:
        'a plump 45-year-old Edwardian former music hall artiste in 1910, kind round face, greying curled hair under a wide flowered hat, fur stole, worried motherly expression',
      summary: 'Cenó con Belle la última noche.',
      biography: 'Casada con el acróbata retirado Paul Martinetti. Compañera de Belle en la Guild, la conoce desde hace años y está segura de que no se iría sin escribirle.',
      personality: ['Afectuosa', 'Tenaz', 'Chismosa'],
    },
    {
      id: 'ch-dew',
      name: 'Walter Dew',
      look: { hair: 'hat', beard: true },
      role: 'witness',
      age: 47,
      occupation: 'Inspector jefe de Scotland Yard',
      appearance:
        'a solid 47-year-old Scotland Yard chief inspector in 1910, square weathered face, thick walrus moustache, bowler hat, dark overcoat with a high collar, patient shrewd eyes',
      summary: 'Un veterano que no se fía de las historias limpias.',
      biography: 'Inspector jefe de la división de investigación criminal. De joven trabajó en los asesinatos de Whitechapel. Paciente, terco y meticuloso.',
      personality: ['Paciente', 'Tenaz', 'Prudente'],
    },
    {
      id: 'ch-kendall',
      name: 'Henry Kendall',
      look: { hair: 'hat', beard: true },
      role: 'witness',
      age: 36,
      occupation: 'Capitán del SS Montrose',
      appearance:
        'a 36-year-old British ocean liner captain in 1910, alert keen face, neat dark beard, peaked captain cap with gold braid, double-breasted navy uniform',
      summary: 'Lee los periódicos y tiene telégrafo a bordo.',
      biography: 'Capitán de la línea Canadian Pacific. Su barco cubre la ruta de Amberes a Quebec y lleva uno de los nuevos aparatos de telegrafía sin hilos Marconi.',
      personality: ['Observador', 'Audaz'],
      appearsWhen: { fact: 'fa-huida' },
    },
    {
      id: 'ch-spilsbury',
      name: 'Bernard Spilsbury',
      look: { hair: 'short' },
      role: 'witness',
      age: 33,
      occupation: 'Patólogo del Hospital St Mary’s',
      appearance:
        'a tall handsome 33-year-old Edwardian pathologist in 1910, clean shaven, neatly parted dark hair, high white collar and dark suit, a carnation in the buttonhole, cool confident gaze',
      summary: 'Joven, elegante e implacable con un microscopio.',
      biography: 'Patólogo en ascenso del Hospital St Mary’s. Trabaja junto al toxicólogo William Willcox en los restos del sótano.',
      personality: ['Seguro', 'Preciso', 'Frío'],
      appearsWhen: { fact: 'fa-restos' },
    },
  ],

  locations: [
    { id: 'lo-casa', name: '39 Hilldrop Crescent', description: 'Casa adosada de tres plantas en Camden, con jardín y sótano para el carbón.' },
    { id: 'lo-sotano', name: 'Sótano del carbón', description: 'Pequeño y oscuro, con suelo de ladrillo.', appearsWhen: { flag: 'sotano-abierto' } },
    { id: 'lo-albion', name: 'Albion House', description: 'Oficina de Crippen y de Ethel, en New Oxford Street.' },
    { id: 'lo-montrose', name: 'SS Montrose', description: 'Vapor de la Canadian Pacific, de Amberes a Quebec.', appearsWhen: { fact: 'fa-huida' } },
  ],

  relationships: [
    { id: 're-matrimonio', a: 'ch-crippen', b: 'ch-belle', label: 'Matrimonio' },
    { id: 're-amantes', a: 'ch-crippen', b: 'ch-ethel', label: 'Amantes desde hace años' },
    { id: 're-amigas', a: 'ch-clara', b: 'ch-belle', label: 'Amigas íntimas' },
  ],

  facts: [
    { id: 'fa-ultima', text: 'Belle fue vista por última vez la madrugada del 1 de febrero, al despedir a los Martinetti tras la cena.', important: true },
    { id: 'fa-sin-equipaje', text: 'Belle no se llevó sus vestidos, ni sus pieles, ni sus joyas: ninguna cantante viaja así.', important: true },
    { id: 'fa-letra', text: 'La carta de dimisión a la Guild no la escribió Belle.', important: true },
    { id: 'fa-broche', text: 'Ethel Le Neve llevó al baile de la Guild un broche de Belle.', important: true },
    { id: 'fa-mentira', text: 'Crippen admite que la muerte de Belle en América es inventada.', important: true },
    { id: 'fa-huida', text: 'Crippen y Ethel huyeron al día siguiente del interrogatorio.', important: true },
    { id: 'fa-restos', text: 'Bajo el suelo del sótano hay restos humanos enterrados en cal.', important: true },
    { id: 'fa-pijama', text: 'Con los restos había un trozo de chaqueta de pijama de Jones Brothers, vendida en 1909: los restos son posteriores a la llegada de Crippen.', important: true },
    { id: 'fa-cicatriz', text: 'Un trozo de piel tiene una cicatriz como la de la operación abdominal de Belle.', important: true },
    { id: 'fa-hioscina', text: 'En los restos hay hioscina, un sedante muy poco común.', important: true },
    { id: 'fa-compra', text: 'Crippen compró cinco granos de hioscina el 19 de enero, dos semanas antes de la desaparición.', important: true },
    { id: 'fa-ahorros', text: 'Belle amenazaba con dejar a Crippen y llevarse los ahorros de la cuenta común.', important: true },
    { id: 'fa-joyas', text: 'Crippen empeñó joyas de Belle en febrero.' },
    { id: 'fa-miller', text: 'Bruce Miller, el antiguo admirador de Belle, vive en Chicago y no la ve desde 1904.' },
  ],

  evidence: [
    {
      id: 'ev-denuncia',
      kind: 'statement',
      title: 'Denuncia de John Nash en Scotland Yard',
      dated: '30 de junio de 1910',
      source: 'Scotland Yard',
      summary: 'Un empresario de variedades no se cree la historia del doctor.',
      related: { characters: ['ch-belle', 'ch-crippen'], locations: ['lo-casa'], events: ['te-necrologica'] },
      body: [
        { type: 'typed', text: '—Mi mujer, Lil Hawthorne, y yo acabamos de volver de América. Allí preguntamos por Belle: nadie sabe nada de su muerte. Ni un hospital, ni un certificado, ni un entierro.' },
        {
          type: 'typed',
          text: '—{{dt-nash-cuentos|El doctor nos dijo que murió en Los Ángeles. Luego que en San Francisco. Luego que la incineraron.}} Cuando le preguntamos, lloraba demasiado bien.',
        },
        { type: 'signature', name: 'John Nash' },
      ],
      details: [{ id: 'dt-nash-cuentos', label: 'Una historia que cambia', description: 'Crippen da versiones distintas del lugar de la muerte.', effects: [], points: 10 }],
    },
    {
      id: 'ev-era',
      kind: 'press',
      title: 'Nota necrológica en The Era',
      dated: '26 de marzo de 1910',
      source: 'The Era, periódico del espectáculo',
      summary: 'El anuncio de la muerte de Belle Elmore.',
      related: { characters: ['ch-belle', 'ch-crippen'], locations: [], events: ['te-necrologica'] },
      body: [
        { type: 'heading', text: 'FALLECIMIENTOS' },
        { type: 'typed', text: 'ELMORE, Belle (Mrs. H. H. Crippen). El 23 de marzo, en California, Estados Unidos. Muy querida por sus compañeras de la Guild.' },
        { type: 'typed', text: '{{dt-era-quien|Anuncio encargado y pagado por el doctor H. H. Crippen.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-necrologica' }],
      details: [{ id: 'dt-era-quien', label: 'Lo publica él', description: 'La única fuente de la muerte de Belle es su marido.', effects: [], points: 10 }],
    },
    {
      id: 'ev-dimision',
      kind: 'letter',
      title: 'Carta de dimisión a la Music Hall Ladies’ Guild',
      dated: '2 de febrero de 1910',
      source: 'Archivo de la Guild',
      summary: 'Belle renuncia a su cargo de tesorera… o eso parece.',
      related: { characters: ['ch-belle', 'ch-crippen'], locations: ['lo-albion'], events: ['te-dimision'] },
      body: [
        { type: 'paragraph', text: 'Queridas compañeras:' },
        { type: 'paragraph', text: 'Perdonad esta nota con prisas: me llaman a América por la enfermedad de un pariente y debo partir de inmediato. Renuncio a mi cargo de tesorera.' },
        { type: 'signature', name: 'Belle Elmore' },
        { type: 'paragraph', text: '{{dt-dimision-letra|La carta no está escrita con la letra de Belle; la firma tampoco se parece a la suya.}} La trajo en mano el doctor, el día 2, a primera hora.' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-dimision' }],
      details: [{ id: 'dt-dimision-letra', label: 'No es su letra', description: 'Otra persona escribió y firmó por Belle al día siguiente de su desaparición.', effects: [{ grantFact: 'fa-letra' }], points: 15 }],
      decisive: true,
    },
    {
      id: 'ev-baile',
      kind: 'photo',
      title: 'Crónica del baile benéfico de la Guild',
      dated: '20 de febrero de 1910',
      source: 'Recorte de prensa y declaración de Clara Martinetti',
      summary: 'El doctor llegó acompañado.',
      autoDiscoverWhen: { asked: 'q-clara-baile' },
      related: { characters: ['ch-crippen', 'ch-ethel', 'ch-belle'], locations: [], events: ['te-baile'] },
      body: [
        { type: 'typed', text: 'Al baile anual de la Guild en el Criterion acudió el doctor Crippen con su secretaria, la señorita Le Neve.' },
        { type: 'typed', text: '{{dt-baile-broche|La joven lucía en el pecho un broche de brillantes en forma de sol: el broche favorito de Belle, que todas conocían.}}' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-baile' }],
      details: [{ id: 'dt-baile-broche', label: 'El broche de Belle', description: 'Las joyas de Belle se quedaron en Londres… y las lleva otra.', effects: [{ grantFact: 'fa-broche' }], points: 15 }],
    },
    {
      id: 'ev-armario',
      kind: 'physical',
      title: 'Armarios de Belle en Hilldrop Crescent',
      source: 'Registro del 8 de julio',
      summary: 'Todo lo que Belle no se llevó.',
      autoDiscoverWhen: { asked: 'q-dew-registro' },
      related: { characters: ['ch-belle'], locations: ['lo-casa'], events: [] },
      body: [
        {
          type: 'typed',
          text: '{{dt-armario-ropa|Decenas de vestidos de escena, sombreros de plumas, tres abrigos de piel. Baúles de viaje vacíos, en el desván.}} Ni una carta de Belle a nadie posterior a enero.',
        },
      ],
      details: [{ id: 'dt-armario-ropa', label: 'No hizo el equipaje', description: 'Belle, que adoraba sus vestidos, se «fue a América» sin baúles.', effects: [{ grantFact: 'fa-sin-equipaje' }], points: 15 }],
    },
    {
      id: 'ev-declaracion',
      kind: 'transcript',
      title: 'Declaración firmada del doctor Crippen',
      dated: '8 de julio de 1910',
      source: 'Tomada por el inspector jefe Dew en Albion House',
      summary: 'Seis horas de declaración y una confesión a medias.',
      autoDiscoverWhen: { asked: 'q-crippen-cx' },
      related: { characters: ['ch-crippen', 'ch-belle'], locations: ['lo-albion'], events: [] },
      body: [
        {
          type: 'typed',
          text: '«{{dt-decl-mentira|La historia de su muerte es falsa. Me la inventé para evitar el escándalo.}} La noche del 31, después de la cena, mi mujer me insultó y me dijo que se iba con su amigo americano. Cuando volví de la oficina al día siguiente se había marchado.»',
        },
        { type: 'typed', text: '«No he vuelto a saber de ella. Supongo que estará en Chicago con Bruce Miller.»' },
        { type: 'signature', name: 'H. H. Crippen' },
      ],
      details: [{ id: 'dt-decl-mentira', label: 'Admite la mentira', description: 'La muerte de Belle en América nunca ocurrió.', effects: [{ grantFact: 'fa-mentira' }], points: 15 }],
    },
    {
      id: 'ev-miller',
      kind: 'letter',
      title: 'Telegrama de Bruce Miller desde Chicago',
      dated: '15 de julio de 1910',
      source: 'Policía de Chicago',
      summary: 'El «amigo americano» responde.',
      autoDiscoverWhen: { fact: 'fa-mentira' },
      related: { characters: ['ch-belle'], locations: [], events: [] },
      body: [
        { type: 'typed', text: '{{dt-miller-nada|MILLER DECLARA NO VER NI ESCRIBIR A MRS CRIPPEN DESDE 1904 STOP CASADO STOP VIVE CHICAGO CON FAMILIA STOP NO HA SALIDO DE LA CIUDAD EN AÑO STOP}}' },
      ],
      details: [{ id: 'dt-miller-nada', label: 'Miller no la ha visto', description: 'Belle no está con su antiguo admirador.', effects: [{ grantFact: 'fa-miller' }], points: 10 }],
    },
    {
      id: 'ev-sotano',
      kind: 'report',
      title: 'Informe del hallazgo en el sótano',
      dated: '13 de julio de 1910',
      source: 'Inspector jefe Walter Dew',
      summary: 'Lo que había bajo los ladrillos.',
      autoDiscoverWhen: { flag: 'sotano-abierto' },
      related: { characters: ['ch-dew'], locations: ['lo-sotano'], events: ['te-hallazgo'] },
      body: [
        { type: 'heading', text: 'HILLDROP CRESCENT · SÓTANO DEL CARBÓN' },
        {
          type: 'typed',
          text: 'Al tantear con un atizador, varios ladrillos del suelo ceden. Debajo, tierra suelta y cal viva. {{dt-sotano-restos|A unos cuarenta centímetros, restos humanos sin cabeza ni huesos, envueltos en tela.}}',
        },
        {
          type: 'typed',
          text: '{{dt-sotano-pijama|Entre ellos, un trozo de chaqueta de pijama con la etiqueta «Jones Brothers, Holloway».}} También un rulo para el pelo de la marca Hinde con un mechón castaño.',
        },
        { type: 'signature', name: 'W. Dew, inspector jefe' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-hallazgo' }],
      details: [
        { id: 'dt-sotano-restos', label: 'Restos bajo el suelo', description: 'Alguien enterró un cuerpo en el sótano de la casa.', effects: [{ grantFact: 'fa-restos' }], points: 20 },
        { id: 'dt-sotano-pijama', label: 'Una chaqueta de pijama', description: 'La etiqueta de la tienda permite fechar la tela.', effects: [], points: 10 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-jones',
      kind: 'record',
      title: 'Registro de ventas de Jones Brothers',
      source: 'Almacenes Jones Brothers, Holloway Road',
      summary: 'Cuándo se vendió esa tela de pijama.',
      autoDiscoverWhen: { detail: 'dt-sotano-pijama' },
      related: { characters: ['ch-crippen'], locations: ['lo-casa'], events: [] },
      body: [
        {
          type: 'table',
          header: ['Artículo', 'Primera venta', 'Cliente'],
          rows: [
            ['Pijama de franela a rayas, modelo 1909', '{{dt-jones-fecha|Noviembre de 1908}}', '{{dt-jones-cliente|Tres juegos para Mrs. Crippen, 39 Hilldrop Crescent, enero de 1909}}'],
          ],
        },
        { type: 'paragraph', text: 'En el dormitorio de Crippen se hallan dos pantalones de este modelo; falta la chaqueta de uno.' },
      ],
      details: [
        { id: 'dt-jones-fecha', label: 'Tela de 1908', description: 'Los restos se enterraron después de 1908, cuando Crippen ya vivía allí.', effects: [], points: 15 },
        { id: 'dt-jones-cliente', label: 'Comprado para la casa', description: 'El pijama se compró para el 39 de Hilldrop Crescent, y su pantalón sigue en el dormitorio de Crippen.', effects: [{ grantFact: 'fa-pijama' }], points: 15 },
      ],
      decisive: true,
    },
    {
      id: 'ev-spilsbury',
      kind: 'report',
      title: 'Informe de Spilsbury y Willcox',
      source: 'Hospital St Mary’s · Ministerio del Interior',
      summary: 'Lo que dicen la piel y la química.',
      autoDiscoverWhen: { asked: 'q-spilsbury' },
      related: { characters: ['ch-spilsbury', 'ch-belle'], locations: ['lo-sotano'], events: [] },
      body: [
        { type: 'heading', text: 'PATOLOGÍA Y TOXICOLOGÍA' },
        {
          type: 'typed',
          text: '{{dt-spil-cicatriz|Un fragmento de piel del abdomen presenta una cicatriz lineal de unos diez centímetros, con su forma y posición características: corresponde a una operación quirúrgica.}} Mrs. Crippen fue operada del abdomen años atrás.',
        },
        {
          type: 'typed',
          text: '{{dt-spil-hioscina|El doctor Willcox halla en los órganos unos dos tercios de grano de hioscina, alcaloide sedante muy poco usado en Inglaterra. Una dosis así es mortal.}}',
        },
        { type: 'signature', name: 'B. H. Spilsbury · W. H. Willcox' },
      ],
      details: [
        { id: 'dt-spil-cicatriz', label: 'La cicatriz', description: 'Los restos tienen la cicatriz de la operación de Belle.', effects: [{ grantFact: 'fa-cicatriz' }], points: 20 },
        { id: 'dt-spil-hioscina', label: 'Hioscina', description: 'La víctima fue envenenada con un sedante rarísimo.', effects: [{ grantFact: 'fa-hioscina' }], points: 20 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-farmacia',
      kind: 'record',
      title: 'Libro de venenos de Lewis & Burrows',
      source: 'Farmacia de New Oxford Street',
      summary: 'Una compra hecha dos semanas antes.',
      autoDiscoverWhen: { fact: 'fa-hioscina' },
      related: { characters: ['ch-crippen'], locations: ['lo-albion'], events: ['te-compra'] },
      body: [
        {
          type: 'table',
          header: ['Fecha', 'Comprador', 'Producto', 'Uso declarado'],
          rows: [['{{dt-farm-fecha|19-ene-1910}}', '{{dt-farm-crippen|Dr. H. H. Crippen, por cuenta de Munyon}}', 'Hidrobromuro de hioscina, 5 granos', 'Preparados homeopáticos']],
        },
        { type: 'paragraph', text: 'El farmacéutico nunca había vendido tanta cantidad de una vez; tuvo que pedirla al proveedor.' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-compra' }],
      details: [
        { id: 'dt-farm-fecha', label: 'Dos semanas antes', description: 'La compra es anterior a la desaparición: hubo premeditación.', effects: [], points: 10 },
        { id: 'dt-farm-crippen', label: 'La compró Crippen', description: 'El veneno de los restos estaba en manos de Crippen.', effects: [{ grantFact: 'fa-compra' }], points: 20 },
      ],
      decisive: true,
      points: 10,
    },
    {
      id: 'ev-telegrama',
      kind: 'letter',
      title: 'Radiotelegrama del SS Montrose',
      dated: '22 de julio de 1910',
      source: 'Estación Marconi de Poldhu',
      summary: 'Un capitán ve algo raro a bordo.',
      autoDiscoverWhen: { asked: 'q-kendall' },
      related: { characters: ['ch-kendall', 'ch-crippen', 'ch-ethel'], locations: ['lo-montrose'], events: ['te-montrose'] },
      body: [
        {
          type: 'typed',
          text: '{{dt-tel-texto|TENGO FUERTES SOSPECHAS DE QUE EL ASESINO DE LA BODEGA DE LONDRES CRIPPEN Y SU CÓMPLICE VAN ENTRE LOS PASAJEROS STOP BIGOTE AFEITADO DEJÁNDOSE BARBA STOP CÓMPLICE VESTIDA DE MUCHACHO STOP MODALES Y FIGURA SIN DUDA DE MUJER}}',
        },
        { type: 'signature', name: 'Kendall, capitán' },
      ],
      onExamine: [{ unlockTimelineEvent: 'te-montrose' }],
      details: [{ id: 'dt-tel-texto', label: 'Disfrazados a bordo', description: 'Huyen con nombres falsos y disfraz: no es la conducta de un marido abandonado.', effects: [], points: 15 }],
    },
    {
      id: 'ev-cuentas',
      kind: 'record',
      title: 'Cuenta de ahorro del matrimonio Crippen',
      source: 'Charing Cross Bank',
      summary: 'Seiscientas libras a nombre de los dos.',
      autoDiscoverWhen: { asked: 'q-clara-matrimonio' },
      related: { characters: ['ch-crippen', 'ch-belle'], locations: [], events: [] },
      body: [
        {
          type: 'table',
          header: ['Fecha', 'Movimiento'],
          rows: [
            ['dic-1909', 'Saldo: 600 libras. Cuenta conjunta; cualquiera de los dos puede disponer con aviso de doce meses.'],
            ['{{dt-cuenta-aviso|15-dic-1909}}', '{{dt-cuenta-aviso-txt|Mrs. Crippen notifica su intención de retirar el saldo íntegro.}}'],
          ],
        },
      ],
      details: [
        { id: 'dt-cuenta-aviso', label: 'Diciembre de 1909', description: 'Un mes antes de la compra de hioscina.', effects: [], points: 5 },
        { id: 'dt-cuenta-aviso-txt', label: 'Belle iba a llevarse los ahorros', description: 'Belle preparaba su marcha… con todo el dinero.', effects: [{ grantFact: 'fa-ahorros' }, { unlockTimelineEvent: 'te-aviso' }], points: 15 },
      ],
    },
  ],

  deductions: [
    {
      id: 'de-viaje',
      title: 'Nadie se fue a América',
      combine: ['dt-armario-ropa', 'dt-dimision-letra'],
      explanation: 'Belle no se llevó ni un vestido, y la carta en la que se despide no es suya. No se marchó: alguien quería que pareciera que se había marchado.',
      points: 30,
    },
    {
      id: 'de-pijama',
      title: 'Enterrada después de 1908',
      combine: ['dt-sotano-pijama', 'dt-jones-cliente'],
      explanation: 'La chaqueta de pijama del sótano es de un modelo vendido desde finales de 1908 y comprado para la propia casa: los restos se enterraron con Crippen viviendo allí.',
      effects: [{ grantFact: 'fa-pijama' }],
      points: 30,
    },
    {
      id: 'de-veneno',
      title: 'La hioscina del doctor',
      combine: ['dt-spil-hioscina', 'dt-farm-crippen'],
      explanation: 'El veneno hallado en los restos es el que Crippen compró dos semanas antes de que Belle desapareciera.',
      points: 40,
    },
    {
      id: 'de-identidad',
      title: 'Los restos son de Belle',
      combine: ['dt-spil-cicatriz', 'dt-sotano-restos'],
      explanation: 'Los restos del sótano llevan la cicatriz de la operación de Belle.',
      points: 30,
    },
  ],

  contradictions: [
    {
      id: 'cx-crippen-muerte',
      title: 'Belle no murió en América',
      a: { line: 'ln-crippen-murio' },
      b: { detail: 'dt-nash-cuentos' },
      explanation: 'Crippen insiste en que Belle murió en California; a los Nash les dio tres versiones distintas, y en América nadie sabe nada.',
      effects: [{ grantFact: 'fa-mentira' }],
      points: 20,
    },
    {
      id: 'cx-crippen-miller',
      title: 'Belle no está con Miller',
      a: { line: 'ln-crippen-miller' },
      b: { detail: 'dt-miller-nada' },
      explanation: 'Crippen dice que Belle se fue con Bruce Miller; Miller no la ve desde 1904.',
      points: 20,
    },
    {
      id: 'cx-ethel-broche',
      title: 'Ethel sabía de quién era el broche',
      a: { line: 'ln-ethel-broche' },
      b: { detail: 'dt-baile-broche' },
      explanation: 'Ethel dice que el broche era un regalo nuevo; todas las amigas de Belle lo reconocieron en el baile.',
      effects: [{ revealSecret: 'se-ethel' }],
      points: 20,
    },
  ],

  secrets: [
    { id: 'se-ethel', characterId: 'ch-ethel', text: 'Ethel sabía que las joyas y las pieles eran de Belle: Crippen le dijo que Belle se había ido y que ya no las necesitaba. Prefirió no preguntar más. No hay prueba de que supiera lo del sótano.', points: 20 },
    { id: 'se-crippen', characterId: 'ch-crippen', text: 'Belle había avisado al banco de que se llevaría los ahorros. Crippen, sin dinero propio, iba a perderlo todo y a seguir sin poder casarse con Ethel.', revealedWhen: { fact: 'fa-ahorros' }, points: 20 },
  ],

  interrogations: [
    {
      id: 'in-crippen',
      characterId: 'ch-crippen',
      setting: 'En su despacho de Albion House. Ordena los frascos de su escritorio con dedos tranquilos y sonríe con educación.',
      opening: [{ text: 'Inspector, caballero: comprendo la preocupación de las amigas de mi pobre esposa. Pregunten lo que deseen; no tengo prisa.' }],
      topics: [
        {
          id: 'tp-crippen-belle',
          label: 'Belle',
          kind: 'victim',
          questions: [
            {
              id: 'q-crippen-belle',
              prompt: '¿Dónde está su esposa?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Viajó a América por un asunto de familia, en febrero. Allí enfermó.', tone: 'lie' },
                    { id: 'ln-crippen-murio', text: 'Murió en California, de una neumonía, en marzo. Sus cenizas me las enviarán.', tone: 'lie' },
                  ],
                },
              ],
            },
            {
              id: 'q-crippen-cx',
              prompt: 'A los Nash les dijo tres ciudades distintas, y en América nadie sabe nada de esa muerte.',
              kind: 'contradiction',
              contradiction: 'cx-crippen-muerte',
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Crippen se quita las gafas, las limpia y vuelve a ponérselas.' },
                    { text: 'Está bien. Es mentira. Belle no ha muerto, que yo sepa. Me dejó, la noche del 31, por otro hombre.', tone: 'admission' },
                    { id: 'ln-crippen-miller', text: 'Por un americano, Bruce Miller. Se habrá ido a Chicago con él. Me inventé lo demás por vergüenza.', tone: 'lie' },
                  ],
                  effects: [{ grantFact: 'fa-mentira' }, { unlockTimelineEvent: 'te-falso-marcha' }],
                },
              ],
            },
            {
              id: 'q-crippen-noche',
              prompt: '¿Qué pasó después de la cena del 31?',
              kind: 'ask',
              requires: { fact: 'fa-mentira' },
              responses: [{ lines: [{ text: 'Se puso furiosa porque no acompañé al señor Martinetti a buscar un coche. Me gritó que se iba. A la mañana siguiente, ya no estaba.', tone: 'lie' }] }],
            },
          ],
        },
        {
          id: 'tp-crippen-pruebas',
          label: 'El sótano y la hioscina',
          kind: 'other',
          questions: [
            {
              id: 'q-crippen-hioscina',
              prompt: '¿Para qué compró cinco granos de hioscina en enero?',
              kind: 'confront',
              requires: { fact: 'fa-compra' },
              responses: [{ lines: [{ text: 'Para preparados homeopáticos. En dosis ínfimas, es un calmante excelente para los nervios.', tone: 'evasion' }] }],
            },
            {
              id: 'q-crippen-final',
              prompt: 'Los restos del sótano tienen la cicatriz de Belle y su hioscina. Y la chaqueta de pijama es de su casa.',
              kind: 'confront',
              requires: { all: [{ fact: 'fa-cicatriz' }, { fact: 'fa-compra' }, { fact: 'fa-pijama' }] },
              responses: [
                {
                  lines: [
                    { speaker: 'narration', text: 'Por primera vez, el doctor no responde enseguida. Mira el reloj de bolsillo, lo cierra.' },
                    { text: 'No tengo nada que decir sobre eso. Solo esto: Ethel no sabía nada. Nada. Que no la toquen.', tone: 'admission' },
                  ],
                  effects: [{ setFlag: 'crippen-protege' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-ethel',
      characterId: 'ch-ethel',
      setting: 'En la cocina de Hilldrop Crescent, que ahora es la suya. Lleva un delantal sobre un vestido demasiado caro para una mecanógrafa.',
      opening: [{ text: 'El doctor me dijo que la señora se había ido. Yo… no hice preguntas.' }],
      topics: [
        {
          id: 'tp-ethel-joyas',
          label: 'Las joyas',
          kind: 'personal',
          questions: [
            {
              id: 'q-ethel-broche',
              prompt: '¿De dónde salió el broche que llevó al baile?',
              kind: 'ask',
              responses: [{ lines: [{ id: 'ln-ethel-broche', text: 'Me lo regaló el doctor. Lo compró para mí. Es nuevo.', tone: 'lie' }] }],
            },
            {
              id: 'q-ethel-cx',
              prompt: 'Todas las amigas de Belle reconocieron su broche en el baile.',
              kind: 'contradiction',
              contradiction: 'cx-ethel-broche',
              responses: [
                {
                  lines: [
                    { text: 'Él me dijo que ella se había ido con otro y que ya no lo quería. Las pieles también. ¿Qué iba a pensar?', tone: 'admission' },
                    { text: 'No pregunté. No quería saber. Yo solo quería… que por fin fuéramos un matrimonio.', tone: 'admission' },
                    { text: 'Las otras joyas, los anillos, los llevó él a empeñar en febrero. Dijo que ella no iba a volver a por ellos.', tone: 'truth' },
                  ],
                  effects: [{ grantFact: 'fa-joyas' }],
                },
              ],
            },
          ],
        },
        {
          id: 'tp-ethel-noche',
          label: 'Febrero',
          kind: 'events',
          questions: [
            {
              id: 'q-ethel-febrero',
              prompt: '¿Notó algo raro en el doctor a primeros de febrero?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'El día 1 llegó a la oficina muy tarde, y me dijo: «Belle se ha ido a América». Estaba tranquilo. Más que nunca.', tone: 'truth' }] }],
            },
          ],
        },
      ],
    },
    {
      id: 'in-clara',
      characterId: 'ch-clara',
      setting: 'En el salón de los Martinetti, rodeada de fotografías de escena firmadas.',
      opening: [{ text: '¿Belle irse sin decírmelo? Antes se va el Támesis. Algo le ha pasado.' }],
      topics: [
        {
          id: 'tp-clara-cena',
          label: 'La última cena',
          kind: 'events',
          questions: [
            {
              id: 'q-clara-cena',
              prompt: 'Cuénteme la noche del 31 de enero.',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Cenamos en Hilldrop Crescent, jugamos a las cartas. Paul se puso malo y nos fuimos a la una y media.', tone: 'truth' },
                    { text: 'Belle nos despidió en la puerta, en bata, riéndose y diciendo que no cogiéramos frío. No hubo ninguna pelea mientras estuvimos.', tone: 'truth' },
                  ],
                  effects: [{ grantFact: 'fa-ultima' }, { unlockTimelineEvent: 'te-cena' }],
                },
              ],
            },
            {
              id: 'q-clara-baile',
              prompt: '¿Vio al doctor después?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'En el baile de la Guild, el día 20. Con su secretaria del brazo. ¡Y con el broche de Belle! Casi me desmayo.', tone: 'truth' }] }],
            },
          ],
        },
        {
          id: 'tp-clara-matrimonio',
          label: 'El matrimonio',
          kind: 'person',
          about: 'ch-crippen',
          questions: [
            {
              id: 'q-clara-matrimonio',
              prompt: '¿Cómo se llevaban?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'Mal. Ella sabía lo de la mecanógrafa. En diciembre me dijo que estaba harta, que iba a sacar los ahorros del banco y a dejarle sin un penique.', tone: 'truth' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-dew',
      characterId: 'ch-dew',
      setting: 'En la acera de Hilldrop Crescent, con las manos a la espalda y el sombrero hongo calado.',
      opening: [{ text: 'Una esposa que se va no es un delito. Una esposa que se va sin su ropa… eso ya me gusta menos.' }],
      topics: [
        {
          id: 'tp-dew-casa',
          label: 'La casa',
          kind: 'other',
          questions: [
            {
              id: 'q-dew-registro',
              prompt: '¿Registramos la casa?',
              kind: 'ask',
              responses: [{ lines: [{ text: 'El doctor nos la enseña encantado. Dormitorios, armarios, el jardín. Fíjese en los armarios de ella; yo me fijaré en él.', tone: 'truth' }] }],
            },
            {
              id: 'q-dew-sotano',
              prompt: 'Han huido. Hay que volver a la casa y mirarlo todo.',
              kind: 'ask',
              requires: { fact: 'fa-huida' },
              responses: [
                {
                  lines: [
                    { text: 'Tres días levantando tablas y cavando el jardín. Y nada. Solo queda ese sótano del carbón.', tone: 'truth' },
                    { speaker: 'narration', text: 'Dew golpea el suelo de ladrillo con un atizador. Uno de los ladrillos se mueve.' },
                  ],
                  effects: [{ setFlag: 'sotano-abierto' }],
                },
              ],
            },
          ],
        },
        {
          id: 'tp-dew-huida',
          label: 'El doctor',
          kind: 'person',
          about: 'ch-crippen',
          questions: [
            {
              id: 'q-dew-volver',
              prompt: '¿Cómo reaccionó el doctor tras la declaración?',
              kind: 'ask',
              requires: { fact: 'fa-mentira' },
              responses: [
                {
                  lines: [{ text: 'Volví a la oficina el día 11 para unas preguntas más. Ni él ni la señorita Le Neve. Se fueron el día 9, al día siguiente de hablar conmigo, y él le pidió a un empleado que le comprara ropa de muchacho.', tone: 'truth' }],
                  effects: [{ grantFact: 'fa-huida' }, { unlockTimelineEvent: 'te-huida' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-kendall',
      characterId: 'ch-kendall',
      setting: 'En el puente del Montrose, frente al río San Lorenzo, con un ejemplar del Daily Mail doblado bajo el brazo.',
      opening: [{ text: 'Fíjese en el señor Robinson y su hijo, los del camarote cinco. El chico se coge de la mano de su padre como no lo hace ningún chico.' }],
      topics: [
        {
          id: 'tp-kendall-pasajeros',
          label: 'Los Robinson',
          kind: 'events',
          questions: [
            {
              id: 'q-kendall',
              prompt: '¿Por qué sospechó de ellos?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'El padre tiene la marca de unas gafas en la nariz y no las lleva. Se está dejando barba donde hasta hace poco había un bigote. Y el pantalón del chico va sujeto con imperdibles.', tone: 'truth' },
                    { text: 'Mandé un telegrama por el Marconi. Su inspector Dew viene detrás en el Laurentic, que es más rápido. Llegará antes que nosotros.', tone: 'truth' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'in-spilsbury',
      characterId: 'ch-spilsbury',
      setting: 'En el laboratorio del St Mary’s, ante un portaobjetos. Huele a formol.',
      opening: [{ text: 'Me dicen que los restos podrían ser de cualquiera y de cualquier época. Veamos qué dice el microscopio.' }],
      topics: [
        {
          id: 'tp-spil-restos',
          label: 'Los restos',
          kind: 'other',
          questions: [
            {
              id: 'q-spilsbury',
              prompt: '¿Puede decirse de quién son?',
              kind: 'ask',
              responses: [
                {
                  lines: [
                    { text: 'No hay cabeza ni huesos, pero la piel conserva una cicatriz. Y el doctor Willcox ha encontrado un alcaloide en los órganos. Le paso el informe.', tone: 'truth' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // t = minutos respecto a la muerte (madrugada del 1 de febrero de 1910)
  timeline: [
    { id: 'te-aviso', t: -67680, display: '15 de diciembre de 1909', title: 'Belle avisa al banco de que retirará los ahorros', description: 'Las seiscientas libras de la cuenta común.', characters: ['ch-belle'], key: true },
    { id: 'te-compra', t: -18000, display: '19 de enero de 1910', title: 'Crippen compra cinco granos de hioscina', description: 'En Lewis & Burrows.', characters: ['ch-crippen'], location: 'lo-albion', key: true },
    { id: 'te-cena', t: -60, display: '31 de enero, noche', title: 'Cena con los Martinetti en Hilldrop Crescent', description: 'Belle les despide en la puerta a la una y media.', characters: ['ch-belle', 'ch-crippen', 'ch-clara'], location: 'lo-casa', key: true },
    { id: 'te-desaparece', t: 0, display: '1 de febrero, madrugada', title: 'Belle Elmore desaparece', description: 'Nadie volverá a verla.', characters: ['ch-belle'], location: 'lo-casa', key: true },
    { id: 'te-falso-marcha', t: 600, display: '1 de febrero', title: 'Belle se marcha de casa con Bruce Miller', description: 'Según Crippen.', characters: ['ch-belle'], veracity: 'false', claimedBy: 'ch-crippen' },
    { id: 'te-dimision', t: 1500, display: '2 de febrero', title: 'Crippen entrega a la Guild una dimisión «de Belle»', description: 'Con una letra que no es la suya.', characters: ['ch-crippen'], key: true },
    { id: 'te-baile', t: 27360, display: '20 de febrero', title: 'Ethel lleva el broche de Belle al baile de la Guild', description: 'Del brazo de Crippen, en el Criterion.', characters: ['ch-ethel', 'ch-crippen'], key: true },
    { id: 'te-necrologica', t: 77760, display: '26 de marzo', title: 'Crippen publica la muerte de Belle en The Era', description: '«En California».', characters: ['ch-crippen'], key: true },
    { id: 'te-huida', t: 228960, display: '9 de julio', title: 'Crippen y Ethel huyen tras el interrogatorio', description: 'Ella, vestida de muchacho.', characters: ['ch-crippen', 'ch-ethel'], key: true },
    { id: 'te-hallazgo', t: 234720, display: '13 de julio', title: 'Dew halla restos bajo el suelo del sótano', description: 'Enterrados en cal, bajo los ladrillos del carbón.', characters: ['ch-dew'], location: 'lo-sotano', key: true },
    { id: 'te-montrose', t: 247680, display: '22 de julio', title: 'El capitán Kendall avisa por telegrafía sin hilos', description: 'Desde el Montrose, en pleno Atlántico.', characters: ['ch-kendall'], location: 'lo-montrose', key: true },
  ],

  accusation: {
    motives: [
      { id: 'mo-ethel-dinero', label: 'Quedarse con los ahorros que Belle iba a llevarse y empezar una vida con Ethel', availableWhen: { fact: 'fa-ahorros' } },
      { id: 'mo-celos', label: 'Celos: Belle se iba con Bruce Miller' },
      { id: 'mo-ethel-casa', label: 'Ethel quería ocupar el lugar de Belle en la casa', availableWhen: { fact: 'fa-broche' } },
      { id: 'mo-accidente', label: 'Ninguno: fue una dosis de calmante mal calculada' },
    ],
    methods: [
      { id: 'me-hioscina', label: 'La envenenó con hioscina en casa y enterró sus restos en cal bajo el suelo del sótano', availableWhen: { all: [{ fact: 'fa-restos' }, { fact: 'fa-hioscina' }] } },
      { id: 'me-golpe', label: 'La golpeó durante una pelea tras la cena' },
      { id: 'me-viaje', label: 'La mató durante un viaje y la trajo de vuelta' },
      { id: 'me-arsenico', label: 'La envenenó poco a poco con arsénico durante meses' },
    ],
  },

  solution: {
    culprits: ['ch-crippen'],
    motive: 'mo-ethel-dinero',
    method: 'me-hioscina',
    proof: ['ev-spilsbury', 'ev-farmacia', 'ev-jones', 'ev-sotano'],
    whatHappened:
      'Hawley Harvey Crippen mató a su esposa, Cora («Belle Elmore»), la madrugada del 1 de febrero de 1910, poco después de que se marcharan sus invitados. Belle había avisado al banco de que se llevaría los ahorros comunes, y Crippen quería vivir con su amante, Ethel Le Neve. Le dio una dosis mortal de hioscina, comprada dos semanas antes, descuartizó el cuerpo y enterró los restos en cal bajo el suelo del sótano del carbón. Al día siguiente llevó a la Guild una dimisión escrita por otra mano; empeñó joyas, dejó que Ethel luciera el broche de Belle y publicó su muerte en California. Cuando Dew le interrogó, cambió de historia y huyó disfrazado. Los restos, con la cicatriz de Belle, la hioscina y un pijama de la casa, lo condenaron.',
    reconstruction: [
      'Diciembre de 1909: Belle, harta, avisa al banco de que retirará los ahorros.',
      '19 de enero: Crippen compra cinco granos de hioscina.',
      '31 de enero: cena con los Martinetti; Belle los despide a la una y media, de buen humor.',
      'Esa madrugada, Crippen le da la hioscina. Esconde los restos bajo el suelo del sótano, en cal, envueltos en un pijama de la casa.',
      '2 de febrero: entrega una dimisión «de Belle». Después empeña sus joyas y deja que Ethel se mude.',
      'Marzo: anuncia en The Era que Belle ha muerto en California.',
      '8 de julio: ante Dew, admite la mentira y culpa a un amante americano. Al día siguiente huye con Ethel, disfrazada de muchacho.',
      'Dew halla los restos el 13 de julio; el capitán Kendall reconoce a los fugitivos y avisa por telegrafía sin hilos.',
    ],
    decisiveEvidence: ['ev-dimision', 'ev-sotano', 'ev-jones', 'ev-spilsbury', 'ev-farmacia'],
    alibiTruths: [
      { characterId: 'ch-crippen', truth: 'Belle no se fue con nadie: estaba bajo el suelo de su sótano. Bruce Miller no la veía desde 1904.' },
      { characterId: 'ch-ethel', truth: 'Sabía que las joyas eran de Belle y prefirió no preguntar; no hay prueba de que supiera del asesinato.' },
    ],
  },

  endings: [
    {
      id: 'en-telegrafo',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct', knowledge: { fact: 'fa-huida' } },
      outcome: 'success',
      title: 'Buenos días, doctor Crippen',
      text: 'El 31 de julio, frente a Father Point, el inspector Dew sube al Montrose vestido de práctico y saluda: «Buenos días, doctor Crippen». Es la primera vez que la telegrafía sin hilos atrapa a un fugitivo. Crippen es condenado en octubre y ahorcado en Pentonville el 23 de noviembre de 1910, con una fotografía de Ethel sobre el pecho. Ella es juzgada aparte y absuelta.',
    },
    {
      id: 'en-exito',
      when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' },
      outcome: 'success',
      title: 'Bajo los ladrillos',
      text: 'La cicatriz, la hioscina y el pijama bastan. Crippen es condenado. Hasta el final dirá que Ethel no sabía nada.',
    },
    { id: 'en-parcial', when: { culprit: 'correct' }, outcome: 'partial', title: 'Duda razonable', text: 'Crippen va a juicio, pero la acusación no explica bien cómo ni por qué. La defensa sostiene que los restos llevaban allí años, de antes de que llegaran los Crippen.' },
    { id: 'en-ethel', when: { culprit: 'ch-ethel' }, outcome: 'failure', title: 'La mecanógrafa', text: 'Ethel Le Neve es acusada de un crimen del que no hay prueba de que supiera nada. Un jurado la absuelve en veinte minutos.' },
    { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Se fue a América', text: 'Oficialmente, Belle Elmore se marchó a América. Sus vestidos de escena acaban en una casa de empeños de Camden.' },
  ],

  hints: [
    {
      id: 'hl-mentira',
      topic: 'La muerte en América',
      relevantWhen: { not: { fact: 'fa-mentira' } },
      steps: ['¿Quién es la única fuente de la muerte de Belle?', 'Lee la denuncia de John Nash: el doctor no cuenta siempre lo mismo.', 'Pregunta a Crippen dónde está su esposa y señálale las versiones distintas.'],
    },
    {
      id: 'hl-sotano',
      topic: 'La casa',
      relevantWhen: { all: [{ fact: 'fa-huida' }, { not: { flag: 'sotano-abierto' } }] },
      steps: ['El doctor ha huido: ya no hay que pedirle permiso para nada.', 'Habla con el inspector Dew.', 'Pídele volver a registrar la casa a fondo.'],
    },
    {
      id: 'hl-pruebas',
      topic: 'Unir los restos con Crippen',
      relevantWhen: { all: [{ fact: 'fa-restos' }, { not: { fact: 'fa-compra' } }] },
      steps: ['¿Quién puede decir algo de esos restos?', 'Habla con Spilsbury.', 'Busca dónde se vendió el veneno que encuentre.'],
    },
  ],

  objectives: [
    { id: 'ob-mentira', text: 'Desmonta la historia de la muerte en América.', completeWhen: { fact: 'fa-mentira' }, points: 30 },
    { id: 'ob-pijama', text: 'Demuestra cuándo se enterraron los restos.', completeWhen: { fact: 'fa-pijama' }, points: 30 },
    { id: 'ob-ethel', text: 'Averigua qué sabía Ethel.', completeWhen: { secret: 'se-ethel' }, points: 20, hidden: true },
  ],

  assets: [],
};

export default caseFile;
