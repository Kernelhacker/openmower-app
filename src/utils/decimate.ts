type Point = {x: number; y: number};

function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return d > Math.PI ? 2 * Math.PI - d : d;
}

/**
 * Decimate a sequence of points, keeping a point only when:
 *  - it moved more than `distThreshold` metres from the last kept point, OR
 *  - the heading changed by more than `headingThresholdRad`, OR
 *  - `heartbeatPoints` points have passed without keeping one (heartbeat).
 */
export function decimateFilter(
  points: Point[],
  distThreshold: number,
  headingThresholdRad: number,
  heartbeatPoints: number,
): Point[] {
  if (points.length === 0) return [];
  const out: Point[] = [points[0]];
  let lastHeading: number | null = null;
  let pointsSinceKept = 0;

  for (let i = 1; i < points.length; i++) {
    const last = out[out.length - 1];
    const curr = points[i];
    pointsSinceKept++;

    const dx = curr.x - last.x;
    const dy = curr.y - last.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const heading = Math.atan2(dy, dx);
    const headingChanged = lastHeading !== null && angleDiff(lastHeading, heading) > headingThresholdRad;

    if (dist > distThreshold || headingChanged || pointsSinceKept >= heartbeatPoints) {
      out.push(curr);
      lastHeading = heading;
      pointsSinceKept = 0;
    }
  }

  return out;
}
