import styled, { css } from "styled-components";

export const TabBar = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid ${(props) => props.theme.colorBackgroundQuaternary};
  margin-bottom: 1.5rem;
`;

export const Tab = styled.button<{ $active: boolean; $badge?: number }>`
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: ${(props) => props.theme.textBodyColor};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition:
    color 0.15s,
    border-color 0.15s;

  ${(props) =>
    props.$active &&
    css`
      color: ${props.theme.textPrimaryColor};
      border-bottom-color: ${props.theme.colorPrimary};
    `}

  &:hover {
    color: ${(props) => props.theme.textPrimaryColor};
  }

  ${(props) =>
    props.$badge &&
    props.$badge > 0 &&
    css`
      &::after {
        content: "${props.$badge}";
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        background: ${props.theme.colorPrimary};
        color: white;
        font-size: 0.625rem;
        border-radius: 50%;
        width: 1.125rem;
        height: 1.125rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `}
`;
