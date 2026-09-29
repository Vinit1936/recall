import { describe, it, expect } from 'vitest';
import {
  addDays,
  applyRevision,
  retireProblem,
  reviseAgainFromMastered,
  getInitialSchedule,
  isDueToday,
  revertRevision,
} from './scheduling';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TODAY = new Date('2024-01-15T00:00:00.000Z');

function daysAfter(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ---------------------------------------------------------------------------
// addDays
// ---------------------------------------------------------------------------

describe('addDays', () => {
  it('adds 3 days to a date correctly', () => {
    const result = addDays(TODAY, 3);
    expect(sameDay(result, daysAfter(TODAY, 3))).toBe(true);
  });

  it('adding 0 days returns the same date', () => {
    const result = addDays(TODAY, 0);
    expect(sameDay(result, TODAY)).toBe(true);
  });

  it('does not mutate the input date', () => {
    const original = new Date(TODAY);
    addDays(TODAY, 5);
    expect(TODAY.getTime()).toBe(original.getTime());
  });
});

// ---------------------------------------------------------------------------
// applyRevision — REGULAR
// ---------------------------------------------------------------------------

describe('applyRevision — REGULAR', () => {
  it('STRUGGLED at step 0 → resets to step 0, ACTIVE, +3 days', () => {
    const result = applyRevision({ currentStep: 0, status: 'ACTIVE', confidence: 'STRUGGLED', revisionType: 'REGULAR', today: TODAY });
    expect(result.newStep).toBe(0);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 3))).toBe(true);
  });

  it('STRUGGLED at step 2 → resets to step 0, ACTIVE, +3 days', () => {
    const result = applyRevision({ currentStep: 2, status: 'ACTIVE', confidence: 'STRUGGLED', revisionType: 'REGULAR', today: TODAY });
    expect(result.newStep).toBe(0);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 3))).toBe(true);
  });

  it('STRUGGLED at step 3 → resets to step 0, ACTIVE, +3 days', () => {
    const result = applyRevision({ currentStep: 3, status: 'ACTIVE', confidence: 'STRUGGLED', revisionType: 'REGULAR', today: TODAY });
    expect(result.newStep).toBe(0);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 3))).toBe(true);
  });

  it('SHAKY at step 0 → stays step 0, ACTIVE, +3 days', () => {
    const result = applyRevision({ currentStep: 0, status: 'ACTIVE', confidence: 'SHAKY', revisionType: 'REGULAR', today: TODAY });
    expect(result.newStep).toBe(0);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 3))).toBe(true);
  });

  it('SHAKY at step 2 → stays step 2, ACTIVE, +14 days', () => {
    const result = applyRevision({ currentStep: 2, status: 'ACTIVE', confidence: 'SHAKY', revisionType: 'REGULAR', today: TODAY });
    expect(result.newStep).toBe(2);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 14))).toBe(true);
  });

  it('CLEAN at step 0 → advances to step 1, ACTIVE, +7 days', () => {
    const result = applyRevision({ currentStep: 0, status: 'ACTIVE', confidence: 'CLEAN', revisionType: 'REGULAR', today: TODAY });
    expect(result.newStep).toBe(1);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 7))).toBe(true);
  });

  it('CLEAN at step 1 → advances to step 2, ACTIVE, +14 days', () => {
    const result = applyRevision({ currentStep: 1, status: 'ACTIVE', confidence: 'CLEAN', revisionType: 'REGULAR', today: TODAY });
    expect(result.newStep).toBe(2);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 14))).toBe(true);
  });

  it('CLEAN at step 2 → advances to step 3, ACTIVE, +30 days', () => {
    const result = applyRevision({ currentStep: 2, status: 'ACTIVE', confidence: 'CLEAN', revisionType: 'REGULAR', today: TODAY });
    expect(result.newStep).toBe(3);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 30))).toBe(true);
  });

  it('CLEAN at step 3 → stays step 3, becomes MASTERED, nextRevisionAt is null', () => {
    const result = applyRevision({ currentStep: 3, status: 'ACTIVE', confidence: 'CLEAN', revisionType: 'REGULAR', today: TODAY });
    expect(result.newStep).toBe(3);
    expect(result.newStatus).toBe('MASTERED');
    expect(result.nextRevisionAt).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// applyRevision — RECHECK
// ---------------------------------------------------------------------------

describe('applyRevision — RECHECK', () => {
  it('CLEAN on RECHECK → step 3, ACTIVE, +30 days', () => {
    const result = applyRevision({ currentStep: 0, status: 'ACTIVE', confidence: 'CLEAN', revisionType: 'RECHECK', today: TODAY });
    expect(result.newStep).toBe(3);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 30))).toBe(true);
  });

  it('SHAKY on RECHECK → step 1, ACTIVE, +7 days', () => {
    const result = applyRevision({ currentStep: 0, status: 'ACTIVE', confidence: 'SHAKY', revisionType: 'RECHECK', today: TODAY });
    expect(result.newStep).toBe(1);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 7))).toBe(true);
  });

  it('STRUGGLED on RECHECK → step 0, ACTIVE, +3 days', () => {
    const result = applyRevision({ currentStep: 0, status: 'ACTIVE', confidence: 'STRUGGLED', revisionType: 'RECHECK', today: TODAY });
    expect(result.newStep).toBe(0);
    expect(result.newStatus).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt!, daysAfter(TODAY, 3))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// retireProblem
// ---------------------------------------------------------------------------

describe('retireProblem', () => {
  it('always returns RETIRED status and null nextRevisionAt', () => {
    const result = retireProblem();
    expect(result.newStatus).toBe('RETIRED');
    expect(result.nextRevisionAt).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// reviseAgainFromMastered
// ---------------------------------------------------------------------------

describe('reviseAgainFromMastered', () => {
  it('returns step 0, ACTIVE, +3 days from today, revisionType RECHECK', () => {
    const result = reviseAgainFromMastered(TODAY);
    expect(result.newStep).toBe(0);
    expect(result.newStatus).toBe('ACTIVE');
    expect(result.revisionType).toBe('RECHECK');
    expect(sameDay(result.nextRevisionAt, daysAfter(TODAY, 3))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getInitialSchedule
// ---------------------------------------------------------------------------

describe('getInitialSchedule', () => {
  it('returns step 0, ACTIVE, nextRevisionAt = createdAt + 3 days', () => {
    const result = getInitialSchedule(TODAY);
    expect(result.currentStep).toBe(0);
    expect(result.status).toBe('ACTIVE');
    expect(sameDay(result.nextRevisionAt, daysAfter(TODAY, 3))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isDueToday
// ---------------------------------------------------------------------------

describe('isDueToday', () => {
  it('problem due today → true', () => {
    expect(isDueToday(TODAY, TODAY)).toBe(true);
  });

  it('problem due yesterday (overdue) → true', () => {
    expect(isDueToday(daysAfter(TODAY, -1), TODAY)).toBe(true);
  });

  it('problem due 5 days ago (overdue) → true', () => {
    expect(isDueToday(daysAfter(TODAY, -5), TODAY)).toBe(true);
  });

  it('problem due tomorrow → false', () => {
    expect(isDueToday(daysAfter(TODAY, 1), TODAY)).toBe(false);
  });

  it('problem due 3 days from now → false', () => {
    expect(isDueToday(daysAfter(TODAY, 3), TODAY)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// revertRevision
// ---------------------------------------------------------------------------

describe('revertRevision', () => {
  it('reverts first revision back to initial schedule', () => {
    const createdAt = daysAfter(TODAY, -3);
    const result = revertRevision({
      currentProblem: { createdAt, revisionCount: 1 },
      latestRevision: { stepBefore: 0, type: 'REGULAR' },
      priorRevision: null,
    });

    expect(result.restoredStep).toBe(0);
    expect(result.restoredStatus).toBe('ACTIVE');
    expect(result.restoredRevisionCount).toBe(0);
    // When created 3 days ago, initial schedule was createdAt + 3 days = TODAY
    expect(sameDay(result.restoredNextRevisionAt, TODAY)).toBe(true);
  });

  it('reverts to prior revision schedule when prior revision exists', () => {
    const createdAt = daysAfter(TODAY, -10);
    const priorRevisedAt = daysAfter(TODAY, -7);
    // Prior revision was at step 0, CLEAN, so next revision was scheduled for priorRevisedAt + 7 days = TODAY
    const result = revertRevision({
      currentProblem: { createdAt, revisionCount: 2 },
      latestRevision: { stepBefore: 1, type: 'REGULAR' },
      priorRevision: {
        stepBefore: 0,
        confidence: 'CLEAN',
        type: 'REGULAR',
        revisedAt: priorRevisedAt,
      },
    });

    expect(result.restoredStep).toBe(1);
    expect(result.restoredStatus).toBe('ACTIVE');
    expect(result.restoredRevisionCount).toBe(1);
    expect(sameDay(result.restoredNextRevisionAt, TODAY)).toBe(true);
  });

  it('reverts a RECHECK revision back to MASTERED', () => {
    const createdAt = daysAfter(TODAY, -40);
    const result = revertRevision({
      currentProblem: { createdAt, revisionCount: 5 },
      latestRevision: { stepBefore: 0, type: 'RECHECK' },
      priorRevision: null,
    });

    expect(result.restoredStep).toBe(0);
    expect(result.restoredStatus).toBe('MASTERED');
    expect(result.restoredRevisionCount).toBe(4);
  });

  it('reverts an overdue problem back to its overdue nextRevisionAt', () => {
    const createdAt = daysAfter(TODAY, -20);
    // Prior revision was 10 days ago at step 0 (Clean -> next revision in 7 days = 3 days ago)
    const priorRevisedAt = daysAfter(TODAY, -10);
    const expectedOverdueDate = daysAfter(priorRevisedAt, 7); // 3 days ago

    const result = revertRevision({
      currentProblem: { createdAt, revisionCount: 2 },
      latestRevision: { stepBefore: 1, type: 'REGULAR' },
      priorRevision: {
        stepBefore: 0,
        confidence: 'CLEAN',
        type: 'REGULAR',
        revisedAt: priorRevisedAt,
      },
    });

    expect(result.restoredStep).toBe(1);
    expect(result.restoredStatus).toBe('ACTIVE');
    expect(sameDay(result.restoredNextRevisionAt, expectedOverdueDate)).toBe(true);
    expect(result.restoredNextRevisionAt < TODAY).toBe(true);
  });
});

