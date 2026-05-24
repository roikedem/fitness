"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTimer } from "./useTimer";
import { EXERCISES, youtubeSearchUrl } from "@/lib/exercises";
import { WORKOUT_TEMPLATES, flattenWorkoutSteps } from "@/lib/workouts";
import { formatTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  Pause,
  Play,
  SkipForward,
  Timer,
  PlayCircle,
  ExternalLink,
} from "lucide-react";

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

  // Rep confirmation dialog
  const [showRepDialog, setShowRepDialog] = useState(false);
  const [actualReps, setActualReps] = useState(0);

  // Last time performance: exerciseId → most recent actual reps
  const [lastPerformance, setLastPerformance] = useState<Record<string, number>>({});

  const sessionIdRef = useRef<string | null>(null);
  const advancingRef = useRef(false);
  const sessionStartRef = useRef(new Date());
  const supabase = useMemo(() => createClient(), []);

  const currentStep = steps[stepIndex];
  const currentExercise = currentStep ? EXERCISES[currentStep.exerciseId] : null;
  const nextStep = steps[stepIndex + 1];
  const nextExercise = nextStep ? EXERCISES[nextStep.exerciseId] : null;

  const isTimed = currentExercise?.type === "timed";
  const targetReps = currentStep?.reps ?? currentExercise?.defaultReps ?? 10;
  const exerciseDuration = currentStep?.duration ?? currentExercise?.defaultDuration ?? 30;
  const restDuration =
    currentStep?.isLastInRound && currentStep.restBetweenRounds > 0
      ? currentStep.restBetweenRounds
      : (currentStep?.restAfter ?? 0);

  // Progressive overload: if hit target last time, add 1
  const lastReps = currentStep ? lastPerformance[currentStep.exerciseId] : undefined;
  const suggestedReps =
    lastReps !== undefined
      ? lastReps >= targetReps
        ? lastReps + 1
        : targetReps
      : targetReps;

  const doAdvance = useCallback(
    async (loggedReps?: number, loggedDuration?: number) => {
      if (advancingRef.current || !currentStep) return;
      advancingRef.current = true;

      const sid = sessionIdRef.current;
      if (sid) {
        await supabase.from("session_sets").insert({
          session_id: sid,
          exercise_id: currentStep.exerciseId,
          set_number: stepIndex + 1,
          reps: loggedReps ?? null,
          target_reps: !isTimed ? targetReps : null,
          duration_seconds: loggedDuration ?? null,
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
      } else {
        setStepIndex((i) => i + 1);
      }

      advancingRef.current = false;
    },
    [currentStep, stepIndex, steps.length, isTimed, targetReps, restDuration, supabase]
  );

  const exerciseTimer = useTimer(
    useCallback(() => doAdvance(undefined, exerciseDuration), [doAdvance, exerciseDuration])
  );

  const restTimer = useTimer(
    useCallback(() => {
      setPhase("exercise");
      setTimerStarted(false);
      setStepIndex((i) => i + 1);
    }, [])
  );

  // Auto-start rest timer
  useEffect(() => {
    if (phase === "resting" && restDuration > 0) {
      restTimer.start(restDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Reset timerStarted on step change
  useEffect(() => {
    setTimerStarted(false);
  }, [stepIndex]);

  // Init session + load last performance
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

    // Fetch most recent reps per exercise (RLS filters to this user)
    supabase
      .from("session_sets")
      .select("exercise_id, reps")
      .not("reps", "is", null)
      .order("completed_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, number> = {};
        for (const row of data) {
          if (row.exercise_id && row.reps !== null && !(row.exercise_id in map)) {
            map[row.exercise_id] = row.reps;
          }
        }
        setLastPerformance(map);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStartTimer = () => {
    setTimerStarted(true);
    exerciseTimer.start(exerciseDuration);
  };

  const handleNext = () => {
    if (isTimed) {
      exerciseTimer.pause();
      doAdvance(undefined, exerciseDuration);
    } else {
      // Show rep confirmation dialog
      setActualReps(suggestedReps);
      setShowRepDialog(true);
    }
  };

  const handleConfirmReps = () => {
    setShowRepDialog(false);
    // Update local last performance optimistically
    if (currentStep) {
      setLastPerformance((prev) => ({ ...prev, [currentStep.exerciseId]: actualReps }));
    }
    doAdvance(actualReps);
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

  const isPaused =
    (phase === "resting" && !restTimer.running) ||
    (phase === "exercise" && isTimed && timerStarted && !exerciseTimer.running);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!template || !currentStep || !currentExercise) return null;

  const progress = (stepIndex / steps.length) * 100;

  if (phase === "complete") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
        <CheckCircle2 className="w-24 h-24 text-accent" />
        <h1 className="text-4xl font-bold">כל הכבוד! 💪</h1>
        <p className="text-muted-foreground text-xl">סיימת את האימון</p>
        <Button size="lg" onClick={onDone}>חזרה לדף הבית</Button>
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

  return (
    <>
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
          {/* Exercise name + YouTube */}
          <div>
            <div className="flex items-start gap-2">
              <div>
                <h1 className="text-4xl font-bold">{currentExercise.nameHe}</h1>
                <p className="text-muted-foreground text-xl mt-1">{currentExercise.nameEn}</p>
              </div>
              <a
                href={youtubeSearchUrl(currentExercise.youtubeQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 p-2 rounded-lg text-red-500 hover:bg-muted transition-colors"
                title="הדגמה ב-YouTube"
              >
                <ExternalLink className="w-6 h-6" />
              </a>
            </div>

            {/* Last time / suggestion for reps exercises */}
            {!isTimed && (
              <div className="mt-3 text-sm text-muted-foreground">
                {lastReps !== undefined ? (
                  lastReps >= targetReps ? (
                    <span className="text-accent">
                      בפעם הקודמת: {lastReps} ✓ — מוצע: {suggestedReps}
                    </span>
                  ) : (
                    <span>בפעם הקודמת: {lastReps} — יעד: {targetReps}</span>
                  )
                ) : (
                  <span>יעד: {targetReps} חזרות</span>
                )}
              </div>
            )}
          </div>

          {/* Reps or timer */}
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
              <span className="text-8xl font-bold text-primary">{suggestedReps}</span>
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
          {(phase === "exercise" && isTimed && timerStarted) && (
            <Button variant="outline" size="lg" onClick={handlePauseResume}>
              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </Button>
          )}
          <Button size="xl" className="flex-1" onClick={handleNext}>
            הבא ←
          </Button>
        </div>
      </div>

      {/* Rep confirmation dialog */}
      {showRepDialog && currentExercise && (
        <div
          className="fixed inset-0 bg-black/70 flex items-end z-50"
          onClick={() => setShowRepDialog(false)}
        >
          <div
            className="bg-card w-full rounded-t-3xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-xl font-bold">כמה חזרות עשית?</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {currentExercise.nameEn} — {currentExercise.nameHe}
              </p>
            </div>

            {lastReps !== undefined && (
              <p className="text-sm text-muted-foreground">
                בפעם הקודמת עשית{" "}
                <span className="font-semibold text-foreground">{lastReps}</span>
                {lastReps >= targetReps && " ✓"}
              </p>
            )}

            <div className="text-6xl font-bold text-center text-primary py-2">
              {actualReps}
            </div>

            <input
              type="range"
              min={0}
              max={Math.max(targetReps * 2, 20)}
              value={actualReps}
              onChange={(e) => setActualReps(Number(e.target.value))}
              className="w-full h-3 accent-[#6366f1] cursor-pointer"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>יעד: {targetReps}</span>
              <span>{Math.max(targetReps * 2, 20)}</span>
            </div>

            <Button size="lg" className="w-full" onClick={handleConfirmReps}>
              אישור
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
