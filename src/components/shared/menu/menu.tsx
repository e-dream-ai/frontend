import {
  MenuButton as MenuButtonComponent,
  Menu as MenuComponent,
  MenuItem as MenuItemComponent,
} from "@szhsin/react-menu";
import styled from "styled-components";

export const MenuButton = styled(MenuButtonComponent)`
  height: fit-content;
  cursor: pointer;
  background-color: transparent;
  border: 0;
  color: ${(props) => props.theme.textPrimaryColor};
  font-size: 1.4rem;
  padding: 0.4rem 1.4rem;
`;

export const MenuItem = styled(MenuItemComponent)`
  color: ${(props) => props.theme.textPrimaryColor};
  background-color: ${(props) => props.theme.inputBackgroundColor};
  &:hover {
    background-color: ${(props) => props.theme.inputBackgroundDisabledColor};
  }
`;

export const Menu = styled(MenuComponent)`
  .my-menu {
    background-color: ${(props) => props.theme.inputBackgroundColor};
  }
`;
