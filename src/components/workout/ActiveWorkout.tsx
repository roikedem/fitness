"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTimer } from "./useTimer";
import { EXERCISES } from "@/lib/exercises";
import { WORKOUT_TEMPLATES, flattenWorkoutSteps } from "@/lib/workouts";
import { formatTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Pause, Play, SkipForward, Timer, PlayCircle } from "lucide-react";

type Phase = "exercise" | "resting" | "complete";

export default function ActiveWorkout({
  workoutId,
  userId,
  onDone,
}: {
  workoutId: string;
  userId: string;
  onDone: () => void;
}) {
  const template = WORKOUT_TEMPLATES.find((w) => w.id === workoutId);
  const steps = useMemo(() => (template ? flattenWorkoutSteps(template) : []), [template]);

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("exercise");
  const [timerStarted, setTimerStarted] = useState(false);

  // Use refs for values needed inside async callbacks so we never capture stale closures
  const sessionIdRef = useRef<string | null>(null);
  const advancingRef = useRef(false);
  const sessionStartRef = useRef(new Date());
  const supabase = useMemo(() => createClient(), []);

  const currentStep = steps[stepIndex];
  const currentExercise = currentStep ? EXERCISES[currentStep.exerciseId] : null;
  const nextStep = steps[stepIndex + 1];
  const nextExercise = nextStep ? EXERCISES[nextStep.exerciseId] : null;

  const isTimed = currentExercise?.type === "timed";
  const exerciseDuration = currentStep?.duration ?? currentExercise?.defaultDuration ?? 30;
  const restDuration =
    currentStep?.isLastInRound && currentStep.restBetweenRounds > 0
      ? currentStep.restBetweenRounds
      : (currentStep?.restAfter ?? 0);

  // Called when the user taps Next OR the exercise timer finishes
  const doAdvance = useCallback(async () => {
    if (advancingRef.current || !currentStep) return;
    advancingRef.current = true;

    const sid = sessionIdRef.current;
    if (sid) {
      await supabase.from("session_sets").insert({
        session_id: sid,
        exercise_id: currentStep.exerciseId,
        set_number: stepIndex + 1,
        reps: !isTimed ? (currentStep.reps ?? null) : null,
        duration_seconds: isTimed ? exerciseDuration : null,
        weight_kg: null,
      });
    }

    if (stepIndex >= steps.length - 1) {
      if (sid) {
        const elapsed = Math.round((Date.now() - sessionStartRef.current.getTime()) / 1000);
        await supabase
          .from("workout_sessions")
          .update({ completed_at: new Date().toISOString(), duration_seconds: elapsed })
          .eq("id", sid);
      }
      setPhase("complete");
    } else if (restDuration > 0) {
      setPhase("resting");
      // restTimer.start is called via the effect below
    } else {
      setStepIndex((i) => i + 1);
    }

    advancingRef.current = false;
  }, [currentStep, stepIndex, steps.length, isTimed, exerciseDuration, restDuration, supabase]);

  const exerciseTimer = useTimer(doAdvance);

  const restTimer = useTimer(() => {
    setPhase("exercise");
    setTimerStarted(false);
    setStepIndex((i) => i + 1);
  });

  // Start rest timer automatically when we enter the resting phase
  useEffect(() => {
    if (phase === "resting" && restDuration > 0) {
      restTimer.start(restDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Reset timerStarted whenever the step changes
  useEffect(() => {
    setTimerStarted(false);
  }, [stepIndex]);

  // Create the workout session once on mount
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
        if (data) sessionIdRef.current = data.id;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartTimer = () => {
    setTimerStarted(true);
    exerciseTimer.start(exerciseDuration);
  };

  const handleNext = () => {
    exerciseTimer.pause(); // stop timer if it was running
    doAdvance();
  };

  const handleSkipRest = () => {
    restTimer.pause();
    setPhase("exercise");
    setTimerStarted(false);
    setStepIndex((i) => i + 1);
  };

  const handlePauseResume = () => {
    if (phase === "resting") {
      restTimer.running ? restTimer.pause() : restTimer.resume();
    } else if (isTimed && timerStarted) {
      exerciseTimer.running ? exerciseTimer.pause() : exerciseTimer.resume();
    }
  };

  const showPauseButton =
    phase === "resting" || (phase === "exercise" && isTimed && timerStarted);
  const isPaused =
    (phase === "resting" && !restTimer.running) ||
    (phase === "exercise" && isTimed && timerStarted && !exerciseTimer.running);

  if (!template || !currentStep || !currentExercise) return null;

  const progress = (stepIndex / steps.length) * 100;

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
          <Button variant="outline" size="lg" onClick={handlePauseResume}>
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            <span className="mr-2">{isPaused ? "המשך" : "הפסק"}</span>
          </Button>
          <Button variant="accent" size="lg" onClick={handleSkipRest}>
            <SkipForward className="w-6 h-6" />
            <span className="mr-2">דלג</span>
          </Button>
        </div>
      </div>
    );
  }

  // Exercise phase
  return (
    <div className="flex flex-col min-h-screen p-6">
      {/* Progress */}
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-muted-foreground text-sm mb-4">
        {currentStep.blockName} · סיבוב {currentStep.round}/{currentStep.totalRounds}
      </p>

      <div className="flex-1 flex flex-col justify-center gap-8">
        {/* Exercise name */}
        <div>
          <h1 className="text-4xl font-bold">{currentExercise.nameHe}</h1>
          <p className="text-muted-foreground text-xl mt-1">{currentExercise.nameEn}</p>
        </div>

        {/* Timed or reps */}
        {isTimed ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Timer className="w-8 h-8 text-primary" />
              <span className="text-7xl font-mono font-bold text-primary">
                {timerStarted ? formatTime(exerciseTimer.seconds) : formatTime(exerciseDuration)}
              </span>
            </div>

            {!timerStarted ? (
              <Button variant="accent" size="lg" className="self-start" onClick={handleStartTimer}>
                <PlayCircle className="w-6 h-6 ml-2" />
                התחל טיימר
              </Button>
            ) : (
              <Button variant="outline" size="md" className="self-start" onClick={handlePauseResume}>
                {exerciseTimer.running ? (
                  <><Pause className="w-5 h-5 ml-2" />הפסק</>
                ) : (
                  <><Play className="w-5 h-5 ml-2" />המשך</>
                )}
              </Button>
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
            {nextStep?.reps && <p className="text-sm mt-1">{nextStep.reps} חזרות</p>}
            {nextStep?.duration && <p className="text-sm mt-1">{formatTime(nextStep.duration)}</p>}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex gap-4 mt-8">
        {showPauseButton && (
          <Button variant="outline" size="lg" onClick={handlePauseResume}>
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </Button>
        )}
        <Button size="xl" className="flex-1" onClick={handleNext}>
          הבא ←
        </Button>
      </div>
    </div>
  );
}
