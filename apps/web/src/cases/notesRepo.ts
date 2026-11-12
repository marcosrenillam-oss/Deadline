import { newId, type Note } from '@deadline/core';
import { getDB } from '../storage/db.ts';

export async function listNotes(caseId?: string): Promise<Note[]> {
  const db = await getDB();
  const all = caseId === undefined ? await db.getAll('notes') : await db.getAllFromIndex('notes', 'byCase', caseId);
  return all.filter((n) => !n.deletedAt).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
}

export function draftNote(patch: Partial<Note> = {}): Note {
  const now = Date.now();
  return { id: newId(), kind: 'note', text: '', refs: [], pinned: false, done: false, createdAt: now, updatedAt: now, rev: 0, ...patch };
}

export async function saveNote(n: Note): Promise<Note> {
  const next = { ...n, updatedAt: Date.now(), rev: n.rev + 1 };
  await (await getDB()).put('notes', next);
  return next;
}

/** Borrado lógico: la nota desaparece pero se conserva para fusionar copias sin "resucitarla". */
export async function deleteNote(n: Note): Promise<void> {
  await (await getDB()).put('notes', { ...n, deletedAt: Date.now(), updatedAt: Date.now(), rev: n.rev + 1 });
}
