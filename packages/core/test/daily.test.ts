import { describe, expect, it } from 'vitest';
import {
  addDays,
  advanceDailyLedger,
  dailyIndexFor,
  dailyStatus,
  daysBetween,
  createDailyLedger,
  maxLegitimateDailyIndex,
  reconcileDailyLedger,
  type CivilDate,
} from '../src/daily/schedule.ts';

const START = '2027-01-01' as CivilDate;
const fresh = () => createDailyLedger(START);

describe('calendario diario', () => {
  it('cuenta días civiles sin verse afectado por el cambio de hora', () => {
    expect(daysBetween('2027-03-27', '2027-03-29')).toBe(2); // cambio de hora en Europa el 28/03
    expect(daysBetween('2027-10-30', '2027-11-01')).toBe(2);
    expect(addDays('2027-02-27', 2)).toBe('2027-03-01');
  });

  it('asigna índices y los acota a 0..499', () => {
    expect(dailyIndexFor('2026-12-31', START)).toBe(-1);
    expect(dailyIndexFor(START, START)).toBe(0);
    expect(dailyIndexFor('2027-01-10', START)).toBe(9);
    expect(dailyIndexFor('2030-01-01', START)).toBe(499);
  });

  it('desbloquea los días saltados con su fecha propia y nunca vuelve a bloquear', () => {
    let ledger = advanceDailyLedger(fresh(), '2027-01-01');
    ledger = advanceDailyLedger(ledger, '2027-01-04');
    expect(ledger.highestUnlocked).toBe(3);
    expect(ledger.unlockedOn[2]).toBe('2027-01-03');
    const back = advanceDailyLedger(ledger, '2027-01-02');
    expect(back).toBe(ledger);
  });

  it('el diario no jugado pasa al archivo, no se pierde', () => {
    const today = '2027-01-04' as CivilDate;
    const ledger = advanceDailyLedger(fresh(), today);
    expect(dailyStatus(3, ledger, today)).toBe('today');
    expect(dailyStatus(1, ledger, today)).toBe('archived');
    expect(dailyStatus(4, ledger, today)).toBe('locked');
  });

  it('el servidor recorta desbloqueos adelantados por un reloj manipulado', () => {
    const cheated = advanceDailyLedger(fresh(), '2027-02-01');
    const serverNow = Date.UTC(2027, 0, 5, 12, 0, 0);
    const max = maxLegitimateDailyIndex(serverNow, START);
    expect(max).toBe(5); // 6 de enero en UTC+14
    const fixed = reconcileDailyLedger(cheated, max);
    expect(fixed.highestUnlocked).toBe(5);
    expect(fixed.unlockedOn[6]).toBeUndefined();
  });

  it('las fechas registradas por el servidor prevalecen', () => {
    const local = advanceDailyLedger(fresh(), '2027-01-03');
    const server = { calendarStart: START, highestUnlocked: 1, unlockedOn: { 0: '2027-01-01', 1: '2027-01-01' } as Record<number, CivilDate> };
    const merged = reconcileDailyLedger(local, 10, server);
    expect(merged.unlockedOn[1]).toBe('2027-01-01');
    expect(merged.highestUnlocked).toBe(2);
  });
});
