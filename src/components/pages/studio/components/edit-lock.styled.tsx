import styled from "styled-components";
import {
  ALLOW_ATTRIBUTE,
  INTERACTIVE_SELECTOR,
} from "../utils/edit-lock-targets";

export const Region = styled.div`
  display: contents;

  &[data-locked] :is(${INTERACTIVE_SELECTOR}):not([${ALLOW_ATTRIBUTE}]) {
    cursor: not-allowed;
  }
`;
