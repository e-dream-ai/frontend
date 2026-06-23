import styled from "styled-components";

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
`;

export const Label = styled.span`
  font-size: 0.68rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.textSecondaryColor};
`;

export const ValueRow = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  white-space: nowrap;
`;

export const Amount = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.inputTextColorPrimary};
`;

export const Breakdown = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textSecondaryColor};
`;
