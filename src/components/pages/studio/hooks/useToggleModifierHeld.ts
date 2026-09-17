import { useEffect, useState } from "react";

/**
 * Is a selection-toggle modifier (shift / cmd / ctrl) held right now?
 *
 * The strip needs this to show that toggling off the only selected transition
 * would do nothing: a cursor can say so only while the modifier is actually
 * down, since a plain click on that same gap is still perfectly valid.
 *
 * One window listener serves every gap — putting it on each would add a pair of
 * listeners per transition.
 */
export function useToggleModifierHeld(): boolean {
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const sync = (e: KeyboardEvent) =>
      setHeld(e.shiftKey || e.metaKey || e.ctrlKey);
    // Releasing the modifier outside the window never sends a keyup here, so a
    // blur has to clear it or the cursor stays stuck on return.
    const clear = () => setHeld(false);

    window.addEventListener("keydown", sync);
    window.addEventListener("keyup", sync);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", sync);
      window.removeEventListener("keyup", sync);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return held;
}
