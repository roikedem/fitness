import { createClient } from "@/lib/supabase/server";
import { WORKOUT_TEMPLATES } from "@/lib/workouts";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import { Clock, ChevronLeft } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Last 5 sessions
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(5);

  const beginnerWorkouts = WORKOUT_TEMPLATES.filter((w) => w.level === "beginner");
  const intermediateWorkouts = WORKOUT_TEMPLATES.filter((w) => w.level === "intermediate");

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">כושר</h1>
          <p className="text-muted-foreground text-sm">{user!.email}</p>
        </div>
        <LogoutButton />
      </div>

      {/* Recent sessions */}
      {sessions && sessions.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">אימונים אחרונים</h2>
            <Link href="/history" className="text-primary text-sm flex items-center gap-1">
              כל ההיסטוריה <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium">{s.workout_name}</p>
                  <p className="text-muted-foreground text-sm">
                    {new Date(s.started_at).toLocaleDateString("he-IL")}
                  </p>
                </div>
                {s.duration_seconds && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {Math.round(s.duration_seconds / 60)} דק&apos;
                  </div>
                )}
                {!s.completed_at && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    לא הושלם
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Workout selection */}
      {beginnerWorkouts.length > 0 && (
        <WorkoutSection title="מתחילים" workouts={beginnerWorkouts} />
      )}
      <WorkoutSection title="בינוני" workouts={intermediateWorkouts} />
    </div>
  );
}

function WorkoutSection({
  title,
  workouts,
}: {
  title: string;
  workouts: typeof WORKOUT_TEMPLATES;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="space-y-3">
        {workouts.map((w) => (
          <Link key={w.id} href={`/workout/${w.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{w.nameHe}</h3>
                  <p className="text-muted-foreground text-sm">{w.nameEn}</p>
                  <p className="text-muted-foreground text-sm mt-1">{w.descriptionHe}</p>
                </div>
                <div className="text-left shrink-0 ml-4">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {w.durationMinutes} דק&apos;
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
