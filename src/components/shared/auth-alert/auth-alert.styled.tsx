import styled, { css, keyframes } from "styled-components";
import { AuthAlertVariant } from "@/utils/auth-error.util";

const VARIANTS: Record<
  AuthAlertVariant,
  { accent: string; surface: string; border: string }
> = {
  error: {
    accent: "#dc4848",
    surface: "rgba(220, 72, 72, 0.08)",
    border: "rgba(220, 72, 72, 0.25)",
  },
  warning: {
    accent: "#ff7d4d",
    surface: "rgba(255, 125, 77, 0.08)",
    border: "rgba(255, 125, 77, 0.25)",
  },
  success: {
    accent: "#5cbf95",
    surface: "rgba(92, 191, 149, 0.08)",
    border: "rgba(92, 191, 149, 0.25)",
  },
  info: {
    accent: "#fcd9b7",
    surface: "rgba(252, 217, 183, 0.06)",
    border: "rgba(252, 217, 183, 0.2)",
  },
};

const iconPulse = keyframes`
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.12); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

export const StyledAuthAlert = styled.div<{ variant: AuthAlertVariant }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.85rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  ${({ variant }) => {
    const { surface, border, accent } = VARIANTS[variant];
    return css`
      background: ${surface};
      border: 1px solid ${border};
      border-left: 3px solid ${accent};
    `;
  }}
`;

export const AuthAlertIcon = styled.span<{ variant: AuthAlertVariant }>`
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  color: ${({ variant }) => VARIANTS[variant].accent};
  animation: ${iconPulse} 0.4s ease both;
`;

export const AuthAlertBody = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.2rem 0.4rem;
  flex: 1 1 auto;
  min-width: 0;
`;

export const AuthAlertTitle = styled.strong<{ variant: AuthAlertVariant }>`
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
  color: ${({ variant }) => VARIANTS[variant].accent};
`;

export const AuthAlertMessage = styled.span`
  font-size: 0.875rem;
  line-height: 1.4;
  color: ${(props) => props.theme.inputTextColorPrimary};
  opacity: 0.85;
`;

export const AuthAlertActions = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
  padding-left: 0.75rem;
`;

export const AuthAlertActionLink = styled.button<{ variant: AuthAlertVariant }>`
  padding: 0;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  color: ${({ variant }) => VARIANTS[variant].accent};
  opacity: 0.8;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`;
