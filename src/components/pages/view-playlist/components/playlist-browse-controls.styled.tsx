import styled from "styled-components";
import { StyledSearchBar } from "@/components/shared/search-bar/search-bar.styled";

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
`;

export const SearchField = styled(StyledSearchBar)`
  flex: 1 1 16rem;
  min-width: 0;
  padding: 0 0.75rem;
  color: ${(props) => props.theme.textSecondaryColor};
  font-size: 1rem;

  &:focus-within {
    outline: 2px solid ${(props) => props.theme.colorPrimary};
    outline-offset: 2px;
  }
`;

export const ControlButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => props.theme.textSecondaryColor};
  border-radius: 5px;
  background: transparent;
  color: ${(props) => props.theme.textPrimaryColor};
  font: inherit;
  cursor: pointer;

  &:hover,
  &[aria-pressed="true"] {
    background: ${(props) => props.theme.colorBackgroundSecondary};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colorPrimary};
    outline-offset: 2px;
  }
`;

export const ClearButton = styled(ControlButton)`
  min-width: 2.75rem;
  border: 0;
`;
