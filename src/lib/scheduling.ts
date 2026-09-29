// =============================================================================
// scheduling.ts — The core "brain" of the spaced repetition system
//
// WHAT IS SPACED REPETITION?
// It's a learning technique where you review problems at increasing intervals.
// The better you remember something, the longer you wait before reviewing it.
// The worse you remember it, the sooner you review it again.
//
// HOW THIS WORKS:
// Each problem climbs a "ladder" of intervals: 3 → 7 → 14 → 30 days.
// - Do well? You climb the ladder (longer wait).
// - Struggle? You fall back to the bottom (shorter wait).
// - Reach the top cleanly? The problem is MASTERED and leaves active rotation.
//
// IMPORTANT: These are pure functions — they take data in and return data out.
// They never touch the database or any framework. That makes them easy to test
// and easy to reason about in isolation.
// =============================================================================

// -----------------------------------------------------------------------------
// LADDER_DAYS — The four revision intervals in days.
//
// Step 0 → review in 3 days
// Step 1 → review in 7 days
// Step 2 → review in 14 days
// Step 3 → review in 30 days (or MASTERED if completed cleanly)
//
// "as const" tells TypeScript these values are fixed and will never change,
// so it treats [3, 7, 14, 30] as literal types instead of just `number[]`.
// -----------------------------------------------------------------------------
export const LADDER_DAYS = [3, 7, 14, 30] as const;

// LadderStep is a union type meaning the value can ONLY be 0, 1, 2, or 3.
// This prevents accidentally passing an invalid step number.
export type LadderStep = 0 | 1 | 2 | 3;

// -----------------------------------------------------------------------------
// TYPES — These describe the shape of the data flowing through the functions.
// Using explicit types makes the code self-documenting and catches mistakes
// at compile time (TypeScript checks them before the code even runs).
// -----------------------------------------------------------------------------

// The three states a problem can be in:
export type ProblemStatus = 'ACTIVE' | 'MASTERED' | 'RETIRED';

// How the user felt about the problem during revision:
export type Confidence = 'CLEAN' | 'SHAKY' | 'STRUGGLED';

// Whether this is a regular scheduled review or a re-check of a mastered problem:
export type RevisionType = 'REGULAR' | 'RECHECK';

// SchedulingInput — everything the applyRevision function needs to compute the next state.
export type SchedulingInput = {
  currentStep: number;       // Where the problem currently sits on the ladder (0–3)
  status: ProblemStatus;     // Current status (ACTIVE / MASTERED / RETIRED)
  confidence: Confidence;    // How the user felt: CLEAN, SHAKY, or STRUGGLED
  revisionType: RevisionType;// REGULAR = scheduled review, RECHECK = pulled back from mastered
  today: Date;               // The date of the revision (used to calculate the next due date)
};

// SchedulingResult — what applyRevision returns: the new state after a revision.
export type SchedulingResult = {
  newStep: number;              // The new ladder step after this revision
  newStatus: ProblemStatus;     // The new status (ACTIVE, MASTERED, or RETIRED)
  nextRevisionAt: Date | null;  // When to review next — null means no next review (MASTERED/RETIRED)
};

// -----------------------------------------------------------------------------
// addDays — A simple date utility used by all the other functions.
//
// Why not just do `date.setDate(date.getDate() + days)`?
// Because setDate() MUTATES the original date object, which can cause
// subtle bugs when the same date is referenced elsewhere.
// Instead, we create a brand-new Date object (a copy) and modify that.
// -----------------------------------------------------------------------------
export function addDays(date: Date, days: number): Date {
  const result = new Date(date); // Copy the date — don't touch the original
  result.setDate(result.getDate() + days);
  return result;
}

// -----------------------------------------------------------------------------
// applyRevision — The main scheduling function.
//
// Given the current state of a problem and how a revision went, it figures out:
//   1. What step the problem should be on now
//   2. Whether it's still ACTIVE or has become MASTERED
//   3. When the next revision should be scheduled
//
// There are two main branches: RECHECK and REGULAR.
// -----------------------------------------------------------------------------
export function applyRevision(input: SchedulingInput): SchedulingResult {
  const { currentStep, confidence, revisionType, today } = input;

  // ---------------------------------------------------------------------------
  // RECHECK branch — the user pulled a MASTERED problem back for review.
  //
  // Since the problem was already mastered, we don't start from scratch.
  // We place it based on how confident the user was:
  //   CLEAN    → jump straight to step 3 (it really was mastered)
  //   SHAKY    → place it at step 1 (needs a bit more work)
  //   STRUGGLED → full reset to step 0 (mastery wasn't real)
  // ---------------------------------------------------------------------------
  if (revisionType === 'RECHECK') {
    if (confidence === 'CLEAN') {
      // User aced it even after time away — fast-forward back to the top
      return { newStep: 3, newStatus: 'ACTIVE', nextRevisionAt: addDays(today, 30) };
    }
    if (confidence === 'SHAKY') {
      // Remembered but not confidently — place mid-ladder
      return { newStep: 1, newStatus: 'ACTIVE', nextRevisionAt: addDays(today, 7) };
    }
    // STRUGGLED — mastery wasn't real, restart from the beginning
    return { newStep: 0, newStatus: 'ACTIVE', nextRevisionAt: addDays(today, 3) };
  }

  // ---------------------------------------------------------------------------
  // REGULAR branch — a normal scheduled revision.
  //
  // Three possible outcomes based on confidence:
  //   STRUGGLED → always reset to step 0 regardless of where you were
  //   SHAKY     → stay at the same step (repeat the same interval)
  //   CLEAN     → advance to the next step (or MASTER if already at step 3)
  // ---------------------------------------------------------------------------

  if (confidence === 'STRUGGLED') {
    // Fell back completely — restart the ladder from day 3
    return { newStep: 0, newStatus: 'ACTIVE', nextRevisionAt: addDays(today, LADDER_DAYS[0]) };
  }

  if (confidence === 'SHAKY') {
    // Not ready to advance yet — repeat the current interval.
    // LADDER_DAYS[currentStep] gives us the interval for where we currently are.
    // e.g. if currentStep is 2, nextRevisionAt = today + 14 days
    return {
      newStep: currentStep,
      newStatus: 'ACTIVE',
      nextRevisionAt: addDays(today, LADDER_DAYS[currentStep as LadderStep]),
    };
  }

  // CLEAN — user nailed it. Check if we're at the final step or can still advance.
  if (currentStep === 3) {
    // Already at the top of the ladder and got it cleanly → MASTERED.
    // null means "no next revision scheduled" — problem leaves active rotation.
    return { newStep: 3, newStatus: 'MASTERED', nextRevisionAt: null };
  }

  // Advance to the next step on the ladder.
  // e.g. step 0 → step 1, and the next review is in 7 days (LADDER_DAYS[1])
  const nextStep = (currentStep + 1) as LadderStep;
  return {
    newStep: nextStep,
    newStatus: 'ACTIVE',
    nextRevisionAt: addDays(today, LADDER_DAYS[nextStep]),
  };
}

// -----------------------------------------------------------------------------
// retireProblem — User manually removes a problem from rotation.
//
// This always returns the same result regardless of the problem's current state.
// `Pick<SchedulingResult, 'newStatus' | 'nextRevisionAt'>` means we only return
// those two fields from SchedulingResult (not newStep, since it doesn't matter
// for a retired problem).
// -----------------------------------------------------------------------------
export function retireProblem(): Pick<SchedulingResult, 'newStatus' | 'nextRevisionAt'> {
  return { newStatus: 'RETIRED', nextRevisionAt: null };
}

// -----------------------------------------------------------------------------
// reviseAgainFromMastered — User clicks "Revise again" on a mastered problem.
//
// This pulls the problem back into active rotation starting from step 0,
// but marks the upcoming revision as a RECHECK so applyRevision knows
// not to treat it like a fresh problem.
//
// The return type uses literal types (e.g. `newStep: 0` not `newStep: number`)
// so TypeScript knows the exact values, not just the types.
// -----------------------------------------------------------------------------
export function reviseAgainFromMastered(today: Date): {
  newStep: 0;
  newStatus: 'ACTIVE';
  nextRevisionAt: Date;
  revisionType: 'RECHECK';
} {
  return {
    newStep: 0,
    newStatus: 'ACTIVE',
    nextRevisionAt: addDays(today, LADDER_DAYS[0]), // Review in 3 days
    revisionType: 'RECHECK',                        // Flag so applyRevision uses the RECHECK rules
  };
}

// -----------------------------------------------------------------------------
// getInitialSchedule — Called when a new problem is first added.
//
// Every new problem starts at step 0 and gets its first revision scheduled
// 3 days from when it was added.
// -----------------------------------------------------------------------------
export function getInitialSchedule(createdAt: Date): {
  currentStep: 0;
  nextRevisionAt: Date;
  status: 'ACTIVE';
} {
  return {
    currentStep: 0,
    nextRevisionAt: addDays(createdAt, LADDER_DAYS[0]), // +3 days from creation
    status: 'ACTIVE',
  };
}

// -----------------------------------------------------------------------------
// isDueToday — Checks if a problem should appear in today's revision list.
//
// A problem is due if its nextRevisionAt is TODAY or any day in the PAST
// (overdue problems should still show up — they don't disappear).
//
// We strip the time component before comparing so that a problem due at
// 11:59 PM still counts as due even if you check at 8 AM the same day.
// -----------------------------------------------------------------------------
export function isDueToday(nextRevisionAt: Date, today: Date): boolean {
  // Create date-only versions (midnight) to avoid time-of-day affecting the comparison
  const due = new Date(nextRevisionAt.getFullYear(), nextRevisionAt.getMonth(), nextRevisionAt.getDate());
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // due <= now means: due today OR already past due (overdue)
  return due <= now;
}

// -----------------------------------------------------------------------------
// revertRevision — Reverts the latest revision and restores the previous state.
//
// When a user accidentally marks a revision or wants to undo it:
// 1. Restores currentStep to the step it had before that revision (stepBefore).
// 2. Restores status: if this was a RECHECK on a previously MASTERED problem,
//    it reverts to MASTERED; otherwise ACTIVE.
// 3. Decrements revisionCount by 1 (minimum 0).
// 4. Restores nextRevisionAt:
//    - If there was a revision prior to the undone one, we recalculate its scheduled
//      due date using that prior revision's parameters.
//    - If there was no prior revision, we restore to the initial schedule (createdAt + 3 days).
// -----------------------------------------------------------------------------
export type RevertRevisionInput = {
  currentProblem: {
    createdAt: Date;
    revisionCount: number;
  };
  latestRevision: {
    stepBefore: number;
    type: RevisionType;
  };
  priorRevision?: {
    stepBefore: number;
    confidence: Confidence;
    type: RevisionType;
    revisedAt: Date;
  } | null;
};

export type RevertRevisionResult = {
  restoredStep: number;
  restoredStatus: ProblemStatus;
  restoredNextRevisionAt: Date;
  restoredRevisionCount: number;
};

export function revertRevision(input: RevertRevisionInput): RevertRevisionResult {
  const { currentProblem, latestRevision, priorRevision } = input;

  const restoredStep = latestRevision.stepBefore;
  const restoredStatus: ProblemStatus = latestRevision.type === 'RECHECK' ? 'MASTERED' : 'ACTIVE';
  const restoredRevisionCount = Math.max(0, currentProblem.revisionCount - 1);

  let restoredNextRevisionAt: Date;
  if (priorRevision) {
    const priorResult = applyRevision({
      currentStep: priorRevision.stepBefore,
      status: priorRevision.type === 'RECHECK' ? 'MASTERED' : 'ACTIVE',
      confidence: priorRevision.confidence,
      revisionType: priorRevision.type,
      today: priorRevision.revisedAt,
    });
    restoredNextRevisionAt = priorResult.nextRevisionAt ?? priorRevision.revisedAt;
  } else {
    restoredNextRevisionAt = getInitialSchedule(currentProblem.createdAt).nextRevisionAt;
  }

  return {
    restoredStep,
    restoredStatus,
    restoredNextRevisionAt,
    restoredRevisionCount,
  };
}

