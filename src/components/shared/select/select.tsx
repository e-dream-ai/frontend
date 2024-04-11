import React from "react";
import { Tooltip } from "react-tooltip";
import ReactSelect, { Props } from "react-select";
import { GroupBase } from "react-select";
import styled from "styled-components";
import {
  DisabledInput,
  InputAfter,
  InputBefore,
  InputError,
  InputGroup,
  InputRow,
} from "../input/input.styled";
import { Anchor } from "..";
import { truncateString } from "@/utils/string.util";
import { Option } from "@/types/select.types";

const StyledSelect = styled(ReactSelect)`
  display: flex;
  flex: auto;
  border-collapse: separate;
  align-items: center;
  margin: 0;

  .select__control {
    display: flex;
    flex: auto;
    height: 2.2rem;
    background: ${(props) => props.theme.inputBackgroundColor};
    border-radius: 0;
    border: 0;
  }

  .select__control--is-focused {
    border: none;
    border-color: red !important;
  }

  .select__value-container {
    padding: 0;
  }

  .select__input-container {
    padding: 0;
    margin: 0;
  }

  .select__input {
    color: ${(props) => props.theme.inputTextColorPrimary} !important;
    font-size: 1rem;
  }

  .select__single-value {
    color: ${(props) => props.theme.inputTextColorPrimary} !important;
    font-size: 1rem;
  }
`;

type SelectProps = Props<unknown, boolean, GroupBase<unknown>> & {
  anchor?: React.MouseEventHandler<HTMLAnchorElement>;
  before?: React.ReactNode;
  after?: React.ReactNode;
  error?: string;
};

export const Select = React.forwardRef<
  Props<unknown, boolean, GroupBase<unknown>>,
  SelectProps
>(
  (
    {
      anchor,
      before,
      after,
      error,
      isDisabled,
      value,
      name,
      placeholder,
      ...props
    },
    /* @ts-expect-error ref is expected to being declared but not needed to make component work */
    ref,
  ) => {
    const v = value as Option;

    const label = v?.label;

    return (
      <InputGroup data-tooltip-id={name}>
        <Tooltip id={name} place="right-end" content={placeholder as string} />
        <InputRow>
          {before && <InputBefore>{before}</InputBefore>}
          {isDisabled ? (
            <DisabledInput>
              {anchor ? (
                <Anchor onClick={anchor}>{label}</Anchor>
              ) : typeof label === "string" ? (
                truncateString(label, 30)
              ) : (
                label ?? "-"
              )}
            </DisabledInput>
          ) : (
            <StyledSelect
              className="select"
              classNamePrefix="select"
              isDisabled={isDisabled}
              value={value}
              name={name}
              placeholder={placeholder}
              {...props}
              theme={undefined}
            />
          )}
          {after && <InputAfter />}
        </InputRow>
        {error && <InputError>{error}</InputError>}
      </InputGroup>
    );
  },
);

export default Select;
