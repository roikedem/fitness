"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function beep(frequency = 880, duration = 200, gain = 0.3) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.frequency.value = frequency;
    vol.gain.value = gain;
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
    osc.onended = () => ctx.close();
  } catch {
    // audio not available
  }
}

export function useTimer(onComplete?: () => void) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);          // source of truth for the interval
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // start resets and begins a fresh countdown
  const start = useCallback((duration: number) => {
    clearInterval_();
    secondsRef.current = duration;
    setSeconds(duration);
    setRunning(true);
    beep(880, 150);
  }, [clearInterval_]);

  const pause = useCallback(() => {
    clearInterval_();
    setRunning(false);
  }, [clearInterval_]);

  const resume = useCallback(() => {
    if (secondsRef.current > 0) setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      secondsRef.current -= 1;
      setSeconds(secondsRef.current);

      if (secondsRef.current <= 0) {
        // Stop the interval immediately — this is the key fix.
        // Calling clearInterval here (via the ref) prevents any further ticks
        // before the React state update propagates.
        clearInterval_();
        setRunning(false);
        beep(440, 400);
        setTimeout(() => onCompleteRef.current?.(), 450);
      } else if (secondsRef.current === 3) {
        beep(660, 100); // 3-second warning
      }
    }, 1000);
    return clearInterval_;
  }, [running, clearInterval_]);

  return { seconds, running, start, pause, resume };
}
