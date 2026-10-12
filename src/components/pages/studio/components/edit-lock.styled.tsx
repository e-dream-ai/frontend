import styled from "styled-components";
import { INTERACTIVE_SELECTOR } from "../utils/edit-lock-targets";

export const Region = styled.div`
  display: contents;

  &[data-locked] :is(${INTERACTIVE_SELECTOR}) {
    cursor: not-allowed;
  }
`;
