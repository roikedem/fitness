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
}

export const EXERCISES: Record<string, Exercise> = {
  pushups: {
    id: "pushups", nameEn: "Push-ups", nameHe: "שכיבות סמיכה",
    type: "reps", defaultReps: 15,
    muscleGroups: ["chest", "triceps", "shoulders"],
    youtubeQuery: "push ups proper form tutorial",
  },
  wide_pushups: {
    id: "wide_pushups", nameEn: "Wide Push-ups", nameHe: "שכיבות סמיכה רחבות",
    type: "reps", defaultReps: 12,
    muscleGroups: ["chest", "triceps", "shoulders"],
    youtubeQuery: "wide grip push ups tutorial",
  },
  diamond_pushups: {
    id: "diamond_pushups", nameEn: "Diamond Push-ups", nameHe: "שכיבות סמיכה יהלום",
    type: "reps", defaultReps: 10,
    muscleGroups: ["triceps", "chest"],
    youtubeQuery: "diamond push ups triceps tutorial",
  },
  pike_pushups: {
    id: "pike_pushups", nameEn: "Pike Push-ups", nameHe: "שכיבות סמיכה פייק",
    type: "reps", defaultReps: 10,
    muscleGroups: ["shoulders", "triceps"],
    youtubeQuery: "pike push ups shoulders tutorial",
  },
  decline_pushups: {
    id: "decline_pushups", nameEn: "Decline Push-ups", nameHe: "שכיבות סמיכה בירידה",
    type: "reps", defaultReps: 12,
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
    type: "reps", defaultReps: 20,
    muscleGroups: ["quads", "glutes", "hamstrings"],
    youtubeQuery: "bodyweight squat proper form tutorial",
  },
  jump_squats: {
    id: "jump_squats", nameEn: "Jump Squats", nameHe: "סקוואט קפיצה",
    type: "reps", defaultReps: 15,
    muscleGroups: ["quads", "glutes", "calves"],
    youtubeQuery: "jump squats plyometric tutorial",
  },
  lunges: {
    id: "lunges", nameEn: "Lunges", nameHe: "לאנג'ס",
    type: "reps", defaultReps: 12,
    muscleGroups: ["quads", "glutes", "hamstrings"],
    youtubeQuery: "lunges proper form tutorial",
  },
  reverse_lunges: {
    id: "reverse_lunges", nameEn: "Reverse Lunges", nameHe: "לאנג'ס לאחור",
    type: "reps", defaultReps: 12,
    muscleGroups: ["quads", "glutes"],
    youtubeQuery: "reverse lunges tutorial proper form",
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
  mountain_climbers: {
    id: "mountain_climbers", nameEn: "Mountain Climbers", nameHe: "מטפסי הרים",
    type: "timed", defaultDuration: 30,
    muscleGroups: ["core", "cardio"],
    youtubeQuery: "mountain climbers exercise tutorial",
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
