import {
  MenuButton as MenuButtonComponent,
  Menu as MenuComponent,
  MenuItem as MenuItemComponent,
  FocusableItem as FocusableItemComponent,
} from "@szhsin/react-menu";
import styled from "styled-components";

export const MenuButton = styled(MenuButtonComponent)`
  height: fit-content;
  cursor: pointer;
  background-color: transparent;
  border: 0;
  color: ${(props) => props.theme.colorPrimary};
  font-size: 1rem;
`;

export const MenuItem = styled(MenuItemComponent)`
  color: ${(props) => props.theme.textPrimaryColor};
  background-color: ${(props) => props.theme.inputTextColorSecondary};
  &:hover {
    background-color: ${(props) => props.theme.inputTextColorPrimary};
    color: black;
  }
`;

export const Menu = styled(MenuComponent)`
  .my-menu {
    background-color: ${(props) => props.theme.inputTextColorSecondary};
  }
`;

export const FocusableItem = styled(FocusableItemComponent)``;
