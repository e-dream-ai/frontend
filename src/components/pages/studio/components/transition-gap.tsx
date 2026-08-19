import type { KeyboardEvent } from "react";
import { Check, Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import type { FlowTransition } from "@/types/flow.types";
import {
  GapContainer,
  GapLine,
  StatusNode,
  ProgressRing,
  GapStatusLabel,
  DurationLabel,
} from "./transition-gap.styled";

interface TransitionGapProps {
  transition: FlowTransition;
  effectiveDuration: number;
  mismatch?: string;
  onClick: () => void;
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
  onClick,
}: TransitionGapProps) {
  const { status, progress } = transition;
  const configured = hasOverrides(transition);

  const activate = {
    role: "button" as const,
    tabIndex: 0,
    onClick,
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      onClick();
    },
  };

  if (mismatch && status === "idle") {
    return (
      <GapContainer
        $expanded
        {...activate}
        title={`Aspect ratio mismatch: ${mismatch}. Generate All will skip this transition - open it to generate it anyway.`}
        aria-label={`Transition with mismatched aspect ratios, ${mismatch}. Generate All will skip it. Activate to open its settings.`}
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
        aria-label="Transition, not yet generated. Activate to open its settings."
      >
        <GapLine $variant="idle" />
      </GapContainer>
    );
  }

  // Idle but configured — solid line + duration pill.
  if (status === "idle" && configured) {
    return (
      <GapContainer
        $expanded={false}
        {...activate}
        aria-label={`Transition with custom settings, ${effectiveDuration} seconds. Activate to open its settings.`}
      >
        <GapLine $variant="configured" />
        <DurationLabel>{effectiveDuration}s</DurationLabel>
      </GapContainer>
    );
  }

  // Queued — soft pulsing dot.
  if (status === "queue") {
    return (
      <GapContainer $expanded {...activate} aria-label="Transition queued">
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
        }`}
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

  // Success — filled gold disc with a check, soft halo, duration below.
  if (status === "processed") {
    return (
      <GapContainer
        $expanded
        {...activate}
        aria-label={`Transition rendered, ${effectiveDuration} seconds. Activate to open its settings.`}
      >
        <StatusNode $variant="processed">
          <Check size={14} strokeWidth={3} />
        </StatusNode>
        <DurationLabel>{effectiveDuration}s</DurationLabel>
      </GapContainer>
    );
  }

  // Failed — red ring with warning icon. Whole node is "click to retry". A
  // mismatch here is the likely cause, so name it rather than just offering the
  // retry that will fail the same way.
  return (
    <GapContainer
      $expanded
      {...activate}
      title={
        mismatch
          ? `Aspect ratio mismatch: ${mismatch}. Click to retry anyway.`
          : "Click to retry"
      }
      aria-label={
        mismatch
          ? `Transition failed, aspect ratios mismatched, ${mismatch}. Activate to retry.`
          : "Transition failed. Activate to retry."
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
