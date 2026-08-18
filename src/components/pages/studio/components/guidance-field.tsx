import { useId } from "react";
import type { GuidanceConstraint } from "@/types/model.types";
import {
  GUIDANCE_TITLE,
  formatGuidance,
  guidanceFillPercent,
  guidanceStepCount,
} from "../constants/guidance-options";
import {
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
  const { min, max, step } = constraint;

  return (
    <Field>
      <Title>{GUIDANCE_TITLE}</Title>
      <Head>
        <Param htmlFor={id}>{param}</Param>
        <Value htmlFor={id}>{formatGuidance(value, constraint)}</Value>
      </Head>
      <Rail>
        <Track $notches={guidanceStepCount(constraint)} />
        <Fill $percent={guidanceFillPercent(value, constraint)} />
        <Slider
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={`${param}, ${formatGuidance(
            min,
            constraint,
          )} to ${formatGuidance(max, constraint)}`}
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
