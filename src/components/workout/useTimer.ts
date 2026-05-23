"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function beep(frequency = 880, duration = 200, gain = 0.3) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.frequency.value = frequency;
    gainNode.gain.value = gain;
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
    osc.onended = () => ctx.close();
  } catch {
    // Audio not available
  }
}

export function useTimer(initialSeconds: number, onComplete?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const start = useCallback(() => {
    beep(880, 150); // start beep
    setRunning(true);
  }, []);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(
    (newSeconds?: number) => {
      clear();
      setRunning(false);
      setSeconds(newSeconds ?? initialSeconds);
    },
    [clear, initialSeconds]
  );

  useEffect(() => {
    if (!running) {
      clear();
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          beep(440, 400); // end beep (lower pitch, longer)
          setTimeout(() => onCompleteRef.current?.(), 450);
          return 0;
        }
        if (s === 4) beep(660, 100); // countdown beep at 3s left
        return s - 1;
      });
    }, 1000);
    return clear;
  }, [running, clear]);

  return { seconds, running, start, pause, reset };
}
