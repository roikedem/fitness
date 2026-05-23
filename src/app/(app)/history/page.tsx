import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("*, session_sets(count)")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">היסטוריית אימונים</h1>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <p className="text-lg">עדיין אין אימונים</p>
          <Link href="/" className="text-primary mt-2 inline-block">
            התחל אימון ראשון
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {s.completed_at ? (
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <p className="font-semibold">{s.workout_name}</p>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    {new Date(s.started_at).toLocaleDateString("he-IL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {new Date(s.started_at).toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {s.duration_seconds && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {Math.round(s.duration_seconds / 60)} דק&apos;
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
