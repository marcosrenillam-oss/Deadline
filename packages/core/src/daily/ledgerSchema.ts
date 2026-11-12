import { z } from 'zod';
import type { DailyLedger } from './schedule.ts';

const civil = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const dailyLedgerSchema: z.ZodType<DailyLedger> = z.strictObject({
  calendarStart: civil,
  highestUnlocked: z.number().int().min(-1).max(499),
  unlockedOn: z.record(z.string(), civil),
}) as unknown as z.ZodType<DailyLedger>;
