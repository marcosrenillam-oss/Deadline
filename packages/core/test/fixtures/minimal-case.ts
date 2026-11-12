import type { CaseFileInput } from '../../src/case/schema.ts';

/**
 * EXPEDIENTE DE PRUEBA (no es contenido jugable).
 * Mínimo pero coherente: sirve para comprobar el esquema, la integridad y la
 * simulación de resolubilidad. Los casos reales se escriben en la Etapa 3.
 */
export function minimalCase(): CaseFileInput {
  return {
    schemaVersion: 1,
    id: 'DL-I-9001',
    contentVersion: 1,
    mode: 'individual',
    title: 'La llave del invernadero',
    origin: 'fiction',
    era: 'c20',
    eraLabel: 'Bath, 1953',
    year: 1953,
    location: { city: 'Bath', place: 'Casa Whitcombe', country: 'Inglaterra' },
    category: 'robbery',
    difficulty: 'detective',
    keywords: ['orquídea', 'invernadero'],
    ambience: { music: 'archive-rain', mood: 'melancholic' },
    maxHints: 3,
    briefing: {
      incidentDisplay: 'Domingo, 14 de junio de 1953 · 07:10',
      summary: 'Ha desaparecido una orquídea premiada del invernadero cerrado con llave.',
      context: 'La señora Whitcombe exhibía la flor al día siguiente.',
      background: 'Solo hay dos llaves del invernadero.',
      victim: 'ch-whitcombe',
      initialFacts: ['fa-dos-llaves'],
      initialEvidence: ['ev-informe', 'ev-maceta'],
      initialTimeline: ['te-cierre'],
    },
    characters: [
      { id: 'ch-whitcombe', name: 'Edith Whitcombe', role: 'victim', occupation: 'Propietaria', summary: 'Dueña de la orquídea.', biography: 'Viuda, cultivadora de orquídeas.' },
      {
        id: 'ch-hale',
        name: 'Arthur Hale',
        role: 'suspect',
        occupation: 'Jardinero',
        summary: 'Tiene la segunda llave.',
        biography: 'Lleva veinte años al servicio de la casa.',
        alibi: { claim: 'Dormía en la casa del guarda desde las diez.' },
      },
      { id: 'ch-pryce', name: 'Lionel Pryce', role: 'suspect', occupation: 'Rival en el concurso', summary: 'Compite en la misma categoría.', biography: 'Coleccionista de Bristol.' },
    ],
    facts: [
      { id: 'fa-dos-llaves', text: 'Solo existen dos llaves: la de la señora y la del jardinero.' },
      { id: 'fa-barro', text: 'El barro de las botas de Hale es del invernadero.', important: true },
      { id: 'fa-deuda', text: 'Hale debe dinero a Pryce.', derivedWhen: { all: [{ evidence: 'ev-pagare' }, { examined: 'ev-pagare' }] } },
    ],
    evidence: [
      { id: 'ev-informe', kind: 'report', title: 'Informe del agente', summary: 'Puerta intacta, cerrada con llave.', body: [{ type: 'typed', text: 'Sin signos de forzamiento.' }] },
      {
        id: 'ev-maceta',
        kind: 'object',
        title: 'Maceta vacía',
        summary: 'La maceta donde estaba la orquídea.',
        body: [{ type: 'paragraph', text: 'Hay una huella de bota en el sustrato.' }],
        details: [{ id: 'dt-huella', label: 'Huella con tacón remendado', description: 'El tacón izquierdo lleva un parche.', effects: [{ grantEvidence: 'ev-botas' }] }],
      },
      {
        id: 'ev-botas',
        kind: 'physical',
        title: 'Botas de Hale',
        summary: 'Botas con el tacón izquierdo remendado.',
        body: [{ type: 'paragraph', text: 'Restos de turba de orquídeas en la suela.' }],
        onExamine: [{ grantFact: 'fa-barro' }, { unlockTimelineEvent: 'te-entrada' }],
        decisive: true,
      },
      {
        id: 'ev-pagare',
        kind: 'document',
        title: 'Pagaré',
        summary: 'Pagaré firmado por Hale a favor de Pryce.',
        body: [{ type: 'field', label: 'Importe', value: '40 libras' }, { type: 'quote', text: 'Lo saldaré antes del concurso.', lineId: 'ln-pagare' }],
        autoDiscoverWhen: { asked: 'q-hale-deudas' },
      },
    ],
    contradictions: [
      { id: 'cx-coartada', title: 'Dormía, pero pisó el invernadero', a: { line: 'ln-hale-dormia' }, b: { fact: 'fa-barro' }, explanation: 'La turba fresca contradice que no saliera.', points: 50 },
    ],
    secrets: [{ id: 'se-trato', characterId: 'ch-hale', text: 'Pryce le perdonaba la deuda a cambio de la flor.', revealedWhen: { all: [{ fact: 'fa-deuda' }, { contradiction: 'cx-coartada' }] }, points: 40 }],
    interrogations: [
      {
        id: 'in-hale',
        characterId: 'ch-hale',
        opening: [{ text: 'No sé nada de esa flor, inspector.' }],
        topics: [
          {
            id: 'tp-hale-noche',
            label: 'La noche del sábado',
            kind: 'alibi',
            questions: [
              { id: 'q-hale-noche', prompt: '¿Dónde estuvo anoche?', kind: 'ask', responses: [{ lines: [{ id: 'ln-hale-dormia', text: 'Dormía desde las diez.', tone: 'lie' }] }] },
              { id: 'q-hale-deudas', prompt: '¿Tiene usted deudas?', kind: 'press', requires: { asked: 'q-hale-noche' }, responses: [{ lines: [{ text: 'Unas pocas. Como todo el mundo.', tone: 'evasion' }] }] },
              {
                id: 'q-hale-botas',
                prompt: 'Explíqueme esta turba en sus botas.',
                kind: 'present',
                presentEvidence: 'ev-botas',
                responses: [
                  { when: { contradiction: 'cx-coartada' }, lines: [{ text: 'Está bien… entré. Pero no por gusto.', tone: 'admission' }], effects: [{ setFlag: 'hale-confiesa' }] },
                  { lines: [{ text: 'Trabajo allí todos los días.', tone: 'evasion' }] },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'in-pryce',
        characterId: 'ch-pryce',
        opening: [{ text: 'Supongo que me consideran el primer sospechoso.' }],
        topics: [{ id: 'tp-pryce', label: 'El concurso', kind: 'events', questions: [{ id: 'q-pryce-1', prompt: '¿Quién ganaría sin esa orquídea?', kind: 'ask', responses: [{ lines: [{ text: 'Yo, evidentemente.', tone: 'truth' }] }] }] }],
      },
    ],
    timeline: [
      { id: 'te-cierre', t: -540, display: 'Sábado, 22:10', title: 'La señora cierra el invernadero', description: 'Cierra con su llave.', characters: ['ch-whitcombe'], key: true },
      { id: 'te-entrada', t: -300, display: 'Domingo, hacia las 02:00', title: 'Alguien entra con llave', description: 'Hale entra con su llave.', characters: ['ch-hale'], key: true },
      { id: 'te-dormia', t: -540, display: 'Sábado, 22:00', title: 'Hale dice que se acostó', description: 'Declaración falsa.', characters: ['ch-hale'], veracity: 'false', claimedBy: 'ch-hale' },
    ],
    accusation: {
      motives: [
        { id: 'mo-deuda', label: 'Saldar una deuda', availableWhen: { fact: 'fa-deuda' } },
        { id: 'mo-celos', label: 'Rivalidad en el concurso' },
      ],
      methods: [
        { id: 'me-llave', label: 'Entró con su propia llave', availableWhen: { fact: 'fa-barro' } },
        { id: 'me-ventana', label: 'Forzó una ventana' },
      ],
    },
    solution: {
      culprits: ['ch-hale'],
      motive: 'mo-deuda',
      method: 'me-llave',
      proof: ['ev-botas'],
      whatHappened: 'Hale robó la orquídea para saldar su deuda con Pryce.',
      reconstruction: ['Hale entró con su llave de madrugada.', 'Entregó la flor a Pryce.'],
      decisiveEvidence: ['ev-botas'],
      alibiTruths: [{ characterId: 'ch-hale', truth: 'No durmió: salió hacia las dos.' }],
    },
    endings: [
      { id: 'en-exito', when: { culprit: 'correct', motive: 'correct', method: 'correct', proof: 'correct' }, outcome: 'success', title: 'Flor devuelta', text: 'La orquídea aparece en Bristol.' },
      { id: 'en-parcial', when: { culprit: 'correct' }, outcome: 'partial', title: 'Culpable, pero sin todo', text: 'Hale confiesa, el resto queda en sombra.' },
      { id: 'en-fallo', when: {}, outcome: 'failure', title: 'Caso cerrado en falso', text: 'La flor nunca aparece.' },
    ],
    hints: [{ id: 'hl-suelo', topic: 'Lo que quedó en el suelo', relevantWhen: { not: { evidence: 'ev-botas' } }, steps: ['Mira dónde estaba la flor.', 'La maceta guarda una huella.', 'Ese tacón remendado tiene dueño.'] }],
    objectives: [{ id: 'ob-trato', text: 'Descubre qué ganaba el ladrón.', completeWhen: { secret: 'se-trato' }, points: 60 }],
  };
}
