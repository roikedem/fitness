export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  workout_name: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

export interface SessionSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  completed_at: string;
}

export type Database = {
  public: {
    Tables: {
      workout_sessions: {
        Row: WorkoutSession;
        Insert: Omit<WorkoutSession, "id">;
        Update: Partial<WorkoutSession>;
      };
      session_sets: {
        Row: SessionSet;
        Insert: Omit<SessionSet, "id">;
        Update: Partial<SessionSet>;
      };
    };
  };
};
