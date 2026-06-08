import { EXERCISES } from "./exercises";

export interface WorkoutStep {
  exerciseId: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds, overrides exercise default
  restAfter: number; // seconds
  note?: string;
}

export interface WorkoutBlock {
  type: "warmup" | "superset" | "circuit" | "cooldown";
  nameHe: string;
  nameEn: string;
  rounds: number;
  restBetweenRounds: number; // seconds
  steps: WorkoutStep[];
}

export interface WorkoutTemplate {
  id: string;
  nameHe: string;
  nameEn: string;
  descriptionHe: string;
  durationMinutes: number;
  level: "beginner" | "intermediate" | "advanced";
  focus: string;
  blocks: WorkoutBlock[];
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "upper_a",
    nameHe: "אימון עליון A",
    nameEn: "Upper Body A",
    descriptionHe: "אימון פוש/פול לחלק העליון של הגוף עם פרוגרסיית מתח",
    durationMinutes: 50,
    level: "intermediate",
    focus: "chest, back, shoulders",
    blocks: [
      {
        type: "warmup",
        nameHe: "חימום",
        nameEn: "Warm-up",
        rounds: 1,
        restBetweenRounds: 0,
        steps: [
          { exerciseId: "jump_rope", sets: 1, duration: 60, restAfter: 15 },
          { exerciseId: "mountain_climbers", sets: 1, duration: 30, restAfter: 15 },
          { exerciseId: "plank", sets: 1, duration: 20, restAfter: 15 },
          { exerciseId: "pushups", sets: 1, reps: 8, restAfter: 20 },
        ],
      },
      {
        type: "circuit",
        nameHe: "מתח – פרוגרסיה",
        nameEn: "Pull-up Progression",
        rounds: 3,
        restBetweenRounds: 60,
        steps: [
          { exerciseId: "pullups", sets: 1, reps: 5, restAfter: 25, note: "מקסימום חזרות נקיות" },
          { exerciseId: "negative_pullups", sets: 1, reps: 4, restAfter: 20, note: "ירידה איטית 3-5 שניות" },
          { exerciseId: "band_pullups", sets: 1, reps: 8, restAfter: 0, note: "עם גומייה לסיום" },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 1 – פוש / פול",
        nameEn: "Superset 1 – Push / Pull",
        rounds: 3,
        restBetweenRounds: 40,
        steps: [
          { exerciseId: "pushups", sets: 1, reps: 15, restAfter: 10 },
          { exerciseId: "trx_rows", sets: 1, reps: 12, restAfter: 0 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 2 – כתפיים / טריספס",
        nameEn: "Superset 2 – Shoulders / Triceps",
        rounds: 3,
        restBetweenRounds: 40,
        steps: [
          { exerciseId: "pike_pushups", sets: 1, reps: 10, restAfter: 10 },
          { exerciseId: "dips", sets: 1, reps: 10, restAfter: 0 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 3 – זרועות (TRX)",
        nameEn: "Superset 3 – Arms (TRX)",
        rounds: 3,
        restBetweenRounds: 30,
        steps: [
          { exerciseId: "trx_bicep_curls", sets: 1, reps: 12, restAfter: 10, note: "יד קדמית" },
          { exerciseId: "trx_tricep_extension", sets: 1, reps: 12, restAfter: 0, note: "יד אחורית" },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 4 – רגליים",
        nameEn: "Superset 4 – Legs",
        rounds: 3,
        restBetweenRounds: 30,
        steps: [
          { exerciseId: "squats", sets: 1, reps: 20, restAfter: 10 },
          { exerciseId: "lunges", sets: 1, reps: 12, restAfter: 0 },
        ],
      },
      {
        type: "circuit",
        nameHe: "פינישר קור",
        nameEn: "Core Finisher",
        rounds: 2,
        restBetweenRounds: 30,
        steps: [
          { exerciseId: "plank", sets: 1, duration: 60, restAfter: 10 },
          { exerciseId: "hollow_body", sets: 1, duration: 30, restAfter: 10 },
          { exerciseId: "superman", sets: 1, duration: 20, restAfter: 10 },
          { exerciseId: "leg_raises", sets: 1, reps: 15, restAfter: 0 },
        ],
      },
    ],
  },
  {
    id: "lower_b",
    nameHe: "אימון תחתון B",
    nameEn: "Lower Body B",
    descriptionHe: "אימון לרגליים וישבן עם עבודת ליבה",
    durationMinutes: 45,
    level: "intermediate",
    focus: "legs, glutes, core",
    blocks: [
      {
        type: "warmup",
        nameHe: "חימום",
        nameEn: "Warm-up",
        rounds: 1,
        restBetweenRounds: 0,
        steps: [
          { exerciseId: "jump_rope", sets: 1, duration: 60, restAfter: 15 },
          { exerciseId: "mountain_climbers", sets: 1, duration: 30, restAfter: 15 },
          { exerciseId: "glute_bridges", sets: 1, reps: 15, restAfter: 15 },
          { exerciseId: "squats", sets: 1, reps: 10, restAfter: 20 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 1 – קפיצה / לאנג'ס",
        nameEn: "Superset 1 – Power / Lunge",
        rounds: 3,
        restBetweenRounds: 40,
        steps: [
          { exerciseId: "jump_squats", sets: 1, reps: 15, restAfter: 10 },
          { exerciseId: "reverse_lunges", sets: 1, reps: 12, restAfter: 0 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 2 – ישבן / גמישות",
        nameEn: "Superset 2 – Glutes / Hamstrings",
        rounds: 3,
        restBetweenRounds: 30,
        steps: [
          { exerciseId: "hip_thrusts", sets: 1, reps: 15, restAfter: 10 },
          { exerciseId: "glute_bridges", sets: 1, reps: 20, restAfter: 10 },
          { exerciseId: "superman", sets: 1, duration: 20, restAfter: 0 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 3 – עליון (תחזוקה)",
        nameEn: "Superset 3 – Upper (Maintenance)",
        rounds: 3,
        restBetweenRounds: 40,
        steps: [
          { exerciseId: "pushups", sets: 1, reps: 12, restAfter: 10 },
          { exerciseId: "trx_rows", sets: 1, reps: 10, restAfter: 0 },
        ],
      },
      {
        type: "circuit",
        nameHe: "פינישר קור",
        nameEn: "Core Finisher",
        rounds: 2,
        restBetweenRounds: 30,
        steps: [
          { exerciseId: "mountain_climbers", sets: 1, duration: 30, restAfter: 10 },
          { exerciseId: "leg_raises", sets: 1, reps: 15, restAfter: 10 },
          { exerciseId: "plank", sets: 1, duration: 45, restAfter: 0 },
        ],
      },
    ],
  },
  {
    id: "full_body_c",
    nameHe: "אימון כל הגוף C",
    nameEn: "Full Body C",
    descriptionHe: "אימון עצימות גבוהה לכל הגוף",
    durationMinutes: 45,
    level: "intermediate",
    focus: "full body, cardio",
    blocks: [
      {
        type: "warmup",
        nameHe: "חימום",
        nameEn: "Warm-up",
        rounds: 1,
        restBetweenRounds: 0,
        steps: [
          { exerciseId: "jump_rope", sets: 1, duration: 60, restAfter: 15 },
          { exerciseId: "mountain_climbers", sets: 1, duration: 30, restAfter: 15 },
          { exerciseId: "pushups", sets: 1, reps: 8, restAfter: 15 },
          { exerciseId: "squats", sets: 1, reps: 10, restAfter: 20 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 1 – קרדיו / פוש",
        nameEn: "Superset 1 – Cardio / Push",
        rounds: 3,
        restBetweenRounds: 40,
        steps: [
          { exerciseId: "burpees", sets: 1, reps: 8, restAfter: 15 },
          { exerciseId: "diamond_pushups", sets: 1, reps: 10, restAfter: 0 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 2 – פול / פוש",
        nameEn: "Superset 2 – Pull / Push",
        rounds: 3,
        restBetweenRounds: 40,
        steps: [
          { exerciseId: "pullups", sets: 1, reps: 6, restAfter: 15, note: "מקסימום חזרות" },
          { exerciseId: "decline_pushups", sets: 1, reps: 10, restAfter: 0 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 3 – רגליים",
        nameEn: "Superset 3 – Legs",
        rounds: 3,
        restBetweenRounds: 40,
        steps: [
          { exerciseId: "jump_squats", sets: 1, reps: 12, restAfter: 10 },
          { exerciseId: "lunges", sets: 1, reps: 14, restAfter: 0 },
        ],
      },
      {
        type: "circuit",
        nameHe: "פינישר קור",
        nameEn: "Core Finisher",
        rounds: 2,
        restBetweenRounds: 20,
        steps: [
          { exerciseId: "plank", sets: 1, duration: 60, restAfter: 10 },
          { exerciseId: "hollow_body", sets: 1, duration: 30, restAfter: 0 },
        ],
      },
    ],
  },
  {
    id: "push_arms_d",
    nameHe: "דחיפה + זרועות D",
    nameEn: "Push & Arms D",
    descriptionHe: "יום דחיפה עם דגש על חזה וזרועות (יד קדמית + אחורית)",
    durationMinutes: 45,
    level: "intermediate",
    focus: "chest, biceps, triceps, shoulders",
    blocks: [
      {
        type: "warmup",
        nameHe: "חימום",
        nameEn: "Warm-up",
        rounds: 1,
        restBetweenRounds: 0,
        steps: [
          { exerciseId: "jump_rope", sets: 1, duration: 60, restAfter: 15 },
          { exerciseId: "mountain_climbers", sets: 1, duration: 30, restAfter: 15 },
          { exerciseId: "pushups", sets: 1, reps: 8, restAfter: 20 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 1 – חזה",
        nameEn: "Superset 1 – Chest",
        rounds: 3,
        restBetweenRounds: 40,
        steps: [
          { exerciseId: "pushups", sets: 1, reps: 16, restAfter: 10 },
          { exerciseId: "wide_pushups", sets: 1, reps: 14, restAfter: 0 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 2 – חזה עליון / טריספס",
        nameEn: "Superset 2 – Upper Chest / Triceps",
        rounds: 3,
        restBetweenRounds: 40,
        steps: [
          { exerciseId: "decline_pushups", sets: 1, reps: 14, restAfter: 10 },
          { exerciseId: "dips", sets: 1, reps: 10, restAfter: 0 },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 3 – זרועות (TRX)",
        nameEn: "Superset 3 – Arms (TRX)",
        rounds: 3,
        restBetweenRounds: 30,
        steps: [
          { exerciseId: "trx_bicep_curls", sets: 1, reps: 12, restAfter: 10, note: "יד קדמית" },
          { exerciseId: "trx_tricep_extension", sets: 1, reps: 12, restAfter: 0, note: "יד אחורית" },
        ],
      },
      {
        type: "superset",
        nameHe: "סופרסט 4 – כתפיים / יד קדמית",
        nameEn: "Superset 4 – Shoulders / Biceps",
        rounds: 3,
        restBetweenRounds: 30,
        steps: [
          { exerciseId: "pike_pushups", sets: 1, reps: 12, restAfter: 10 },
          { exerciseId: "chinups", sets: 1, reps: 6, restAfter: 0, note: "אנדרגריפ – יד קדמית" },
        ],
      },
      {
        type: "circuit",
        nameHe: "פינישר קור",
        nameEn: "Core Finisher",
        rounds: 2,
        restBetweenRounds: 30,
        steps: [
          { exerciseId: "plank", sets: 1, duration: 60, restAfter: 10 },
          { exerciseId: "hollow_body", sets: 1, duration: 30, restAfter: 0 },
        ],
      },
    ],
  },
  {
    id: "beginner_intro",
    nameHe: "מתחילים – כניסה לכושר",
    nameEn: "Beginner Intro",
    descriptionHe: "אימון מתחילים עם תרגילים בסיסיים",
    durationMinutes: 30,
    level: "beginner",
    focus: "full body",
    blocks: [
      {
        type: "warmup",
        nameHe: "חימום",
        nameEn: "Warm-up",
        rounds: 1,
        restBetweenRounds: 0,
        steps: [
          { exerciseId: "mountain_climbers", sets: 1, duration: 20, restAfter: 20 },
          { exerciseId: "squats", sets: 1, reps: 10, restAfter: 20 },
        ],
      },
      {
        type: "circuit",
        nameHe: "סבב כל הגוף",
        nameEn: "Full Body Circuit",
        rounds: 3,
        restBetweenRounds: 60,
        steps: [
          { exerciseId: "pushups", sets: 1, reps: 8, restAfter: 20 },
          { exerciseId: "squats", sets: 1, reps: 15, restAfter: 20 },
          { exerciseId: "plank", sets: 1, duration: 30, restAfter: 20 },
          { exerciseId: "glute_bridges", sets: 1, reps: 15, restAfter: 20 },
          { exerciseId: "leg_raises", sets: 1, reps: 10, restAfter: 0 },
        ],
      },
    ],
  },
];

export function flattenWorkoutSteps(template: WorkoutTemplate) {
  const steps: Array<{
    blockIndex: number;
    blockName: string;
    blockType: WorkoutBlock["type"];
    round: number;
    totalRounds: number;
    stepIndex: number;
    exerciseId: string;
    reps?: number;
    duration?: number;
    isLastInRound: boolean;
    restAfter: number;
    restBetweenRounds: number;
  }> = [];

  template.blocks.forEach((block, blockIndex) => {
    for (let round = 1; round <= block.rounds; round++) {
      block.steps.forEach((step, stepIndex) => {
        const exercise = EXERCISES[step.exerciseId];
        steps.push({
          blockIndex,
          blockName: block.nameHe,
          blockType: block.type,
          round,
          totalRounds: block.rounds,
          stepIndex,
          exerciseId: step.exerciseId,
          reps: step.reps ?? exercise?.defaultReps,
          duration: step.duration ?? exercise?.defaultDuration,
          isLastInRound: stepIndex === block.steps.length - 1,
          restAfter: step.restAfter,
          restBetweenRounds: block.restBetweenRounds,
        });
      });
    }
  });

  return steps;
}
