import React from "react";
import {
  INTERPOLATION_FACTOR_OPTIONS,
  UPSCALE_FACTOR_OPTIONS,
} from "../constants/uprez-factor-options";
import {
  FactorToggle,
  FactorToggleGroup,
  UprezParamLabel,
  UprezParamRow,
} from "./uprez-factor-row.styled";

export type UpscaleFactor = (typeof UPSCALE_FACTOR_OPTIONS)[number];
export type InterpolationFactor = (typeof INTERPOLATION_FACTOR_OPTIONS)[number];
type Factor = UpscaleFactor | InterpolationFactor;

export const NO_OP_HINT =
  "1x on both upscale and interpolation would be a no-op — pick 1x on only one of them.";

/**
 * 1x on both factors asks the uprez model to reproduce its input. Callers use
 * this to keep the submit disabled rather than queueing work that does nothing.
 */
export const isNoOpUprez = (
  upscaleFactor: UpscaleFactor,
  interpolationFactor: InterpolationFactor,
): boolean => upscaleFactor === 1 && interpolationFactor === 1;

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
  return (
    <UprezParamRow>
      <UprezParamLabel>{label}</UprezParamLabel>
      <FactorToggleGroup>
        {options.map((factor) => {
          const disabled = factor === disabledFactor;
          return (
            <FactorToggle
              key={factor}
              type="button"
              $active={value === factor}
              disabled={disabled}
              title={disabled ? disabledHint : undefined}
              onClick={() => onChange(factor)}
            >
              {factor}×
            </FactorToggle>
          );
        })}
      </FactorToggleGroup>
    </UprezParamRow>
  );
}

/**
 * The upscale + interpolation pair, with the no-op rule (1x on both) enforced
 * by greying out the second 1x. Shared so the Uprez app and the flow's
 * save-to-playlist modal can't drift on the options or that rule.
 */
export const UprezFactorFields: React.FC<{
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
