import { DreamCardProgress } from "@/components/shared/dream-progress/dream-progress";
import type { KeyboardEvent, MouseEvent } from "react";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import type { FlowTransition } from "@/types/flow.types";
import {
  GapContainer,
  GapLine,
  StatusNode,
  GapStatusLabel,
  StaleDot,
} from "./transition-gap.styled";

/** Click selects; shift-click (or ctrl/cmd-click) toggles this one in or out. */
export interface TransitionClickModifiers {
  toggle: boolean;
}

interface TransitionGapProps {
  transition: FlowTransition;
  effectiveDuration: number;
  mismatch?: string;
  selected: boolean;
  /** Rendered, then edited: the video on screen is behind the settings. */
  stale?: boolean;
  /**
   * A toggle modifier is held and this is the only selected transition, so a
   * toggle-click here would do nothing. Shows as a not-allowed cursor.
   */
  deselectBlocked?: boolean;
  onClick: (modifiers: TransitionClickModifiers) => void;
}

/**
 * A plain gold strip of film: three frame windows between two rows of sprocket
 * holes. Windows and holes are cut out (evenodd) rather than painted, so the
 * selection slab shows through them.
 */
function FilmstripIcon() {
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2.5 0H33.5A2.5 2.5 0 0 1 36 2.5V25.5A2.5 2.5 0 0 1 33.5 28H2.5A2.5 2.5 0 0 1 0 25.5V2.5A2.5 2.5 0 0 1 2.5 0Z
           M1.75 2.5h2.5v2.5h-2.5Z M7.75 2.5h2.5v2.5h-2.5Z M13.75 2.5h2.5v2.5h-2.5Z
           M19.75 2.5h2.5v2.5h-2.5Z M25.75 2.5h2.5v2.5h-2.5Z M31.75 2.5h2.5v2.5h-2.5Z
           M1.5 7h10v14h-10Z M13 7h10v14h-10Z M24.5 7h10v14h-10Z
           M1.75 23h2.5v2.5h-2.5Z M7.75 23h2.5v2.5h-2.5Z M13.75 23h2.5v2.5h-2.5Z
           M19.75 23h2.5v2.5h-2.5Z M25.75 23h2.5v2.5h-2.5Z M31.75 23h2.5v2.5h-2.5Z"
      />
    </svg>
  );
}

export function TransitionGapEnhanced({
  transition,
  effectiveDuration,
  mismatch,
  selected,
  stale = false,
  deselectBlocked = false,
  onClick,
}: TransitionGapProps) {
  const { status } = transition;

  const selectedSuffix = selected ? " Selected." : "";
  // Spelled out for anyone not seeing the dot: the marker is the only thing
  // separating a rendered transition from a rendered-then-edited one.
  const staleSuffix = stale ? " Edited since it was rendered." : "";

  const activate = {
    role: "button" as const,
    tabIndex: 0,
    $selected: selected,
    $deselectBlocked: deselectBlocked,
    "aria-pressed": selected,
    // Swallow the mousedown default for every click, which does two jobs.
    // It stops a shift-click extending the browser's text selection from
    // wherever the last click landed, which painted a range highlight across
    // the reference frame between two gaps. And it keeps mouse clicks from
    // focusing the gap at all: a focused gap starts matching :focus-visible
    // the moment Chrome sees any key, so merely *pressing shift* — before any
    // click — lit up a second blue ring on top of the selection. Keyboard
    // users still Tab here and still get the ring, which is the case it is for.
    onMouseDown: (e: MouseEvent<HTMLDivElement>) => e.preventDefault(),
    onClick: (e: MouseEvent<HTMLDivElement>) =>
      onClick({ toggle: e.shiftKey || e.metaKey || e.ctrlKey }),
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      onClick({ toggle: e.shiftKey || e.metaKey || e.ctrlKey });
    },
  };

  if (mismatch && status === "idle") {
    return (
      <GapContainer
        $expanded
        {...activate}
        title={`Aspect ratio mismatch: ${mismatch}. Generate All will skip this transition - select it to generate it anyway.`}
        aria-label={`Transition with mismatched aspect ratios, ${mismatch}. Generate All will skip it. Activate to select it.${selectedSuffix}`}
      >
        <GapLine $variant="mismatched" />
        <GapStatusLabel $status="failed">mismatch</GapStatusLabel>
      </GapContainer>
    );
  }

  // Idle — just the connecting line. There used to be a second, gold variant
  // for a transition carrying overrides, but every transition now owns a full
  // set of settings, so "configured" is true of all of them and distinguishes
  // nothing.
  if (status === "idle") {
    return (
      <GapContainer
        $expanded={false}
        {...activate}
        aria-label={`Transition, not yet generated, ${effectiveDuration} seconds. Activate to select it.${selectedSuffix}`}
      >
        <GapLine $variant="idle" />
      </GapContainer>
    );
  }

  if (status === "queue" || status === "processing") {
    const fallbackLabel = status === "queue" ? "queued" : "rendering";
    return (
      <GapContainer
        $expanded
        {...activate}
        aria-label={`Transition ${fallbackLabel}.${selectedSuffix}`}
      >
        {transition.dreamUuid ? (
          <DreamCardProgress dream={{ uuid: transition.dreamUuid, status }} />
        ) : (
          <>
            <StatusNode $variant={status === "queue" ? "queued" : "processing"}>
              {status === "processing" && (
                <Loader2 size={14} strokeWidth={2.4} />
              )}
            </StatusNode>
            <GapStatusLabel $status={fallbackLabel}>
              {fallbackLabel}
            </GapStatusLabel>
          </>
        )}
      </GapContainer>
    );
  }

  // Success — a gold filmstrip with a soft halo, and a dot below it when the
  // settings have moved on since this render.
  if (status === "processed") {
    return (
      <GapContainer
        $expanded
        {...activate}
        title={
          stale
            ? "Edited since it was rendered — generate to bring the video up to date"
            : undefined
        }
        aria-label={`Transition rendered, ${effectiveDuration} seconds.${staleSuffix} Activate to select it.${selectedSuffix}`}
      >
        <StatusNode $variant="processed">
          <FilmstripIcon />
        </StatusNode>
        {stale && <StaleDot aria-hidden="true" />}
        {transition.uprezDreamUuid && transition.uprezStatus && (
          <DreamCardProgress
            dream={{
              uuid: transition.uprezDreamUuid,
              status: transition.uprezStatus,
            }}
          />
        )}
      </GapContainer>
    );
  }

  // Failed — red ring with warning icon. Selecting it loads its settings into
  // the panel, where Retry regenerates. A mismatch here is the likely cause, so
  // name it rather than just offering the retry that will fail the same way.
  return (
    <GapContainer
      $expanded
      {...activate}
      title={
        mismatch
          ? `Aspect ratio mismatch: ${mismatch}. Select it and use Retry to run it anyway.`
          : "Select it, then use Retry"
      }
      aria-label={
        mismatch
          ? `Transition failed, aspect ratios mismatched, ${mismatch}. Activate to select it.${selectedSuffix}`
          : `Transition failed. Activate to select it.${selectedSuffix}`
      }
    >
      <StatusNode $variant="failed">
        <AlertTriangle size={13} strokeWidth={2.4} />
      </StatusNode>
      <GapStatusLabel $status="failed">
        <RotateCcw size={9} strokeWidth={2.4} />
        retry
      </GapStatusLabel>
    </GapContainer>
  );
}
