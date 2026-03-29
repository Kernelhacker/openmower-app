import {useEffect, useRef, useState} from 'react';

interface Position {
  x: number;
  y: number;
  heading: number;
}

/**
 * Smoothly interpolates a position+heading value toward the latest target using
 * exponential smoothing driven by requestAnimationFrame.
 *
 * Because position updates arrive constantly (MQTT), we never restart the animation
 * loop — instead we just update the target ref and let the running loop converge.
 * Heading is interpolated via the shortest angular path.
 */
export function useSmoothedPosition(target: Position | null, halfLifeMs = 75): Position | null {
  const [smoothed, setSmoothed] = useState<Position | null>(target);
  const currentRef = useRef<Position | null>(null);
  const targetRef = useRef<Position | null>(target);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // Always keep targetRef current without triggering effect re-runs
  targetRef.current = target;

  useEffect(() => {
    if (target === null) {
      setSmoothed(null);
      currentRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // Snap on first value
    if (currentRef.current === null) {
      currentRef.current = target;
      setSmoothed(target);
    }

    // RAF loop is already running — nothing else to start
    if (rafRef.current !== null) return;

    lastTimestampRef.current = null;

    const animate = (timestamp: number) => {
      const t = targetRef.current;
      const c = currentRef.current;

      if (t === null || c === null) {
        rafRef.current = null;
        return;
      }

      const dt = lastTimestampRef.current !== null ? timestamp - lastTimestampRef.current : 0;
      lastTimestampRef.current = timestamp;

      // Exponential decay factor: alpha = 1 - 0.5^(dt / halfLifeMs)
      const alpha = dt > 0 ? 1 - Math.pow(0.5, dt / halfLifeMs) : 0;

      // Shortest-path heading delta
      let dHeading = t.heading - c.heading;
      if (dHeading > Math.PI) dHeading -= 2 * Math.PI;
      if (dHeading < -Math.PI) dHeading += 2 * Math.PI;

      const next: Position = {
        x: c.x + (t.x - c.x) * alpha,
        y: c.y + (t.y - c.y) * alpha,
        heading: c.heading + dHeading * alpha,
      };

      currentRef.current = next;

      const EPSILON = 1e-6;
      const converged =
        Math.abs(next.x - t.x) < EPSILON &&
        Math.abs(next.y - t.y) < EPSILON &&
        Math.abs(next.heading - t.heading) < EPSILON;

      if (converged) {
        currentRef.current = t;
        setSmoothed({...t});
        rafRef.current = null;
        return;
      }

      if (alpha > 0) {
        setSmoothed({...next});
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return smoothed;
}
