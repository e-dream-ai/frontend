import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const ResetButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid ${FLOW.border};
  border-radius: 999px;
  font-family: ${FLOW.fontFamily};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${FLOW.textDim};
  padding: 6px 10px;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;

  svg {
    color: ${FLOW.error};
    opacity: 0.85;
    transition:
      transform 0.3s ease,
      opacity 0.18s ease;
  }

  &:hover {
    color: ${FLOW.text};
    background: ${FLOW.bgElevated};
    border-color: ${FLOW.borderHover};

    svg {
      opacity: 1;
      transform: rotate(-60deg);
    }
  }
`;
