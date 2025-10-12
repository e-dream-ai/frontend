import React, { useCallback, useRef } from "react";
import { PlacesType, Tooltip, TooltipRefProps } from "react-tooltip";
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
import { Anchor, AnchorLink } from "..";
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
    box-shadow: none;
  }

  .select__control--is-focused {
    border: none;
    border-color: red !important;
  }

  .select__value-container {
    padding: 0.375rem 0.75rem;
  }

  .select__single-value {
    margin: 0;
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

  .select__menu {
    background-color: ${(props) => props.theme.inputTextColorSecondary};
  }

  .select__option {
    background-color: ${(props) => props.theme.inputTextColorSecondary};
    color: white;
    &:hover {
      background-color: ${(props) => props.theme.inputTextColorPrimary};
      color: black;
    }
  }

  .select__option--is-selected {
    background-color: ${(props) => props.theme.colorPrimary};
    color: white;
  }

  .select__option--is-focused {
    background-color: ${(props) => props.theme.inputTextColorSecondary};
  }
`;

type SelectProps = Props<unknown, boolean, GroupBase<unknown>> & {
  href?: string;
  to?: string;
  before?: React.ReactNode;
  after?: React.ReactNode;
  error?: string;
  tooltipPlace?: PlacesType;
};

export const Select = React.forwardRef<
  Props<unknown, boolean, GroupBase<unknown>>,
  SelectProps
>(
  (
    {
      href,
      to,
      before,
      after,
      error,
      isDisabled,
      value,
      name,
      placeholder,
      tooltipPlace = "right",
      ...props
    },
    // unused ref
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __,
  ) => {
    const tooltipRef = useRef<TooltipRefProps>(null);

    const v = value as Option;
    const label = v?.label;

    const handleMenuClose = useCallback(() => tooltipRef.current?.close(), []);

    return (
      <InputGroup data-tooltip-id={name}>
        <Tooltip
          id={name}
          ref={tooltipRef}
          place={tooltipPlace}
          content={placeholder as string}
          style={{
            maxWidth: "14rem",
            wordBreak: "break-word",
          }}
        />
        <InputRow>
          {before && <InputBefore>{before}</InputBefore>}
          {isDisabled ? (
            <DisabledInput>
              {to ? (
                <AnchorLink type="secondary" to={to}>
                  {label}
                </AnchorLink>
              ) : href ? (
                <Anchor type="secondary" href={href}>
                  {label}
                </Anchor>
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
              onMenuClose={handleMenuClose}
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
