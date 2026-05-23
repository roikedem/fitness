export type ExerciseType = "reps" | "timed" | "reps_weighted";

export interface Exercise {
  id: string;
  nameEn: string;
  nameHe: string;
  type: ExerciseType;
  defaultReps?: number;
  defaultDuration?: number; // seconds
  defaultWeight?: number; // kg
  muscleGroups: string[];
  instructions?: string;
}

export const EXERCISES: Record<string, Exercise> = {
  pushups: {
    id: "pushups",
    nameEn: "Push-ups",
    nameHe: "שכיבות סמיכה",
    type: "reps",
    defaultReps: 15,
    muscleGroups: ["chest", "triceps", "shoulders"],
  },
  wide_pushups: {
    id: "wide_pushups",
    nameEn: "Wide Push-ups",
    nameHe: "שכיבות סמיכה רחבות",
    type: "reps",
    defaultReps: 12,
    muscleGroups: ["chest", "triceps", "shoulders"],
  },
  diamond_pushups: {
    id: "diamond_pushups",
    nameEn: "Diamond Push-ups",
    nameHe: "שכיבות סמיכה יהלום",
    type: "reps",
    defaultReps: 10,
    muscleGroups: ["triceps", "chest"],
  },
  pike_pushups: {
    id: "pike_pushups",
    nameEn: "Pike Push-ups",
    nameHe: "שכיבות סמיכה פייק",
    type: "reps",
    defaultReps: 10,
    muscleGroups: ["shoulders", "triceps"],
  },
  decline_pushups: {
    id: "decline_pushups",
    nameEn: "Decline Push-ups",
    nameHe: "שכיבות סמיכה בירידה",
    type: "reps",
    defaultReps: 12,
    muscleGroups: ["upper chest", "shoulders"],
  },
  pullups: {
    id: "pullups",
    nameEn: "Pull-ups",
    nameHe: "מתח",
    type: "reps",
    defaultReps: 6,
    muscleGroups: ["back", "biceps"],
  },
  chinups: {
    id: "chinups",
    nameEn: "Chin-ups",
    nameHe: "מתח אנדרגריפ",
    type: "reps",
    defaultReps: 6,
    muscleGroups: ["biceps", "back"],
  },
  inverted_rows: {
    id: "inverted_rows",
    nameEn: "Inverted Rows",
    nameHe: "משיכות הפוכות",
    type: "reps",
    defaultReps: 12,
    muscleGroups: ["back", "biceps"],
  },
  dips: {
    id: "dips",
    nameEn: "Dips",
    nameHe: "שקיעות",
    type: "reps",
    defaultReps: 10,
    muscleGroups: ["triceps", "chest", "shoulders"],
  },
  squats: {
    id: "squats",
    nameEn: "Squats",
    nameHe: "סקוואט",
    type: "reps",
    defaultReps: 20,
    muscleGroups: ["quads", "glutes", "hamstrings"],
  },
  jump_squats: {
    id: "jump_squats",
    nameEn: "Jump Squats",
    nameHe: "סקוואט קפיצה",
    type: "reps",
    defaultReps: 15,
    muscleGroups: ["quads", "glutes", "calves"],
  },
  lunges: {
    id: "lunges",
    nameEn: "Lunges",
    nameHe: "לאנג'ס",
    type: "reps",
    defaultReps: 12,
    muscleGroups: ["quads", "glutes", "hamstrings"],
  },
  reverse_lunges: {
    id: "reverse_lunges",
    nameEn: "Reverse Lunges",
    nameHe: "לאנג'ס לאחור",
    type: "reps",
    defaultReps: 12,
    muscleGroups: ["quads", "glutes"],
  },
  glute_bridges: {
    id: "glute_bridges",
    nameEn: "Glute Bridges",
    nameHe: "גשר ישבן",
    type: "reps",
    defaultReps: 20,
    muscleGroups: ["glutes", "hamstrings"],
  },
  plank: {
    id: "plank",
    nameEn: "Plank",
    nameHe: "פלאנק",
    type: "timed",
    defaultDuration: 60,
    muscleGroups: ["core", "shoulders"],
  },
  side_plank_left: {
    id: "side_plank_left",
    nameEn: "Side Plank (Left)",
    nameHe: "פלאנק צד (שמאל)",
    type: "timed",
    defaultDuration: 30,
    muscleGroups: ["core", "obliques"],
  },
  side_plank_right: {
    id: "side_plank_right",
    nameEn: "Side Plank (Right)",
    nameHe: "פלאנק צד (ימין)",
    type: "timed",
    defaultDuration: 30,
    muscleGroups: ["core", "obliques"],
  },
  hollow_body: {
    id: "hollow_body",
    nameEn: "Hollow Body Hold",
    nameHe: "החזקת גוף חלול",
    type: "timed",
    defaultDuration: 30,
    muscleGroups: ["core"],
  },
  leg_raises: {
    id: "leg_raises",
    nameEn: "Leg Raises",
    nameHe: "הרמות רגליים",
    type: "reps",
    defaultReps: 15,
    muscleGroups: ["core", "hip flexors"],
  },
  mountain_climbers: {
    id: "mountain_climbers",
    nameEn: "Mountain Climbers",
    nameHe: "מטפסי הרים",
    type: "timed",
    defaultDuration: 30,
    muscleGroups: ["core", "cardio"],
  },
  burpees: {
    id: "burpees",
    nameEn: "Burpees",
    nameHe: "ברפי",
    type: "reps",
    defaultReps: 10,
    muscleGroups: ["full body", "cardio"],
  },
  superman: {
    id: "superman",
    nameEn: "Superman Hold",
    nameHe: "סופרמן",
    type: "timed",
    defaultDuration: 20,
    muscleGroups: ["lower back", "glutes"],
  },
};
