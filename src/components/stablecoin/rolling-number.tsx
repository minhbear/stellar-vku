"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

function format(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/**
 * Counts from the previous value to the next one instead of snapping, so a
 * supply change reads as a change rather than a different screen.
 */
export function RollingNumber({
  value,
  duration = 520,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  // With reduced motion there is nothing to animate, so the value is rendered
  // straight through and no state is involved at all.
  if (reduce) return <span className={className}>{format(value)}</span>;

  return <Animated value={value} duration={duration} className={className} />;
}

function Animated({
  value,
  duration,
  className,
}: {
  value: number;
  duration: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = value;
    };
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
