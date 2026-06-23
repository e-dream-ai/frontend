import styled from "styled-components";

type ChipState = "active" | "invalid" | "none";

const chipColor = (
  theme: import("styled-components").DefaultTheme,
  state: ChipState,
) => {
  if (state === "active") return theme.colorSecondary;
  if (state === "invalid") return theme.colorDanger;
  return theme.textSecondaryColor;
};

export const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const Heading = styled.span`
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondaryColor};
`;

export const StatusChip = styled.span<{ $state: ChipState }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  color: ${({ theme, $state }) => chipColor(theme, $state)};
  border: 1px solid ${({ theme, $state }) => chipColor(theme, $state)}55;
  background: ${({ theme, $state }) => chipColor(theme, $state)}14;
`;

export const Hint = styled.p`
  margin: 0;
  font-size: 0.74rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.textSecondaryColor};
`;
