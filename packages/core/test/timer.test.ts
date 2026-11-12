import { describe, expect, it } from 'vitest';
import { deadlineFor, estimateServerOffset, formatRemaining, readTimer } from '../src/timer/timer.ts';

const start = 1_800_000_000_000;
const deadline = deadlineFor(start, 60);

describe('cronómetro por marcas de tiempo', () => {
  it('calcula el restante a partir del límite absoluto (sobrevive a suspensiones)', () => {
    const snap = readTimer({ startedAt: start, deadlineAt: deadline, lastObservedAt: start, localNow: start + 25 * 60_000 });
    expect(snap.remainingMs).toBe(35 * 60_000);
    expect(snap.expired).toBe(false);
  });

  it('expira aunque la app haya estado cerrada todo el tiempo', () => {
    const snap = readTimer({ startedAt: start, deadlineAt: deadline, lastObservedAt: start + 1000, localNow: start + 3 * 3_600_000 });
    expect(snap.expired).toBe(true);
    expect(snap.remainingMs).toBe(0);
    expect(snap.elapsedMs).toBe(60 * 60_000);
  });

  it('no devuelve tiempo si el reloj del dispositivo retrocede', () => {
    const snap = readTimer({ startedAt: start, deadlineAt: deadline, lastObservedAt: start + 40 * 60_000, localNow: start + 5 * 60_000 });
    expect(snap.clockWentBack).toBe(true);
    expect(snap.remainingMs).toBe(20 * 60_000);
  });

  it('aplica el desfase con el servidor', () => {
    const snap = readTimer({ startedAt: start, deadlineAt: deadline, lastObservedAt: start, localNow: start, serverOffsetMs: 10 * 60_000 });
    expect(snap.remainingMs).toBe(50 * 60_000);
  });

  it('estima el desfase con latencia simétrica', () => {
    expect(estimateServerOffset(1000, 5100, 1200)).toEqual({ offsetMs: 4000, rttMs: 200 });
  });

  it('formatea el restante', () => {
    expect(formatRemaining(47 * 60_000 + 9_000)).toBe('47:09');
    expect(formatRemaining(2 * 3_600_000 - 1)).toBe('2:00:00');
    expect(formatRemaining(65_000)).toBe('1:05');
    expect(formatRemaining(0)).toBe('0:00');
  });
});
