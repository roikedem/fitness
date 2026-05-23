"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTimer } from "./useTimer";
import { EXERCISES } from "@/lib/exercises";
import { WORKOUT_TEMPLATES, flattenWorkoutSteps } from "@/lib/workouts";
import { formatTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Pause, Play, SkipForward, Timer } from "lucide-react";

type Phase = "exercise" | "resting" | "complete";

interface Props {
  workoutId: string;
  userId: string;
  onDone: () => void;
}

export default function ActiveWorkout({ workoutId, userId, onDone }: Props) {
  const template = WORKOUT_TEMPLATES.find((w) => w.id === workoutId);
  const steps = useMemo(() => (template ? flattenWorkoutSteps(template) : []), [template]);

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("exercise");
  const [paused, setPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [setCount, setSetCount] = useState(0);
  const sessionStartRef = useRef<Date>(new Date());
  const supabase = createClient();

  const currentStep = steps[stepIndex];
  const currentExercise = currentStep ? EXERCISES[currentStep.exerciseId] : null;
  const nextStep = steps[stepIndex + 1];
  const nextExercise = nextStep ? EXERCISES[nextStep.exerciseId] : null;
  const isTimed = currentExercise?.type === "timed";

  const restDuration =
    currentStep?.isLastInRound && currentStep.restBetweenRounds > 0
      ? currentStep.restBetweenRounds
      : currentStep?.restAfter ?? 0;

  const advanceStep = useCallback(async () => {
    if (!currentStep || !sessionId) return;

    // Log the completed set
    await supabase.from("session_sets").insert({
      session_id: sessionId,
      exercise_id: currentStep.exerciseId,
      set_number: setCount + 1,
      reps: !isTimed ? currentStep.reps ?? null : null,
      duration_seconds: isTimed ? (currentStep.duration ?? currentExercise?.defaultDuration ?? null) : null,
      weight_kg: null,
    });
    setSetCount((n) => n + 1);

    if (stepIndex >= steps.length - 1) {
      // Workout complete
      const elapsed = Math.round((Date.now() - sessionStartRef.current.getTime()) / 1000);
      await supabase
        .from("workout_sessions")
        .update({ completed_at: new Date().toISOString(), duration_seconds: elapsed })
        .eq("id", sessionId);
      setPhase("complete");
      return;
    }

    if (restDuration > 0) {
      setPhase("resting");
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [currentStep, sessionId, setCount, isTimed, stepIndex, steps.length, restDuration, supabase, currentExercise]);

  const afterRest = useCallback(() => {
    setPhase("exercise");
    setStepIndex((i) => i + 1);
  }, []);

  const exerciseDuration = currentStep?.duration ?? currentExercise?.defaultDuration ?? 30;

  const exerciseTimer = useTimer(exerciseDuration, () => {
    if (phase === "exercise" && isTimed) advanceStep();
  });

  const restTimer = useTimer(restDuration || 60, afterRest);

  // Start exercise timer automatically for timed exercises
  useEffect(() => {
    if (phase === "exercise" && isTimed && !paused) {
      exerciseTimer.reset(exerciseDuration);
      exerciseTimer.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, phase, isTimed, paused]);

  // Start rest timer automatically
  useEffect(() => {
    if (phase === "resting" && !paused) {
      restTimer.reset(restDuration || 60);
      restTimer.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Init session
  useEffect(() => {
    supabase
      .from("workout_sessions")
      .insert({
        user_id: userId,
        workout_id: workoutId,
        workout_name: template?.nameHe ?? workoutId,
        started_at: sessionStartRef.current.toISOString(),
      })
      .select("id")
      .single()
      .then(({ data }) => {
        if (data) setSessionId(data.id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePause = () => {
    setPaused((p) => {
      if (!p) {
        if (phase === "exercise" && isTimed) exerciseTimer.pause();
        if (phase === "resting") restTimer.pause();
      } else {
        if (phase === "exercise" && isTimed) exerciseTimer.start();
        if (phase === "resting") restTimer.start();
      }
      return !p;
    });
  };

  if (!template || !currentStep || !currentExercise) return null;

  const progress = ((stepIndex + (phase === "complete" ? 1 : 0)) / steps.length) * 100;

  if (phase === "complete") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
        <CheckCircle2 className="w-24 h-24 text-accent" />
        <h1 className="text-4xl font-bold">כל הכבוד! 💪</h1>
        <p className="text-muted-foreground text-xl">סיימת את האימון</p>
        <Button size="lg" onClick={onDone}>
          חזרה לדף הבית
        </Button>
      </div>
    );
  }

  if (phase === "resting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
        <p className="text-muted-foreground text-lg">מנוחה</p>
        <div className="text-8xl font-mono font-bold text-primary">
          {formatTime(restTimer.seconds)}
        </div>
        {nextExercise && (
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">הבא</p>
            <p className="text-xl font-semibold">{nextExercise.nameEn}</p>
            <p className="text-muted-foreground">{nextExercise.nameHe}</p>
          </div>
        )}
        <div className="flex gap-4">
          <Button variant="outline" size="lg" onClick={handlePause}>
            {paused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            <span className="mr-2">{paused ? "המשך" : "הפסק"}</span>
          </Button>
          <Button variant="accent" size="lg" onClick={afterRest}>
            <SkipForward className="w-6 h-6" />
            <span className="mr-2">דלג</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-6">
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Block info */}
      <p className="text-muted-foreground text-sm mb-1">
        {currentStep.blockName} · סיבוב {currentStep.round}/{currentStep.totalRounds}
      </p>

      {/* Exercise name */}
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div>
          <h1 className="text-4xl font-bold">{currentExercise.nameHe}</h1>
          <p className="text-muted-foreground text-xl mt-1">{currentExercise.nameEn}</p>
        </div>

        {/* Reps or timed */}
        {isTimed ? (
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <Timer className="w-8 h-8 text-primary" />
              <span className="text-7xl font-mono font-bold text-primary">
                {formatTime(exerciseTimer.seconds)}
              </span>
            </div>
            {!exerciseTimer.running && !paused && (
              <p className="text-muted-foreground text-sm">הטיימר יתחיל אוטומטית</p>
            )}
          </div>
        ) : (
          <div className="flex items-baseline gap-3">
            <span className="text-8xl font-bold text-primary">{currentStep.reps}</span>
            <span className="text-2xl text-muted-foreground">חזרות</span>
          </div>
        )}

        {/* Next exercise preview */}
        {nextExercise && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-sm mb-1">הבא</p>
            <p className="font-semibold">{nextExercise.nameEn}</p>
            <p className="text-muted-foreground text-sm">{nextExercise.nameHe}</p>
            {nextStep.reps && (
              <p className="text-sm mt-1">
                {nextStep.reps} חזרות
              </p>
            )}
            {nextStep.duration && (
              <p className="text-sm mt-1">
                {formatTime(nextStep.duration)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-8">
        <Button variant="outline" size="lg" onClick={handlePause} className="flex-1">
          {paused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          <span className="mr-2">{paused ? "המשך" : "הפסק"}</span>
        </Button>
        <Button size="xl" className="flex-[2]" onClick={advanceStep} disabled={!sessionId}>
          הבא ←
        </Button>
      </div>
    </div>
  );
}
