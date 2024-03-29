import styled from "styled-components";

export const SearchInput = styled.input`
  width: 100%;
  height: 3rem;
  padding: 6px 12px;
  background-color: transparent;
  border-radius: 0;
  border: 0;
  color: ${(props) => props.theme.inputTextColorPrimary};
  font-size: 1rem;
`;

export const StyledSearchBar = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  border-radius: 5px;
  background-color: ${(props) => props.theme.colorBackgroundSecondary};
  font-size: 1.6rem;
`;

export const SearchBarClearButton = styled.button`
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  margin: 0 0.2rem;
  border-radius: 100%;
  cursor: pointer;
  font-size: 1.2rem;
  color: ${(props) => props.theme.inputTextColorPrimary};
`;

export const SearchBarIcon = styled.button`
  width: 34px;
  height: 34px;
  background: transparent;
  border: none;
  margin: 0 1rem;
  border-radius: 100%;
  cursor: pointer;
  font-size: 1.4rem;
  color: ${(props) => props.theme.inputTextColorPrimary};
`;
