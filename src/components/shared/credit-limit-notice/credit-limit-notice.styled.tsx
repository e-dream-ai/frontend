import styled from "styled-components";
import { Link } from "react-router-dom";

export const NoticeRow = styled.div`
  margin-top: 0.75rem;
`;

export const Root = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: ${({ theme }) => theme.textSecondaryColor};
`;

export const SettingsLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.textAccentColor};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
