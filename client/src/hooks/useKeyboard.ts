import { useEffect, useRef } from "react";

export type Keys = Record<string, boolean>;

// Tracks currently-pressed keys without causing React re-renders.
export function useKeyboard() {
  const keys = useRef<Keys>({});

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return keys;
}
