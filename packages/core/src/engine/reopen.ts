import { emptyKnowledge, type SerializedKnowledge } from '../case/conditions.ts';
import type { CaseFile } from '../case/schema.ts';
import type { CaseRecord, Investigation } from '../investigation/state.ts';
import { REOPEN_COST } from '../progression/rules.ts';

/**
 * REAPERTURA DE EXPEDIENTES.
 *
 * Un expediente cerrado (por acusación o por tiempo) se puede reabrir. La
 * primera reapertura de cada expediente es gratuita (D-046); las siguientes
 * cuestan puntos. La investigación vuelve a empezar con un reloj nuevo, pero se
 * conserva lo que el jugador ya había descubierto: evidencias, detalles,
 * hechos, fichas de cronología y deducciones, además de su tablero, su
 * cronología y sus notas. Lo que se pierde es lo que dependía de la
 * conversación: preguntas formuladas, contradicciones señaladas, secretos
 * confesados y marcas narrativas. Hay que volver a interrogar.
 */

/** La primera reapertura de cada expediente es gratuita; las siguientes se pagan. */
export function reopenCost(c: CaseFile, record: Pick<CaseRecord, 'reopens'> | undefined): number {
  return (record?.reopens ?? 0) === 0 ? 0 : REOPEN_COST[c.difficulty];
}

export function carryOverKnowledge(k: SerializedKnowledge): SerializedKnowledge {
  return {
    ...emptySerialized(),
    facts: [...k.facts],
    evidence: [...k.evidence],
    examined: [...k.examined],
    details: [...k.details],
    timelineEvents: [...k.timelineEvents],
  };
}

function emptySerialized(): SerializedKnowledge {
  const e = emptyKnowledge();
  return Object.fromEntries(Object.keys(e).map((key) => [key, []])) as unknown as SerializedKnowledge;
}

/** Trabajo del jugador que pasa a la nueva investigación. */
export function carryOverWorkspace(prev: Investigation): Pick<Investigation, 'board' | 'timeline' | 'evidenceMarks' | 'associations' | 'deductions'> {
  return {
    board: prev.board,
    timeline: prev.timeline,
    evidenceMarks: prev.evidenceMarks,
    associations: prev.associations,
    deductions: prev.deductions,
  };
}
