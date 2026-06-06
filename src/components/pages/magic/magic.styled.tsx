import styled, { css, keyframes } from "styled-components";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const ResendIcon = styled.span<{ $spinning?: boolean }>`
  display: inline-flex;
  align-items: center;
  ${({ $spinning }) =>
    $spinning &&
    css`
      animation: ${spin} 0.8s linear infinite;
    `}
`;

export const AuthActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.25rem;
`;

export const ResendButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: 0.9rem;
  color: ${(props) => props.theme.textAccentColor};
  cursor: pointer;
  transition: color linear 0.2s;

  &:hover:not(:disabled) {
    color: #ff9d6b;
  }

  &:disabled {
    color: ${(props) => props.theme.textSecondaryColor};
    cursor: not-allowed;
  }
`;
