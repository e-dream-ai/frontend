import styled, { css, keyframes } from "styled-components";

const LOW_THRESHOLD = 25;

export const Wrapper = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? "0.25rem" : "0.5rem")};
  width: 100%;
  ${({ $compact }) =>
    $compact &&
    css`
      max-width: 220px;
    `}
`;

export const TopRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const Label = styled.span<{ $compact?: boolean }>`
  font-size: ${({ $compact }) => ($compact ? "0.7rem" : "0.8rem")};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondaryColor};
`;

export const Amount = styled.span<{ $compact?: boolean; $low?: boolean }>`
  font-size: ${({ $compact }) => ($compact ? "0.72rem" : "0.85rem")};
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: ${({ theme, $low }) =>
    $low ? theme.colorDanger : theme.textAccentColor};
`;

export const Track = styled.div<{ $compact?: boolean }>`
  position: relative;
  width: 100%;
  height: ${({ $compact }) => ($compact ? "6px" : "10px")};
  border-radius: 999px;
  background: ${({ theme }) => theme.colorBackgroundSecondary};
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
  overflow: hidden;
`;

const emberGlow = keyframes`
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
`;

export const Fill = styled.div<{ $pct: number; $low?: boolean }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $pct }) => `${$pct}%`};
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
  background: ${({ theme, $low }) =>
    $low
      ? theme.colorDanger
      : `linear-gradient(90deg, ${theme.colorDarkPrimary}, ${theme.colorLightPrimary})`};
  box-shadow: ${({ theme, $low }) =>
    $low ? "none" : `0 0 8px ${theme.colorDarkPrimary}80`};

  ${({ $low }) =>
    !$low &&
    css`
      animation: ${emberGlow} 3.2s ease-in-out infinite;
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    animation: none;
  }
`;

export const SubText = styled.span<{ $low?: boolean }>`
  font-size: 0.72rem;
  color: ${({ theme, $low }) =>
    $low ? theme.colorDanger : theme.textSecondaryColor};
`;

export { LOW_THRESHOLD };
