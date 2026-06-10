export type ExerciseType = "reps" | "timed" | "reps_weighted";

export interface Exercise {
  id: string;
  nameEn: string;
  nameHe: string;
  type: ExerciseType;
  defaultReps?: number;
  defaultDuration?: number;
  defaultWeight?: number;
  muscleGroups: string[];
  youtubeQuery: string;
  // Per-side / asymmetric moves (e.g. lunges): target reps must be even so
  // both sides get equal work. The app rounds suggestions to the nearest even.
  perSide?: boolean;
  // Auto-mode tempo: seconds counted per rep before auto-advancing. Push-ups
  // run fast at 1s/rep; everything else uses the 2.5s/rep default (set in the
  // workout component).
  secondsPerRep?: number;
}

export const EXERCISES: Record<string, Exercise> = {
  pushups: {
    id: "pushups", nameEn: "Push-ups", nameHe: "שכיבות סמיכה",
    type: "reps", defaultReps: 16, secondsPerRep: 1,
    muscleGroups: ["chest", "triceps", "shoulders"],
    youtubeQuery: "push ups proper form tutorial",
  },
  wide_pushups: {
    id: "wide_pushups", nameEn: "Wide Push-ups", nameHe: "שכיבות סמיכה רחבות",
    type: "reps", defaultReps: 14, secondsPerRep: 1,
    muscleGroups: ["chest", "triceps", "shoulders"],
    youtubeQuery: "wide grip push ups tutorial",
  },
  diamond_pushups: {
    id: "diamond_pushups", nameEn: "Diamond Push-ups", nameHe: "שכיבות סמיכה יהלום",
    type: "reps", defaultReps: 12, secondsPerRep: 1,
    muscleGroups: ["triceps", "chest"],
    youtubeQuery: "diamond push ups triceps tutorial",
  },
  pike_pushups: {
    id: "pike_pushups", nameEn: "Pike Push-ups", nameHe: "שכיבות סמיכה פייק",
    type: "reps", defaultReps: 12, secondsPerRep: 1,
    muscleGroups: ["shoulders", "triceps"],
    youtubeQuery: "pike push ups shoulders tutorial",
  },
  decline_pushups: {
    id: "decline_pushups", nameEn: "Decline Push-ups", nameHe: "שכיבות סמיכה בירידה",
    type: "reps", defaultReps: 14, secondsPerRep: 1,
    muscleGroups: ["upper chest", "shoulders"],
    youtubeQuery: "decline push ups upper chest tutorial",
  },
  pullups: {
    id: "pullups", nameEn: "Pull-ups", nameHe: "מתח",
    type: "reps", defaultReps: 6,
    muscleGroups: ["back", "biceps"],
    youtubeQuery: "pull ups proper form beginners",
  },
  chinups: {
    id: "chinups", nameEn: "Chin-ups", nameHe: "מתח אנדרגריפ",
    type: "reps", defaultReps: 6,
    muscleGroups: ["biceps", "back"],
    youtubeQuery: "chin ups underhand grip tutorial",
  },
  band_pullups: {
    id: "band_pullups", nameEn: "Band-Assisted Pull-ups", nameHe: "מתח בעזרת גומייה",
    type: "reps", defaultReps: 8,
    muscleGroups: ["back", "biceps"],
    youtubeQuery: "band assisted pull ups tutorial",
  },
  negative_pullups: {
    id: "negative_pullups", nameEn: "Negative Pull-ups", nameHe: "מתח שלילי – ירידות איטיות",
    type: "reps", defaultReps: 4,
    muscleGroups: ["back", "biceps"],
    youtubeQuery: "negative pull ups eccentric tutorial",
  },
  trx_rows: {
    id: "trx_rows", nameEn: "TRX Rows", nameHe: "משיכות TRX",
    type: "reps", defaultReps: 12, secondsPerRep: 1,
    muscleGroups: ["back", "biceps"],
    youtubeQuery: "trx inverted row tutorial",
  },
  trx_bicep_curls: {
    id: "trx_bicep_curls", nameEn: "TRX Bicep Curls", nameHe: "כפיפת מרפק TRX (יד קדמית)",
    type: "reps", defaultReps: 12,
    muscleGroups: ["biceps"],
    youtubeQuery: "trx bicep curl proper form tutorial",
  },
  trx_tricep_extension: {
    id: "trx_tricep_extension", nameEn: "TRX Tricep Extension", nameHe: "פשיטת מרפק TRX (יד אחורית)",
    type: "reps", defaultReps: 12,
    muscleGroups: ["triceps"],
    youtubeQuery: "trx tricep extension proper form tutorial",
  },
  inverted_rows: {
    id: "inverted_rows", nameEn: "Inverted Rows", nameHe: "משיכות הפוכות",
    type: "reps", defaultReps: 12,
    muscleGroups: ["back", "biceps"],
    youtubeQuery: "inverted rows bodyweight tutorial",
  },
  dips: {
    id: "dips", nameEn: "Dips", nameHe: "שקיעות",
    type: "reps", defaultReps: 10,
    muscleGroups: ["triceps", "chest", "shoulders"],
    youtubeQuery: "tricep dips proper form calisthenics",
  },
  squats: {
    id: "squats", nameEn: "Squats", nameHe: "סקוואט",
    type: "reps", defaultReps: 20, secondsPerRep: 1,
    muscleGroups: ["quads", "glutes", "hamstrings"],
    youtubeQuery: "bodyweight squat proper form tutorial",
  },
  jump_squats: {
    id: "jump_squats", nameEn: "Jump Squats", nameHe: "סקוואט קפיצה",
    type: "reps", defaultReps: 15, secondsPerRep: 1,
    muscleGroups: ["quads", "glutes", "calves"],
    youtubeQuery: "jump squats plyometric tutorial",
  },
  lunges: {
    id: "lunges", nameEn: "Lunges", nameHe: "לאנג'ס",
    type: "reps", defaultReps: 12, perSide: true, secondsPerRep: 1,
    muscleGroups: ["quads", "glutes", "hamstrings"],
    youtubeQuery: "lunges proper form tutorial",
  },
  reverse_lunges: {
    id: "reverse_lunges", nameEn: "Reverse Lunges", nameHe: "לאנג'ס לאחור",
    type: "reps", defaultReps: 12, perSide: true, secondsPerRep: 1,
    muscleGroups: ["quads", "glutes"],
    youtubeQuery: "reverse lunges tutorial proper form",
  },
  bulgarian_split_squat: {
    id: "bulgarian_split_squat", nameEn: "Bulgarian Split Squat", nameHe: "סקוואט בולגרי",
    type: "reps", defaultReps: 10, perSide: true, secondsPerRep: 1,
    muscleGroups: ["glutes", "quads", "hamstrings"],
    youtubeQuery: "bulgarian split squat proper form tutorial",
  },
  hip_thrusts: {
    id: "hip_thrusts", nameEn: "Hip Thrusts", nameHe: "הרמות אגן (היפ ת'ראסט)",
    type: "reps", defaultReps: 15,
    muscleGroups: ["glutes", "hamstrings"],
    youtubeQuery: "bodyweight hip thrust glutes tutorial",
  },
  glute_bridges: {
    id: "glute_bridges", nameEn: "Glute Bridges", nameHe: "גשר ישבן",
    type: "reps", defaultReps: 20,
    muscleGroups: ["glutes", "hamstrings"],
    youtubeQuery: "glute bridge exercise tutorial",
  },
  plank: {
    id: "plank", nameEn: "Plank", nameHe: "פלאנק",
    type: "timed", defaultDuration: 60,
    muscleGroups: ["core", "shoulders"],
    youtubeQuery: "plank exercise proper form core",
  },
  side_plank_left: {
    id: "side_plank_left", nameEn: "Side Plank (Left)", nameHe: "פלאנק צד שמאל",
    type: "timed", defaultDuration: 30,
    muscleGroups: ["core", "obliques"],
    youtubeQuery: "side plank obliques tutorial",
  },
  side_plank_right: {
    id: "side_plank_right", nameEn: "Side Plank (Right)", nameHe: "פלאנק צד ימין",
    type: "timed", defaultDuration: 30,
    muscleGroups: ["core", "obliques"],
    youtubeQuery: "side plank obliques tutorial",
  },
  hollow_body: {
    id: "hollow_body", nameEn: "Hollow Body Hold", nameHe: "החזקת גוף חלול",
    type: "timed", defaultDuration: 30,
    muscleGroups: ["core"],
    youtubeQuery: "hollow body hold tutorial calisthenics",
  },
  leg_raises: {
    id: "leg_raises", nameEn: "Leg Raises", nameHe: "הרמות רגליים",
    type: "reps", defaultReps: 15,
    muscleGroups: ["core", "hip flexors"],
    youtubeQuery: "lying leg raises core tutorial",
  },
  crunches_legs_up: {
    id: "crunches_legs_up", nameEn: "Legs-Up Crunches", nameHe: "כפיפות בטן רגליים למעלה",
    type: "reps", defaultReps: 20, secondsPerRep: 1,
    muscleGroups: ["core"],
    youtubeQuery: "legs up crunches abs no lower back tutorial",
  },
  oblique_crunches: {
    id: "oblique_crunches", nameEn: "Oblique Crunches", nameHe: "כפיפות בטן באלכסון",
    type: "reps", defaultReps: 20, perSide: true, secondsPerRep: 1,
    muscleGroups: ["core", "obliques"],
    youtubeQuery: "oblique crunches obliques tutorial",
  },
  mountain_climbers: {
    id: "mountain_climbers", nameEn: "Mountain Climbers", nameHe: "מטפסי הרים",
    type: "timed", defaultDuration: 30,
    muscleGroups: ["core", "cardio"],
    youtubeQuery: "mountain climbers exercise tutorial",
  },
  jump_rope: {
    id: "jump_rope", nameEn: "Jump Rope", nameHe: "קפיצה בדלגית",
    type: "timed", defaultDuration: 60,
    muscleGroups: ["cardio", "calves", "shoulders"],
    youtubeQuery: "jump rope basics warm up tutorial",
  },
  burpees: {
    id: "burpees", nameEn: "Burpees", nameHe: "ברפי",
    type: "reps", defaultReps: 10,
    muscleGroups: ["full body", "cardio"],
    youtubeQuery: "burpees proper form tutorial",
  },
  superman: {
    id: "superman", nameEn: "Superman Hold", nameHe: "סופרמן",
    type: "timed", defaultDuration: 20,
    muscleGroups: ["lower back", "glutes"],
    youtubeQuery: "superman exercise lower back tutorial",
  },
};

export function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
