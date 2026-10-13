import React, { useId } from "react";
import {
  INTERPOLATION_FACTOR_OPTIONS,
  NO_OP_HINT,
  UPSCALE_FACTOR_OPTIONS,
  type UpscaleFactor,
  type InterpolationFactor,
} from "../constants/enhance-factor-options";
import {
  FactorToggle,
  FactorToggleGroup,
  EnhanceParamLabel,
  EnhanceParamRow,
} from "./enhance-factor-row.styled";

type Factor = UpscaleFactor | InterpolationFactor;

function FactorRow<T extends Factor>({
  label,
  options,
  value,
  onChange,
  disabledFactor,
  disabledHint,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (factor: T) => void;
  disabledFactor?: T;
  disabledHint?: string;
}) {
  const labelId = useId();

  return (
    <EnhanceParamRow>
      <EnhanceParamLabel id={labelId}>{label}</EnhanceParamLabel>
      <FactorToggleGroup role="group" aria-labelledby={labelId}>
        {options.map((factor) => {
          const disabled = factor === disabledFactor;
          return (
            <FactorToggle
              key={factor}
              type="button"
              $active={value === factor}
              aria-pressed={value === factor}
              disabled={disabled}
              title={disabled ? disabledHint : undefined}
              onClick={() => onChange(factor)}
            >
              {factor}×
            </FactorToggle>
          );
        })}
      </FactorToggleGroup>
    </EnhanceParamRow>
  );
}

/**
 * The upscale + interpolation pair, with the no-op rule (1x on both) enforced
 * by greying out the second 1x. Shared so the Enhance app and the flow's
 * save-to-playlist modal can't drift on the options or that rule.
 */
export const EnhanceFactorFields: React.FC<{
  upscaleFactor: UpscaleFactor;
  interpolationFactor: InterpolationFactor;
  onUpscaleChange: (factor: UpscaleFactor) => void;
  onInterpolationChange: (factor: InterpolationFactor) => void;
}> = ({
  upscaleFactor,
  interpolationFactor,
  onUpscaleChange,
  onInterpolationChange,
}) => (
  <>
    <FactorRow
      label="Upscale factor"
      options={UPSCALE_FACTOR_OPTIONS}
      value={upscaleFactor}
      onChange={onUpscaleChange}
      disabledFactor={interpolationFactor === 1 ? 1 : undefined}
      disabledHint={NO_OP_HINT}
    />
    <FactorRow
      label="Interpolation factor"
      options={INTERPOLATION_FACTOR_OPTIONS}
      value={interpolationFactor}
      onChange={onInterpolationChange}
      disabledFactor={upscaleFactor === 1 ? 1 : undefined}
      disabledHint={NO_OP_HINT}
    />
  </>
);
