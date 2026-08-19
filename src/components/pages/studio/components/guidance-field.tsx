import { useCallback, useId, useRef } from "react";
import type { GuidanceConstraint } from "@/types/model.types";
import {
  GUIDANCE_TITLE,
  clampGuidance,
  formatGuidance,
  guidanceFillPercent,
  guidanceStepCount,
} from "../constants/guidance-options";
import {
  THUMB,
  Bounds,
  Field,
  Fill,
  Head,
  Param,
  Rail,
  Slider,
  Title,
  Track,
  Value,
} from "./guidance-field.styled";

interface GuidanceFieldProps {
  param: "guidance" | "cfg_scale";
  constraint: GuidanceConstraint;
  value: number;
  onChange: (guidance: number) => void;
}

export const GuidanceField = ({
  param,
  constraint,
  value,
  onChange,
}: GuidanceFieldProps) => {
  const id = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const { min, max, step } = constraint;

  const setFromClientX = useCallback(
    (clientX: number) => {
      const rail = railRef.current;
      if (!rail) return;
      const rect = rail.getBoundingClientRect();
      const travel = rect.width - THUMB;
      if (travel <= 0) return;
      const ratio = (clientX - rect.left - THUMB / 2) / travel;
      const next = clampGuidance(min + ratio * (max - min), constraint);
      if (next !== value) onChange(next);
    },
    [constraint, value, onChange],
  );

  return (
    <Field>
      <Title>{GUIDANCE_TITLE}</Title>
      <Head>
        <Param htmlFor={id}>{param}</Param>
        <Value aria-hidden="true">{formatGuidance(value, constraint)}</Value>
      </Head>
      <Rail
        ref={railRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          sliderRef.current?.focus();
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            setFromClientX(e.clientX);
          }
        }}
      >
        <Track $notches={guidanceStepCount(constraint)} />
        <Fill $percent={guidanceFillPercent(value, constraint)} />
        <Slider
          ref={sliderRef}
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={`${GUIDANCE_TITLE} (${param})`}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </Rail>
      <Bounds>
        <span>{formatGuidance(min, constraint)}</span>
        <span>{formatGuidance(max, constraint)}</span>
      </Bounds>
    </Field>
  );
};
