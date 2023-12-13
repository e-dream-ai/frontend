import styled from "styled-components";

export const SearchInput = styled.input`
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: fill-available;
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
  width: -moz-available; /* WebKit-based browsers will ignore this. */
  width: -webkit-fill-available; /* Mozilla-based browsers will ignore this. */
  width: fill-available;
  border-radius: 5px;
  background-color: ${(props) => props.theme.colorBackgroundSecondary};
  font-size: 1.6rem;
`;

export const SearchBarIcon = styled.i`
  padding: 0 1rem;
  cursor: pointer;
`;
