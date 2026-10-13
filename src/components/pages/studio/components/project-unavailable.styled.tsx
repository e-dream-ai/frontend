import styled from "styled-components";
import { Link } from "react-router-dom";
import { FLOW } from "@/constants/flow-theme.constants";
import { Panel } from "./project-dialog.styled";

export const Wrapper = styled(Panel)`
  margin: 12vh auto 0;
  text-align: center;
  box-shadow: none;
`;

export const BackLink = styled(Link)`
  display: inline-block;
  padding: 8px 14px;
  border-radius: ${FLOW.radiusSm};
  border: 1px solid ${FLOW.accent};
  background: ${FLOW.accentDim};
  color: ${FLOW.accent};
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: ${FLOW.accent};
    color: ${FLOW.bg};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }
`;
