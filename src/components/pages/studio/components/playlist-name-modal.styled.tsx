import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const NameField = styled.input`
  width: 100%;
  margin: 0 0 18px;
  padding: 9px 12px;
  background: ${FLOW.bg};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 14px;

  &::placeholder {
    color: ${FLOW.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${FLOW.accent};
  }
`;
