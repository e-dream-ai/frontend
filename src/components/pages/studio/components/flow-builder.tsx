import React from "react";
import styled from "styled-components";
import { FLOW } from "@/constants/flow-theme.constants";

const Container = styled.div`
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 16px;
  text-align: center;
  padding: 4rem 2rem;
  color: ${FLOW.textDim};
  font-family: ${FLOW.fontFamily};
`;

export const FlowBuilder: React.FC = () => {
  return <Container>Flow Builder — coming soon</Container>;
};
