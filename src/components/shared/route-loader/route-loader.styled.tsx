import styled from "styled-components";
import { delayedAppearance } from "@/styles/delayed-appearance";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: ${(props) => props.theme.textBodyColor};

  ${delayedAppearance()}
`;
