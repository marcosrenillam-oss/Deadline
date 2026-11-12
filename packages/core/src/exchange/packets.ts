import { z } from 'zod';
import { sharePayloadSchema, sharedBoardSchema } from '../engine/coop.ts';
import { INVESTIGATOR_NUMBER_PATTERN } from '../profile/profile.ts';

/**
 * Mensajes del cooperativo por correspondencia (dos dispositivos, sin
 * servidor). Viajan como códigos DL1 firmados con la clave de la partida
 * (salvo la invitación, que es la que la transporta).
 */

const who = z.strictObject({ n: z.string().regex(INVESTIGATOR_NUMBER_PATTERN), a: z.string().optional() });
const role = z.enum(['A', 'B']);
const accusation = z.strictObject({ culprits: z.array(z.string()).min(1), motive: z.string(), method: z.string(), proof: z.string() });

export const invitePacket = z.strictObject({
  t: z.literal('invite'),
  sid: z.string().min(8),
  caseId: z.string(),
  cv: z.number().int(),
  hostRole: role,
  host: who,
  key: z.string().min(40),
  at: z.number().int(),
});

export const acceptPacket = z.strictObject({ t: z.literal('accept'), sid: z.string(), guest: who, startedAt: z.number().int() });

export const reportPacket = z.strictObject({
  t: z.literal('report'),
  sid: z.string(),
  seq: z.number().int().min(1),
  from: role,
  share: sharePayloadSchema,
  notes: z.array(z.string().max(2000)).max(30).default([]),
  message: z.string().max(1000).optional(),
  board: sharedBoardSchema.optional(),
  at: z.number().int(),
});

export const proposePacket = z.strictObject({ t: z.literal('propose'), sid: z.string(), seq: z.number().int().min(1), from: role, accusation, at: z.number().int() });

export const answerPacket = z.strictObject({
  t: z.literal('answer'),
  sid: z.string(),
  seq: z.number().int().min(1),
  from: role,
  agree: z.boolean(),
  accusation,
  at: z.number().int(),
});

export const sessionPacket = z.discriminatedUnion('t', [reportPacket, proposePacket, answerPacket]);
export type InvitePacket = z.infer<typeof invitePacket>;
export type AcceptPacket = z.infer<typeof acceptPacket>;
export type ReportPacket = z.infer<typeof reportPacket>;
export type ProposePacket = z.infer<typeof proposePacket>;
export type AnswerPacket = z.infer<typeof answerPacket>;
export type SessionPacket = z.infer<typeof sessionPacket>;
export type JointAccusation = z.infer<typeof accusation>;

export function sameAccusation(a: JointAccusation, b: JointAccusation): boolean {
  return a.motive === b.motive && a.method === b.method && a.proof === b.proof && [...a.culprits].sort().join() === [...b.culprits].sort().join();
}
