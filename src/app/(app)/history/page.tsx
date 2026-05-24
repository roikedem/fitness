import { createClient } from "@/lib/supabase/server";
import { Clock, CheckCircle2, XCircle, Layers, Repeat } from "lucide-react";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select(`
      id, workout_name, started_at, completed_at, duration_seconds,
      session_sets(reps, duration_seconds, exercise_id)
    `)
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">היסטוריה</h1>

      {!sessions || sessions.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <p className="text-lg">עדיין אין אימונים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const sets = s.session_sets ?? [];
            const totalSets = sets.length;
            const totalReps = sets.reduce((sum: number, set: { reps: number | null }) => sum + (set.reps ?? 0), 0);

            return (
              <div key={s.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {s.completed_at ? (
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <p className="font-semibold">{s.workout_name}</p>
                  </div>
                  {s.duration_seconds && (
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="w-4 h-4" />
                      {Math.round(s.duration_seconds / 60)} דק&apos;
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-3">
                  {new Date(s.started_at).toLocaleDateString("he-IL", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  ·{" "}
                  {new Date(s.started_at).toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {totalSets > 0 && (
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Layers className="w-4 h-4" />
                      <span>{totalSets} סטים</span>
                    </div>
                    {totalReps > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Repeat className="w-4 h-4" />
                        <span>{totalReps} חזרות</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
