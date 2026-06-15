import { createClient } from "@/lib/supabase/server";
import { WORKOUT_TEMPLATES, WEEKLY_SCHEDULE, WEEKDAY_NAMES_HE, israelWeekday } from "@/lib/workouts";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import { Clock, ChevronLeft, CheckCircle2 } from "lucide-react";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Last completed session (to mark "done today")
  const { data: lastSession } = await supabase
    .from("workout_sessions")
    .select("workout_id, started_at, completed_at")
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Check if worked out today
  const todayStr = new Date().toLocaleDateString("sv"); // YYYY-MM-DD
  const workedOutToday =
    lastSession &&
    new Date(lastSession.started_at).toLocaleDateString("sv") === todayStr;

  // Today's workout is fixed by the WEEKLY SCHEDULE (day of week), not a
  // rotation — so the app, the email, and plan.md always agree.
  const dow = israelWeekday();
  const todaySchedule = WEEKLY_SCHEDULE[dow];
  const recommended = todaySchedule.templateId
    ? WORKOUT_TEMPLATES.find((w) => w.id === todaySchedule.templateId) ?? null
    : null;

  const todayHe = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jerusalem",
  });

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">היום</h1>
          <p className="text-muted-foreground text-sm">{todayHe}</p>
        </div>
        <LogoutButton />
      </div>

      {!recommended ? (
        <Card className="mb-6 border-border bg-card">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-semibold text-lg">{todaySchedule.labelHe}</p>
              <p className="text-muted-foreground text-sm">אין אימון קליסטניקס היום</p>
            </div>
          </div>
        </Card>
      ) : workedOutToday ? (
        <Card className="mb-6 border-accent/40 bg-accent/10">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-accent shrink-0" />
            <div>
              <p className="font-semibold text-lg">אימון הושלם היום! 💪</p>
              <p className="text-muted-foreground text-sm">{recommended.nameHe}</p>
            </div>
          </div>
        </Card>
      ) : (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">אימון מומלץ להיום</h2>
          <Link href={`/workout/${recommended.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-xl">{recommended.nameHe}</h3>
                  <p className="text-muted-foreground text-sm">{recommended.nameEn}</p>
                  <p className="text-muted-foreground text-sm mt-1">{recommended.descriptionHe}</p>
                  <p className="text-primary font-semibold text-sm mt-3">התחל אימון ←</p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm shrink-0 mr-4">
                  <Clock className="w-4 h-4" />
                  {recommended.durationMinutes} דק&apos;
                </div>
              </div>
            </Card>
          </Link>
        </section>
      )}

      {/* Weekly schedule (fixed by day of week) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">תכנית שבועית</h2>
          <Link href="/workouts" className="text-primary text-sm flex items-center gap-1">
            כל האימונים <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {WEEKLY_SCHEDULE.map((sched, i) => {
            const w = sched.templateId
              ? WORKOUT_TEMPLATES.find((t) => t.id === sched.templateId)
              : null;
            const isToday = i === dow;
            const row = (
              <div
                className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                  isToday ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm w-10">{WEEKDAY_NAMES_HE[i]}</span>
                  <div>
                    <p className={`font-medium ${w ? "" : "text-muted-foreground"}`}>
                      {w ? w.nameHe : sched.labelHe}
                    </p>
                    {w && <p className="text-muted-foreground text-xs">{w.focus}</p>}
                  </div>
                </div>
                {isToday && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    היום
                  </span>
                )}
              </div>
            );
            return w ? (
              <Link key={i} href={`/workout/${w.id}`} className="block">
                {row}
              </Link>
            ) : (
              <div key={i}>{row}</div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
