"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTimer } from "./useTimer";
import { EXERCISES } from "@/lib/exercises";
import { WORKOUT_TEMPLATES, flattenWorkoutSteps } from "@/lib/workouts";
import { suggestNextReps } from "@/lib/progression";
import { formatTime, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import ExerciseAnimation from "./ExerciseAnimation";
import {
  CheckCircle2,
  Pause,
  Play,
  SkipForward,
  Timer,
  PlayCircle,
  SlidersHorizontal,
  Zap,
  Minus,
  Plus,
} from "lucide-react";

type Phase = "exercise" | "resting" | "complete";

// Speak a line out loud (auto mode only). Hebrew voice when the device has one.
function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "he-IL";
    utter.rate = 1;
    const heVoice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith("he"));
    if (heVoice) utter.voice = heVoice;
    synth.cancel(); // drop any queued announcement so we don't pile up
    synth.speak(utter);
  } catch {
    /* speech is best-effort; never break the workout */
  }
}

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

  // Auto mode: auto-start timed exercises, and auto-advance reps after a
  // per-rep countdown (rest already auto-advances).
  const [autoMode, setAutoMode] = useState(false);
  // Seconds counted per rep before auto-advancing. Configurable (future UI).
  const [secondsPerRep, setSecondsPerRep] = useState(1);

  // Rep confirmation dialog
  const [showRepDialog, setShowRepDialog] = useState(false);
  const [actualReps, setActualReps] = useState(0);

  // Per-exercise rep history (most recent first), incl. this session's logs.
  // Drives the non-linear progression suggestion in @/lib/progression.
  const [history, setHistory] = useState<Record<string, number[]>>({});

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

  // Progressive overload: non-linear suggestion from recent rep history.
  const exerciseHistory = currentStep ? history[currentStep.exerciseId] : undefined;
  const lastReps = exerciseHistory?.[0];
  const suggestedReps = suggestNextReps(
    exerciseHistory ?? [],
    targetReps,
    currentExercise?.perSide ?? false
  );

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

  // Record an actual rep count for an exercise (most recent first).
  const recordReps = useCallback((exerciseId: string, reps: number) => {
    setHistory((prev) => ({
      ...prev,
      [exerciseId]: [reps, ...(prev[exerciseId] ?? [])].slice(0, 10),
    }));
  }, []);

  // Advance a reps exercise, logging the suggested reps as performed.
  const advanceReps = useCallback(() => {
    if (currentStep) recordReps(currentStep.exerciseId, suggestedReps);
    doAdvance(suggestedReps);
  }, [currentStep, suggestedReps, doAdvance, recordReps]);

  // Auto mode countdown for reps exercises (≈ secondsPerRep × reps)
  const repCountdown = useTimer(advanceReps);

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

  // Load auto-mode preference + per-rep pacing
  useEffect(() => {
    if (localStorage.getItem("autoMode") === "1") setAutoMode(true);
    const spr = Number(localStorage.getItem("secondsPerRep"));
    if (spr > 0) setSecondsPerRep(spr);
  }, []);

  const toggleAutoMode = () => {
    setAutoMode((v) => {
      const next = !v;
      localStorage.setItem("autoMode", next ? "1" : "0");
      return next;
    });
  };

  // Auto mode: automatically start the timer on timed exercises
  useEffect(() => {
    if (autoMode && phase === "exercise" && isTimed && !timerStarted && currentStep) {
      setTimerStarted(true);
      exerciseTimer.start(exerciseDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, phase, isTimed, timerStarted, stepIndex]);

  // Auto mode: count down per-rep on reps exercises, then advance.
  // Paused while the adjust dialog is open so a manual log isn't cut off.
  useEffect(() => {
    if (autoMode && phase === "exercise" && !isTimed && !showRepDialog && currentStep) {
      repCountdown.start(Math.max(1, Math.round(suggestedReps * secondsPerRep)));
    }
    return () => repCountdown.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, phase, isTimed, showRepDialog, stepIndex, secondsPerRep]);

  // Auto mode: announce the exercise name + reps/duration out loud before it
  // starts, so Roi doesn't have to look at the screen mid-workout.
  useEffect(() => {
    if (!autoMode || phase !== "exercise" || !currentExercise) return;
    const detail = isTimed
      ? `${exerciseDuration} שניות`
      : `${suggestedReps} חזרות`;
    speak(`${currentExercise.nameHe}, ${detail}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, phase, stepIndex]);

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

    // Fetch recent rep history per exercise, most recent first (RLS filters
    // to this user). Keep up to 10 per exercise for the progression average.
    supabase
      .from("session_sets")
      .select("exercise_id, reps")
      .not("reps", "is", null)
      .order("completed_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, number[]> = {};
        for (const row of data) {
          if (row.exercise_id && row.reps !== null) {
            const list = map[row.exercise_id] ?? (map[row.exercise_id] = []);
            if (list.length < 10) list.push(row.reps);
          }
        }
        setHistory(map);
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
      // Direct advance — assume the suggested reps were performed.
      // Use "Adjust" to log a different number.
      repCountdown.pause();
      advanceReps();
    }
  };

  const handleAdjust = () => {
    repCountdown.pause();
    setActualReps(suggestedReps);
    setShowRepDialog(true);
  };

  const handleConfirmReps = () => {
    setShowRepDialog(false);
    // Record what was actually performed so the next suggestion adapts.
    if (currentStep) recordReps(currentStep.exerciseId, actualReps);
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

        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-muted-foreground text-sm">
            {currentStep.blockName} · סיבוב {currentStep.round}/{currentStep.totalRounds}
          </p>
          <button
            onClick={toggleAutoMode}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors shrink-0",
              autoMode
                ? "bg-accent text-accent-foreground border-accent"
                : "border-border text-muted-foreground"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            {autoMode ? "אוטומטי פעיל" : "אוטומטי כבוי"}
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-8">
          {/* Exercise name + animation */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold">{currentExercise.nameHe}</h1>
                <p className="text-muted-foreground text-xl mt-1">{currentExercise.nameEn}</p>
              </div>
              <ExerciseAnimation exerciseId={currentExercise.id} />
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
              <button
                type="button"
                onClick={timerStarted ? undefined : handleStartTimer}
                disabled={timerStarted}
                className="flex items-center gap-3 self-start disabled:cursor-default"
              >
                <Timer className="w-8 h-8 text-primary" />
                <span className="text-7xl font-mono font-bold text-primary">
                  {timerStarted ? formatTime(exerciseTimer.seconds) : formatTime(exerciseDuration)}
                </span>
              </button>
              {!timerStarted ? (
                <Button variant="accent" size="lg" className="w-full" onClick={handleStartTimer}>
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
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <span className="text-8xl font-bold text-primary">{suggestedReps}</span>
                <span className="text-2xl text-muted-foreground">חזרות</span>
              </div>
              {autoMode && repCountdown.running && (
                <p className="text-sm text-accent">
                  הבא אוטומטי בעוד {repCountdown.seconds}s
                </p>
              )}
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
          {!isTimed && (
            <Button variant="outline" size="lg" onClick={handleAdjust}>
              <SlidersHorizontal className="w-5 h-5 ml-2" />
              כוונן
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

            {/* Big +/- steppers — easy to hit with sweaty hands */}
            <div className="flex items-center justify-center gap-6 py-2">
              <Button
                variant="outline"
                size="xl"
                className="w-16 h-16 rounded-full p-0 text-3xl"
                aria-label="פחות חזרה"
                onClick={() => setActualReps((r) => Math.max(0, r - 1))}
              >
                <Minus className="w-8 h-8" />
              </Button>
              <div className="text-6xl font-bold text-center text-primary w-24">
                {actualReps}
              </div>
              <Button
                variant="outline"
                size="xl"
                className="w-16 h-16 rounded-full p-0 text-3xl"
                aria-label="עוד חזרה"
                onClick={() => setActualReps((r) => r + 1)}
              >
                <Plus className="w-8 h-8" />
              </Button>
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
