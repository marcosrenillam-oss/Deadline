import type { JointAccusation, SharePayload } from '@deadline/core';

/** Partida cooperativa guardada en el dispositivo. */
export interface CoopSession {
  id: string;
  caseId: string;
  contentVersion: number;
  mode: 'same-device' | 'correspondence';
  style: 'shared' | 'split';
  status: 'pending' | 'active' | 'closed';
  createdAt: number;
  startedAt?: number;
  /** Mesa compartida: papel que tiene ahora el dispositivo. Correspondencia: mi papel. */
  activeRole?: 'A' | 'B';
  myRole?: 'A' | 'B';
  host?: boolean;
  key?: string;
  me?: { n: string; a?: string };
  partner?: { n: string; a?: string };
  inviteCode?: string;
  acceptCode?: string;
  investigationIds: { A?: string; B?: string; shared?: string };
  /** Lo que yo he compartido y lo que he recibido (correspondencia). */
  sharedOut: SharePayload;
  received: SharePayload;
  seqOut: number;
  seenSeqs: number[];
  messages: Array<{ from: 'me' | 'partner' | 'A' | 'B'; text: string; at: number }>;
  proposal?: { from: 'A' | 'B'; accusation: JointAccusation; at: number; status: 'pending' | 'agreed' | 'rejected' };
  updatedAt: number;
}

/** Lo que el espacio de trabajo necesita saber del cooperativo. */
export interface CoopApi {
  session: CoopSession;
  role: 'A' | 'B' | undefined;
  roleTitle: string;
  /** Proponer la acusación conjunta. */
  propose: (a: JointAccusation) => Promise<void>;
  /** Responder a la propuesta del compañero. */
  answer: (agree: boolean) => Promise<void>;
  /** Abrir el panel de pareja (compartir, recibir, mensajes, acusación pendiente). */
  openPanel: () => void;
}
