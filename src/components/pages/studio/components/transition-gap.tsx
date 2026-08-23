import type { KeyboardEvent, MouseEvent } from "react";
import { Check, Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import type { FlowTransition } from "@/types/flow.types";
import {
  GapContainer,
  GapLine,
  StatusNode,
  ProgressRing,
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
  onClick: (modifiers: TransitionClickModifiers) => void;
}

function hasOverrides(t: FlowTransition): boolean {
  return !!(
    t.presetOverride ||
    t.promptOverride ||
    t.negativePromptOverride ||
    t.durationOverride !== undefined ||
    t.modelOverride ||
    t.loraOverride ||
    t.numInferenceStepsOverride !== undefined ||
    t.guidanceOverride !== undefined
  );
}

export function TransitionGapEnhanced({
  transition,
  effectiveDuration,
  mismatch,
  selected,
  stale = false,
  onClick,
}: TransitionGapProps) {
  const { status, progress } = transition;
  const configured = hasOverrides(transition);

  const selectedSuffix = selected ? " Selected." : "";
  // Spelled out for anyone not seeing the dot: the marker is the only thing
  // separating a rendered transition from a rendered-then-edited one.
  const staleSuffix = stale ? " Edited since it was rendered." : "";

  const activate = {
    role: "button" as const,
    tabIndex: 0,
    $selected: selected,
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

  // Idle, no config — just the connecting line.
  if (status === "idle" && !configured) {
    return (
      <GapContainer
        $expanded={false}
        {...activate}
        aria-label={`Transition, not yet generated. Activate to select it.${selectedSuffix}`}
      >
        <GapLine $variant="idle" />
      </GapContainer>
    );
  }

  // Idle but configured — solid line, no marker: nothing has been rendered
  // here, so there is no gap between what is on screen and these settings.
  if (status === "idle" && configured) {
    return (
      <GapContainer
        $expanded={false}
        {...activate}
        aria-label={`Transition with custom settings, ${effectiveDuration} seconds. Activate to select it.${selectedSuffix}`}
      >
        <GapLine $variant="configured" />
      </GapContainer>
    );
  }

  // Queued — soft pulsing dot.
  if (status === "queue") {
    return (
      <GapContainer
        $expanded
        {...activate}
        aria-label={`Transition queued.${selectedSuffix}`}
      >
        <StatusNode $variant="queued" />
        <GapStatusLabel $status="queued">queued</GapStatusLabel>
      </GapContainer>
    );
  }

  // Processing — spinning loader inside a node, with progress ring.
  if (status === "processing") {
    const pct = Math.max(0, Math.min(100, progress ?? 0));
    return (
      <GapContainer
        $expanded
        {...activate}
        aria-label={`Transition rendering${
          pct > 0 ? `, ${Math.round(pct)}%` : ""
        }.${selectedSuffix}`}
      >
        <StatusNode $variant="processing">
          {pct > 0 && <ProgressRing $percent={pct} />}
          <Loader2 size={14} strokeWidth={2.4} />
        </StatusNode>
        <GapStatusLabel $status="processing">
          {pct > 0 ? `${Math.round(pct)}%` : "rendering"}
        </GapStatusLabel>
      </GapContainer>
    );
  }

  // Success — filled gold disc with a check and a soft halo, and a dot below it
  // when the settings have moved on since this render.
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
          <Check size={14} strokeWidth={3} />
        </StatusNode>
        {stale && <StaleDot aria-hidden="true" />}
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
