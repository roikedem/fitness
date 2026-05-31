"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ActiveWorkout from "@/components/workout/ActiveWorkout";
import { WORKOUT_TEMPLATES } from "@/lib/workouts";
import { EXERCISES } from "@/lib/exercises";
import { Button } from "@/components/ui/button";
import { Clock, Dumbbell, ChevronRight } from "lucide-react";

export default function WorkoutClient({ workoutId, userId }: { workoutId: string; userId: string }) {
  const [started, setStarted] = useState(false);
  const router = useRouter();
  const template = WORKOUT_TEMPLATES.find((w) => w.id === workoutId);

  if (!template) return null;

  if (started) {
    return <ActiveWorkout workoutId={workoutId} userId={userId} onDone={() => router.push("/")} />;
  }

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-muted-foreground mb-6"
      >
        <ChevronRight className="w-5 h-5" />
        חזרה
      </button>

      <h1 className="text-3xl font-bold mb-1">{template.nameHe}</h1>
      <p className="text-muted-foreground mb-2">{template.nameEn}</p>
      <p className="text-muted-foreground mb-6">{template.descriptionHe}</p>

      <div className="flex gap-4 mb-8">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
          <Clock className="w-5 h-5 text-primary" />
          <span>{template.durationMinutes} דקות</span>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
          <Dumbbell className="w-5 h-5 text-primary" />
          <span>
            {template.level === "beginner" ? "מתחילים" : template.level === "intermediate" ? "בינוני" : "מתקדם"}
          </span>
        </div>
      </div>

      {/* Workout outline */}
      <div className="space-y-3 mb-8">
        <h2 className="font-semibold">תוכנית האימון</h2>
        {template.blocks.map((block, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{block.nameHe}</p>
              {block.rounds > 1 && (
                <span className="text-xs text-muted-foreground">{block.rounds} סיבובים</span>
              )}
            </div>
            <div className="space-y-1">
              {block.steps.map((step, j) => {
                const ex = EXERCISES[step.exerciseId]?.nameEn ?? step.exerciseId;
                return (
                  <p key={j} className="text-sm text-muted-foreground">
                    • {ex}{step.reps ? ` × ${step.reps}` : step.duration ? ` ${step.duration}s` : ""}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Button size="xl" className="w-full" onClick={() => setStarted(true)}>
        התחל אימון
      </Button>
    </div>
  );
}
