import styled from "styled-components";
import { FLOW, flowSlideIn } from "@/constants/flow-theme.constants";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.66);
`;

export const Panel = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: ${FLOW.radius};
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  padding: 20px;
  animation: ${flowSlideIn} 0.16s ease;
  font-family: ${FLOW.fontFamily};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: ${FLOW.text};
`;

export const Text = styled.p`
  margin: 0 0 18px;
  font-size: 13px;
  line-height: 1.55;
  color: ${FLOW.textDim};
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 14px;
  border-radius: ${FLOW.radiusSm};
  font-size: 13px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  background: ${(p) => (p.$primary ? FLOW.accentDim : "transparent")};
  border: 1px solid ${(p) => (p.$primary ? FLOW.accent : FLOW.border)};
  color: ${(p) => (p.$primary ? FLOW.accent : FLOW.textDim)};

  &:hover {
    background: ${(p) => (p.$primary ? FLOW.accent : FLOW.bgElevated)};
    color: ${(p) => (p.$primary ? FLOW.bg : FLOW.text)};
  }

  &:focus-visible {
    outline: 2px solid ${FLOW.accent};
    outline-offset: 2px;
  }
`;
