import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

export const TooltipBox = styled.div`
  position: fixed;
  z-index: 60;
  transform: translateX(-50%);
  max-width: 320px;
  padding: 6px 10px;
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radiusSm};
  background: ${FLOW.bgElevated};
  color: ${FLOW.text};
  font-family: ${FLOW.fontFamily};
  font-size: 12px;
  line-height: 1.4;
  overflow-wrap: anywhere;
  pointer-events: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
`;
